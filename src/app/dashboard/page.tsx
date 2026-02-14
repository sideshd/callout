import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Users, TrendingUp } from "lucide-react"
import { Logo } from "@/components/ui/logo"


export default async function Dashboard() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/api/auth/signin")
    }

    const memberships = await prisma.leagueMember.findMany({
        where: {
            userId: session.user.id
        },
        include: {
            league: {
                include: {
                    _count: {
                        select: { members: true, props: true }
                    }
                }
            }
        }
    })

    return (
        <div className="min-h-screen relative">
            {/* Blur nav */}
            <header className="blur-bg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold tracking-tight hover:opacity-90 transition-opacity">
                        <Logo className="size-8" />
                        <span className="wow-grad">CallOut</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-white/70">
                            {session.user.name || session.user.email}
                        </span>
                        <Link href="/api/auth/signout" className="text-sm text-white/50 hover:text-white/90 transition-colors">
                            Sign out
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8 animate-slide-up">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2 wow-grad">Your Leagues</h1>
                        <p className="text-white/60">Trade on prediction markets with your friends</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/leagues/join"
                            className="btn-quiet px-5 py-2.5 text-sm flex items-center gap-2"
                        >
                            Join League
                        </Link>
                        <Link
                            href="/leagues/create"
                            className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
                        >
                            <Plus className="size-4" />
                            Create League
                        </Link>
                    </div>
                </div>

                {memberships.length === 0 ? (
                    <div className="wow-shell rounded-3xl text-center py-32 animate-fade-in">
                        <Users className="size-16 text-white/30 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-3">No leagues yet</h3>
                        <p className="text-white/60 mb-8 max-w-md mx-auto">Create a league with friends or join one to start trading on prediction markets.</p>
                        <Link
                            href="/leagues/create"
                            className="btn-primary px-6 py-3 inline-flex items-center gap-2"
                        >
                            <Plus className="size-5" />
                            Create your first league
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {memberships.map((membership, index) => (
                            <Link
                                key={membership.leagueId}
                                href={`/leagues/${membership.leagueId}`}
                                className="market-card card-shadow-hover p-6 animate-slide-up"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-black text-white">
                                        {membership.league.name}
                                    </h3>
                                    <div className="pill px-3 py-1 text-xs font-bold text-white/90">
                                        ${membership.credits.toFixed(0)}
                                    </div>
                                </div>
                                <p className="text-white/60 text-sm mb-6 line-clamp-2">
                                    {membership.league.description || "Prediction market league"}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-white/50">
                                    <span className="flex items-center gap-1.5">
                                        <Users className="size-4" />
                                        {membership.league._count.members}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5">
                                        <TrendingUp className="size-4" />
                                        {membership.league._count.props} markets
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>


        </div>
    )
}
