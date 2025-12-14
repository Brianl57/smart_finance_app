"use client"

import { Button } from "@/components/ui/button"
import { NetWorthChart } from "@/components/net-worth-chart"
import { RefreshCw } from "lucide-react"
import { PlaidLink } from "@/components/plaid-link"

export default function AccountsPage() {
    return (
        <div className="p-8 space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Accounts</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh all
                    </Button>
                    <PlaidLink />
                </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-4">
                {/* Net Worth Chart reused from Dashboard */}
                <NetWorthChart />
            </div>
        </div>
    )
}
