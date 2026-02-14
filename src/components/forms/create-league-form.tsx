"use client"

import { createLeague } from "@/app/actions"
import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"

export function CreateLeagueForm() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setError(null)
        startTransition(async () => {
            const result = await createLeague(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-black text-white/70 uppercase tracking-wider">League Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. The Squad 2025"
                    className="input-apple"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="startingCredits" className="text-sm font-black text-white/70 uppercase tracking-wider">Starting Credits</label>
                <input
                    type="number"
                    id="startingCredits"
                    name="startingCredits"
                    defaultValue={1000}
                    min={100}
                    step={100}
                    className="input-apple"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-black text-white/70 uppercase tracking-wider">Description (Optional)</label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="What's this league about?"
                    className="input-apple resize-none"
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
                {isPending ? "Creating..." : "Create League"}
            </button>
        </form>
    )
}
