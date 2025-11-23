"use client"

import { placeBet } from "@/app/actions"
import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"

interface PlaceBetFormProps {
    propId: string
    propType: "HIT" | "LINE"
    betsBySide: Record<string, number>
    maxCredits: number
}

export function PlaceBetForm({ propId, propType, betsBySide, maxCredits }: PlaceBetFormProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

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

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Wager Amount</label>
                <div className="relative">
                    <input
                        type="number"
                        name="amount"
                        min="1"
                        max={maxCredits}
                        required
                        placeholder={`Max: ${maxCredits}`}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                    <span className="absolute right-4 top-3.5 text-sm text-slate-500">credits</span>
                </div>
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
