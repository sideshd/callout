"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/actions";
import { Loader2 } from "lucide-react";

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
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
            <div className="w-full max-w-md relative z-10">
                <div className="flex items-center gap-3 justify-center mb-10">
                    <div className="w-10 h-10 rounded-2xl wow-logo flex items-center justify-center">
                        <span className="font-black text-xs wow-logo-text">CO</span>
                    </div>
                    <span className="text-2xl font-black tracking-tight wow-grad">CallOut</span>
                </div>

                <div className="wow-shell rounded-[26px] p-8">
                    <h1 className="text-2xl font-black mb-1">Create an account</h1>
                    <p className="text-[var(--muted)] mb-8">Enter your details to get started with CallOut</p>

                    <form action={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="text-[var(--bad)] text-sm bg-[var(--bad)]/10 p-3 rounded-2xl border border-[var(--bad)]/20">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-black text-[var(--muted)] uppercase tracking-wider">Name</label>
                            <input id="name" name="name" placeholder="John Doe" required className="input-apple" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-black text-[var(--muted)] uppercase tracking-wider">Email</label>
                            <input id="email" name="email" type="email" placeholder="john@example.com" required className="input-apple" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-black text-[var(--muted)] uppercase tracking-wider">Password</label>
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

                    <p className="mt-6 text-center text-sm text-[var(--muted)]">
                        Already have an account?{" "}
                        <Link href="/login" className="text-[var(--brand)] hover:underline font-bold">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
