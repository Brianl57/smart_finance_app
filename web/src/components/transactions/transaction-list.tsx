import { Transaction, TransactionItem } from "./transaction-item"
import { format } from "date-fns"

interface TransactionListProps {
    transactions: Transaction[]
    accountsMap: Record<string, { name: string; mask: string }>
    loading?: boolean
}

export function TransactionList({ transactions, accountsMap, loading }: TransactionListProps) {
    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading transactions...</div>
    }

    if (!transactions.length) {
        return <div className="p-8 text-center text-gray-500">No transactions found.</div>
    }

    // Group by date
    // Plaid date format YYYY-MM-DD
    const groups: Record<string, Transaction[]> = {}

    transactions.forEach(t => {
        const date = t.date
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(t)
    })

    // Sort dates descending
    const sortedDates = Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    // Calculate daily totals? Image shows "+$13,130.45" next to date.
    // Let's implement that sum.

    return (
        <div className="space-y-0 bg-white rounded-lg border shadow-sm overflow-hidden">
            {sortedDates.map(dateStr => {
                const dayTransactions = groups[dateStr]

                // Calculate total for the day (Incomes are negative in Plaid, Expenses positive)
                // Total = Incomes - Expenses ?? 
                // Wait, usually one wants to see Net.
                // If I had +100 income (plaid -100) and 50 expense (plaid 50).
                // Net is +50.
                // Plaid values: -100 + 50 = -50.
                // So sum of raw plaid values = Net flow.
                // If result is negative => Net Income. Result positive => Net Expense.
                // But display wise, we usually inverse it for "Change in balance"?
                // Let's just sum raw values.

                const daySum = dayTransactions.reduce((acc, t) => acc + t.amount, 0)
                // If daySum is negative => Net Positive for user (Income > Expense).
                // If daySum is positive => Net Negative for user (Expense > Income).

                const isNetIncome = daySum < 0
                const absSum = Math.abs(daySum)

                const formattedSum = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                }).format(absSum)

                return (
                    <div key={dateStr}>
                        {/* Group Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b border-t first:border-t-0">
                            <div className="text-sm font-medium text-gray-500">
                                {format(new Date(dateStr), "MMMM d, yyyy")}
                            </div>
                            <div className={`text-sm font-medium ${isNetIncome ? 'text-green-600' : 'text-gray-600'}`}>
                                {isNetIncome ? '+' : '-'}{formattedSum}
                            </div>
                        </div>

                        {/* List Items */}
                        <div>
                            {dayTransactions.map(t => (
                                <TransactionItem
                                    key={t.transaction_id}
                                    transaction={t}
                                    accountName={accountsMap[t.account_id]?.name}
                                    accountMask={accountsMap[t.account_id]?.mask}
                                />
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
