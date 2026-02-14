import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { placeBet, resolveProp, cancelProp, createComment } from "@/app/actions"
import Link from "next/link"
import { ArrowLeft, TrendingUp, AlertCircle, MessageSquare } from "lucide-react"
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

    // User bets
    const userBets = prop.bets.filter((b: any) => b.userId === session.user.id)
    const totalPool = prop.liquidity || prop.bets.reduce((sum: number, b: any) => sum + b.amount, 0)

    // Find top choice
    const topChoice = prop.choices[0]

    return (
        <div className="min-h-screen flex justify-center p-6 pb-32">
            <div className="w-full max-w-2xl">
                <Link href={`/leagues/${prop.leagueId}`} className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="size-4" />
                    Back to League
                </Link>

                <div className="glass rounded-3xl overflow-hidden card-shadow animate-slide-up">
                    {/* Header */}
                    <div className="p-8 border-b border-white/8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-sm text-white/50">
                                <span className="font-black text-white">{prop.creator.user.name}</span>
                                <span>created market</span>
                            </div>
                            <span className={`text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${prop.status === "LIVE" ? "bg-[var(--apple-green)]/15 text-[var(--apple-green)]" :
                                prop.status === "LOCKED" ? "bg-[var(--apple-orange)]/15 text-[var(--apple-orange)]" :
                                    prop.status === "RESOLVED" ? "bg-[var(--apple-blue)]/15 text-[var(--apple-blue)]" :
                                        "bg-[var(--apple-red)]/15 text-[var(--apple-red)]"
                                }`}>
                                {prop.status}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="bg-[var(--apple-purple)]/15 text-[var(--apple-purple)] text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                                Prediction Market
                            </span>
                            {prop.targetPlayer && (
                                <span className="glass text-white/70 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1">
                                    <span>@</span>
                                    {prop.targetPlayer.user.name}
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl font-black mb-6">{prop.question}</h1>

                        <div className="flex items-center gap-6 text-sm">
                            {topChoice && (
                                <div className="pill px-4 py-2 rounded-full">
                                    <span className="text-white/50 mr-2">Top:</span>
                                    <span className="font-black text-[var(--apple-green)]">{topChoice.text} {(topChoice.probability * 100).toFixed(0)}%</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-[var(--apple-blue)]">
                                <TrendingUp className="size-4" />
                                <span className="font-black">{totalPool} credits</span>
                            </div>
                        </div>
                    </div>

                    {/* Probabilities Chart */}
                    <div className="p-8 border-b border-white/8">
                        <h3 className="text-xs font-black text-white/40 mb-6 uppercase tracking-wider">Probability Over Time</h3>
                        <PropProbabilityChart
                            choices={prop.choices}
                            bets={prop.bets}
                            createdAt={prop.createdAt}
                        />

                        {/* Current Probabilities */}
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <h4 className="text-xs font-black text-white/40 mb-4 uppercase tracking-wider">Current Odds</h4>
                            <div className="space-y-3">
                                {prop.choices.map((choice: any, index: number) => {
                                    const colors = ["var(--apple-green)", "var(--apple-blue)", "var(--apple-orange)", "var(--apple-red)", "var(--apple-purple)"]
                                    const color = colors[index % colors.length]
                                    return (
                                        <div key={choice.id} className="relative">
                                            <div className="flex justify-between text-sm mb-1.5">
                                                <span className="font-black text-white">{choice.text}</span>
                                                <span className="font-black" style={{ color }}>{(choice.probability * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${choice.probability * 100}%`, backgroundColor: color }}
                                                ></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Betting Section */}
                    <div className="p-8">
                        {userBets.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xs font-black text-white/40 mb-4 uppercase tracking-wider">Your Positions</h3>
                                <div className="space-y-2">
                                    {userBets.map((bet: any) => (
                                        <div key={bet.id} className="wow-mini rounded-2xl p-4 flex justify-between items-center">
                                            <div>
                                                <span className="text-[var(--apple-green)] font-black block">{bet.choice.text}</span>
                                                <span className="text-xs text-white/40">{formatDistanceToNow(bet.createdAt, { addSuffix: true })}</span>
                                            </div>
                                            <span className="text-xl font-black text-white">{bet.amount} cr</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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

                {/* Comments Section */}
                <div className="mt-12 max-w-2xl mx-auto animate-fade-in">
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-white/80">
                        <MessageSquare className="size-5 text-white/40" />
                        Comments
                    </h2>

                    <div className="glass rounded-2xl p-6 mb-8">
                        <form action={createComment} className="flex gap-4">
                            <input type="hidden" name="propId" value={prop.id} />
                            <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-black shrink-0 border border-white/20">
                                {session.user.name?.[0] || "?"}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    name="content"
                                    placeholder="Add a comment..."
                                    className="w-full bg-transparent border-b border-white/10 pb-2 focus:outline-none focus:border-[var(--apple-blue)] transition-colors placeholder:text-white/30"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="text-[var(--apple-blue)] hover:text-[var(--apple-blue)]/80 font-black text-sm"
                            >
                                Post
                            </button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        {prop.comments.length === 0 ? (
                            <p className="text-center text-white/30 py-8">No comments yet. Be the first!</p>
                        ) : (
                            prop.comments.map((comment: any) => (
                                <div key={comment.id} className="flex gap-4 group">
                                    <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-black shrink-0 border border-white/20">
                                        {comment.user.name?.[0] || "?"}
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-black text-sm">{comment.user.name}</span>
                                            <span className="text-xs text-white/30">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-white/70 mt-1">{comment.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
