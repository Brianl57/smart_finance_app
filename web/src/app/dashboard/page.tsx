"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockTotalNetworthTimeSeries, mockSpending, formatCurrency } from "@/lib/data"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { NetWorthChart } from "@/components/net-worth-chart"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
    const [netWorth, setNetWorth] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    // TEMPORARY - DEV ONLY: Display current user for testing multiple accounts
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchUser()
        calculateNetWorth()
    }, [])

    // TEMPORARY - DEV ONLY: Fetch user info for development
    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setUserEmail(user.email || null)
        }
    }

    const calculateNetWorth = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const response = await fetch('http://localhost:4000/api/accounts', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch accounts')
            }

            const accounts = await response.json()

            if (accounts) {
                let total = 0
                accounts.forEach((account: any) => {
                    // API returns balances object nested or flattened?
                    // Looking at backend code: it returns flattened object with balances object nested inside.
                    // balances: { available: ..., current: ..., ... }
                    const balance = account.balances.available ?? account.balances.current ?? 0

                    // Logic: Depository/Investment = Asset (+), Credit/Loan = Liability (-)
                    if (account.type === 'credit' || account.type === 'loan') {
                        total -= balance
                    } else {
                        total += balance
                    }
                })
                setNetWorth(total)
            }
        } catch (error) {
            console.error("Error calculating net worth:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 space-y-8">
            {/* TEMPORARY - DEV ONLY: Display current logged-in user */}
            {userEmail && (
                <div className="bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-500 rounded-md p-3 mb-4">
                    <p className="text-sm font-mono">
                        <strong>DEV MODE:</strong> Logged in as <strong>{userEmail}</strong>
                    </p>
                </div>
            )}

            <h1 className="text-3xl font-bold">Dashboard</h1>

            {/* Net Worth Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Net Worth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? "Loading..." : formatCurrency(netWorth || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Current Balance
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Net Worth Chart */}
                <NetWorthChart />

                {/* Spending Breakdown */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Spending Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={mockSpending}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {mockSpending.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
