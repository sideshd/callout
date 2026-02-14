"use client"

import { useState } from "react"
import { League, LeagueMember, Prop, Activity, User } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import { Trophy, TrendingUp, Settings, Users, Activity as ActivityIcon, MessageSquare, LogOut, Trash2, Edit2, Check, X } from "lucide-react"
import Link from "next/link"
import { updateLeagueSettings, adminAction, updateMemberCredits, leaveLeague, deleteLeague, markNotificationRead, markAllNotificationsRead } from "@/app/actions"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Bell } from "lucide-react"

type LeagueTabsProps = {
    league: League & { members: (LeagueMember & { user: User })[] }
    // Updated Prop type to include choices
    activeProps: (Prop & { creator: { user: User }, bets: any[], choices: any[], targetPlayer?: { user: User } | null })[]
    pastProps: (Prop & { creator: { user: User }, bets: any[], choices: any[], targetPlayer?: { user: User } | null })[]
    activities: (Activity & { user: User })[]
    notifications: any[]
    currentUserId: string
    isOwner: boolean
}

export function LeagueTabs({ league, activeProps, pastProps, activities, notifications, currentUserId, isOwner }: LeagueTabsProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [activeTab, setActiveTab] = useState<"board" | "feed" | "notifications" | "admin" | "settings">("board")
    const [editingCredits, setEditingCredits] = useState<string | null>(null)
    const [filterBetStatus, setFilterBetStatus] = useState<"ALL" | "BET_ON" | "NOT_BET_ON">("ALL")

    const unreadNotificationsCount = notifications.filter(n => !n.read).length

    const handleAction = async (action: (formData: FormData) => Promise<void>, formData: FormData) => {
        startTransition(async () => {
            await action(formData)
            router.refresh()
        })
    }

    const filteredProps = activeProps.filter(prop => {
        // Filter by Bet Status
        const hasBet = prop.bets.some(bet => bet.userId === currentUserId)
        if (filterBetStatus === "BET_ON" && !hasBet) return false
        if (filterBetStatus === "NOT_BET_ON" && hasBet) return false

        return true
    })

    return (
        <div>
            {/* Tabs Header */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto p-1 glass rounded-2xl">
                <button
                    onClick={() => setActiveTab("board")}
                    className={`px-4 py-2 text-sm font-black transition-all rounded-xl whitespace-nowrap ${activeTab === "board" ? "bg-[var(--apple-blue)] text-white shadow-lg" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                >
                    Board
                </button>
                <button
                    onClick={() => setActiveTab("feed")}
                    className={`px-4 py-2 text-sm font-black transition-all rounded-xl whitespace-nowrap ${activeTab === "feed" ? "bg-[var(--apple-blue)] text-white shadow-lg" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                >
                    Activity
                </button>
                <button
                    onClick={() => setActiveTab("notifications")}
                    className={`px-4 py-2 text-sm font-black transition-all rounded-xl whitespace-nowrap flex items-center gap-2 ${activeTab === "notifications" ? "bg-[var(--apple-blue)] text-white shadow-lg" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                >
                    Notifications
                    {unreadNotificationsCount > 0 && (
                        <span className="bg-[var(--apple-red)] text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                            {unreadNotificationsCount}
                        </span>
                    )}
                </button>
                {isOwner && (
                    <button
                        onClick={() => setActiveTab("admin")}
                        className={`px-4 py-2 text-sm font-black transition-all rounded-xl whitespace-nowrap ${activeTab === "admin" ? "bg-[var(--apple-blue)] text-white shadow-lg" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                    >
                        Admin
                    </button>
                )}
                <button
                    onClick={() => setActiveTab("settings")}
                    className={`px-4 py-2 text-sm font-black transition-all rounded-xl whitespace-nowrap ${activeTab === "settings" ? "bg-[var(--apple-blue)] text-white shadow-lg" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                >
                    Settings
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === "board" && (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content: Props */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Active Props */}
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <h2 className="text-xl font-black flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-[var(--apple-green)] animate-pulse"></span>
                                    Active Markets
                                </h2>

                                {/* Filters */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                                    <select
                                        value={filterBetStatus}
                                        onChange={(e) => setFilterBetStatus(e.target.value as any)}
                                        className="glass rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--apple-blue)] appearance-none pr-8"
                                    >
                                        <option value="ALL">All Markets</option>
                                        <option value="BET_ON">My Positions</option>
                                        <option value="NOT_BET_ON">Unseen</option>
                                    </select>
                                </div>
                            </div>

                            {filteredProps.length === 0 ? (
                                <div className="text-center py-12 glass rounded-3xl">
                                    <p className="text-white/40 mb-4">No active markets found.</p>
                                    {league.allowPropCreation || isOwner ? (
                                        <Link
                                            href={`/leagues/${league.id}/props/create`}
                                            className="text-[var(--apple-blue)] hover:text-[var(--apple-blue)]/80 font-black"
                                        >
                                            Create one?
                                        </Link>
                                    ) : (
                                        <p className="text-xs text-white/30">Market creation is currently disabled.</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredProps.map((prop) => {
                                        const hasBet = prop.bets.some(bet => bet.userId === currentUserId)
                                        const totalLiquidity = prop.liquidity || prop.bets.reduce((acc: number, bet: any) => acc + bet.amount, 0)
                                        const topChoice = prop.choices?.sort((a: any, b: any) => b.probability - a.probability)[0]

                                        return (
                                            <Link
                                                key={prop.id}
                                                href={`/props/${prop.id}`}
                                                className="block glass rounded-3xl p-6 hover:bg-white/8 transition-all group card-shadow"
                                            >
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-black text-white group-hover:text-[var(--apple-blue)] transition-colors mb-1">
                                                            {prop.question}
                                                        </h3>
                                                        {topChoice && (
                                                            <div className="text-xs text-white/40">
                                                                Top: <span className="text-[var(--apple-green)] font-black">{topChoice.text}</span> ({(topChoice.probability * 100).toFixed(0)}%)
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-[var(--apple-purple)]/15 text-[var(--apple-purple)] text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                                Market
                                                            </span>
                                                            {prop.targetPlayer && (
                                                                <span className="glass text-white/70 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                                                                    <span>@</span>
                                                                    {prop.targetPlayer.user.name}
                                                                </span>
                                                            )}
                                                            {prop.status === "LOCKED" && (
                                                                <span className="bg-[var(--apple-orange)]/15 text-[var(--apple-orange)] text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                                    Locked
                                                                </span>
                                                            )}
                                                        </div>
                                                        {hasBet && (
                                                            <span className="bg-[var(--apple-green)]/15 text-[var(--apple-green)] text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                                                                <Check className="size-3" />
                                                                Position
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-sm text-white/40">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] text-white font-black">
                                                            {prop.creator.user.name?.[0] || "?"}
                                                        </div>
                                                        <span className="font-bold">{prop.creator.user.name}</span>
                                                        <span>•</span>
                                                        <span>{formatDistanceToNow(new Date(prop.createdAt), { addSuffix: true })}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[var(--apple-green)] font-black">
                                                        <TrendingUp className="size-4" />
                                                        <span>{totalLiquidity} vol</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Past Props */}
                        {pastProps.length > 0 && (
                            <div>
                                <h2 className="text-xl font-black mb-4 text-white/40">Resolved</h2>
                                <div className="space-y-4 opacity-75 hover:opacity-100 transition-opacity">
                                    {pastProps.map((prop) => (
                                        <Link
                                            key={prop.id}
                                            href={`/props/${prop.id}`}
                                            className="block glass rounded-3xl p-6 hover:bg-white/8 transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <h3 className="text-lg font-black text-white/70">
                                                    {prop.question}
                                                </h3>
                                                <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${prop.status === "RESOLVED" ? "bg-[var(--apple-blue)]/15 text-[var(--apple-blue)]" : "bg-[var(--apple-red)]/15 text-[var(--apple-red)]"
                                                    }`}>
                                                    {prop.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-white/30">
                                                {prop.resolutionDeadline ? `Resolved ${formatDistanceToNow(new Date(prop.resolutionDeadline), { addSuffix: true })}` : ""}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Leaderboard */}
                    <div className="space-y-6">
                        <div className="glass rounded-3xl p-6 card-shadow">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Trophy className="size-5 text-[var(--apple-orange)]" />
                                    <h2 className="font-black text-lg">Leaderboard</h2>
                                </div>
                                <Link href={`/leagues/${league.id}/leaderboard`} className="text-xs text-[var(--apple-blue)] hover:text-[var(--apple-blue)]/80 font-black">
                                    View All
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {league.members.map((member, index) => (
                                    <div key={member.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 text-center font-black ${index === 0 ? "text-[var(--apple-orange)]" :
                                                index === 1 ? "text-white/60" :
                                                    index === 2 ? "text-[var(--apple-orange)]/60" : "text-white/30"
                                                }`}>
                                                {index + 1}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-black border border-white/20">
                                                    {member.user.name?.[0] || "?"}
                                                </div>
                                                <span className={member.userId === currentUserId ? "text-[var(--apple-green)] font-black" : "text-white/80 font-bold"}>
                                                    {member.user.name}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="font-mono font-black text-[var(--apple-green)]">{member.credits}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "feed" && (
                <div className="max-w-2xl mx-auto">
                    {!league.showActivityFeed && !isOwner ? (
                        <div className="text-center py-12">
                            <ActivityIcon className="size-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">Activity feed is currently disabled.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activities.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    No activity yet.
                                </div>
                            ) : (
                                activities.map((activity) => (
                                    <div key={activity.id} className="glass rounded-2xl p-4 flex items-start gap-4">
                                        <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-black shrink-0 border border-white/20">
                                            {activity.user.name?.[0] || "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm">
                                                <span className="font-bold text-white">{activity.user.name}</span>
                                                <span className="text-white/50"> {activity.content}</span>
                                            </p>
                                            <p className="text-xs text-white/30 mt-1">
                                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "notifications" && (
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold">Notifications</h2>
                        {unreadNotificationsCount > 0 && (
                            <button
                                onClick={() => startTransition(async () => {
                                    await markAllNotificationsRead(league.id)
                                    router.refresh()
                                })}
                                className="text-xs text-emerald-400 hover:text-emerald-300"
                                disabled={isPending}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {notifications.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                No notifications.
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`bg-white/5 border ${notification.read ? 'border-white/5 opacity-60' : 'border-emerald-500/30'} rounded-xl p-4 flex items-start gap-4 transition-all hover:bg-white/10`}
                                >
                                    <div className={`size-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${notification.type === 'BET_WON' ? 'bg-emerald-500/20 text-emerald-400' : notification.type === 'BET_LOST' ? 'bg-red-500/20 text-red-400' : notification.type === 'PROP_ON_YOU' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        <Bell className="size-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-white mb-1">{notification.message}</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-slate-500">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </p>
                                            {!notification.read && (
                                                <button
                                                    onClick={() => startTransition(async () => {
                                                        await markNotificationRead(notification.id, league.id)
                                                        router.refresh()
                                                    })}
                                                    className="text-xs text-emerald-400 hover:text-emerald-300"
                                                    disabled={isPending}
                                                >
                                                    Mark read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === "admin" && isOwner && (
                <div className="max-w-2xl mx-auto space-y-8">
                    {/* Settings */}
                    <div className="glass rounded-3xl p-6 card-shadow">
                        <h2 className="text-lg font-black mb-6 flex items-center gap-2">
                            <Settings className="size-5 text-white/40" />
                            League Settings
                        </h2>
                        <form action={updateLeagueSettings} className="space-y-4">
                            <input type="hidden" name="leagueId" value={league.id} />

                            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                                <div>
                                    <p className="font-medium text-white">Allow Prop Creation</p>
                                    <p className="text-xs text-slate-400">Let members create their own props</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="allowPropCreation"
                                        value="true"
                                        defaultChecked={league.allowPropCreation}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                                <div>
                                    <p className="font-medium text-white">Show Activity Feed</p>
                                    <p className="text-xs text-slate-400">Display recent activity to members</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="showActivityFeed"
                                        value="true"
                                        defaultChecked={league.showActivityFeed}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full btn-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isPending}
                                onClick={(e) => {
                                    e.preventDefault()
                                    const form = e.currentTarget.closest('form')
                                    if (form) handleAction(updateLeagueSettings, new FormData(form))
                                }}
                            >
                                {isPending ? "Saving..." : "Save Settings"}
                            </button>
                        </form>
                    </div>

                    {/* Member Management */}
                    <div className="glass rounded-3xl p-6 card-shadow">
                        <h2 className="text-lg font-black mb-6 flex items-center gap-2">
                            <Users className="size-5 text-white/40" />
                            Member Management
                        </h2>
                        <div className="space-y-4">
                            {league.members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
                                            {member.user.name?.[0] || "?"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">
                                                {member.user.name}
                                                {member.userId === currentUserId && <span className="text-xs text-slate-500 ml-2">(You)</span>}
                                            </p>

                                            {editingCredits === member.userId ? (
                                                <form action={async (formData) => {
                                                    await handleAction(updateMemberCredits, formData)
                                                    setEditingCredits(null)
                                                }} className="flex items-center gap-2 mt-1">
                                                    <input type="hidden" name="leagueId" value={league.id} />
                                                    <input type="hidden" name="targetUserId" value={member.userId} />
                                                    <input
                                                        type="number"
                                                        name="credits"
                                                        defaultValue={member.credits}
                                                        className="w-20 bg-slate-800 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-400"
                                                    />
                                                    <button type="submit" disabled={isPending} className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50">
                                                        <Check className="size-4" />
                                                    </button>
                                                    <button type="button" onClick={() => setEditingCredits(null)} className="text-red-400 hover:text-red-300">
                                                        <X className="size-4" />
                                                    </button>
                                                </form>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-slate-400">{member.credits} credits</p>
                                                    <button
                                                        onClick={() => setEditingCredits(member.userId)}
                                                        className="text-slate-500 hover:text-white transition-colors"
                                                    >
                                                        <Edit2 className="size-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {member.userId !== currentUserId && (
                                        <div className="flex items-center gap-2">
                                            <form action={(formData) => handleAction(adminAction, formData)}>
                                                <input type="hidden" name="leagueId" value={league.id} />
                                                <input type="hidden" name="targetUserId" value={member.userId} />
                                                <input type="hidden" name="action" value="KICK" />
                                                <button type="submit" disabled={isPending} className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50">
                                                    {isPending ? "..." : "Kick"}
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "settings" && (
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="glass rounded-3xl p-6 card-shadow">
                        <h2 className="text-lg font-black mb-6 flex items-center gap-2">
                            <Settings className="size-5 text-white/40" />
                            Settings
                        </h2>

                        {isOwner ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                                        <Trash2 className="size-4" />
                                        Danger Zone
                                    </h3>
                                    <p className="text-sm text-red-300/70 mb-4">
                                        Deleting the league is irreversible. All data, including props and bets, will be lost.
                                    </p>
                                    <form action={deleteLeague}>
                                        <input type="hidden" name="leagueId" value={league.id} />
                                        <button
                                            type="submit"
                                            className="w-full bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            Delete League
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-4 bg-slate-900/50 rounded-xl">
                                    <h3 className="font-bold mb-2 text-white">Leave League</h3>
                                    <p className="text-sm text-slate-400 mb-4">
                                        You will lose your current credits and betting history in this league.
                                    </p>
                                    <form action={leaveLeague}>
                                        <input type="hidden" name="leagueId" value={league.id} />
                                        <button
                                            type="submit"
                                            className="w-full bg-white/10 text-white font-bold py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <LogOut className="size-4" />
                                            Leave League
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
