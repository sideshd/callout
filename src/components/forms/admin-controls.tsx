"use client"

import { resolveProp, cancelProp } from "@/app/actions"
import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"

interface Choice {
    id: string
    text: string
}

interface AdminControlsProps {
    propId: string
    choices: Choice[]
}

export function AdminControls({ propId, choices }: AdminControlsProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    async function handleResolve(choiceId: string) {
        if (!confirm("Are you sure? This will resolve the market and distribute winnings.")) return

        setError(null)
        startTransition(async () => {
            const formData = new FormData()
            formData.append("propId", propId)
            formData.append("winningChoiceId", choiceId)

            const result = await resolveProp(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    async function handleCancel() {
        if (!confirm("Are you sure you want to cancel this prop? All bets will be refunded.")) return

        setError(null)
        startTransition(async () => {
            const formData = new FormData()
            formData.append("propId", propId)
            const result = await cancelProp(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <div className="p-8 border-t border-white/10 bg-slate-900/80">
            <h3 className="font-bold mb-4 text-slate-300">Admin Controls</h3>

            {error && (
                <div className="mb-4 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <p className="text-xs text-slate-400 mb-2">Resolve Prop</p>
                    <div className="flex flex-wrap gap-2">
                        {choices.map((choice) => (
                            <button
                                key={choice.id}
                                onClick={() => handleResolve(choice.id)}
                                disabled={isPending}
                                className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg hover:bg-emerald-500/20 transition-colors text-sm font-bold disabled:opacity-50"
                            >
                                {choice.text} Wins
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <button
                        onClick={handleCancel}
                        disabled={isPending}
                        className="text-slate-500 hover:text-red-400 text-sm underline disabled:opacity-50 transition-colors"
                    >
                        {isPending ? "Processing..." : "Cancel Prop & Refund"}
                    </button>
                </div>
            </div>
        </div>
    )
}
