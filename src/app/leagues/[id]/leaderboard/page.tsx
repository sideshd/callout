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
        <div className="min-h-screen bg-slate-950 text-white flex justify-center p-6">
            <div className="w-full max-w-2xl">
                <Link href={`/leagues/${league.id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="size-4" />
                    Back to League
                </Link>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-amber-500/10 p-3 rounded-full">
                            <Trophy className="size-8 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Leaderboard</h1>
                            <p className="text-slate-400">{league.name}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {league.members.map((member, index) => (
                            <div
                                key={member.id}
                                className={`flex items-center justify-between p-4 rounded-xl border ${member.userId === session.user.id
                                        ? "bg-emerald-500/10 border-emerald-500/20"
                                        : "bg-white/5 border-white/5"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`w-8 text-center font-bold text-xl ${index === 0 ? "text-amber-400" :
                                            index === 1 ? "text-slate-300" :
                                                index === 2 ? "text-amber-700" : "text-slate-500"
                                        }`}>
                                        {index + 1}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold">
                                            {member.user.name?.[0] || "?"}
                                        </div>
                                        <div>
                                            <p className={`font-bold ${member.userId === session.user.id ? "text-emerald-400" : "text-white"}`}>
                                                {member.user.name}
                                            </p>
                                            <p className="text-xs text-slate-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-bold text-xl text-white">{member.credits}</p>
                                    <p className="text-xs text-slate-500">credits</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
