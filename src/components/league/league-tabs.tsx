"use client"

import { useState, useTransition } from "react"
import { League, LeagueMember, Prop, Activity, User } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import { TrendingUp, Settings, Users, Activity as ActivityIcon, Bell, LogOut, Trash2, Edit2, Check, X, Trophy, FileText, MessageCircle, ChevronDown } from "lucide-react"
import Link from "next/link"
import { updateLeagueSettings, adminAction, updateMemberCredits, leaveLeague, deleteLeague, markNotificationRead, markAllNotificationsRead } from "@/app/actions"
import { useRouter } from "next/navigation"
import { DockNavigation } from "@/components/ui/dock-navigation"

type LeagueTabsProps = {
    league: League & { members: (LeagueMember & { user: User })[] }
    activeProps: (Prop & { creator: { user: User }, bets: any[], choices: any[], targetPlayer?: { user: User } | null })[]
    pastProps: (Prop & { creator: { user: User }, bets: any[], choices: any[], targetPlayer?: { user: User } | null })[]
    activities: (Activity & { user: User })[]
    notifications: any[]
    currentUserId: string
    isOwner: boolean
}

const OUTCOME_COLORS = ['#ff3b30', '#007aff', '#34c759', '#ff9500', '#af52de', '#5856d6']
const RANK_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32']

function formatCurrency(n: number) {
    return '$' + Math.round(n).toLocaleString()
}

export function LeagueTabs({ league, activeProps, pastProps, activities, notifications, currentUserId, isOwner }: LeagueTabsProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [activeTab, setActiveTab] = useState<string>("markets")
    const [filterBetStatus, setFilterBetStatus] = useState<"ALL" | "BET_ON" | "NOT_BET_ON">("ALL")
    const [filterCategory, setFilterCategory] = useState<string>("ALL")
    const [socialSubTab, setSocialSubTab] = useState<"ACTIVITY" | "COMMENTS">("ACTIVITY")
    const [editingCredits, setEditingCredits] = useState<string | null>(null)

    const unreadNotificationsCount = notifications.filter((n: any) => !n.read).length

    const handleAction = async (action: (formData: FormData) => Promise<void>, formData: FormData) => {
        startTransition(async () => {
            await action(formData)
            router.refresh()
        })
    }

    // Categories from active props
    const categories = Array.from(new Set(activeProps.map(p => (p as any).category || 'Uncategorized'))).sort()

    const filteredProps = activeProps.filter(prop => {
        const hasBet = prop.bets.some(bet => bet.userId === currentUserId)
        if (filterBetStatus === "BET_ON" && !hasBet) return false
        if (filterBetStatus === "NOT_BET_ON" && hasBet) return false
        if (filterCategory !== "ALL") {
            const cat = (prop as any).category || 'Uncategorized'
            if (cat !== filterCategory) return false
        }
        return true
    })

    // Sorted members for leaderboard
    const sortedMembers = [...league.members].sort((a, b) => b.credits - a.credits)

    // Portfolio: user's bets across all active props
    const userPositions = activeProps.flatMap(prop => {
        const userBetsOnProp = prop.bets.filter((b: any) => b.userId === currentUserId)
        if (userBetsOnProp.length === 0) return []
        return userBetsOnProp.map((bet: any) => ({
            prop,
            bet,
            choice: prop.choices.find((c: any) => c.id === bet.choiceId),
        }))
    }).filter(p => p.choice)

    const currentMember = league.members.find(m => m.userId === currentUserId)
    const balance = currentMember?.credits || 0

    // Portfolio stats
    const totalInvested = userPositions.reduce((sum, p) => sum + (p.bet.amount || 0), 0)
    const totalMarkValue = userPositions.reduce((sum, p) => {
        const shares = p.bet.shares || (p.bet.amount / (p.choice.probability || 0.5))
        return sum + shares * (p.choice.probability || 0)
    }, 0)
    const unrealizedPnL = totalMarkValue - totalInvested

    return (
        <div>
            {/* ===== MARKETS TAB ===== */}
            {activeTab === "markets" && (
                <div className="animate-fade-in">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
                        <div>
                            <div className="text-2xl font-black">Markets</div>
                            <div className="text-sm text-[var(--muted)]">Trade on predictions in your league</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={filterBetStatus}
                                onChange={(e) => setFilterBetStatus(e.target.value as any)}
                                className="input-apple !py-2 !px-3 text-sm"
                            >
                                <option value="ALL">All Markets</option>
                                <option value="BET_ON">My Positions</option>
                                <option value="NOT_BET_ON">Unseen</option>
                            </select>
                            {categories.length > 1 && (
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="input-apple !py-2 !px-3 text-sm"
                                >
                                    <option value="ALL">All categories</option>
                                    {categories.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {filteredProps.length === 0 ? (
                        <div className="glass rounded-3xl p-16 text-center border border-white/5">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto mb-6 flex items-center justify-center border border-white/10">
                                <TrendingUp className="size-8 text-[var(--muted)]" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No active markets</h3>
                            <p className="text-[var(--muted)]">Start trading to build your portfolio.</p>
                            {(league.allowPropCreation || isOwner) && (
                                <Link href={`/leagues/${league.id}/props/create`} className="btn-primary px-7 py-4 mt-6 inline-block">
                                    Create Market
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {filteredProps.map((prop, index) => {
                                const hasBet = prop.bets.some(bet => bet.userId === currentUserId)
                                const totalLiquidity = prop.liquidity || prop.bets.reduce((acc: number, bet: any) => acc + bet.amount, 0)
                                const topChoice = prop.choices?.sort((a: any, b: any) => b.probability - a.probability)[0]
                                const category = (prop as any).category
                                const person = (prop as any).person

                                return (
                                    <Link
                                        key={prop.id}
                                        href={`/props/${prop.id}`}
                                        className="w-full text-left wow-shell rounded-[22px] p-5 hover:border-white/20 transition border border-white/10 bg-white/5 block stagger-item"
                                        style={{ animationDelay: `${index * 0.06}s` }}
                                    >
                                        <div className="flex justify-between items-start gap-4 mb-3">
                                            <div className="min-w-0">
                                                <h3 className="font-black text-lg leading-snug truncate">{prop.question}</h3>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {category && (
                                                        <span className="chip text-[11px] text-white/70">{category}</span>
                                                    )}
                                                    {person && (
                                                        <span className="chip text-[11px] text-white/70">👤 {person}</span>
                                                    )}
                                                    {prop.status === 'LOCKED' && (
                                                        <span className="chip text-[11px] text-[var(--warn)]">Locked</span>
                                                    )}
                                                    {hasBet && (
                                                        <span className="chip text-[11px] text-[var(--good)]">Position</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-[var(--muted)] mt-1 flex items-center gap-2">
                                                    <span className="font-mono">{formatDistanceToNow(new Date(prop.createdAt), { addSuffix: true })}</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-xs text-[var(--muted)]">Volume</div>
                                                <div className="font-black">{formatCurrency(totalLiquidity)}</div>
                                            </div>
                                        </div>

                                        {/* Outcome pills */}
                                        <div className="flex items-center justify-between gap-3 mt-2">
                                            <div className="flex items-center gap-3 text-xs overflow-hidden">
                                                {prop.choices?.slice(0, 3).map((choice: any, i: number) => (
                                                    <div key={choice.id} className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: OUTCOME_COLORS[i % OUTCOME_COLORS.length] }}></div>
                                                        <span className="font-semibold truncate">{choice.text}</span>
                                                        <span className="text-[var(--muted)] font-mono">{(choice.probability * 100).toFixed(0)}%</span>
                                                    </div>
                                                ))}
                                                {(prop.choices?.length || 0) > 3 && (
                                                    <span className="text-[var(--muted)] font-mono">+{(prop.choices?.length || 0) - 3}</span>
                                                )}
                                            </div>
                                            <span className="btn-quiet px-3 py-1.5 text-xs shrink-0">Trade →</span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ===== PORTFOLIO TAB ===== */}
            {activeTab === "portfolio" && (
                <div className="animate-fade-in">
                    {userPositions.length === 0 ? (
                        <div className="glass rounded-3xl p-16 text-center border border-white/5">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto mb-6 flex items-center justify-center">
                                <FileText className="size-8 text-[var(--muted)]" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No positions</h3>
                            <p className="text-[var(--muted)]">Start trading to build your portfolio.</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Summary cards */}
                            <div className="grid md:grid-cols-4 gap-3">
                                <div className="glass rounded-2xl p-5 border border-white/10">
                                    <div className="text-xs text-[var(--muted)] uppercase tracking-wider">Cash</div>
                                    <div className="text-2xl font-black mt-1">{formatCurrency(balance)}</div>
                                </div>
                                <div className="glass rounded-2xl p-5 border border-white/10">
                                    <div className="text-xs text-[var(--muted)] uppercase tracking-wider">Market Value</div>
                                    <div className="text-2xl font-black mt-1">{formatCurrency(totalMarkValue)}</div>
                                </div>
                                <div className="glass rounded-2xl p-5 border border-white/10">
                                    <div className="text-xs text-[var(--muted)] uppercase tracking-wider">Invested</div>
                                    <div className="text-2xl font-black mt-1">{formatCurrency(totalInvested)}</div>
                                </div>
                                <div className="glass rounded-2xl p-5 border border-white/10">
                                    <div className="text-xs text-[var(--muted)] uppercase tracking-wider">Unrealized P&L</div>
                                    <div className={`text-2xl font-black mt-1 ${unrealizedPnL >= 0 ? 'text-[var(--apple-green)]' : 'text-[var(--apple-red)]'}`}>
                                        {unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(unrealizedPnL)}
                                    </div>
                                </div>
                            </div>

                            {/* Position cards */}
                            <div className="space-y-3">
                                {userPositions.map((pos, index) => {
                                    const shares = pos.bet.shares || (pos.bet.amount / (pos.choice.probability || 0.5))
                                    const costBasis = pos.bet.amount || 0
                                    const markValue = shares * (pos.choice.probability || 0)
                                    const pnl = markValue - costBasis
                                    const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0
                                    const isProfit = pnl >= 0
                                    const nowPct = ((pos.choice.probability || 0) * 100).toFixed(0)
                                    const choiceIndex = pos.prop.choices.findIndex((c: any) => c.id === pos.choice.id)
                                    const choiceColor = OUTCOME_COLORS[choiceIndex % OUTCOME_COLORS.length]

                                    return (
                                        <Link
                                            key={pos.bet.id}
                                            href={`/props/${pos.prop.id}`}
                                            className="glass rounded-2xl p-6 card-shadow border border-white/5 stagger-item cursor-pointer hover:border-[var(--apple-blue)]/30 transition block"
                                            style={{ animationDelay: `${index * 0.06}s` }}
                                        >
                                            <div className="flex justify-between items-start gap-4 mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-black truncate">{pos.prop.question}</div>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: choiceColor }}></div>
                                                        <div className="font-black" style={{ color: choiceColor }}>{pos.choice.text}</div>
                                                        <span className="chip text-[11px] text-[var(--muted)]">{(pos.prop as any).category || 'Uncategorized'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-5 gap-4 pt-4 border-t border-white/5">
                                                <div>
                                                    <div className="text-xs text-[var(--muted)] mb-1 uppercase tracking-wide">Shares</div>
                                                    <div className="font-black">{shares.toFixed(2)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-[var(--muted)] mb-1 uppercase tracking-wide">Cost</div>
                                                    <div className="font-black">{formatCurrency(costBasis)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-[var(--muted)] mb-1 uppercase tracking-wide">Now</div>
                                                    <div className="font-black">{nowPct}%</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-[var(--muted)] mb-1 uppercase tracking-wide">Mark</div>
                                                    <div className="font-black">{formatCurrency(markValue)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-[var(--muted)] mb-1 uppercase tracking-wide">P&L</div>
                                                    <div className={`font-black text-lg ${isProfit ? 'text-[var(--apple-green)]' : 'text-[var(--apple-red)]'}`}>
                                                        {isProfit ? '+' : ''}{pnlPct.toFixed(0)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ===== LEADERBOARD TAB ===== */}
            {activeTab === "leaderboard" && (
                <div className="animate-fade-in max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
                        <div>
                            <div className="text-sm text-[var(--muted)] font-bold uppercase tracking-wider">Leaderboard</div>
                            <div className="text-2xl font-black">Net Worth</div>
                            <div className="text-xs text-[var(--muted)] mt-1">Starting funds: {formatCurrency(league.startingCredits)}</div>
                        </div>
                    </div>

                    <div className="glass rounded-3xl border border-white/5 overflow-hidden">
                        <div className="divide-y divide-white/5">
                            {sortedMembers.map((member, idx) => {
                                const rankColor = idx < 3 ? RANK_COLORS[idx] : '#636366'
                                const profit = member.credits - league.startingCredits
                                const isCurrentUser = member.userId === currentUserId

                                return (
                                    <div
                                        key={member.id}
                                        className={`px-7 py-6 flex items-center justify-between ${isCurrentUser ? 'bg-[var(--apple-blue)]/5 border-l-4 border-[var(--apple-blue)]' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
                                                style={{ background: `${rankColor}22`, color: rankColor }}
                                            >
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className="font-black flex items-center gap-2">
                                                    {member.user.name}
                                                    {isCurrentUser && <span className="text-xs text-[var(--apple-blue)]">(You)</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Net Worth</div>
                                            <div className="text-2xl font-black">{formatCurrency(member.credits)}</div>
                                            <div className={`text-xs font-mono ${profit >= 0 ? 'text-[var(--apple-green)]' : 'text-[var(--apple-red)]'}`}>
                                                {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== RESOLVED TAB ===== */}
            {activeTab === "resolved" && (
                <div className="animate-fade-in">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                            <div className="text-2xl font-black">Resolved markets</div>
                            <div className="text-sm text-[var(--muted)]">Past results and payouts</div>
                        </div>
                    </div>

                    {pastProps.length === 0 ? (
                        <div className="wow-shell rounded-[26px] p-6 text-[var(--muted)]">No resolved markets yet.</div>
                    ) : (
                        <div className="grid gap-3">
                            {pastProps.map((prop) => {
                                const winnerChoice = prop.choices.find((c: any) => c.id === (prop as any).resolvedChoiceId)
                                const volume = prop.liquidity || prop.bets.reduce((acc: number, bet: any) => acc + bet.amount, 0)
                                const when = new Date(prop.updatedAt || prop.createdAt).toLocaleDateString()

                                return (
                                    <Link
                                        key={prop.id}
                                        href={`/props/${prop.id}`}
                                        className="w-full text-left wow-shell rounded-[22px] p-5 hover:border-white/20 transition border border-white/10 bg-white/5 block"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="font-black text-lg leading-snug">{prop.question}</div>
                                                <div className="mt-1 text-xs text-[var(--muted)]">
                                                    {(prop as any).category || 'Uncategorized'} • {when}
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {winnerChoice ? (
                                                        <span className="chip text-[11px]" style={{ borderColor: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.92)' }}>
                                                            {winnerChoice.text} won
                                                        </span>
                                                    ) : (
                                                        <span className={`chip text-[11px] ${prop.status === 'RESOLVED' ? 'text-[var(--brand)]' : 'text-[var(--bad)]'}`}>
                                                            {prop.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-xs text-[var(--muted)]">Volume</div>
                                                <div className="font-black">{formatCurrency(volume)}</div>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ===== SOCIAL TAB ===== */}
            {activeTab === "social" && (
                <div className="animate-fade-in">
                    <div className="wow-shell rounded-[26px] p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <div className="text-xs text-[var(--muted)] uppercase tracking-widest">Social</div>
                                <div className="text-2xl font-black">League feed</div>
                                <div className="text-xs text-[var(--muted)] mt-1">Activity + notifications, unified.</div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    className={`px-3 py-2 rounded-xl text-xs font-black border ${socialSubTab === 'ACTIVITY' ? 'bg-white/10 border-white/15' : 'bg-white/5 border-white/10 hover:bg-white/[0.08]'}`}
                                    onClick={() => setSocialSubTab('ACTIVITY')}
                                >
                                    Activity
                                </button>
                                <button
                                    className={`px-3 py-2 rounded-xl text-xs font-black border relative ${socialSubTab === 'COMMENTS' ? 'bg-white/10 border-white/15' : 'bg-white/5 border-white/10 hover:bg-white/[0.08]'}`}
                                    onClick={() => setSocialSubTab('COMMENTS')}
                                >
                                    Notifications
                                    {unreadNotificationsCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-[var(--bad)] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                                            {unreadNotificationsCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="mt-5">
                            {socialSubTab === 'ACTIVITY' && (
                                <div className="space-y-2">
                                    {activities.length === 0 ? (
                                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-[var(--muted)]">
                                            No activity yet. Create a market or place a trade.
                                        </div>
                                    ) : (
                                        activities.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-black shrink-0 border border-white/20">
                                                        {activity.user.name?.[0] || "?"}
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-sm">
                                                            <span className="text-white">{activity.user.name}</span>{' '}
                                                            <span className="text-white/50 font-normal">{activity.content}</span>
                                                        </div>
                                                        <div className="text-xs text-[var(--muted)] mt-1">
                                                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {socialSubTab === 'COMMENTS' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-sm font-black">Notifications</div>
                                        {unreadNotificationsCount > 0 && (
                                            <button
                                                onClick={() => startTransition(async () => {
                                                    await markAllNotificationsRead(league.id)
                                                    router.refresh()
                                                })}
                                                className="text-xs text-[var(--brand)] font-bold hover:opacity-70"
                                                disabled={isPending}
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-[var(--muted)]">
                                                No notifications yet.
                                            </div>
                                        ) : (
                                            notifications.map((notification: any) => (
                                                <div
                                                    key={notification.id}
                                                    className={`p-4 rounded-2xl bg-white/5 border hover:bg-white/[0.07] transition ${notification.read ? 'border-white/5 opacity-60' : 'border-[var(--apple-blue)]/30'}`}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`size-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${notification.type === 'BET_WON' ? 'bg-[var(--apple-green)]/20 text-[var(--apple-green)]' : notification.type === 'BET_LOST' ? 'bg-[var(--apple-red)]/20 text-[var(--apple-red)]' : 'bg-[var(--apple-blue)]/20 text-[var(--apple-blue)]'}`}>
                                                                <Bell className="size-4" />
                                                            </div>
                                                            <div>
                                                                <div className="font-extrabold text-sm">{notification.message}</div>
                                                                <div className="text-xs text-[var(--muted)] mt-1">
                                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {!notification.read && (
                                                            <button
                                                                onClick={() => startTransition(async () => {
                                                                    await markNotificationRead(notification.id, league.id)
                                                                    router.refresh()
                                                                })}
                                                                className="text-xs text-[var(--brand)] font-bold hover:opacity-70"
                                                                disabled={isPending}
                                                            >
                                                                Mark read
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Commissioner Portal — always visible for owners */}
                    {isOwner && (
                        <div className="mt-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-8 rounded-xl bg-[var(--apple-orange)]/20 flex items-center justify-center border border-[var(--apple-orange)]/30">
                                    <Settings className="size-4 text-[var(--apple-orange)]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black">Commissioner Portal</h2>
                                    <p className="text-xs text-[var(--muted)]">Manage your league</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* League Settings */}
                                <div className="glass rounded-2xl p-6 card-shadow border border-white/10">
                                    <h3 className="text-sm font-black mb-4 uppercase tracking-wider text-white/40">League Settings</h3>
                                    <form action={updateLeagueSettings} className="space-y-4">
                                        <input type="hidden" name="leagueId" value={league.id} />
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                            <div>
                                                <p className="font-medium text-white">Allow Prop Creation</p>
                                                <p className="text-xs text-[var(--muted)]">Let members create their own props</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" name="allowPropCreation" value="true" defaultChecked={league.allowPropCreation} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--apple-green)]"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                            <div>
                                                <p className="font-medium text-white">Show Activity Feed</p>
                                                <p className="text-xs text-[var(--muted)]">Display recent activity to members</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" name="showActivityFeed" value="true" defaultChecked={league.showActivityFeed} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--apple-green)]"></div>
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
                                <div className="glass rounded-2xl p-6 card-shadow border border-white/10">
                                    <h3 className="text-sm font-black mb-4 uppercase tracking-wider text-white/40">Member Management</h3>
                                    <div className="space-y-3">
                                        {league.members.map((member) => (
                                            <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-black border border-white/20">
                                                        {member.user.name?.[0] || "?"}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">
                                                            {member.user.name}
                                                            {member.userId === currentUserId && <span className="text-xs text-[var(--muted)] ml-2">(You)</span>}
                                                            {member.userId === league.ownerId && <span className="text-xs text-[var(--apple-orange)] ml-2">👑 Commissioner</span>}
                                                        </p>
                                                        {editingCredits === member.userId ? (
                                                            <form action={async (formData) => {
                                                                await handleAction(updateMemberCredits, formData)
                                                                setEditingCredits(null)
                                                            }} className="flex items-center gap-2 mt-1">
                                                                <input type="hidden" name="leagueId" value={league.id} />
                                                                <input type="hidden" name="targetUserId" value={member.userId} />
                                                                <input type="number" name="credits" defaultValue={member.credits} className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--apple-blue)]" />
                                                                <button type="submit" disabled={isPending} className="text-[var(--apple-green)] hover:opacity-70 disabled:opacity-50">
                                                                    <Check className="size-4" />
                                                                </button>
                                                                <button type="button" onClick={() => setEditingCredits(null)} className="text-[var(--apple-red)] hover:opacity-70">
                                                                    <X className="size-4" />
                                                                </button>
                                                            </form>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs text-[var(--muted)]">{member.credits} credits</p>
                                                                <button onClick={() => setEditingCredits(member.userId)} className="text-[var(--muted)] hover:text-white transition-colors">
                                                                    <Edit2 className="size-3" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {member.userId !== currentUserId && (
                                                    <form action={(formData) => handleAction(adminAction, formData)}>
                                                        <input type="hidden" name="leagueId" value={league.id} />
                                                        <input type="hidden" name="targetUserId" value={member.userId} />
                                                        <input type="hidden" name="action" value="KICK" />
                                                        <button type="submit" disabled={isPending} className="text-xs bg-[var(--apple-red)]/10 text-[var(--apple-red)] px-3 py-1.5 rounded-lg hover:bg-[var(--apple-red)]/20 transition-colors disabled:opacity-50 font-bold">
                                                            {isPending ? "..." : "Kick"}
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="glass rounded-2xl p-6 card-shadow border border-[var(--apple-red)]/30">
                                    <h3 className="text-sm font-black mb-4 uppercase tracking-wider text-[var(--apple-red)]">Danger Zone</h3>
                                    <div className="p-4 bg-[var(--apple-red)]/10 border border-[var(--apple-red)]/20 rounded-xl">
                                        <h4 className="text-[var(--apple-red)] font-bold mb-2 flex items-center gap-2">
                                            <Trash2 className="size-4" />
                                            Delete League
                                        </h4>
                                        <p className="text-sm text-[var(--apple-red)]/70 mb-4">
                                            Deleting the league is irreversible. All data will be lost.
                                        </p>
                                        <form action={deleteLeague}>
                                            <input type="hidden" name="leagueId" value={league.id} />
                                            <button type="submit" className="w-full bg-[var(--apple-red)] text-white font-bold py-2 rounded-lg hover:opacity-90 transition">
                                                Delete League
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Non-owner settings (just leave) */}
                    {!isOwner && (
                        <div className="mt-8">
                            <div className="glass rounded-2xl p-6 card-shadow border border-white/10">
                                <h3 className="font-bold mb-2 text-white">Leave League</h3>
                                <p className="text-sm text-[var(--muted)] mb-4">
                                    You will lose your current credits and betting history in this league.
                                </p>
                                <form action={leaveLeague}>
                                    <input type="hidden" name="leagueId" value={league.id} />
                                    <button type="submit" className="w-full bg-white/10 text-white font-bold py-2 rounded-lg hover:bg-white/20 transition flex items-center justify-center gap-2">
                                        <LogOut className="size-4" />
                                        Leave League
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Bottom Dock Navigation */}
            <DockNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    )
}
