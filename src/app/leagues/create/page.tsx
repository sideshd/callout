import { CreateLeagueForm } from "@/components/forms/create-league-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CreateLeaguePage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="size-4" />
                    Back to Dashboard
                </Link>

                <div className="glass rounded-3xl p-8 card-shadow">
                    <h1 className="text-2xl font-black mb-2 wow-grad">Create a League</h1>
                    <p className="text-white/50 mb-8">Start a private group for you and your friends.</p>

                    <CreateLeagueForm />
                </div>
            </div>
        </div>
    )
}
