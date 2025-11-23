"use client"

import { leaveLeague, deleteLeague } from "@/app/actions"
import { useState, useTransition } from "react"
import { Loader2, LogOut, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface LeagueActionsProps {
    leagueId: string
    isOwner: boolean
}

export function LeagueActions({ leagueId, isOwner }: LeagueActionsProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    async function handleLeave() {
        if (!confirm("Are you sure you want to leave this league?")) return

        startTransition(async () => {
            const formData = new FormData()
            formData.append("leagueId", leagueId)
            const result = await leaveLeague(formData)
            if (result?.error) {
                alert(result.error)
            } else {
                router.push("/dashboard")
            }
        })
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to DELETE this league? This cannot be undone.")) return

        startTransition(async () => {
            const formData = new FormData()
            formData.append("leagueId", leagueId)
            const result = await deleteLeague(formData)
            if (result?.error) {
                alert(result.error)
            } else {
                router.push("/dashboard")
            }
        })
    }

    return (
        <div className="flex items-center gap-2">
            {isOwner ? (
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="bg-red-500/10 text-red-400 p-2 rounded-full hover:bg-red-500/20 transition-colors"
                    title="Delete League"
                >
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                </button>
            ) : (
                <button
                    onClick={handleLeave}
                    disabled={isPending}
                    className="bg-slate-800 text-slate-400 p-2 rounded-full hover:bg-slate-700 hover:text-white transition-colors"
                    title="Leave League"
                >
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                </button>
            )}
        </div>
    )
}
