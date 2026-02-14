"use client"

import { Choice, Bet } from "@prisma/client"
import { useMemo } from "react"

type BetWithChoice = Bet & { choice: Choice }

interface KalshiTooltipData {
    date: Date
    values: Array<{
        name: string
        probability: number
        color: string
    }>
}

interface KalshiTooltipProps {
    data: KalshiTooltipData | null
    position: { x: number; y: number }
    visible: boolean
}

export function KalshiTooltip({ data, position, visible }: KalshiTooltipProps) {
    if (!visible || !data) return null

    return (
        <div
            className="kalshi-tooltip show"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
        >
            <div className="kt-date">
                {data.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                })}
            </div>
            {data.values.map((value, index) => (
                <div key={value.name}>
                    {index > 0 && <div className="kt-sep" />}
                    <div className="kt-item" style={{ "--c": value.color } as React.CSSProperties}>
                        <div className="kt-name">{value.name}</div>
                        <div className={`kt-pct kt-r${Math.min(index, 4)}`}>
                            {(value.probability * 100).toFixed(1)}%
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
