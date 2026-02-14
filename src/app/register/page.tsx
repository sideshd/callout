"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/actions";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = await registerUser(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push("/login?registered=true");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="flex items-center gap-2 justify-center mb-10">
                    <Logo className="size-10" />
                    <span className="text-2xl font-black tracking-tight wow-grad">CallOut</span>
                </div>

                <div className="glass rounded-3xl p-8 card-shadow">
                    <h1 className="text-2xl font-black mb-1">Create an account</h1>
                    <p className="text-white/50 mb-8">Enter your details to get started with CallOut</p>

                    <form action={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="text-[var(--apple-red)] text-sm bg-[var(--apple-red)]/10 p-3 rounded-2xl border border-[var(--apple-red)]/20">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-black text-white/70 uppercase tracking-wider">Name</label>
                            <input id="name" name="name" placeholder="John Doe" required className="input-apple" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-black text-white/70 uppercase tracking-wider">Email</label>
                            <input id="email" name="email" type="email" placeholder="john@example.com" required className="input-apple" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-black text-white/70 uppercase tracking-wider">Password</label>
                            <input id="password" name="password" type="password" required className="input-apple" />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="size-4 animate-spin" />}
                            {loading ? "Creating account..." : "Sign Up"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-white/50">
                        Already have an account?{" "}
                        <Link href="/login" className="text-[var(--apple-blue)] hover:underline font-bold">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
