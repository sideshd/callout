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
                <label htmlFor="name" className="text-sm font-medium text-slate-300">League Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. The Squad 2025"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="startingCredits" className="text-sm font-medium text-slate-300">Starting Credits</label>
                <input
                    type="number"
                    id="startingCredits"
                    name="startingCredits"
                    defaultValue={1000}
                    min={100}
                    step={100}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-slate-300">Description (Optional)</label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="What's this league about?"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
                />
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
                {isPending ? "Creating..." : "Create League"}
            </button>
        </form>
    )
}
