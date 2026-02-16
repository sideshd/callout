import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertCircle, DollarSign } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { PlaceBetForm } from "@/components/forms/place-bet-form"
import { AdminControls } from "@/components/forms/admin-controls"
import { PropProbabilityChart } from "@/components/charts/prop-probability-chart"
import { CommentSection } from "@/components/market/comment-section"
import { CashOutButton } from "@/components/market/cash-out-button"

export const dynamic = "force-dynamic"

export default async function PropPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/api/auth/signin")

    const prop = await prisma.prop.findUnique({
        where: { id },
        include: {
            league: true,
            choices: {
                orderBy: { probability: 'desc' }
            },
            creator: { include: { user: true } },
            targetPlayer: { include: { user: true } },
            bets: { include: { user: true, choice: true } },
            comments: {
                include: { user: true },
                orderBy: { createdAt: "asc" }
            }
        }
    })

    if (!prop) notFound()

    const membership = await prisma.leagueMember.findUnique({
        where: {
            leagueId_userId: {
                leagueId: prop.leagueId,
                userId: session.user.id
            }
        }
    })

    if (!membership) redirect("/dashboard")

    const isAdmin = prop.league.ownerId === session.user.id
    const isLive = prop.status === "LIVE"

    // Active (unsold) bets for the current user
    const activeBets = prop.bets.filter((b: any) => b.userId === session.user.id && !b.soldAt)
    // Past (sold) bets for the current user
    const soldBets = prop.bets.filter((b: any) => b.userId === session.user.id && b.soldAt)
    const existingBet = activeBets[0] || null

    const totalPool = prop.liquidity || prop.bets.reduce((sum: number, b: any) => sum + b.amount, 0)

    const OUTCOME_COLORS = ["var(--apple-green)", "var(--apple-blue)", "var(--apple-orange)", "var(--apple-red)", "var(--apple-purple)"]

    return (
        <div className="min-h-screen p-6 pb-32">
            <div className="max-w-7xl mx-auto">
                {/* Back link */}
                <Link href={`/leagues/${prop.leagueId}`} className="inline-flex items-center gap-2 text-[var(--apple-blue)] hover:opacity-70 mb-6 transition text-sm font-bold">
                    <ArrowLeft className="size-4" />
                    Back to market
                </Link>

                {/* Header bar */}
                <div className="glass rounded-3xl overflow-hidden card-shadow animate-slide-up border border-white/10 mb-6">
                    <div className="border-b border-white/10 px-8 py-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                        <div className="flex-1 pr-8">
                            <h1 className="text-3xl font-black mb-1">{prop.question}</h1>
                            <div className="flex items-center gap-4 flex-wrap">
                                <p className="text-[var(--muted)] text-sm">
                                    by {prop.creator.user.name} • {formatDistanceToNow(new Date(prop.createdAt), { addSuffix: true })}
                                </p>
                                <div className="px-3 py-1 rounded-full glass border border-white/5 flex items-center gap-2">
                                    <DollarSign className="w-3 h-3 text-[var(--apple-green)]" />
                                    <span className="text-xs font-mono font-bold text-[var(--apple-green)]">${totalPool}</span>
                                    <span className="text-xs text-[var(--muted)]">total invested</span>
                                </div>
                                <span className={`text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${prop.status === "LIVE" ? "bg-[var(--apple-green)]/15 text-[var(--apple-green)]" :
                                    prop.status === "LOCKED" ? "bg-[var(--apple-orange)]/15 text-[var(--apple-orange)]" :
                                        prop.status === "RESOLVED" ? "bg-[var(--apple-blue)]/15 text-[var(--apple-blue)]" :
                                            "bg-[var(--apple-red)]/15 text-[var(--apple-red)]"
                                    }`}>
                                    {prop.status}
                                </span>
                            </div>
                        </div>
                        {prop.targetPlayer && (
                            <div className="glass text-white/70 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0">
                                <span>@</span>
                                {prop.targetPlayer.user.name}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main content: Chart + Trade Panel side by side */}
                <div className="flex gap-6 items-start flex-col lg:flex-row animate-fade-in">
                    {/* Chart section */}
                    <div className="flex-1 min-w-0 w-full">
                        <div className="glass rounded-2xl p-6 border border-white/5 card-shadow" style={{ minHeight: '420px' }}>
                            <h3 className="text-xs font-black text-white/40 mb-4 uppercase tracking-wider">Probability Over Time</h3>
                            <PropProbabilityChart
                                choices={prop.choices}
                                bets={prop.bets}
                                createdAt={prop.createdAt}
                            />
                        </div>
                    </div>

                    {/* Trade Panel (right column) */}
                    <div className="w-full lg:w-[420px] shrink-0 self-start">
                        <div className="glass rounded-2xl border border-white/10 overflow-hidden card-shadow">
                            {/* Active position with cash-out */}
                            {activeBets.length > 0 && (
                                <div className="p-6 border-b border-white/10">
                                    <h3 className="text-xs font-black text-white/40 mb-4 uppercase tracking-wider">Your Position</h3>
                                    <div className="space-y-3">
                                        {activeBets.map((bet: any) => {
                                            const currentValue = Math.floor(bet.shares * bet.choice.probability)
                                            const pnl = currentValue - bet.amount
                                            const pnlPercent = bet.amount > 0 ? ((pnl / bet.amount) * 100).toFixed(1) : '0'
                                            return (
                                                <div key={bet.id} className="glass rounded-xl p-4 border border-white/5">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <span className="text-[var(--apple-green)] font-black block text-lg">{bet.choice.text}</span>
                                                            <span className="text-xs text-white/40">{formatDistanceToNow(bet.createdAt, { addSuffix: true })}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xl font-black text-white">${bet.amount}</div>
                                                            <div className="text-xs text-white/40">{bet.shares.toFixed(1)} shares</div>
                                                        </div>
                                                    </div>

                                                    {/* P&L display */}
                                                    <div className="flex items-center justify-between glass rounded-lg p-3 mb-3">
                                                        <div className="text-xs text-white/40">Current Value</div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono font-bold">${currentValue}</span>
                                                            <span className={`text-xs font-bold ${pnl >= 0 ? 'text-[var(--apple-green)]' : 'text-[var(--apple-red)]'}`}>
                                                                {pnl >= 0 ? '+' : ''}{pnl} ({pnl >= 0 ? '+' : ''}{pnlPercent}%)
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Cash out button */}
                                                    {isLive && (
                                                        <CashOutButton betId={bet.id} saleValue={currentValue} pnl={pnl} />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Past (cashed out) positions */}
                            {soldBets.length > 0 && (
                                <div className="p-6 border-b border-white/10">
                                    <h3 className="text-xs font-black text-white/40 mb-3 uppercase tracking-wider">Cashed Out</h3>
                                    <div className="space-y-2">
                                        {soldBets.map((bet: any) => {
                                            const pnl = (bet.soldPrice || 0) - bet.amount
                                            return (
                                                <div key={bet.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10 opacity-60">
                                                    <div>
                                                        <span className="text-sm font-bold">{bet.choice.text}</span>
                                                        <span className="text-xs text-white/40 ml-2">sold</span>
                                                    </div>
                                                    <span className={`text-sm font-bold ${pnl >= 0 ? 'text-[var(--apple-green)]' : 'text-[var(--apple-red)]'}`}>
                                                        {pnl >= 0 ? '+' : ''}{pnl}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Outcome list + trade form */}
                            <div className="p-6">
                                <h3 className="text-lg font-bold mb-4">
                                    {isLive ? (existingBet ? 'Current Odds' : 'Select outcome') : 'Final odds'}
                                </h3>

                                {/* Outcome pills */}
                                <div className="space-y-3 mb-6">
                                    {prop.choices.map((choice: any, index: number) => {
                                        const color = OUTCOME_COLORS[index % OUTCOME_COLORS.length]
                                        const isWinner = prop.winningChoiceId === choice.id
                                        return (
                                            <div key={choice.id} className={`p-5 bg-white/5 rounded-xl border ${isWinner ? 'border-[var(--apple-green)]/50 bg-[var(--apple-green)]/10' : 'border-white/10'}`}>
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="w-3 h-3 rounded-full" style={{ background: color }}></div>
                                                        <div className="text-2xl font-black" style={{ color }}>
                                                            {choice.text}
                                                            {isWinner && <span className="text-sm ml-2 text-[var(--apple-green)]">✓ Winner</span>}
                                                        </div>
                                                    </div>
                                                    <div className="text-[var(--muted)] font-mono text-sm font-bold">
                                                        {(choice.probability * 100).toFixed(0)}%
                                                    </div>
                                                </div>
                                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${choice.probability * 100}%`, background: color }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Trade form - only show if no existing position */}
                                {isLive ? (
                                    existingBet ? (
                                        <div className="text-center py-4 glass rounded-xl border border-white/10">
                                            <p className="text-white/50 text-sm font-semibold">You already have a position</p>
                                            <p className="text-white/30 text-xs mt-1">Cash out above to place a new bet</p>
                                        </div>
                                    ) : (
                                        <PlaceBetForm
                                            propId={prop.id}
                                            choices={prop.choices}
                                            maxCredits={membership.credits}
                                        />
                                    )
                                ) : (
                                    <div className="text-center py-4">
                                        <AlertCircle className="size-8 text-white/30 mx-auto mb-2" />
                                        <p className="text-white/50">Betting is closed for this market.</p>
                                    </div>
                                )}
                            </div>

                            {/* Admin Controls */}
                            {isAdmin && prop.status !== "RESOLVED" && prop.status !== "CANCELED" && (
                                <AdminControls propId={prop.id} choices={prop.choices} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Dynamic Comments Section */}
                <div className="mt-8 animate-fade-in">
                    <CommentSection
                        propId={prop.id}
                        initialComments={prop.comments}
                        currentUserId={session.user.id}
                        currentUserName={session.user.name ?? null}
                    />
                </div>
            </div>
        </div>
    )
}
