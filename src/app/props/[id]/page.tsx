import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, TrendingUp, AlertCircle } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { PlaceBetForm } from "@/components/forms/place-bet-form"
import { AdminControls } from "@/components/forms/admin-controls"

export default async function PropPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/api/auth/signin")

    const prop = await prisma.prop.findUnique({
        where: { id: params.id },
        include: {
            league: true,
            creator: { include: { user: true } },
            bets: { include: { user: true } }
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
    const userBet = prop.bets.find((b: any) => b.userId === session.user.id)

    const totalPool = prop.bets.reduce((sum: number, b: any) => sum + b.amount, 0)

    // Group bets by side
    const betsBySide: Record<string, number> = {}
    prop.bets.forEach((b: any) => {
        betsBySide[b.side] = (betsBySide[b.side] || 0) + b.amount
    })

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
                                <span>asks</span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${prop.status === "LIVE" ? "bg-green-500/10 text-green-400" :
                                prop.status === "LOCKED" ? "bg-amber-500/10 text-amber-400" :
                                    prop.status === "RESOLVED" ? "bg-blue-500/10 text-blue-400" :
                                        "bg-red-500/10 text-red-400"
                                }`}>
                                {prop.status}
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold mb-6">{prop.question}</h1>

                        <div className="flex items-center gap-6 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <Clock className="size-4" />
                                <span>
                                    {isLive
                                        ? `Closes ${formatDistanceToNow(prop.bettingDeadline, { addSuffix: true })}`
                                        : `Closed ${format(prop.bettingDeadline, "MMM d, h:mm a")}`
                                    }
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400">
                                <TrendingUp className="size-4" />
                                <span>{totalPool} credits pool</span>
                            </div>
                        </div>
                    </div>

                    {/* Betting Section */}
                    <div className="p-8 bg-slate-900/50">
                        {userBet ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                                <p className="text-emerald-400 font-medium mb-1">You bet {userBet.amount} credits on</p>
                                <p className="text-2xl font-bold text-white">{userBet.side}</p>
                            </div>
                        ) : isLive ? (
                            <PlaceBetForm
                                propId={prop.id}
                                propType={prop.type}
                                betsBySide={betsBySide}
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
                        <AdminControls propId={prop.id} propType={prop.type} />
                    )}
                </div>
            </div>
        </div>
    )
}
