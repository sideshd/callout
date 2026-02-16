import { JoinLeagueForm } from "@/components/forms/join-league-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function JoinLeaguePage() {
    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
            <div className="w-full max-w-md relative z-10">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-white mb-8 transition-colors text-sm font-bold">
                    <ArrowLeft className="size-4" />
                    Back to Dashboard
                </Link>

                <div className="wow-shell rounded-[26px] p-8">
                    <h1 className="text-3xl font-black tracking-tight mb-2">Join League</h1>
                    <p className="text-[var(--muted)] text-sm mb-8">Enter an invite code to join an existing league.</p>
                    <JoinLeagueForm />
                </div>
            </div>
        </div>
    )
}
