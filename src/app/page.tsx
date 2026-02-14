import {
  Target,
  Users,
  Trophy,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BarChart3,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="blur-bg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-white tracking-tight font-black text-xl wow-grad">
              CallOut
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-white/70 hover:text-white transition-colors font-bold text-sm">
              Log in
            </Link>
            <Link href="/register" className="btn-primary px-5 py-2.5 text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-slide-up">
            <div className="pill inline-flex items-center gap-2 px-4 py-2 text-sm">
              <Sparkles className="size-4 text-[var(--apple-purple)]" />
              <span className="font-bold">Trade on outcomes. Compete with friends.</span>
            </div>
            <h1 className="text-white text-6xl lg:text-8xl tracking-tight font-black">
              Social <span className="wow-grad">Prediction</span> Markets
            </h1>
            <p className="text-white/70 text-xl max-w-2xl mx-auto leading-relaxed">
              Create prediction markets with friends. Place bets. Watch the odds shift in real-time. May the best trader win.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/register" className="btn-primary px-8 py-4 text-lg flex items-center gap-2 group">
                Get Started
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="btn-quiet px-8 py-4 text-lg">
                Log in
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="wow-shell rounded-3xl p-8 card-shadow-hover">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6">
                <BarChart3 className="size-7 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Live Markets</h3>
              <p className="text-white/60 leading-relaxed">
                Watch probabilities update in real-time as bets pour in. Dynamic odds with automated market maker.
              </p>
            </div>

            <div className="wow-shell rounded-3xl p-8 card-shadow-hover">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6">
                <Users className="size-7 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Private Leagues</h3>
              <p className="text-white/60 leading-relaxed">
                Create leagues with friends. Everyone starts with equal credits. No real money, just bragging rights.
              </p>
            </div>

            <div className="wow-shell rounded-3xl p-8 card-shadow-hover">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6">
                <Trophy className="size-7 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Leaderboards</h3>
              <p className="text-white/60 leading-relaxed">
                Compete to be the top trader. Track your portfolio. See who has the best predictions.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">How it <span className="wow-grad">Works</span></h2>
            <p className="text-white/60 text-xl">Simple, fast, and addictive</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="pill size-12 flex-shrink-0 flex items-center justify-center font-black text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2">Create a League</h3>
                  <p className="text-white/60">Invite your friends. Everyone starts with $1000 in play money.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="pill size-12 flex-shrink-0 flex items-center justify-center font-black text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2">Make Predictions</h3>
                  <p className="text-white/60">Create markets on anything. Who'll win the game? Who'll be late to dinner?</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="pill size-12 flex-shrink-0 flex items-center justify-center font-black text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2">Trade Shares</h3>
                  <p className="text-white/60">Buy and sell shares. Watch odds update in real-time based on the market.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="pill size-12 flex-shrink-0 flex items-center justify-center font-black text-lg">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2">Win Bragging Rights</h3>
                  <p className="text-white/60">Resolve markets. Winners cash out. Climb the leaderboard.</p>
                </div>
              </div>
            </div>

            <div className="wow-shell rounded-3xl p-12 text-center card-shadow">
              <Zap className="size-20 text-[var(--apple-blue)] mx-auto mb-6" />
              <h3 className="text-3xl font-black text-white mb-4">Ready to Play?</h3>
              <p className="text-white/60 mb-8">Join thousands trading on prediction markets</p>
              <Link href="/register" className="btn-primary px-8 py-4 text-lg inline-flex items-center gap-2">
                Create Account
                <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 py-32">
          <div className="wow-shell rounded-[2.5rem] p-16 text-center card-shadow">
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-6">
              Start Trading <span className="wow-grad">Today</span>
            </h2>
            <p className="text-white/70 text-xl mb-10 max-w-2xl mx-auto">
              Free to use. No credit card required. Invite your friends and start making predictions.
            </p>
            <Link href="/register" className="btn-primary px-10 py-5 text-xl inline-flex items-center gap-3">
              Get Started
              <ArrowRight className="size-6" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center text-white/50 text-sm">
          <p>© 2026 CallOut. No real money, all real fun.</p>
        </div>
      </footer>
    </div>
  );
}
