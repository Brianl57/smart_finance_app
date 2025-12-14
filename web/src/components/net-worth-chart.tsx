"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockTotalNetworthTimeSeries } from "@/lib/data"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export function NetWorthChart() {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Net Worth Performance</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockTotalNetworthTimeSeries}>
                            <XAxis
                                dataKey="day"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="networth"
                                stroke="#4ECDC4"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
