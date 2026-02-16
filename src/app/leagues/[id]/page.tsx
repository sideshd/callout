import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { LeagueTabs } from "@/components/league/league-tabs"
import { CopyInviteCode } from "@/components/league/copy-invite-code"
import Link from "next/link"
import { AppNavbar } from "@/components/ui/app-navbar"

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

    const isOwner = league.ownerId === session.user.id

    // Spotlight: first active prop
    const spotlightProp = activeProps[0]
    const spotlightTop = spotlightProp?.choices?.[0]
    const spotlightVolume = spotlightProp?.liquidity || spotlightProp?.bets?.reduce((sum: number, b: any) => sum + b.amount, 0) || 0

    return (
        <div className="min-h-screen relative overflow-hidden">
            <AppNavbar
                leagueName={league.name}
                leagueCode={league.inviteCode}
                memberCount={league.members.length}
                balance={membership.credits}
                isCommissioner={isOwner}
                leagueId={league.id}
                allowPropCreation={league.allowPropCreation}
            />

            <div className="relative z-10 max-w-[1180px] mx-auto px-6 pt-24 pb-32">
                {/* Header */}
                <div className="flex items-start justify-between gap-6 animate-slide-up mb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight">{league.name}</h1>
                            {isOwner && <span className="chip text-xs text-[var(--brand)]">COMMISSIONER</span>}
                        </div>
                        <div className="mt-2 text-sm text-[var(--muted)] flex items-center gap-2">
                            <span className="font-mono font-semibold">{league.inviteCode}</span>
                            <span className="w-1 h-1 rounded-full bg-white/30"></span>
                            <span>{league.members.length} member{league.members.length !== 1 ? "s" : ""}</span>
                            <span className="w-1 h-1 rounded-full bg-white/30"></span>
                            <span className="font-mono">${membership.credits} balance</span>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-3">
                        {(league.allowPropCreation || isOwner) && (
                            <Link
                                href={`/leagues/${league.id}/props/create`}
                                className="btn-primary px-5 py-3 text-sm"
                            >
                                + New Market
                            </Link>
                        )}
                        <CopyInviteCode inviteCode={league.inviteCode} />
                    </div>
                </div>

                {/* Spotlight Card */}
                {spotlightProp && (
                    <div className="wow-shell rounded-[26px] p-6 mb-6 animate-fade-in">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <div className="text-xs text-[var(--muted)] uppercase tracking-widest">Spotlight</div>
                                <div className="mt-1 text-2xl font-black leading-tight">{spotlightProp.question}</div>
                                <div className="mt-2 text-sm text-[var(--muted)]">
                                    by {spotlightProp.creator.user.name} • Vol ${spotlightVolume}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-[var(--muted)]">Top</div>
                                {spotlightTop && (
                                    <div className="text-4xl font-black text-[var(--good)]">
                                        {(spotlightTop.probability * 100).toFixed(0)}%
                                    </div>
                                )}
                                <div className="flex items-center gap-2 justify-end mt-3">
                                    <Link
                                        href={`/props/${spotlightProp.id}`}
                                        className="btn-primary px-4 py-2 text-xs"
                                    >
                                        Trade
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabbed Content driven by the dock */}
                <LeagueTabs
                    league={league}
                    activeProps={activeProps}
                    pastProps={pastProps}
                    activities={league.activities}
                    notifications={notifications}
                    currentUserId={session.user.id}
                    isOwner={isOwner}
                />
            </div>
        </div>
    )
}
