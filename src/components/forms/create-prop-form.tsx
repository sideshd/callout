"use client"

import { createProp } from "@/app/actions"
import { useState, useTransition } from "react"
import { Loader2, Plus, X, Check, List } from "lucide-react"

type MarketType = "BINARY" | "MULTIPLE_CHOICE"

export function CreatePropForm({ leagueId, members, currentUserId }: { leagueId: string, members: any[], currentUserId: string }) {
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
            <div className="grid grid-cols-2 gap-2 p-1 glass rounded-2xl">
                <button
                    type="button"
                    onClick={() => setMarketType("BINARY")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all ${marketType === "BINARY"
                        ? "bg-[var(--apple-blue)] text-white shadow-lg"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <Check className="size-4" />
                    Yes / No
                </button>
                <button
                    type="button"
                    onClick={() => setMarketType("MULTIPLE_CHOICE")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all ${marketType === "MULTIPLE_CHOICE"
                        ? "bg-[var(--apple-blue)] text-white shadow-lg"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <List className="size-4" />
                    Multiple Choice
                </button>
            </div>

            <div className="space-y-2">
                <label htmlFor="question" className="text-sm font-black text-white/70 uppercase tracking-wider">Question / Prop</label>
                <textarea
                    id="question"
                    name="question"
                    required
                    rows={2}
                    placeholder={marketType === "BINARY" ? "e.g. Will the Chiefs win the Super Bowl?" : "e.g. Who will win the 2024 Election?"}
                    className="input-apple resize-none"
                />
            </div>

            {marketType === "MULTIPLE_CHOICE" && (
                <div className="space-y-3">
                    <label className="text-sm font-black text-white/70 uppercase tracking-wider">Outcomes</label>
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
                                    className="input-apple flex-1"
                                />
                                {choices.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeChoice(index)}
                                        className="p-3 text-white/40 hover:text-[var(--apple-red)] hover:bg-[var(--apple-red)]/10 rounded-xl transition-colors"
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
                        className="text-sm text-[var(--apple-blue)] hover:text-[var(--apple-blue)]/80 flex items-center gap-1 font-black px-2 py-1 rounded-lg hover:bg-[var(--apple-blue)]/10 transition-colors"
                    >
                        <Plus className="size-4" />
                        Add Option
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="targetPlayerId" className="text-sm font-black text-white/70 uppercase tracking-wider">Target Player</label>
                    <select
                        id="targetPlayerId"
                        name="targetPlayerId"
                        className="input-apple appearance-none"
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
                    <label htmlFor="bettingDeadline" className="text-sm font-black text-white/70 uppercase tracking-wider">Deadline <span className="text-white/30 normal-case">(opt.)</span></label>
                    <input
                        type="datetime-local"
                        id="bettingDeadline"
                        name="bettingDeadline"
                        className="input-apple"
                    />
                </div>
            </div>

            {
                error && (
                    <div className="text-[var(--apple-red)] text-sm bg-[var(--apple-red)]/10 p-3 rounded-2xl border border-[var(--apple-red)]/20">
                        {error}
                    </div>
                )
            }

            <button
                type="submit"
                disabled={isPending}
                className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending ? "Creating Prop..." : "Create Prop"}
            </button>
        </form >
    )
}
