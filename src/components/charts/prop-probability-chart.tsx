"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

interface Choice {
    id: string
    text: string
    probability: number
}

interface Bet {
    id: string
    choiceId: string
    amount: number
    createdAt: Date | string
}

interface PropProbabilityChartProps {
    choices: Choice[]
    bets: Bet[]
    createdAt: Date | string
}

// Color palette for different choices (Kalshi-inspired)
const CHART_COLORS = [
    "#10b981", // emerald-500
    "#3b82f6", // blue-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
]

export function PropProbabilityChart({ choices, bets, createdAt }: PropProbabilityChartProps) {
    const timelineData = useMemo(() => {
        // Sort bets chronologically
        const sortedBets = [...bets].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )

        const timeline: any[] = []
        let currentLiquidity = 0
        const poolAmounts: Record<string, number> = Object.fromEntries(
            choices.map(c => [c.id, 0])
        )

        // Initial state (equal probabilities)
        const initialPoint: any = {
            timestamp: new Date(createdAt).getTime(),
            time: format(new Date(createdAt), "MMM d, h:mm a"),
        }
        for (const choice of choices) {
            initialPoint[choice.id] = (1 / choices.length) * 100
        }
        timeline.push(initialPoint)

        // Process each bet
        for (const bet of sortedBets) {
            currentLiquidity += bet.amount
            poolAmounts[bet.choiceId] += bet.amount

            const dataPoint: any = {
                timestamp: new Date(bet.createdAt).getTime(),
                time: format(new Date(bet.createdAt), "MMM d, h:mm a"),
            }

            for (const choice of choices) {
                const probability = currentLiquidity > 0
                    ? (poolAmounts[choice.id] / currentLiquidity) * 100
                    : (1 / choices.length) * 100
                dataPoint[choice.id] = probability
            }

            timeline.push(dataPoint)
        }

        return timeline
    }, [choices, bets, createdAt])

    if (timelineData.length <= 1) {
        return (
            <div className="text-center py-8 text-slate-400 text-sm">
                No betting activity yet. Place bets to see the probability chart.
            </div>
        )
    }

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis
                        dataKey="time"
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickFormatter={(value) => {
                            // Show only first few chars for space
                            const parts = value.split(',')
                            return parts[0]
                        }}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            padding: '8px'
                        }}
                        labelStyle={{ color: '#e2e8f0', fontWeight: 'bold', marginBottom: '4px' }}
                        itemStyle={{ color: '#cbd5e1', fontSize: '12px' }}
                        formatter={(value: any) => `${value.toFixed(1)}%`}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: '16px' }}
                        iconType="line"
                        formatter={(value) => {
                            const choice = choices.find(c => c.id === value)
                            return choice ? choice.text : value
                        }}
                    />
                    {choices.map((choice, index) => (
                        <Line
                            key={choice.id}
                            type="monotone"
                            dataKey={choice.id}
                            stroke={CHART_COLORS[index % CHART_COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
