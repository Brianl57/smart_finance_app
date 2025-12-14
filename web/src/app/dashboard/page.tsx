"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockTotalNetworth, mockTotalNetworthTimeSeries, mockSpending, formatCurrency } from "@/lib/data"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { NetWorthChart } from "@/components/net-worth-chart"

export default function DashboardPage() {
    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            {/* Net Worth Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Net Worth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(mockTotalNetworth)}</div>
                        <p className="text-xs text-muted-foreground text-green-500">
                            +23.5% from last month
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
