import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Trophy, TrendingUp, Plus, Copy, Check } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { LeagueActions } from "@/components/forms/league-actions"

export default async function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/api/auth/signin")

    const league = await prisma.league.findUnique({
        where: { id },
        include: {
            members: {
                include: { user: true },
                orderBy: { credits: "desc" },
                take: 5
            },
            props: {
                orderBy: { createdAt: "desc" },
                include: {
                    creator: { include: { user: true } },
                    bets: true
                }
            }
        }
    })

    if (!league) notFound()

    // Check membership
    const membership = await prisma.leagueMember.findUnique({
        where: {
            leagueId_userId: {
                leagueId: league.id,
                userId: session.user.id
            }
        }
    })

    if (!membership) redirect("/dashboard")

    const activeProps = league.props.filter(p => p.status === "LIVE" || p.status === "LOCKED")
    const pastProps = league.props.filter(p => p.status === "RESOLVED" || p.status === "CANCELED")

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="size-5" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold">{league.name}</h1>
                            <p className="text-xs text-slate-400">{league.members.length} members</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-slate-400 text-sm hover:text-white transition-colors hidden md:block">
                            {session.user.name || session.user.email}
                        </Link>
                        <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/20">
                            {membership.credits} credits
                        </div>
                        <Link
                            href={`/leagues/${league.id}/props/create`}
                            className="bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-bold hover:bg-slate-100 transition-colors flex items-center gap-2"
                        >
                            <Plus className="size-4" />
                            New Prop
                        </Link>

                        <LeagueActions leagueId={league.id} isOwner={league.ownerId === session.user.id} />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content: Props */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Invite Code */}
                        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-indigo-300 font-medium uppercase tracking-wider mb-1">Invite Code</p>
                                <p className="text-lg font-mono font-bold text-white">{league.inviteCode}</p>
                            </div>
                            <button className="text-indigo-300 hover:text-white transition-colors">
                                <Copy className="size-5" />
                            </button>
                        </div>

                        {/* Active Props */}
                        {/* Active Props */}
                        <div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                                Active Props
                            </h2>
                            {activeProps.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
                                    <p className="text-slate-400 mb-4">No active props right now.</p>
                                    <Link
                                        href={`/leagues/${league.id}/props/create`}
                                        className="text-emerald-400 hover:text-emerald-300 font-medium"
                                    >
                                        Create one?
                                    </Link>
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
                                                {prop.status === "LOCKED" && (
                                                    <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-2 py-1 rounded uppercase">
                                                        Locked
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between text-sm text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-bold">
                                                        {prop.creator.user.name?.[0] || "?"}
                                                    </div>
                                                    <span>{prop.creator.user.name}</span>
                                                    <span>•</span>
                                                    <span>{formatDistanceToNow(prop.createdAt, { addSuffix: true })}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-emerald-400">
                                                    <TrendingUp className="size-4" />
                                                    <span>{prop.bets.reduce((acc: number, bet: any) => acc + bet.amount, 0)} pool</span>
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
                                                Resolved {prop.resolutionDeadline ? formatDistanceToNow(prop.resolutionDeadline, { addSuffix: true }) : ""}
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
                                                <span className={member.userId === session.user.id ? "text-emerald-400 font-bold" : "text-slate-300"}>
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
            </main>
        </div>
    )
}
