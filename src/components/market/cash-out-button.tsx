"use client"

import { useTransition } from "react"
import { sellShares } from "@/app/actions"
import { Loader2, ArrowDownToLine } from "lucide-react"

interface CashOutButtonProps {
    betId: string
    saleValue: number
    pnl: number
}

export function CashOutButton({ betId, saleValue, pnl }: CashOutButtonProps) {
    const [isPending, startTransition] = useTransition()

    async function handleCashOut() {
        if (!confirm(`Cash out for $${saleValue}? ${pnl >= 0 ? `You'll profit $${pnl}` : `You'll lose $${Math.abs(pnl)}`}`)) return

        const formData = new FormData()
        formData.set("betId", betId)

        startTransition(async () => {
            const result = await sellShares(formData)
            if (result?.error) {
                alert(result.error)
            }
        })
    }

    return (
        <button
            onClick={handleCashOut}
            disabled={isPending}
            className={`w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all ${pnl >= 0
                    ? 'bg-[var(--apple-green)]/20 text-[var(--apple-green)] hover:bg-[var(--apple-green)]/30 border border-[var(--apple-green)]/30'
                    : 'bg-[var(--apple-red)]/20 text-[var(--apple-red)] hover:bg-[var(--apple-red)]/30 border border-[var(--apple-red)]/30'
                } disabled:opacity-50`}
        >
            {isPending ? (
                <>
                    <Loader2 className="size-4 animate-spin" />
                    Cashing Out…
                </>
            ) : (
                <>
                    <ArrowDownToLine className="size-4" />
                    Cash Out for ${saleValue} ({pnl >= 0 ? '+' : ''}{pnl})
                </>
            )}
        </button>
    )
}
