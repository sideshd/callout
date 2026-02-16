import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Trophy } from "lucide-react"

export default async function LeaderboardPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/api/auth/signin")

    const league = await prisma.league.findUnique({
        where: { id: params.id },
        include: {
            members: {
                include: { user: true },
                orderBy: { credits: "desc" }
            }
        }
    })

    if (!league) notFound()

    return (
        <div className="min-h-screen relative overflow-hidden flex justify-center p-6">
            <div className="w-full max-w-2xl relative z-10 pt-6">
                <Link href={`/leagues/${league.id}`} className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-white mb-8 transition-colors text-sm font-bold">
                    <ArrowLeft className="size-4" />
                    Back to League
                </Link>

                <div className="wow-shell rounded-[26px] p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-2xl bg-[var(--warn)]/10 border border-[var(--warn)]/20">
                            <Trophy className="size-8 text-[var(--warn)]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black">Leaderboard</h1>
                            <p className="text-[var(--muted)]">{league.name}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {league.members.map((member, index) => (
                            <div
                                key={member.id}
                                className={`flex items-center justify-between p-4 rounded-2xl border stagger-item ${member.userId === session.user.id
                                    ? "bg-[var(--good)]/10 border-[var(--good)]/20"
                                    : "bg-white/[0.03] border-white/[0.06]"
                                    }`}
                                style={{ animationDelay: `${index * 0.06}s` }}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`w-8 text-center font-black text-xl ${index === 0 ? "text-[var(--warn)]" :
                                        index === 1 ? "text-white/60" :
                                            index === 2 ? "text-[var(--warn)]/60" : "text-white/30"
                                        }`}>
                                        {index + 1}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg font-black border border-white/20">
                                            {member.user.name?.[0] || "?"}
                                        </div>
                                        <div>
                                            <p className={`font-black ${member.userId === session.user.id ? "text-[var(--good)]" : "text-white"}`}>
                                                {member.user.name}
                                            </p>
                                            <p className="text-xs text-[var(--muted)]">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-black text-xl text-[var(--good)]">${member.credits}</p>
                                    <p className="text-xs text-[var(--muted)]">credits</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
