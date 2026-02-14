"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface DockTab {
    id: string
    label: string
    href: string
}

const tabs: DockTab[] = [
    { id: "markets", label: "Markets", href: "/dashboard" },
    { id: "portfolio", label: "Portfolio", href: "/dashboard/portfolio" },
    { id: "leaderboard", label: "Board", href: "/dashboard/leaderboard" },
    { id: "resolved", label: "Resolved", href: "/dashboard/resolved" },
    { id: "social", label: "Social", href: "/dashboard/social" },
]

export function DockNavigation() {
    const router = useRouter()
    const pathname = usePathname()

    const getActiveTab = () => {
        if (pathname === "/dashboard") return "markets"
        if (pathname.includes("/portfolio")) return "portfolio"
        if (pathname.includes("/leaderboard")) return "leaderboard"
        if (pathname.includes("/resolved")) return "resolved"
        if (pathname.includes("/social")) return "social"
        return "markets"
    }

    const activeTab = getActiveTab()

    return (
        <div className="wow-dock">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => router.push(tab.href)}
                    className={cn(activeTab === tab.id && "active")}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}
