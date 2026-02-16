"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, Briefcase, Trophy, CheckCircle2, Users } from "lucide-react"

type Tab = {
    id: string
    label: string
    icon: React.ReactNode
}

const tabs: Tab[] = [
    { id: "markets", label: "Markets", icon: <TrendingUp className="size-4" /> },
    { id: "portfolio", label: "Portfolio", icon: <Briefcase className="size-4" /> },
    { id: "leaderboard", label: "Board", icon: <Trophy className="size-4" /> },
    { id: "resolved", label: "Resolved", icon: <CheckCircle2 className="size-4" /> },
    { id: "social", label: "Social", icon: <Users className="size-4" /> },
]

type DockNavigationProps = {
    activeTab: string
    onTabChange: (tab: string) => void
}

export function DockNavigation({ activeTab, onTabChange }: DockNavigationProps) {
    return (
        <div className="wow-dock">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        "flex-1 flex flex-col items-center gap-1 py-2.5 px-3 rounded-[14px] text-[11px] font-bold transition-all",
                        activeTab === tab.id
                            ? "bg-white/12 text-white shadow-sm"
                            : "text-white/40 hover:text-white/70 hover:bg-white/5"
                    )}
                >
                    {tab.icon}
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
    )
}
