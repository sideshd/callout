import {
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 px-6 pt-10 pb-28">
        <div className="max-w-[1220px] mx-auto">
          {/* Main Bento Shell */}
          <div className="wow-shell rounded-[30px] p-6 lg:p-8">
            {/* Top bar: Logo + CTAs */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl wow-logo flex items-center justify-center">
                  <span className="font-black text-sm wow-logo-text">CO</span>
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight">CallOut</div>
                  <div className="text-sm text-[var(--muted)]">Private prediction markets with real pricing.</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/login" className="btn-quiet px-6 py-3 text-sm">
                  Log in
                </Link>
                <Link href="/register" className="btn-primary px-6 py-3 text-sm">
                  Get started
                </Link>
              </div>
            </div>

            {/* Two-column hero */}
            <div className="mt-8 grid lg:grid-cols-2 gap-8 items-start">
              {/* Left: Tagline + CTAs */}
              <div className="animate-slide-up">
                <div className="inline-flex items-center gap-2 chip text-xs text-[var(--muted)]">
                  <span className="w-2 h-2 rounded-full wow-dot"></span>
                  LMSR AMM · coherent probabilities
                </div>
                <h1 className="mt-5 text-5xl lg:text-6xl font-black tracking-tight leading-[1.02]">
                  A league for chaos.<br />
                  <span className="wow-grad">A market for truth.</span>
                </h1>
                <p className="mt-5 text-lg text-[var(--muted)] max-w-xl">
                  Create leagues, launch markets, add options mid-flight, and watch probabilities move.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link href="/register" className="btn-primary px-7 py-4 text-base glow-on-hover inline-flex items-center gap-2 group">
                    Start a league
                    <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/login" className="btn-quiet px-7 py-4 text-base">
                    Explore demo
                  </Link>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="wow-mini rounded-2xl p-4">
                    <div className="text-xs text-[var(--muted)]">Built-in</div>
                    <div className="text-lg font-black mt-1">Categories</div>
                  </div>
                  <div className="wow-mini rounded-2xl p-4">
                    <div className="text-xs text-[var(--muted)]">Supports</div>
                    <div className="text-lg font-black mt-1">Add options</div>
                  </div>
                </div>
              </div>

              {/* Right: Preview Markets */}
              <div className="animate-fade-in">
                <div className="wow-shell rounded-[26px] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-black text-lg">How it works</div>
                    <div className="text-xs text-[var(--muted)]">Tap to explore</div>
                  </div>

                  <div className="grid gap-3">
                    {/* Feature Card 1 */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-black leading-tight">Create private leagues</div>
                          <div className="mt-1 text-xs text-[var(--muted)]">
                            Invite friends, everyone starts with equal play money
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-[var(--muted)]">Step</div>
                          <div className="text-2xl font-black text-[var(--brand)]">1</div>
                        </div>
                      </div>
                    </div>

                    {/* Feature Card 2 */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-black leading-tight">Launch prediction markets</div>
                          <div className="mt-1 text-xs text-[var(--muted)]">
                            Multiple outcomes, dynamic odds via LMSR pricing
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-[var(--muted)]">Step</div>
                          <div className="text-2xl font-black text-[var(--purple)]">2</div>
                        </div>
                      </div>
                    </div>

                    {/* Feature Card 3 */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-black leading-tight">Trade & compete</div>
                          <div className="mt-1 text-xs text-[var(--muted)]">
                            Buy shares, watch probabilities shift, climb the leaderboard
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-[var(--muted)]">Step</div>
                          <div className="text-2xl font-black text-[var(--good)]">3</div>
                        </div>
                      </div>
                    </div>

                    {/* Feature Card 4 */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-black leading-tight">Resolve & win</div>
                          <div className="mt-1 text-xs text-[var(--muted)]">
                            Winning shares pay out. Best traders rise to the top.
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-[var(--muted)]">Step</div>
                          <div className="text-2xl font-black text-[var(--warn)]">4</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 text-xs text-[var(--muted)]">
                    Prices update via LMSR AMM. No real money, all real fun.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center text-xs text-[var(--muted)]">
            Prices update via LMSR AMM. Winning shares redeem at $1 on resolution.
          </div>
        </div>
      </div>
    </div>
  );
}
