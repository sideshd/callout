"use client"

import { Copy, Check } from "lucide-react"
import { useState } from "react"

export function CopyInviteCode({ inviteCode }: { inviteCode: string }) {
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

    return (
        <div className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-3">
            <div className="text-xs">
                <span className="text-slate-500 block">Invite Code</span>
                <span className="font-mono font-bold text-white tracking-wider">{inviteCode}</span>
            </div>
            <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white"
                title={copied ? "Copied!" : "Copy to clipboard"}
            >
                {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
            </button>
        </div>
    )
}
