import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { placeBet, resolveProp, cancelProp, createComment } from "@/app/actions"
import Link from "next/link"
import { ArrowLeft, Trophy, TrendingUp, AlertCircle, Clock, CheckCircle2, XCircle, MessageSquare } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
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
    const isLive = prop.status === "LIVE" && new Date() < prop.bettingDeadline

    // User bets
    const userBets = prop.bets.filter((b: any) => b.userId === session.user.id)
    const totalPool = prop.liquidity || prop.bets.reduce((sum: number, b: any) => sum + b.amount, 0)

    return (
        <div className="min-h-screen bg-slate-950 text-white flex justify-center p-6">
            <div className="w-full max-w-2xl">
                <Link href={`/leagues/${prop.leagueId}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="size-4" />
                    Back to League
                </Link>

                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                    <div className="p-8 border-b border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <span className="font-bold text-white">{prop.creator.user.name}</span>
                                <span>created prop</span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${prop.status === "LIVE" ? "bg-green-500/10 text-green-400" :
                                prop.status === "LOCKED" ? "bg-amber-500/10 text-amber-400" :
                                    prop.status === "RESOLVED" ? "bg-blue-500/10 text-blue-400" :
                                        "bg-red-500/10 text-red-400"
                                }`}>
                                {prop.status}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="bg-purple-500/10 text-purple-400 text-xs font-bold px-2 py-1 rounded uppercase">
                                Prediction Prop
                            </span>
                            {prop.targetPlayer && (
                                <span className="bg-slate-700/50 text-slate-300 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                    <span>@</span>
                                    {prop.targetPlayer.user.name}
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold mb-6">{prop.question}</h1>

                        <div className="flex items-center gap-6 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <Clock className="size-4 text-amber-400" />
                                <span className="text-amber-400 font-bold">
                                    {isLive
                                        ? `Closes ${formatDistanceToNow(prop.bettingDeadline, { addSuffix: true })}`
                                        : `Closed ${format(prop.bettingDeadline, "MMM d, h:mm a")}`
                                    }
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400">
                                <TrendingUp className="size-4" />
                                <span>{totalPool} credits volume</span>
                            </div>
                        </div>
                    </div>

                    {/* Probabilities Chart */}
                    <div className="p-8 bg-slate-900/30 border-b border-white/10">
                        <h3 className="text-sm font-bold text-slate-400 mb-6">Probability Over Time</h3>
                        <PropProbabilityChart
                            choices={prop.choices}
                            bets={prop.bets}
                            createdAt={prop.createdAt}
                        />

                        {/* Current Probabilities */}
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <h4 className="text-xs font-bold text-slate-500 mb-3">Current Odds</h4>
                            <div className="space-y-3">
                                {prop.choices.map((choice: any) => (
                                    <div key={choice.id} className="relative">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-white">{choice.text}</span>
                                            <span className="font-bold text-emerald-400">{(choice.probability * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500"
                                                style={{ width: `${choice.probability * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Betting Section */}
                    <div className="p-8 bg-slate-900/50">
                        {userBets.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-slate-400 mb-4">Your Positions</h3>
                                <div className="space-y-2">
                                    {userBets.map((bet: any) => (
                                        <div key={bet.id} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex justify-between items-center">
                                            <div>
                                                <span className="text-emerald-400 font-bold block">{bet.choice.text}</span>
                                                <span className="text-xs text-slate-400">{formatDistanceToNow(bet.createdAt, { addSuffix: true })}</span>
                                            </div>
                                            <span className="text-xl font-bold text-white">{bet.amount} cr</span>
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
                                <AlertCircle className="size-8 text-slate-500 mx-auto mb-2" />
                                <p className="text-slate-400">Betting is closed for this prop.</p>
                            </div>
                        )}
                    </div>

                    {/* Admin Controls */}
                    {isAdmin && prop.status !== "RESOLVED" && prop.status !== "CANCELED" && (
                        <AdminControls propId={prop.id} choices={prop.choices} />
                    )}
                </div>

                {/* Comments Section */}
                <div className="mt-12 max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <MessageSquare className="size-5 text-slate-400" />
                        Comments
                    </h2>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                        <form action={createComment} className="flex gap-4">
                            <input type="hidden" name="propId" value={prop.id} />
                            <div className="size-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold shrink-0">
                                {session.user.name?.[0] || "?"}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    name="content"
                                    placeholder="Add a comment..."
                                    className="w-full bg-transparent border-b border-white/10 pb-2 focus:outline-none focus:border-emerald-400 transition-colors placeholder:text-slate-600"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="text-emerald-400 hover:text-emerald-300 font-bold text-sm"
                            >
                                Post
                            </button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        {prop.comments.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">No comments yet. Be the first!</p>
                        ) : (
                            prop.comments.map((comment: any) => (
                                <div key={comment.id} className="flex gap-4 group">
                                    <div className="size-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold shrink-0">
                                        {comment.user.name?.[0] || "?"}
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-sm">{comment.user.name}</span>
                                            <span className="text-xs text-slate-500">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-slate-300 mt-1">{comment.content}</p>
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
