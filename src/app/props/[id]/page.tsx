import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { createComment } from "@/app/actions"
import Link from "next/link"
import { ArrowLeft, TrendingUp, AlertCircle, MessageSquare, DollarSign } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { PlaceBetForm } from "@/components/forms/place-bet-form"
import { AdminControls } from "@/components/forms/admin-controls"
import { PropProbabilityChart } from "@/components/charts/prop-probability-chart"

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
                orderBy: { createdAt: "desc" }
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

    const userBets = prop.bets.filter((b: any) => b.userId === session.user.id)
    const totalPool = prop.liquidity || prop.bets.reduce((sum: number, b: any) => sum + b.amount, 0)

    const topChoice = prop.choices[0]
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
                            {/* User positions if any */}
                            {userBets.length > 0 && (
                                <div className="p-6 border-b border-white/10">
                                    <h3 className="text-xs font-black text-white/40 mb-4 uppercase tracking-wider">Your Positions</h3>
                                    <div className="space-y-2">
                                        {userBets.map((bet: any) => (
                                            <div key={bet.id} className="glass rounded-xl p-4 flex justify-between items-center border border-white/5">
                                                <div>
                                                    <span className="text-[var(--apple-green)] font-black block">{bet.choice.text}</span>
                                                    <span className="text-xs text-white/40">{formatDistanceToNow(bet.createdAt, { addSuffix: true })}</span>
                                                </div>
                                                <span className="text-xl font-black text-white">${bet.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Outcome list + trade form */}
                            <div className="p-6">
                                <h3 className="text-lg font-bold mb-4">
                                    {isLive ? 'Select outcome' : 'Current odds'}
                                </h3>

                                {/* Outcome pills */}
                                <div className="space-y-3 mb-6">
                                    {prop.choices.map((choice: any, index: number) => {
                                        const color = OUTCOME_COLORS[index % OUTCOME_COLORS.length]
                                        return (
                                            <div key={choice.id} className="p-5 bg-white/5 rounded-xl border border-white/10">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="w-3 h-3 rounded-full" style={{ background: color }}></div>
                                                        <div className="text-2xl font-black" style={{ color }}>{choice.text}</div>
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

                                {/* Trade form */}
                                {isLive ? (
                                    <PlaceBetForm
                                        propId={prop.id}
                                        choices={prop.choices}
                                        maxCredits={membership.credits}
                                    />
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

                {/* Comments Section */}
                <div className="mt-8 glass rounded-2xl p-5 border border-white/10 card-shadow animate-fade-in">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                            <div className="text-sm font-black">Comments</div>
                            <div className="text-xs text-[var(--muted)]">Argue your case. Drop receipts.</div>
                        </div>
                    </div>

                    {/* Comment form */}
                    <div className="flex gap-2 mb-4">
                        <form action={createComment} className="flex gap-2 w-full">
                            <input type="hidden" name="propId" value={prop.id} />
                            <input
                                type="text"
                                name="content"
                                placeholder="Write a comment…"
                                className="input-apple flex-1"
                                required
                            />
                            <button type="submit" className="btn-primary px-4 py-2.5 text-sm">Post</button>
                        </form>
                    </div>

                    {/* Comment list */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto rounded-xl bg-black/25 border border-white/10 p-3">
                        {prop.comments.length === 0 ? (
                            <div className="text-sm text-[var(--muted)] p-3">No comments yet. Be the first!</div>
                        ) : (
                            prop.comments.map((comment: any) => (
                                <div
                                    key={comment.id}
                                    className={`p-3 rounded-xl ${comment.user.id === session.user.id ? 'bg-[var(--apple-blue)]/15 border border-[var(--apple-blue)]/25' : 'bg-white/5 border border-white/10'}`}
                                >
                                    <div className="text-xs text-[var(--muted)]">
                                        {comment.user.name} • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                    </div>
                                    <div className="mt-1 font-semibold">{comment.content}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
