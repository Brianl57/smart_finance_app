import { supabase } from '../config/supabaseClient';
import { PlaidItemRow } from '../types';

export async function insertPlaidItem(item: PlaidItemRow) {
    const { error } = await supabase
        .from('plaid_items')
        .insert({
            plaid_access_token: item.plaid_access_token,
            plaid_item_id: item.plaid_item_id,
            user_id: item.user_id,
            consent_expiration_time: item.consent_expiration_time ?? null,
            institution_name: item.institution_name ?? null,
        });

    if (error) {
        throw error;
    }
}

export async function getItemsByUserId(userId: string): Promise<Pick<PlaidItemRow, 'plaid_access_token' | 'plaid_item_id'>[]> {
    const { data, error } = await supabase
        .from('plaid_items')
        .select('plaid_access_token, plaid_item_id')
        .eq('user_id', userId);

    if (error) {
        throw error;
    }

    return data || [];
}

export async function updateItemStatus(plaidItemId: string, status: string, errorCode: string | null) {
    const { error } = await supabase
        .from('plaid_items')
        .update({
            status,
            error_code: errorCode,
            updated_at: new Date().toISOString(),
        })
        .eq('plaid_item_id', plaidItemId);

    if (error) {
        throw error;
    }
}

export async function clearItemError(plaidItemId: string) {
    const { error } = await supabase
        .from('plaid_items')
        .update({
            status: 'good',
            error_code: null,
            updated_at: new Date().toISOString(),
        })
        .eq('plaid_item_id', plaidItemId);

    if (error) {
        throw error;
    }
}

export async function getItemByPlaidItemId(userId: string, plaidItemId: string): Promise<PlaidItemRow | null> {
    const { data, error } = await supabase
        .from('plaid_items')
        .select('plaid_access_token, plaid_item_id, user_id, status, error_code, consent_expiration_time, institution_name')
        .eq('plaid_item_id', plaidItemId)
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // no rows found
        throw error;
    }

    return data;
}

export async function getItemsWithStatus(userId: string) {
    const { data, error } = await supabase
        .from('plaid_items')
        .select('plaid_item_id, status, error_code, institution_name, consent_expiration_time')
        .eq('user_id', userId);

    if (error) {
        throw error;
    }

    return data || [];
}

export async function updateItemMetadata(
    plaidItemId: string,
    metadata: Partial<Pick<PlaidItemRow, 'consent_expiration_time' | 'institution_name'>>
) {
    const { error } = await supabase
        .from('plaid_items')
        .update({
            ...metadata,
            updated_at: new Date().toISOString(),
        })
        .eq('plaid_item_id', plaidItemId);

    if (error) {
        throw error;
    }
}
