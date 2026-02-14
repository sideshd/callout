"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";

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
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="flex items-center gap-2 justify-center mb-10">
                    <Logo className="size-10" />
                    <span className="text-2xl font-black tracking-tight wow-grad">CallOut</span>
                </div>

                <div className="glass rounded-3xl p-8 card-shadow">
                    <h1 className="text-2xl font-black mb-1">Welcome back</h1>
                    <p className="text-white/50 mb-8">Sign in to your account</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {registered && (
                            <div className="text-[var(--apple-green)] text-sm bg-[var(--apple-green)]/10 p-3 rounded-2xl border border-[var(--apple-green)]/20">
                                Account created! Please log in.
                            </div>
                        )}
                        {error && (
                            <div className="text-[var(--apple-red)] text-sm bg-[var(--apple-red)]/10 p-3 rounded-2xl border border-[var(--apple-red)]/20">
                                {error}
                            </div>
                        )}
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
                            {loading ? "Logging in..." : "Log In"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-white/50">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-[var(--apple-blue)] hover:underline font-bold">
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
