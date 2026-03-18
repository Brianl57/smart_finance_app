import { ChevronRight } from "lucide-react"
import Image from "next/image"

export interface Transaction {
    transaction_id: string
    date: string
    name: string
    merchant_name: string | null
    amount: number
    iso_currency_code: string | null
    category: string[] | null
    payment_channel: string
    account_id: string
    personal_finance_category?: {
        detailed: string
        primary: string
    } | null
    personal_finance_category_icon_url?: string | null
}

interface TransactionItemProps {
    transaction: Transaction
    accountName?: string
    accountMask?: string
}

export function TransactionItem({ transaction, accountName, accountMask }: TransactionItemProps) {
    // Fallback for merchant name
    const title = transaction.merchant_name || transaction.name

    // Category Logic: Prioritize personal_finance_category (v2), fallback to legacy category array
    let category = 'Uncategorized'
    if (transaction.personal_finance_category?.primary) {
        // Convert SCREAMING_SNAKE_CASE to Title Case if needed, or just use as is.
        // Plaid returns 'TRAVEL', 'FOOD_AND_DRINK'. 
        // Let's simple title case it: 'TRAVEL' -> 'Travel', 'FOOD_AND_DRINK' -> 'Food And Drink'
        category = transaction.personal_finance_category.primary
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
    } else if (transaction.category && transaction.category.length > 0) {
        category = transaction.category[0]
    }

    // Formatting amount. Plaid: positive = spent, negative = refund/income usually?
    // Actually Plaid: positive amount is money moving OUT (expense). Negative is money IN (credit).
    // But usually in UI we might show expense as positive or negative depending on preference.
    // Image shows green +$117.78 for "Paychecks". So Income is positive Green.
    // Expense is Black (or default) $3.19.
    // So if amount < 0 => Income (Green). If amount > 0 => Expense.

    // Plaid: "A positive amount indicates that money has been removed from the account" (Expense)
    // "A negative amount indicates that money has been added to the account" (Income)

    const isIncome = transaction.amount < 0;
    // We want to show income as positive string, expense as positive string usually, or just raw.
    // Image: Paychecks +$117.78. (Amount was likely -117.78 from Plaid).
    // Google One $3.19. (Amount was 3.19 from Plaid).

    const displayAmount = Math.abs(transaction.amount) // Show absolute value
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: transaction.iso_currency_code || 'USD',
    }).format(displayAmount)

    return (
        <div className="flex items-center justify-between p-4 border-b hover:bg-gray-50/50 transition-colors">
            {/* Left: Icon/Image + Name */}
            <div className="flex items-center gap-4 w-[30%]">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-lg overflow-hidden relative">
                    {transaction.personal_finance_category_icon_url ? (
                        /* Use Plaid Category Icon if available */
                        <img
                            src={transaction.personal_finance_category_icon_url}
                            alt={category}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        /* Fallback to first letter */
                        <span>{title[0]}</span>
                    )}
                </div>
                <div className="font-medium truncate">{title}</div>
            </div>

            {/* Middle: Category */}
            <div className="flex items-center gap-2 w-[20%] text-gray-500">
                {/* Icon could go here */}
                <span className="truncate">{category}</span>
            </div>

            {/* Middle: Account */}
            <div className="flex items-center gap-2 w-[25%] text-gray-500">
                {/* Bank Icon placeholder */}
                <div className="h-5 w-5 rounded bg-blue-100 flex-shrink-0"></div>
                <span className="truncate">{accountName || 'Account'} (...{accountMask || '....'})</span>
            </div>

            {/* Right: Amount + Chevron */}
            <div className="flex items-center justify-end gap-4 w-[25%]">
                <div className={`font-semibold ${isIncome ? 'text-green-600' : ''}`}>
                    {isIncome ? '+' : ''}{formattedAmount}
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300" />
            </div>
        </div>
    )
}
