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
    activeProps: (Prop & { creator: { user: User }, bets: any[], targetPlayer?: { user: User } | null })[]
    pastProps: (Prop & { creator: { user: User }, bets: any[], targetPlayer?: { user: User } | null })[]
    activities: (Activity & { user: User })[]
    notifications: any[] // Using any for now to avoid complex type issues with Prisma enums on client, but ideally should be typed
    currentUserId: string
    isOwner: boolean
}

export function LeagueTabs({ league, activeProps, pastProps, activities, notifications, currentUserId, isOwner }: LeagueTabsProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [activeTab, setActiveTab] = useState<"board" | "feed" | "notifications" | "admin" | "settings">("board")
    const [editingCredits, setEditingCredits] = useState<string | null>(null)
    const [filterType, setFilterType] = useState<"ALL" | "HIT" | "LINE">("ALL")
    const [filterBetStatus, setFilterBetStatus] = useState<"ALL" | "BET_ON" | "NOT_BET_ON">("ALL")

    const unreadNotificationsCount = notifications.filter(n => !n.read).length

    const handleAction = async (action: (formData: FormData) => Promise<void>, formData: FormData) => {
        startTransition(async () => {
            await action(formData)
            router.refresh()
        })
    }

    const filteredProps = activeProps.filter(prop => {
        // Filter by Type
        if (filterType === "HIT" && prop.type !== "HIT") return false
        if (filterType === "LINE" && prop.type !== "LINE") return false

        // Filter by Bet Status
        const hasBet = prop.bets.some(bet => bet.userId === currentUserId)
        if (filterBetStatus === "BET_ON" && !hasBet) return false
        if (filterBetStatus === "NOT_BET_ON" && hasBet) return false

        return true
    })

    return (
        <div>
            {/* Tabs Header */}
            <div className="flex items-center gap-4 mb-8 border-b border-white/10 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("board")}
                    className={`pb-4 px-2 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === "board" ? "text-white" : "text-slate-400 hover:text-slate-300"}`}
                >
                    Board
                    {activeTab === "board" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("feed")}
                    className={`pb-4 px-2 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === "feed" ? "text-white" : "text-slate-400 hover:text-slate-300"}`}
                >
                    Activity Feed
                    {activeTab === "feed" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("notifications")}
                    className={`pb-4 px-2 text-sm font-bold transition-colors relative whitespace-nowrap flex items-center gap-2 ${activeTab === "notifications" ? "text-white" : "text-slate-400 hover:text-slate-300"}`}
                >
                    Notifications
                    {unreadNotificationsCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            {unreadNotificationsCount}
                        </span>
                    )}
                    {activeTab === "notifications" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full"></div>
                    )}
                </button>
                {isOwner && (
                    <button
                        onClick={() => setActiveTab("admin")}
                        className={`pb-4 px-2 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === "admin" ? "text-white" : "text-slate-400 hover:text-slate-300"}`}
                    >
                        Admin
                        {activeTab === "admin" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full"></div>
                        )}
                    </button>
                )}
                <button
                    onClick={() => setActiveTab("settings")}
                    className={`pb-4 px-2 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === "settings" ? "text-white" : "text-slate-400 hover:text-slate-300"}`}
                >
                    Settings
                    {activeTab === "settings" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full"></div>
                    )}
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
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Active Props
                                </h2>

                                {/* Filters */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value as any)}
                                        className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                                    >
                                        <option value="ALL">All Types</option>
                                        <option value="HIT">Hit/Miss</option>
                                        <option value="LINE">Over/Under</option>
                                    </select>
                                    <select
                                        value={filterBetStatus}
                                        onChange={(e) => setFilterBetStatus(e.target.value as any)}
                                        className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                                    >
                                        <option value="ALL">All Props</option>
                                        <option value="BET_ON">My Bets</option>
                                        <option value="NOT_BET_ON">New Props</option>
                                    </select>
                                </div>
                            </div>

                            {filteredProps.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
                                    <p className="text-slate-400 mb-4">No props match your filters.</p>
                                    {league.allowPropCreation || isOwner ? (
                                        <Link
                                            href={`/leagues/${league.id}/props/create`}
                                            className="text-emerald-400 hover:text-emerald-300 font-medium"
                                        >
                                            Create one?
                                        </Link>
                                    ) : (
                                        <p className="text-xs text-slate-500">Prop creation is currently disabled.</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredProps.map((prop) => {
                                        const hasBet = prop.bets.some(bet => bet.userId === currentUserId)
                                        const isExpired = new Date(prop.bettingDeadline) < new Date()
                                        const isDeadlineClose = !isExpired && new Date(prop.bettingDeadline).getTime() - Date.now() < 24 * 60 * 60 * 1000 // 24 hours

                                        return (
                                            <Link
                                                key={prop.id}
                                                href={`/props/${prop.id}`}
                                                className="block bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:border-white/20 group"
                                            >
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <h3 className="text-lg font-medium text-white group-hover:text-emerald-400 transition-colors">
                                                        {prop.question}
                                                    </h3>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${prop.type === "HIT" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}>
                                                                {prop.type === "HIT" ? "HIT/MISS" : "OVER/UNDER"}
                                                            </span>
                                                            {prop.targetPlayer && (
                                                                <span className="bg-slate-700/50 text-slate-300 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                                                    <span>@</span>
                                                                    {prop.targetPlayer.user.name}
                                                                </span>
                                                            )}
                                                            {(prop.status === "LOCKED" || isExpired) && (
                                                                <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-2 py-1 rounded uppercase">
                                                                    Locked
                                                                </span>
                                                            )}
                                                        </div>
                                                        {hasBet && (
                                                            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                                                <Check className="size-3" />
                                                                Bet Placed
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-sm text-slate-400">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-bold">
                                                            {prop.creator.user.name?.[0] || "?"}
                                                        </div>
                                                        <span>{prop.creator.user.name}</span>
                                                        <span>•</span>
                                                        <span className={isDeadlineClose ? "text-amber-400 font-bold" : isExpired ? "text-slate-500 font-bold" : ""}>
                                                            {isExpired ? "LOCKED" : `Closes ${formatDistanceToNow(new Date(prop.bettingDeadline), { addSuffix: true })}`}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-emerald-400">
                                                        <TrendingUp className="size-4" />
                                                        {league.mode === "RANK" ? (
                                                            <span>Odds: {prop.odds?.toString()}:1</span>
                                                        ) : (
                                                            <span>{prop.bets.reduce((acc: number, bet: any) => acc + bet.amount, 0)} pool</span>
                                                        )}
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
                                <h2 className="text-xl font-bold mb-4 text-slate-400">Past Props</h2>
                                <div className="space-y-4 opacity-75 hover:opacity-100 transition-opacity">
                                    {pastProps.map((prop) => (
                                        <Link
                                            key={prop.id}
                                            href={`/props/${prop.id}`}
                                            className="block bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <h3 className="text-lg font-medium text-slate-300">
                                                    {prop.question}
                                                </h3>
                                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${prop.status === "RESOLVED" ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
                                                    }`}>
                                                    {prop.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                Resolved {prop.resolutionDeadline ? formatDistanceToNow(new Date(prop.resolutionDeadline), { addSuffix: true }) : ""}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Leaderboard */}
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Trophy className="size-5 text-amber-400" />
                                    <h2 className="font-bold text-lg">Leaderboard</h2>
                                </div>
                                <Link href={`/leagues/${league.id}/leaderboard`} className="text-xs text-slate-400 hover:text-white">
                                    View All
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {league.members.map((member, index) => (
                                    <div key={member.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 text-center font-bold ${index === 0 ? "text-amber-400" :
                                                index === 1 ? "text-slate-300" :
                                                    index === 2 ? "text-amber-700" : "text-slate-500"
                                                }`}>
                                                {index + 1}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <div className="size-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
                                                    {member.user.name?.[0] || "?"}
                                                </div>
                                                <span className={member.userId === currentUserId ? "text-emerald-400 font-bold" : "text-slate-300"}>
                                                    {member.user.name}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="font-mono font-medium text-slate-400">{member.credits}</span>
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
                                    <div key={activity.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-4">
                                        <div className="size-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold shrink-0">
                                            {activity.user.name?.[0] || "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm">
                                                <span className="font-bold text-white">{activity.user.name}</span>
                                                <span className="text-slate-400"> {activity.content}</span>
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
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
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Settings className="size-5 text-slate-400" />
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
                                className="w-full bg-white text-slate-900 font-bold py-2 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Users className="size-5 text-slate-400" />
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
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Settings className="size-5 text-slate-400" />
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
