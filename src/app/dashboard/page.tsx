import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Users } from "lucide-react"
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
        <div className="min-h-screen bg-slate-950 text-white">
            <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold tracking-tight hover:opacity-90 transition-opacity">
                        <Logo className="size-8" />
                        <span>
                            <span className="text-slate-300">Call</span>
                            <span className="text-slate-400">Out</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-slate-400 text-sm hover:text-white transition-colors">
                            {session.user.name || session.user.email}
                        </Link>
                        <Link href="/api/auth/signout" className="text-sm text-slate-400 hover:text-white">
                            Sign out
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Your Leagues</h1>
                    <div className="flex gap-4">
                        <Link
                            href="/leagues/join"
                            className="px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium"
                        >
                            Join League
                        </Link>
                        <Link
                            href="/leagues/create"
                            className="px-4 py-2 rounded-full bg-white text-slate-900 hover:bg-slate-100 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <Plus className="size-4" />
                            Create League
                        </Link>
                    </div>
                </div>

                {memberships.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
                        <Users className="size-12 text-slate-500 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">No leagues yet</h3>
                        <p className="text-slate-400 mb-6">Create a league with friends or join one to start playing.</p>
                        <Link
                            href="/leagues/create"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 hover:bg-slate-100 transition-colors font-medium"
                        >
                            <Plus className="size-4" />
                            Create your first league
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {memberships.map((membership) => (
                            <Link
                                key={membership.leagueId}
                                href={`/leagues/${membership.leagueId}`}
                                className="group block bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-[1.02]"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                        {membership.league.name}
                                    </h3>
                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/10 text-slate-300">
                                        {membership.credits} credits
                                    </span>
                                </div>
                                <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                                    {membership.league.description || "No description"}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Users className="size-4" />
                                        {membership.league._count.members} members
                                    </span>
                                    <span>•</span>
                                    <span>{membership.league._count.props} props</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
