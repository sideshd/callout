"use client"

import { placeBet } from "@/app/actions"
import { useState, useTransition, useMemo } from "react"
import { Loader2 } from "lucide-react"

interface Choice {
    id: string
    text: string
    probability: number
    poolAmount: number
}

interface PlaceBetFormProps {
    propId: string
    choices: Choice[]
    maxCredits: number
}

const QUICK_AMOUNTS = [10, 50, 100]

const CHOICE_COLORS = [
    "var(--apple-green)",
    "var(--apple-blue)",
    "var(--apple-orange)",
    "var(--apple-red)",
    "var(--apple-purple)",
]

export function PlaceBetForm({ propId, choices, maxCredits }: PlaceBetFormProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [amount, setAmount] = useState<number>(50)
    const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)

    const selectedChoice = choices.find(c => c.id === selectedChoiceId)

    // Estimate trade preview
    const tradePreview = useMemo(() => {
        if (!selectedChoice || amount <= 0) return null
        const curPrice = selectedChoice.probability
        const estShares = amount / Math.max(curPrice, 0.01)
        const avgFill = amount / estShares
        // Simple estimate of price impact
        const impact = curPrice > 0 ? ((amount / (selectedChoice.poolAmount + amount)) * 100) : 0
        return {
            curPrice: (curPrice * 100).toFixed(0),
            estShares: estShares.toFixed(2),
            avgFill: (avgFill * 100).toFixed(0),
            impact: impact.toFixed(1),
        }
    }, [selectedChoice, amount])

    async function handleSubmit(formData: FormData) {
        setError(null)
        startTransition(async () => {
            const result = await placeBet(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <form action={handleSubmit} className="space-y-5">
            <input type="hidden" name="propId" value={propId} />

            {/* Outcome selection */}
            <div className="space-y-3">
                <label className="text-xs font-black text-white/40 uppercase tracking-wider">Select Outcome</label>
                <div className="grid grid-cols-1 gap-2">
                    {choices.map((choice, index) => {
                        const color = CHOICE_COLORS[index % CHOICE_COLORS.length]
                        const isSelected = selectedChoiceId === choice.id
                        return (
                            <label key={choice.id} className="cursor-pointer group">
                                <input
                                    type="radio"
                                    name="choiceId"
                                    value={choice.id}
                                    className="peer sr-only"
                                    required
                                    onChange={() => setSelectedChoiceId(choice.id)}
                                />
                                <div
                                    className={`rounded-xl p-4 transition-all relative overflow-hidden ${isSelected
                                        ? "border-2"
                                        : "bg-white/5 border border-white/10 hover:bg-white/[0.08]"
                                        }`}
                                    style={isSelected ? {
                                        borderColor: color,
                                        background: `color-mix(in srgb, ${color} 12%, transparent)`
                                    } : {}}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ background: color }}></div>
                                            <span className="font-black text-white">{choice.text}</span>
                                        </div>
                                        <span className="font-mono font-bold text-sm" style={{ color }}>
                                            {(choice.probability * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            </label>
                        )
                    })}
                </div>
            </div>

            {/* Wager Amount */}
            <div className="space-y-3">
                <label className="text-xs font-black text-white/40 uppercase tracking-wider">Wager Amount</label>

                {/* Number input */}
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] font-bold text-xl">$</span>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={amount}
                        onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                        min="1"
                        max={maxCredits}
                        required
                        className="input-apple w-full pl-10 pr-4 text-2xl font-black text-center"
                    />
                </div>

                {/* Range slider */}
                <input
                    type="range"
                    min="1"
                    max={Math.min(1000, maxCredits)}
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value))}
                    className="w-full accent-[var(--apple-blue)]"
                />

                {/* Quick amounts */}
                <div className="grid grid-cols-4 gap-2">
                    {QUICK_AMOUNTS.map((qa) => (
                        <button
                            key={qa}
                            type="button"
                            onClick={() => setAmount(qa)}
                            className={`py-2.5 rounded-xl text-sm font-black transition-all ${amount === qa
                                ? "bg-[var(--apple-blue)] text-white"
                                : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.08]"
                                }`}
                        >
                            ${qa}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setAmount(Math.floor(maxCredits))}
                        className={`py-2.5 rounded-xl text-sm font-black transition-all ${amount === Math.floor(maxCredits)
                            ? "bg-[var(--apple-blue)] text-white"
                            : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.08]"
                            }`}
                    >
                        Max
                    </button>
                </div>

                <div className="text-xs text-[var(--muted)] text-center">
                    Available balance: ${maxCredits}
                </div>
            </div>

            {/* Trade Preview */}
            {tradePreview && selectedChoice && (
                <div className="glass rounded-2xl p-4 border border-white/10">
                    <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">Trade preview</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <div className="text-[var(--muted)] text-xs">Current price</div>
                            <div className="font-black">{tradePreview.curPrice}%</div>
                        </div>
                        <div>
                            <div className="text-[var(--muted)] text-xs">Est. shares</div>
                            <div className="font-black">{tradePreview.estShares}</div>
                        </div>
                        <div>
                            <div className="text-[var(--muted)] text-xs">Avg fill</div>
                            <div className="font-black">{tradePreview.avgFill}%</div>
                        </div>
                        <div>
                            <div className="text-[var(--muted)] text-xs">Price impact</div>
                            <div className="font-black">{tradePreview.impact}%</div>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="text-[var(--apple-red)] text-sm bg-[var(--apple-red)]/10 p-3 rounded-2xl border border-[var(--apple-red)]/20">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending || !selectedChoiceId}
                className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending ? "Placing Bet..." : "Buy Shares"}
            </button>
        </form>
    )
}
