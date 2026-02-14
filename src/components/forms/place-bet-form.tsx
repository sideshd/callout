"use client"

import { placeBet } from "@/app/actions"
import { useState, useTransition } from "react"
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
    const [amount, setAmount] = useState<number>(10)
    const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)

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
        <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="propId" value={propId} />

            <div className="space-y-3">
                <label className="text-xs font-black text-white/40 uppercase tracking-wider">Select Outcome</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                    className={`rounded-2xl p-4 transition-all relative overflow-hidden ${isSelected
                                        ? "border-2"
                                        : "wow-mini hover:bg-white/8"
                                        }`}
                                    style={isSelected ? {
                                        borderColor: color,
                                        background: `color-mix(in srgb, ${color} 12%, transparent)`
                                    } : {}}
                                >
                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <span className="font-black text-white transition-colors">
                                            {choice.text}
                                        </span>
                                        <span className="text-lg font-black" style={{ color }}>
                                            {(choice.probability * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="text-xs text-white/30 relative z-10 font-bold">
                                        {choice.poolAmount} credits pool
                                    </div>

                                    {/* Progress bar */}
                                    <div
                                        className="absolute bottom-0 left-0 h-1 transition-all duration-500 rounded-full"
                                        style={{ width: `${choice.probability * 100}%`, backgroundColor: color, opacity: 0.4 }}
                                    ></div>
                                </div>
                            </label>
                        )
                    })}
                </div>
            </div>

            <div className="space-y-3">
                <label htmlFor="amount" className="text-xs font-black text-white/40 uppercase tracking-wider">Wager Amount</label>

                {/* Quick amount buttons */}
                <div className="flex gap-2">
                    {QUICK_AMOUNTS.map((qa) => (
                        <button
                            key={qa}
                            type="button"
                            onClick={() => setAmount(qa)}
                            className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${amount === qa
                                ? "bg-[var(--apple-blue)] text-white"
                                : "wow-mini text-white/60 hover:text-white hover:bg-white/8"
                                }`}
                        >
                            ${qa}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setAmount(maxCredits)}
                        className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${amount === maxCredits
                            ? "bg-[var(--apple-blue)] text-white"
                            : "wow-mini text-white/60 hover:text-white hover:bg-white/8"
                            }`}
                    >
                        Max
                    </button>
                </div>

                <div className="relative">
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={amount}
                        onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                        min="1"
                        max={maxCredits}
                        required
                        className="input-apple"
                    />
                    <span className="absolute right-4 top-3.5 text-sm text-white/30 font-bold">credits</span>
                </div>
                <div className="flex justify-between text-xs text-white/30 font-bold">
                    <span>Balance: {maxCredits}</span>
                </div>
            </div>

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
