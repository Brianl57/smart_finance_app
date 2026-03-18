export interface PlaidItemRow {
    plaid_access_token: string;
    plaid_item_id: string;
    user_id: string;
    status?: string;
    error_code?: string | null;
    consent_expiration_time?: string | null;
    institution_name?: string | null;
}

export interface PlaidAccountRow {
    plaid_item_id: string;
    plaid_account_id: string;
    name: string;
    type: string;
    mask: string | null;
    subtype: string | null;
    current_balance: number | null;
    available_balance: number | null;
}

export interface AccountBalances {
    current: number | null;
    available: number | null;
    iso_currency_code: string | null;
    unofficial_currency_code: string | null;
}

export interface CleanedAccount {
    plaid_item_id: string;
    plaid_account_id: string;
    name: string;
    type: string;
    mask: string | null;
    subtype: string | null;
    current_balance: number | null;
    available_balance: number | null;
    balances: AccountBalances;
}

export interface GetTransactionsParams {
    start_date?: string;
    end_date?: string;
}
