import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Users, TrendingUp } from "lucide-react"
import { AppNavbar } from "@/components/ui/app-navbar"

export default async function Dashboard() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    const memberships = await prisma.leagueMember.findMany({
        where: { userId: session.user.id },
        include: {
            league: {
                include: {
                    members: true,
                    props: true,
                    _count: { select: { members: true, props: true } }
                },
            },
        },
        orderBy: { joinedAt: "desc" },
    })

    return (
        <div className="min-h-screen relative overflow-hidden">
            <AppNavbar />

            <div className="relative z-10 max-w-[1180px] mx-auto px-6 pt-24 pb-28">
                {/* Header */}
                <div className="animate-slide-up">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight">Your Leagues</h1>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                        Welcome back, {session.user.name}
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 grid sm:grid-cols-2 gap-3">
                    <Link
                        href="/leagues/create"
                        className="btn-primary px-6 py-4 text-sm inline-flex items-center justify-center gap-2 glow-on-hover"
                    >
                        <Plus className="size-5" />
                        Create League
                    </Link>
                    <Link
                        href="/leagues/join"
                        className="btn-quiet px-6 py-4 text-sm inline-flex items-center justify-center gap-2"
                    >
                        <Users className="size-5" />
                        Join League
                    </Link>
                </div>

                {/* Leagues */}
                <div className="mt-8">
                    {memberships.length === 0 ? (
                        <div className="wow-shell rounded-[26px] p-16 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto mb-6 flex items-center justify-center border border-white/10">
                                <TrendingUp className="size-8 text-[var(--muted)]" />
                            </div>
                            <h3 className="text-2xl font-black mb-2">No leagues yet</h3>
                            <p className="text-[var(--muted)] mb-8">Create a league or join one with an invite code.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {memberships.map((membership) => {
                                const league = membership.league
                                const activeCount = league.props.filter(p => p.status === "LIVE" || p.status === "LOCKED").length

                                return (
                                    <Link
                                        key={league.id}
                                        href={`/leagues/${league.id}`}
                                        className="market-card card-shadow-hover p-6 block stagger-item"
                                    >
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <div>
                                                <h3 className="text-xl font-black leading-tight">{league.name}</h3>
                                                <div className="mt-1 text-xs text-[var(--muted)] flex items-center gap-2">
                                                    <span className="font-mono font-semibold">{league.inviteCode}</span>
                                                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                                    <span>{league._count.members} members</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-[var(--muted)]">Balance</div>
                                                <div className="text-2xl font-black text-[var(--good)]">${membership.credits}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-[var(--good)] animate-pulse"></div>
                                                    <span className="font-semibold">{activeCount} active</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[var(--muted)] font-mono">{league._count.props} total</span>
                                                </div>
                                            </div>
                                            <span className="btn-quiet px-4 py-2 text-xs">
                                                Open →
                                            </span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
