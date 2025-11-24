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
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <Link href={`/leagues/${id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="size-4" />
                    Back to League
                </Link>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                    <h1 className="text-2xl font-bold mb-2">Create a Prop</h1>
                    <p className="text-slate-400 mb-8">Set the terms. Make it spicy.</p>

                    <CreatePropForm leagueId={id} members={league.members} leagueMode={league.mode} />
                </div>
            </div>
        </div>
    )
}
