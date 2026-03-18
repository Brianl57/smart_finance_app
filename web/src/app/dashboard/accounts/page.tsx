"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { NetWorthChart } from "@/components/net-worth-chart"
import { RefreshCw, AlertTriangle } from "lucide-react"
import { PlaidLink } from "@/components/plaid-link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

interface Account {
    account_id: string; // from Plaid
    plaid_item_id: string;
    name: string;
    mask: string;
    type: string;
    subtype: string;
    balances: {
        available: number | null;
        current: number | null;
        iso_currency_code: string | null;
        unofficial_currency_code: string | null;
    };
}

interface PlaidItem {
    plaid_item_id: string;
    status: string;
    error_code: string | null;
    institution_name: string | null;
    consent_expiration_time: string | null;
}

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [items, setItems] = useState<PlaidItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const badItems = items.filter(item => item.status === 'bad')

    const fetchData = useCallback(async (forceSync = false) => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                console.error("No active session")
                return
            }

            const headers = { 'Authorization': `Bearer ${session.access_token}` }

            if (forceSync) {
                await fetch('http://localhost:4000/api/accounts/sync', {
                    method: 'POST',
                    headers,
                });
            }

            // Fetch accounts and items in parallel
            const [accountsRes, itemsRes] = await Promise.all([
                fetch('http://localhost:4000/api/accounts', { headers }),
                fetch('http://localhost:4000/api/items', { headers }),
            ])

            if (!accountsRes.ok) throw new Error('Failed to fetch accounts')

            const accountsData = await accountsRes.json()
            setAccounts(accountsData)

            if (itemsRes.ok) {
                const itemsData = await itemsRes.json()
                setItems(itemsData)
            }
        } catch (err) {
            console.error('Error fetching data:', err)
            setError('Failed to load accounts')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleReconnectSuccess = useCallback(() => {
        fetchData()
    }, [fetchData])

    const formatCurrency = (amount: number | null, currencyCode: string | null) => {
        if (amount === null) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode || 'USD',
        }).format(amount);
    }

    const isAccountBad = (account: Account) => {
        return badItems.some(item => item.plaid_item_id === account.plaid_item_id)
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Accounts</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => fetchData(true)}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh all
                    </Button>
                    <PlaidLink onSuccess={handleReconnectSuccess} />
                </div>
            </div>

            {/* Reconnect Banner */}
            {badItems.length > 0 && (
                <Card className="border-amber-300 bg-amber-50">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                            <div className="space-y-3 flex-1">
                                <div>
                                    <p className="font-medium text-amber-800">
                                        {badItems.length === 1
                                            ? 'A connected account needs attention'
                                            : `${badItems.length} connected accounts need attention`}
                                    </p>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Please reconnect to continue syncing your financial data.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {badItems.map(item => (
                                        <PlaidLink
                                            key={item.plaid_item_id}
                                            mode="update"
                                            plaidItemId={item.plaid_item_id}
                                            institutionName={item.institution_name ?? undefined}
                                            onSuccess={handleReconnectSuccess}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Content */}
            <div className="grid gap-4">
                {/* Net Worth Chart reused from Dashboard */}
                <NetWorthChart />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {accounts.map((account) => (
                        <Card
                            key={account.account_id}
                            className={isAccountBad(account) ? 'border-amber-300' : ''}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-bold">
                                    {account.name}
                                </CardTitle>
                                {isAccountBad(account) && (
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">
                                    {formatCurrency(account.balances.available || account.balances.current, account.balances.iso_currency_code)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {account.subtype} &bull; {account.mask}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
