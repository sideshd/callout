import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CreatePropForm } from "@/components/forms/create-prop-form"

export default async function CreatePropPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/api/auth/signin")

    const league = await prisma.league.findUnique({
        where: { id },
        include: {
            members: {
                include: { user: true }
            }
        }
    })

    if (!league) redirect("/dashboard")

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
            <div className="w-full max-w-md relative z-10">
                <Link href={`/leagues/${id}`} className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-white mb-8 transition-colors text-sm font-bold">
                    <ArrowLeft className="size-4" />
                    Back to League
                </Link>

                <div className="wow-shell rounded-[26px] p-8">
                    <h1 className="text-3xl font-black tracking-tight mb-2">New Market</h1>
                    <p className="text-[var(--muted)] text-sm mb-8">Create a prediction market. Make it interesting.</p>

                    <CreatePropForm leagueId={id} members={league.members} currentUserId={session.user.id} />
                </div>
            </div>
        </div>
    )
}
