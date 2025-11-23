import {
  Target,
  Users,
  Trophy,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-gradient-to-br from-slate-400 to-slate-500 rounded-lg flex items-center justify-center">
              <Target className="size-5 text-white" />
            </div>
            <span className="text-white tracking-tight font-medium text-xl">
              <span className="text-slate-300">Call</span>
              <span className="text-slate-400">Out</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-300 hover:text-white transition-colors font-medium">
              Log in
            </Link>
            <Link href="/register" className="bg-white text-slate-900 px-5 py-2 rounded-full hover:bg-slate-100 transition-all font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-slate-300 mb-4">
              <Sparkles className="size-4" />
              <span className="text-sm">Play with virtual credits, win real bragging rights</span>
            </div>
            <h1 className="text-white text-5xl lg:text-7xl tracking-tight font-medium">
              <span className="text-slate-300">Call</span>
              <span className="text-slate-400">Out</span>
            </h1>
            <p className="text-slate-300 text-xl max-w-xl mx-auto">
              Bet on yourself. And your friends.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/dashboard" className="bg-white text-slate-900 px-8 py-4 rounded-full hover:bg-slate-100 transition-all transform hover:scale-105 font-medium">
                Start a league
              </Link>
              <button className="border-2 border-white/20 text-white px-8 py-4 rounded-full hover:bg-white/10 backdrop-blur-sm transition-all font-medium">
                View demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="size-8 text-slate-400" />}
              title="Leagues"
              description="Create private groups with your friends. Keep the fun contained to people who actually get the jokes."
            />
            <FeatureCard
              icon={<Target className="size-8 text-slate-400" />}
              title="Props"
              description="Make bets on anything – who'll be late, who'll bail, who'll actually follow through. All with virtual credits."
            />
            <FeatureCard
              icon={<Trophy className="size-8 text-amber-400" />}
              title="Leaderboards"
              description="Track who's got the best instincts. Bragging rights included, real money not involved."
            />
          </div>
        </section>

        {/* League Screenshot Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-white text-3xl lg:text-5xl mb-4 tracking-tight font-medium">
              See how it looks
            </h2>
            <p className="text-slate-300 text-lg">
              A clean, simple board where all the action happens
            </p>
          </div>

          {/* Browser Frame */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            {/* Browser Chrome */}
            <div className="bg-slate-900/80 px-4 py-3 flex items-center gap-2 border-b border-white/10">
              <div className="flex gap-2">
                <div className="size-3 rounded-full bg-red-400"></div>
                <div className="size-3 rounded-full bg-yellow-400"></div>
                <div className="size-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 ml-4">
                <div className="bg-slate-700/50 rounded-lg px-4 py-1.5 text-slate-400 text-sm max-w-md">
                  callout.app/league/squad-2025
                </div>
              </div>
            </div>

            {/* Browser Content */}
            <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-white text-2xl mb-1 font-medium">
                    The Squad 2025
                  </h3>
                  <p className="text-slate-400">
                    14 members · 47 active props
                  </p>
                </div>
                <button className="bg-gradient-to-r from-pink-500 to-violet-500 text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-pink-500/50 transition-all font-medium">
                  New Prop
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <LeaguePropCard
                  title="Alex will respond to texts within 24hrs this week"
                  creator="Sarah"
                  pool="2,450"
                  status="open"
                />
                <LeaguePropCard
                  title="Chris actually cooks dinner instead of ordering"
                  creator="Jordan"
                  pool="1,820"
                  status="open"
                />
                <LeaguePropCard
                  title="Taylor beats their screen time goal"
                  creator="Mike"
                  pool="3,100"
                  status="hot"
                />
                <LeaguePropCard
                  title="Jamie finishes their project before deadline"
                  creator="Emma"
                  pool="2,675"
                  status="open"
                />
              </div>

              {/* Leaderboard Preview */}
              <div className="mt-8 bg-white/95 backdrop-blur rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="size-5 text-amber-500" />
                  <span className="text-slate-900 font-medium">
                    Top Predictors
                  </span>
                </div>
                <div className="space-y-3">
                  <LeaderboardRow
                    rank={1}
                    name="Sarah K."
                    credits="12,450"
                    trend="up"
                  />
                  <LeaderboardRow
                    rank={2}
                    name="Mike R."
                    credits="11,230"
                    trend="up"
                  />
                  <LeaderboardRow
                    rank={3}
                    name="Jordan L."
                    credits="9,875"
                    trend="down"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-32">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-center gap-8 text-slate-400 text-sm">
            <Link
              href="#"
              className="hover:text-white transition-colors"
            >
              About
            </Link>
            <span>·</span>
            <Link
              href="#"
              className="hover:text-white transition-colors"
            >
              Terms
            </Link>
            <span>·</span>
            <Link
              href="#"
              className="hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Component for feature cards
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/15 hover:scale-105 transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="text-white text-xl mb-3 font-medium">{title}</h3>
      <p className="text-slate-300">{description}</p>
    </div>
  );
}

// Component for league prop cards in browser mockup
function LeaguePropCard({
  title,
  creator,
  pool,
  status,
}: {
  title: string;
  creator: string;
  pool: string;
  status: string;
}) {
  return (
    <div className="bg-slate-700/50 backdrop-blur rounded-2xl p-4 border border-slate-600/50 hover:border-violet-500/50 transition-all">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-white text-sm flex-1 font-medium">{title}</p>
        {status === "hot" && (
          <div className="bg-gradient-to-r from-pink-500 to-violet-500 p-1 rounded-full">
            <TrendingUp className="size-3 text-white" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">by {creator}</span>
        <span className="text-emerald-400 font-medium">{pool} credits</span>
      </div>
    </div>
  );
}

// Component for leaderboard rows
function LeaderboardRow({
  rank,
  name,
  credits,
  trend,
}: {
  rank: number;
  name: string;
  credits: string;
  trend: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-slate-500 w-6 font-medium">{rank}</span>
        <span className="text-slate-900 font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-slate-900 font-medium">{credits}</span>
        {trend === "up" ? (
          <TrendingUp className="size-4 text-emerald-500" />
        ) : (
          <TrendingUp className="size-4 text-rose-500 rotate-180" />
        )}
      </div>
    </div>
  );
}
