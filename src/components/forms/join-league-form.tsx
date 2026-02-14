"use client"

import { joinLeague } from "@/app/actions"
import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"

export function JoinLeagueForm() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setError(null)
        startTransition(async () => {
            const result = await joinLeague(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="inviteCode" className="text-sm font-black text-white/70 uppercase tracking-wider">Invite Code</label>
                <input
                    type="text"
                    id="inviteCode"
                    name="inviteCode"
                    required
                    placeholder="e.g. ck8s9d7f..."
                    className="input-apple font-mono"
                />
            </div>

            {error && (
                <div className="text-[var(--apple-red)] text-sm bg-[var(--apple-red)]/10 p-3 rounded-2xl border border-[var(--apple-red)]/20">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending ? "Joining..." : "Join League"}
            </button>
        </form>
    )
}
