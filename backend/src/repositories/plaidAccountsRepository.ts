import { supabase } from '../config/supabaseClient';
import { PlaidAccountRow } from '../types';

export async function insertAccounts(accounts: PlaidAccountRow[]) {
    const { error } = await supabase
        .from('plaid_accounts')
        .insert(accounts);

    if (error) {
        throw error;
    }
}

export async function upsertAccounts(accounts: PlaidAccountRow[]) {
    const { error } = await supabase
        .from('plaid_accounts')
        .upsert(accounts, { onConflict: 'plaid_account_id' });

    if (error) {
        throw error;
    }
}

export async function getAccountsByUserId(userId: string) {
    const { data, error } = await supabase
        .from('plaid_accounts')
        .select('*, plaid_items!inner(user_id)')
        .eq('plaid_items.user_id', userId);

    if (error) {
        throw error;
    }

    return data || [];
}
