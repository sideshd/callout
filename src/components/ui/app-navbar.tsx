"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface AppNavbarProps {
    leagueName?: string
    leagueCode?: string
    memberCount?: number
    balance?: number
    isCommissioner?: boolean
    leagueId?: string
    allowPropCreation?: boolean
}

export function AppNavbar({
    leagueName,
    leagueCode,
    memberCount,
    balance,
    isCommissioner,
    leagueId,
    allowPropCreation,
}: AppNavbarProps) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 blur-bg">
            <div className="max-w-[980px] mx-auto px-6 h-[52px] flex items-center justify-between">
                <Link
                    href="/dashboard"
                    className="text-xl font-bold tracking-tight hover:opacity-60 transition flex items-center gap-2"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand)] to-[var(--purple)] flex items-center justify-center pulse-glow">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    CallOut
                </Link>

                <div className="flex items-center gap-6">
                    {leagueName && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--panel2)] text-sm font-medium shimmer">
                            <span>{leagueName}</span>
                        </div>
                    )}

                    {balance !== undefined && (
                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-[var(--muted)]">Balance</div>
                            <div className="text-lg font-semibold">${balance.toFixed(0)}</div>
                        </div>
                    )}

                    {leagueId && (allowPropCreation || isCommissioner) && (
                        <Link
                            href={`/leagues/${leagueId}/props/create`}
                            className="btn-primary px-6 py-2.5 text-sm"
                        >
                            New Market
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
