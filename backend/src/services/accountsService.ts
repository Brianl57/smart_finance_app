import { plaidClient } from '../config/plaidClient';
import * as plaidItemsRepo from '../repositories/plaidItemsRepository';
import * as plaidAccountsRepo from '../repositories/plaidAccountsRepository';
import { CleanedAccount, PlaidAccountRow } from '../types';

export async function getAccounts(userId: string): Promise<CleanedAccount[]> {
    console.log('Fetching accounts for user:', userId);

    const accounts = await plaidAccountsRepo.getAccountsByUserId(userId);

    const cleanedAccounts: CleanedAccount[] = accounts.map((acc: any) => {
        const { plaid_items, ...rest } = acc;
        return {
            ...rest,
            balances: {
                current: rest.current_balance,
                available: rest.available_balance,
                iso_currency_code: 'USD',
                unofficial_currency_code: null,
            },
        };
    });

    return cleanedAccounts;
}

export async function syncAccounts(userId: string): Promise<void> {
    console.log('Syncing accounts for user:', userId);

    const items = await plaidItemsRepo.getItemsByUserId(userId);

    for (const item of items) {
        try {
            const response = await plaidClient.accountsGet({
                access_token: item.plaid_access_token,
            });
            const accounts = response.data.accounts;

            const accountsToUpsert: PlaidAccountRow[] = accounts.map(account => ({
                plaid_item_id: item.plaid_item_id,
                plaid_account_id: account.account_id,
                name: account.name,
                type: account.type,
                mask: account.mask ?? null,
                subtype: account.subtype ?? null,
                current_balance: account.balances.current,
                available_balance: account.balances.available,
            }));

            await plaidAccountsRepo.upsertAccounts(accountsToUpsert);
        } catch (err: any) {
            const errorCode = err?.response?.data?.error_code;
            if (errorCode === 'ITEM_LOGIN_REQUIRED') {
                await plaidItemsRepo.updateItemStatus(item.plaid_item_id, 'bad', 'ITEM_LOGIN_REQUIRED');
                console.warn(`Item ${item.plaid_item_id} requires re-authentication`);
            }
            console.error(`Failed to sync item ${item.plaid_item_id}`, err);
        }
    }
}
