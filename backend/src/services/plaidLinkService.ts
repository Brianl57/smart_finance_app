import { CountryCode, Products } from 'plaid';
import { plaidClient } from '../config/plaidClient';
import * as plaidItemsRepo from '../repositories/plaidItemsRepository';
import * as plaidAccountsRepo from '../repositories/plaidAccountsRepository';
import { PlaidAccountRow } from '../types';

export async function createLinkToken(userId: string) {
    const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: 'Smart Finance App',
        products: [Products.Auth, Products.Transactions],
        country_codes: [CountryCode.Us],
        language: 'en',
    });
    console.log('Link token created for user:', userId);
    return response.data;
}

export async function createUpdateLinkToken(userId: string, plaidItemId: string) {
    const item = await plaidItemsRepo.getItemByPlaidItemId(userId, plaidItemId);
    if (!item) {
        throw new Error('Item not found');
    }

    // Update mode: pass access_token instead of products
    const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: 'Smart Finance App',
        country_codes: [CountryCode.Us],
        language: 'en',
        access_token: item.plaid_access_token,
    });

    console.log('Update link token created for item:', plaidItemId);
    return response.data;
}

export async function onUpdateSuccess(userId: string, plaidItemId: string) {
    // 1. Fetch the item to get access_token
    console.log("onUpdateSucces called...")
    const item = await plaidItemsRepo.getItemByPlaidItemId(userId, plaidItemId);
    if (!item) {
        throw new Error('Item not found');
    }

    // console.log("Item: ", item)
    // 2. Clear the error state
    await plaidItemsRepo.clearItemError(plaidItemId);

    // 3. Refresh consent_expiration_time from Plaid (consent is renewed on successful update)
    try {
        const itemResponse = await plaidClient.itemGet({
            access_token: item.plaid_access_token,
        });
        // console.log("Item response: ", itemResponse)
        const newConsentExpiration = itemResponse.data.item.consent_expiration_time;

        if (newConsentExpiration) {
            await plaidItemsRepo.updateItemMetadata(plaidItemId, {
                consent_expiration_time: newConsentExpiration,
            });
            console.log('Updated consent_expiration_time for item:', plaidItemId);
        }
    } catch (err) {
        console.error('Error refreshing consent_expiration_time after update:', err);
        // Don't fail the whole operation if metadata refresh fails
    }

    console.log('Item error cleared after update mode success:', plaidItemId);
}

export async function exchangePublicToken(userId: string, publicToken: string) {
    const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;
    console.log('Access Token:', accessToken);
    console.log('Item ID:', itemId);
    console.log('User ID:', userId);

    // Fetch item metadata for consent expiration and institution name
    let consentExpirationTime: string | null = null;
    let institutionName: string | null = null;
    try {
        const itemResponse = await plaidClient.itemGet({ access_token: accessToken });
        consentExpirationTime = itemResponse.data.item.consent_expiration_time ?? null;
        institutionName = itemResponse.data.item.institution_name ?? null;
    } catch (err) {
        console.error('Error fetching item metadata:', err);
    }

    // Save item to database
    await plaidItemsRepo.insertPlaidItem({
        plaid_access_token: accessToken,
        plaid_item_id: itemId,
        user_id: userId,
        consent_expiration_time: consentExpirationTime,
        institution_name: institutionName,
    });

    // Fetch and save initial accounts (non-fatal on failure)
    try {
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });
        const accounts = accountsResponse.data.accounts;

        const accountsToInsert: PlaidAccountRow[] = accounts.map(account => ({
            plaid_item_id: itemId,
            plaid_account_id: account.account_id,
            name: account.name,
            type: account.type,
            mask: account.mask ?? null,
            subtype: account.subtype ?? null,
            current_balance: account.balances.current,
            available_balance: account.balances.available,
        }));

        await plaidAccountsRepo.insertAccounts(accountsToInsert);
        console.log(`Saved ${accounts.length} accounts for item: ${itemId}`);
    } catch (err) {
        console.error('Error fetching/saving accounts after link:', err);
    }

    return { item_id: itemId };
}
