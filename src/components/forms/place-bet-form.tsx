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
                <label className="text-sm font-medium text-slate-300">Select Outcome</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {choices.map((choice) => (
                        <label key={choice.id} className="cursor-pointer group">
                            <input
                                type="radio"
                                name="choiceId"
                                value={choice.id}
                                className="peer sr-only"
                                required
                                onChange={() => setSelectedChoiceId(choice.id)}
                            />
                            <div className="bg-slate-800 border border-white/10 rounded-xl p-4 hover:bg-slate-700 peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 transition-all relative overflow-hidden">
                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <span className="font-bold text-white group-hover:text-emerald-400 peer-checked:text-emerald-400 transition-colors">
                                        {choice.text}
                                    </span>
                                    <span className="text-lg font-bold text-emerald-400">
                                        {(choice.probability * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 relative z-10">
                                    {choice.poolAmount} credits pool
                                </div>

                                {/* Progress bar visual */}
                                <div
                                    className="absolute bottom-0 left-0 h-1 bg-emerald-500/30 transition-all duration-500"
                                    style={{ width: `${choice.probability * 100}%` }}
                                ></div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium text-slate-300">Wager Amount</label>
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
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                    <span className="absolute right-4 top-3.5 text-sm text-slate-500">credits</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                    <span>Balance: {maxCredits}</span>
                </div>
            </div>

            {error && (
                <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending || !selectedChoiceId}
                className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-100 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending ? "Placing Bet..." : "Buy Shares"}
            </button>
        </form>
    )
}
