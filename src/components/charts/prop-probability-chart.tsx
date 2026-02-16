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

const CHART_COLORS = [
    "#34c759", // apple green
    "#007aff", // apple blue
    "#ff9500", // apple orange
    "#ff3b30", // apple red
    "#af52de", // apple purple
    "#5856d6", // apple indigo
]

export function PropProbabilityChart({ choices, bets, createdAt }: PropProbabilityChartProps) {
    const timelineData = useMemo(() => {
        const sortedBets = [...bets].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )

        const timeline: any[] = []
        let currentLiquidity = 0
        const poolAmounts: Record<string, number> = Object.fromEntries(
            choices.map(c => [c.id, 0])
        )

        // Build a lookup: choice.id -> choice.text
        const nameMap: Record<string, string> = Object.fromEntries(
            choices.map(c => [c.id, c.text])
        )

        // Initial state (equal probabilities)
        const initialPoint: any = {
            timestamp: new Date(createdAt).getTime(),
            time: format(new Date(createdAt), "MMM d, h:mm a"),
        }
        for (const choice of choices) {
            initialPoint[choice.text] = Math.round((1 / choices.length) * 100)
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
                dataPoint[choice.text] = Math.round(probability * 10) / 10
            }

            timeline.push(dataPoint)
        }

        return timeline
    }, [choices, bets, createdAt])

    if (timelineData.length <= 1) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto mb-4 flex items-center justify-center border border-white/10">
                    <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <p className="text-white/40 text-sm font-semibold">No trading activity yet</p>
                <p className="text-white/25 text-xs mt-1">Place bets to see the probability chart</p>
            </div>
        )
    }

    return (
        <div className="w-full h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 24, left: -8, bottom: 8 }}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.06)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="time"
                        stroke="rgba(255,255,255,0.2)"
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600 }}
                        tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                        tickFormatter={(value) => {
                            const parts = value.split(',')
                            return parts[0]
                        }}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.2)"
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700 }}
                        tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                        width={48}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(20, 20, 24, 0.95)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '14px',
                            padding: '12px 16px',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        }}
                        labelStyle={{
                            color: 'rgba(255,255,255,0.7)',
                            fontWeight: 700,
                            fontSize: '12px',
                            marginBottom: '8px'
                        }}
                        itemStyle={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '13px',
                            fontWeight: 600,
                            padding: '2px 0'
                        }}
                        formatter={(value: any, name: string) => [`${value.toFixed(1)}%`, name]}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                    />
                    <Legend
                        wrapperStyle={{
                            paddingTop: '16px',
                            fontSize: '13px',
                            fontWeight: 700
                        }}
                        iconType="circle"
                        iconSize={10}
                    />
                    {choices.map((choice, index) => (
                        <Line
                            key={choice.id}
                            type="monotone"
                            dataKey={choice.text}
                            name={choice.text}
                            stroke={CHART_COLORS[index % CHART_COLORS.length]}
                            strokeWidth={3}
                            dot={false}
                            activeDot={{
                                r: 6,
                                stroke: CHART_COLORS[index % CHART_COLORS.length],
                                strokeWidth: 2,
                                fill: '#0a0a0c'
                            }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
