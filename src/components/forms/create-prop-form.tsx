"use client"

import { createProp } from "@/app/actions"
import { useState, useTransition } from "react"
import { Loader2, Plus, X, Check, List } from "lucide-react"

type MarketType = "BINARY" | "MULTIPLE_CHOICE"

export function CreatePropForm({ leagueId, members, leagueMode, currentUserId }: { leagueId: string, members: any[], leagueMode: string, currentUserId: string }) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const [marketType, setMarketType] = useState<MarketType>("BINARY")
    const [choices, setChoices] = useState<string[]>(["", ""])

    const addChoice = () => {
        setChoices([...choices, ""])
    }

    const removeChoice = (index: number) => {
        if (choices.length <= 2) return
        const newChoices = choices.filter((_, i) => i !== index)
        setChoices(newChoices)
    }

    const updateChoice = (index: number, value: string) => {
        const newChoices = [...choices]
        newChoices[index] = value
        setChoices(newChoices)
    }

    async function handleSubmit(formData: FormData) {
        setError(null)

        // Append marketType manually if not picked up (though input hidden will catch it)
        // If MULTIPLE_CHOICE, we need to ensure all choices are sent. 
        // With named inputs "choices", formData.getAll("choices") will work.
        // For BINARY, we can just send "Yes" and "No" or let backend handle.
        // Let's make it explicit here to be safe.

        if (marketType === "BINARY") {
            formData.delete("choices")
            formData.append("choices", "Yes")
            formData.append("choices", "No")
        }

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
            <input type="hidden" name="marketType" value={marketType} />

            {/* Market Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800/50 rounded-xl border border-white/5">
                <button
                    type="button"
                    onClick={() => setMarketType("BINARY")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${marketType === "BINARY"
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <Check className="size-4" />
                    Yes / No
                </button>
                <button
                    type="button"
                    onClick={() => setMarketType("MULTIPLE_CHOICE")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${marketType === "MULTIPLE_CHOICE"
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <List className="size-4" />
                    Multiple Choice
                </button>
            </div>

            <div className="space-y-2">
                <label htmlFor="question" className="text-sm font-medium text-slate-300">Question / Prop</label>
                <textarea
                    id="question"
                    name="question"
                    required
                    rows={2}
                    placeholder={marketType === "BINARY" ? "e.g. Will the Chiefs win the Super Bowl?" : "e.g. Who will win the 2024 Election?"}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
                />
            </div>

            {marketType === "MULTIPLE_CHOICE" && (
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">Outcomes</label>
                    <div className="space-y-2">
                        {choices.map((choice, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    name="choices"
                                    value={choice}
                                    onChange={(e) => updateChoice(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    required
                                    className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                />
                                {choices.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeChoice(index)}
                                        className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                                    >
                                        <X className="size-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addChoice}
                        className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium px-2 py-1 rounded-lg hover:bg-emerald-500/10 transition-colors"
                    >
                        <Plus className="size-4" />
                        Add Option
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="targetPlayerId" className="text-sm font-medium text-slate-300">Target Player (Optional)</label>
                    <select
                        id="targetPlayerId"
                        name="targetPlayerId"
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                    >
                        <option value="">None</option>
                        {members
                            .filter(member => member.userId !== currentUserId)
                            .map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.user.name}
                                </option>
                            ))}
                    </select>
                </div>

                <div className="space-y-2">
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
                {isPending ? "Creating Prop..." : "Create Prop"}
            </button>
        </form >
    )
}
