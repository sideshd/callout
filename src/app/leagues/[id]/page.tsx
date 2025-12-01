import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { LeagueTabs } from "@/components/league/league-tabs"
import { Logo } from "@/components/ui/logo"
import { ArrowLeft, Copy, Share2, Plus } from "lucide-react"
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
                    bets: true
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
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="size-5 text-slate-400" />
                        </Link>
                        <Logo className="size-8" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-slate-400">Your Credits</span>
                            <span className="font-mono font-bold text-emerald-400">{membership.credits}</span>
                        </div>
                        <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold border border-white/10">
                            {session.user.name?.[0] || "U"}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* League Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">{league.name}</h1>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${league.mode === "RANK" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
                                    {league.mode} Mode
                                </span>
                            </div>
                            <p className="text-slate-400 max-w-xl">{league.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {(league.allowPropCreation || league.ownerId === session.user.id) && (
                                <Link
                                    href={`/leagues/${league.id}/props/create`}
                                    className="bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                                >
                                    <Plus className="size-4" />
                                    New Prop
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
