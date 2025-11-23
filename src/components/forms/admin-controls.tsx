"use client"

import { resolveProp, cancelProp } from "@/app/actions"
import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"

interface AdminControlsProps {
    propId: string
    propType: "HIT" | "LINE"
}

export function AdminControls({ propId, propType }: AdminControlsProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    async function handleResolve(winningSide: string) {
        setError(null)
        startTransition(async () => {
            const formData = new FormData()
            formData.append("propId", propId)
            formData.append("winningSide", winningSide)
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

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => handleResolve(propType === "HIT" ? "YES" : "OVER")}
                    disabled={isPending}
                    className="w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-2 rounded-lg hover:bg-emerald-500/20 transition-colors text-sm font-bold disabled:opacity-50"
                >
                    Resolve {propType === "HIT" ? "YES" : "OVER"}
                </button>
                <button
                    onClick={() => handleResolve(propType === "HIT" ? "NO" : "UNDER")}
                    disabled={isPending}
                    className="w-full bg-rose-500/10 text-rose-400 border border-rose-500/20 py-2 rounded-lg hover:bg-rose-500/20 transition-colors text-sm font-bold disabled:opacity-50"
                >
                    Resolve {propType === "HIT" ? "NO" : "UNDER"}
                </button>
            </div>

            <button
                onClick={handleCancel}
                disabled={isPending}
                className="w-full mt-4 text-slate-500 hover:text-slate-300 text-sm underline disabled:opacity-50"
            >
                {isPending ? "Processing..." : "Cancel Prop & Refund"}
            </button>
        </div>
    )
}
