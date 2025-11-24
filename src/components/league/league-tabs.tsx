"use client"

import { useState } from "react"
import { League, LeagueMember, Prop, Activity, User } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import { Trophy, TrendingUp, Settings, Users, Activity as ActivityIcon, MessageSquare } from "lucide-react"
import Link from "next/link"
import { updateLeagueSettings, adminAction } from "@/app/actions"

type LeagueTabsProps = {
    league: League & { members: (LeagueMember & { user: User })[] }
    activeProps: (Prop & { creator: { user: User }, bets: any[], targetPlayer?: { user: User } | null })[]
    pastProps: (Prop & { creator: { user: User }, bets: any[], targetPlayer?: { user: User } | null })[]
    activities: (Activity & { user: User })[]
    currentUserId: string
    isOwner: boolean
}

export function LeagueTabs({ league, activeProps, pastProps, activities, currentUserId, isOwner }: LeagueTabsProps) {
    const [activeTab, setActiveTab] = useState<"board" | "feed" | "admin">("board")

    return (
        <div>
            {/* Tabs Header */}
            <div className="flex items-center gap-4 mb-8 border-b border-white/10">
                <button
                    onClick={() => setActiveTab("board")}
                    className={`pb-4 px-2 text-sm font-bold transition-colors relative ${activeTab === "board" ? "text-white" : "text-slate-400 hover:text-slate-300"}`}
                >
                    Board
                    {activeTab === "board" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("feed")}
                    className={`pb-4 px-2 text-sm font-bold transition-colors relative ${activeTab === "feed" ? "text-white" : "text-slate-400 hover:text-slate-300"}`}
                >
                    Activity Feed
                    {activeTab === "feed" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full"></div>
                    )}
                </button>
                {isOwner && (
                    <button
                        onClick={() => setActiveTab("admin")}
                        className={`pb-4 px-2 text-sm font-bold transition-colors relative ${activeTab === "admin" ? "text-white" : "text-slate-400 hover:text-slate-300"}`}
                    >
                        Admin
                        {activeTab === "admin" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full"></div>
                        )}
                    </button>
                )}
            </div>

            {/* Tab Content */}
            {activeTab === "board" && (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content: Props */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Active Props */}
                        <div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                                Active Props
                            </h2>
                            {activeProps.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
                                    <p className="text-slate-400 mb-4">No active props right now.</p>
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
                                    {activeProps.map((prop) => (
                                        <Link
                                            key={prop.id}
                                            href={`/props/${prop.id}`}
                                            className="block bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:border-white/20 group"
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <h3 className="text-lg font-medium text-white group-hover:text-emerald-400 transition-colors">
                                                    {prop.question}
                                                </h3>
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
                                                    {prop.status === "LOCKED" && (
                                                        <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-2 py-1 rounded uppercase">
                                                            Locked
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
                                                    <span>{formatDistanceToNow(new Date(prop.createdAt), { addSuffix: true })}</span>
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
                                    ))}
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

                            <button type="submit" className="w-full bg-white text-slate-900 font-bold py-2 rounded-lg hover:bg-slate-100 transition-colors">
                                Save Settings
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
                                            <p className="text-xs text-slate-400">{member.credits} credits</p>
                                        </div>
                                    </div>

                                    {member.userId !== currentUserId && (
                                        <div className="flex items-center gap-2">
                                            <form action={adminAction}>
                                                <input type="hidden" name="leagueId" value={league.id} />
                                                <input type="hidden" name="targetUserId" value={member.userId} />
                                                <input type="hidden" name="action" value="KICK" />
                                                <button type="submit" className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded hover:bg-red-500/20 transition-colors">
                                                    Kick
                                                </button>
                                            </form>
                                            {/* Add Set Credits and Transfer Ownership modals/inputs here if needed */}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
