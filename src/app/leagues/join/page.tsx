import { JoinLeagueForm } from "@/components/forms/join-league-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function JoinLeaguePage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="size-4" />
                    Back to Dashboard
                </Link>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                    <h1 className="text-2xl font-bold mb-2">Join a League</h1>
                    <p className="text-slate-400 mb-8">Enter the invite code shared by your friend.</p>

                    <JoinLeagueForm />
                </div>
            </div>
        </div>
    )
}
