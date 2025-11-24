"use client"

import { createProp } from "@/app/actions"
import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"

export function CreatePropForm({ leagueId, members, leagueMode }: { leagueId: string, members: any[], leagueMode: string }) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setError(null)
        startTransition(async () => {
            const result = await createProp(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="leagueId" value={leagueId} />

            <div className="space-y-2">
                <label htmlFor="question" className="text-sm font-medium text-slate-300">Question</label>
                <textarea
                    id="question"
                    name="question"
                    required
                    rows={3}
                    placeholder="e.g. Will Dylan get cheated on this semester?"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="type" className="text-sm font-medium text-slate-300">Type</label>
                    <select
                        id="type"
                        name="type"
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                    >
                        <option value="HIT">Hit / Miss</option>
                        <option value="LINE">Over / Under</option>
                    </select>
                </div>



                <div className="space-y-2">
                    <label htmlFor="wagerAmount" className="text-sm font-medium text-slate-300">Wager Amount</label>
                    <div className="relative">
                        <input
                            type="number"
                            id="wagerAmount"
                            name="wagerAmount"
                            required
                            min="0"
                            defaultValue="10"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                        />
                        <span className="absolute right-4 top-3.5 text-sm text-slate-500">credits</span>
                    </div>
                </div>
            </div>

            {leagueMode === "RANK" && (
                <div className="space-y-2">
                    <label htmlFor="odds" className="text-sm font-medium text-slate-300">Odds (Payout Multiplier)</label>
                    <select
                        id="odds"
                        name="odds"
                        required
                        defaultValue="2"
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                    >
                        <option value="1">1:1 (Even money)</option>
                        <option value="2">2:1 (Double)</option>
                        <option value="3">3:1 (Triple)</option>
                        <option value="4">4:1</option>
                        <option value="5">5:1</option>
                        <option value="6">6:1</option>
                        <option value="7">7:1</option>
                        <option value="8">8:1</option>
                        <option value="9">9:1</option>
                        <option value="10">10:1</option>
                    </select>
                    <p className="text-xs text-slate-500">Winners receive their bet × this multiplier</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="targetPlayerId" className="text-sm font-medium text-slate-300">Target Player</label>
                    <select
                        id="targetPlayerId"
                        name="targetPlayerId"
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                    >
                        <option value="">None</option>
                        {members.map((member) => (
                            <option key={member.id} value={member.id}>
                                {member.user.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2 col-span-2">
                    <label htmlFor="bettingDeadline" className="text-sm font-medium text-slate-300">Betting Deadline</label>
                    <input
                        type="datetime-local"
                        id="bettingDeadline"
                        name="bettingDeadline"
                        required
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                </div>
            </div>

            {
                error && (
                    <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        {error}
                    </div>
                )
            }

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-100 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending ? "Posting..." : "Post Prop"}
            </button>
        </form >
    )
}
