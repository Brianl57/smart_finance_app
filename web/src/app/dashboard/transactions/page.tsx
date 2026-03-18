"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { TransactionList } from "@/components/transactions/transaction-list"
import { Transaction } from "@/components/transactions/transaction-item"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon } from "lucide-react"

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [accountsMap, setAccountsMap] = useState<Record<string, { name: string, mask: string }>>({})
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState("1y") // 1y, 2y, 3y

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [dateRange])

    const fetchData = async () => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            // 1. Fetch Accounts to build map
            // We can reuse the existing /api/accounts endpoint or just fetch from Supabase directly if we want
            // Let's use the API to be consistent or just easier query since we are client side and have supabase client

            // Fetch accounts from Supabase directly to get names/masks mapped to account_ids
            const { data: accountsData, error: accountsError } = await supabase
                .from('plaid_accounts')
                .select('plaid_account_id, name, mask')

            const accMap: Record<string, { name: string, mask: string }> = {}
            if (accountsData) {
                accountsData.forEach((acc: any) => {
                    accMap[acc.plaid_account_id] = { name: acc.name, mask: acc.mask }
                })
            }
            setAccountsMap(accMap)

            // 2. Fetch Transactions
            // Calculate start date based on selection
            const endDate = new Date()
            const startDate = new Date()

            if (dateRange === '1y') startDate.setFullYear(endDate.getFullYear() - 1)
            if (dateRange === '2y') startDate.setFullYear(endDate.getFullYear() - 2)
            if (dateRange === '3y') startDate.setFullYear(endDate.getFullYear() - 3)

            const res = await fetch('http://localhost:4000/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                })
            })

            if (res.ok) {
                const data = await res.json()
                setTransactions(data.transactions || [])
            } else {
                console.error("Failed to fetch transactions")
            }

        } catch (error) {
            console.error("Error loading data", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Transactions</h1>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors md:pl-9 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="1y">Last 1 Year</option>
                            <option value="2y">Last 2 Years</option>
                            <option value="3y">Last 3 Years</option>
                        </select>
                    </div>
                </div>
            </div>

            <TransactionList
                transactions={transactions}
                accountsMap={accountsMap}
                loading={loading}
            />
        </div>
    )
}
