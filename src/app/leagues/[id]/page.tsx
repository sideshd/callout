import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { LeagueTabs } from "@/components/league/league-tabs"
import { Logo } from "@/components/ui/logo"
import { ArrowLeft, Copy, Share2, Plus, TrendingUp } from "lucide-react"
import { CopyInviteCode } from "@/components/league/copy-invite-code"
import Link from "next/link"


export const dynamic = "force-dynamic"

export default async function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    const league = await prisma.league.findUnique({
        where: { id },
        include: {
            members: {
                include: { user: true },
                orderBy: { credits: "desc" }
            },
            props: {
                orderBy: { createdAt: "desc" },
                include: {
                    creator: { include: { user: true } },
                    targetPlayer: { include: { user: true } },
                    bets: true,
                    choices: true
                }
            },
            activities: {
                orderBy: { createdAt: "desc" },
                take: 50,
                include: { user: true }
            }
        }
    })

    if (!league) {
        redirect("/dashboard")
    }

    const membership = league.members.find(m => m.userId === session.user.id)
    if (!membership) {
        redirect(`/leagues/${id}/join`)
    }

    const activeProps = league.props.filter(p => p.status === "LIVE" || p.status === "LOCKED")
    const pastProps = league.props.filter(p => p.status === "RESOLVED" || p.status === "CANCELED")

    const notifications = await prisma.notification.findMany({
        where: {
            userId: session.user.id,
            leagueId: id
        },
        orderBy: { createdAt: "desc" },
        take: 50
    })

    return (
        <div className="min-h-screen relative">
            {/* Header */}
            <header className="blur-bg sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="size-5 text-white/70" />
                        </Link>
                        <Logo className="size-8" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="pill px-4 py-1.5 flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase text-white/50 tracking-wider">Credits</span>
                            <span className="font-black text-[var(--apple-green)] text-lg leading-tight">${membership.credits.toFixed(0)}</span>
                        </div>
                        <div className="size-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-black border border-white/20">
                            {session.user.name?.[0] || "U"}
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
                {/* League Header */}
                <div className="mb-8 animate-slide-up">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight mb-2 wow-grad">{league.name}</h1>
                            <p className="text-white/60 max-w-xl">{league.description || "Prediction market league"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {(league.allowPropCreation || league.ownerId === session.user.id) && (
                                <Link
                                    href={`/leagues/${league.id}/props/create`}
                                    className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
                                >
                                    <Plus className="size-4" />
                                    New Market
                                </Link>
                            )}
                            <CopyInviteCode inviteCode={league.inviteCode} />
                        </div>
                    </div>
                </div>

                <LeagueTabs
                    league={league}
                    activeProps={activeProps}
                    pastProps={pastProps}
                    activities={league.activities}
                    notifications={notifications}
                    currentUserId={session.user.id}
                    isOwner={league.ownerId === session.user.id}
                />
            </main>


        </div>
    )
}
