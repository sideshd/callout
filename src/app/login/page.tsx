"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Suspense } from "react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const registered = searchParams.get("registered");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid email or password");
            setLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
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
                    <h1 className="text-2xl font-black mb-1">Welcome back</h1>
                    <p className="text-[var(--muted)] mb-8">Sign in to your account</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {registered && (
                            <div className="text-[var(--good)] text-sm bg-[var(--good)]/10 p-3 rounded-2xl border border-[var(--good)]/20">
                                Account created! Please log in.
                            </div>
                        )}
                        {error && (
                            <div className="text-[var(--bad)] text-sm bg-[var(--bad)]/10 p-3 rounded-2xl border border-[var(--bad)]/20">
                                {error}
                            </div>
                        )}
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
                            {loading ? "Logging in..." : "Log In"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-[var(--muted)]">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-[var(--brand)] hover:underline font-bold">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
