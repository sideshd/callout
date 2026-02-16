"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function CopyInviteCode({ inviteCode, variant }: { inviteCode: string, variant?: "inline" | "button" }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error("Failed to copy:", error)
        }
    }

    if (variant === "button") {
        return (
            <button
                onClick={handleCopy}
                className="btn-quiet px-4 py-3 text-sm text-center w-full flex items-center justify-center gap-2"
            >
                {copied ? (
                    <>
                        <Check className="size-4 text-[var(--good)]" />
                        Copied!
                    </>
                ) : (
                    <>
                        <Copy className="size-4" />
                        Copy invite code
                    </>
                )}
            </button>
        )
    }

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition"
            title={copied ? "Copied!" : "Copy to clipboard"}
        >
            <span className="font-mono font-semibold">{inviteCode}</span>
            {copied ? <Check className="size-4 text-[var(--good)]" /> : <Copy className="size-4 text-[var(--muted)]" />}
        </button>
    )
}
