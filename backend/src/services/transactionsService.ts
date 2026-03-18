import { plaidClient } from '../config/plaidClient';
import * as plaidItemsRepo from '../repositories/plaidItemsRepository';
import { GetTransactionsParams } from '../types';

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export async function getTransactions(userId: string, params: GetTransactionsParams) {
    const items = await plaidItemsRepo.getItemsByUserId(userId);

    if (items.length === 0) {
        throw new NotFoundError('No linked accounts found');
    }

    const allTransactions: any[] = [];

    await Promise.all(items.map(async (item) => {
        try {
            const response = await plaidClient.transactionsGet({
                access_token: item.plaid_access_token,
                start_date: params.start_date || '2024-01-01',
                end_date: params.end_date || new Date().toISOString().split('T')[0],
                options: {
                    count: 500,
                },
            });
            allTransactions.push(...response.data.transactions);
        } catch (err: any) {
            const errorCode = err?.response?.data?.error_code;
            if (errorCode === 'ITEM_LOGIN_REQUIRED') {
                await plaidItemsRepo.updateItemStatus(item.plaid_item_id, 'bad', 'ITEM_LOGIN_REQUIRED');
                console.warn(`Item ${item.plaid_item_id} requires re-authentication`);
            }
            console.error(`Error fetching transactions for item ${item.plaid_item_id}:`, err);
        }
    }));

    allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log(`Retrieved ${allTransactions.length} transactions for user: ${userId}`);
    return allTransactions;
}
