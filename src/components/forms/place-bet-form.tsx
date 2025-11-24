"use client"

import { placeBet } from "@/app/actions"
import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"

interface PlaceBetFormProps {
    propId: string
    propType: "HIT" | "LINE"
    betsBySide: Record<string, number>
    maxCredits: number
    wagerAmount: number
    leagueMode: string
    minBet?: number
    odds?: number
}

export function PlaceBetForm({ propId, propType, betsBySide, maxCredits, wagerAmount, leagueMode, minBet = 0, odds }: PlaceBetFormProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [customAmount, setCustomAmount] = useState<number>(minBet || 10)

    async function handleSubmit(formData: FormData) {
        setError(null)
        startTransition(async () => {
            const result = await placeBet(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    const isRankMode = leagueMode === "RANK"
    const potentialWinnings = isRankMode && odds ? customAmount * odds : customAmount * 2

    return (
        <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="propId" value={propId} />
            {isRankMode && <input type="hidden" name="amount" value={customAmount} />}

            {isRankMode && (
                <div className="space-y-2">
                    <label htmlFor="betAmount" className="text-sm font-medium text-slate-300">Your Wager</label>
                    <div className="relative">
                        <input
                            type="number"
                            id="betAmount"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(parseInt(e.target.value) || 0)}
                            min={minBet}
                            max={maxCredits}
                            required
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                        />
                        <span className="absolute right-4 top-3.5 text-sm text-slate-500">credits</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Min: {minBet} • Max: {maxCredits}</span>
                        <span className="text-emerald-400">Win: {potentialWinnings} credits</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                {propType === "HIT" ? (
                    <>
                        <label className="cursor-pointer">
                            <input type="radio" name="side" value="YES" className="peer sr-only" required />
                            <div className="bg-slate-800 border border-white/10 rounded-xl p-4 text-center hover:bg-slate-700 peer-checked:bg-emerald-500 peer-checked:border-emerald-400 transition-all">
                                <span className="font-bold block mb-1">YES</span>
                                <span className="text-xs opacity-75">{betsBySide["YES"] || 0} pool</span>
                            </div>
                        </label>
                        <label className="cursor-pointer">
                            <input type="radio" name="side" value="NO" className="peer sr-only" required />
                            <div className="bg-slate-800 border border-white/10 rounded-xl p-4 text-center hover:bg-slate-700 peer-checked:bg-rose-500 peer-checked:border-rose-400 transition-all">
                                <span className="font-bold block mb-1">NO</span>
                                <span className="text-xs opacity-75">{betsBySide["NO"] || 0} pool</span>
                            </div>
                        </label>
                    </>
                ) : (
                    <>
                        <label className="cursor-pointer">
                            <input type="radio" name="side" value="OVER" className="peer sr-only" required />
                            <div className="bg-slate-800 border border-white/10 rounded-xl p-4 text-center hover:bg-slate-700 peer-checked:bg-emerald-500 peer-checked:border-emerald-400 transition-all">
                                <span className="font-bold block mb-1">OVER</span>
                                <span className="text-xs opacity-75">{betsBySide["OVER"] || 0} pool</span>
                            </div>
                        </label>
                        <label className="cursor-pointer">
                            <input type="radio" name="side" value="UNDER" className="peer sr-only" required />
                            <div className="bg-slate-800 border border-white/10 rounded-xl p-4 text-center hover:bg-slate-700 peer-checked:bg-rose-500 peer-checked:border-rose-400 transition-all">
                                <span className="font-bold block mb-1">UNDER</span>
                                <span className="text-xs opacity-75">{betsBySide["UNDER"] || 0} pool</span>
                            </div>
                        </label>
                    </>
                )}
            </div>

            <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Wager Amount</span>
                <span className="text-xl font-bold text-emerald-400">{isRankMode ? customAmount : wagerAmount} credits</span>
            </div>

            {error && (
                <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-100 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending ? "Placing Bet..." : "Place Bet"}
            </button>
        </form>
    )
}
