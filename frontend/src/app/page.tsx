import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import Image from "next/image";

export default function Lobby() {
  return (
    <div className="min-h-screen flex flex-col wizard-gradient pb-32">
      <TopBar />

      <main className="flex-grow container mx-auto px-6 py-12">
        {/* Hero Section / Player Stats */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h1 className="font-headline font-black text-6xl md:text-8xl text-on-surface tracking-tighter leading-[0.9] mb-6">
                READY YOUR <br /> <span className="text-primary">SPELLS.</span>
              </h1>
              <p className="font-body text-xl text-on-surface-variant max-w-xl">
                The Grand Tournament of the Northern Isles is now live. Predict
                your tricks, outsmart the Jesters, and claim the Wizard&apos;s mantle.
              </p>
            </div>

            {/* Profile Stats Card */}
            <div className="lg:col-span-4 glass-card p-8 rounded-[2rem] border border-primary/10 arcane-glow">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="font-label text-xs uppercase tracking-widest text-primary mb-1">
                    Current Rank
                  </p>
                  <h3 className="font-headline text-3xl font-bold text-secondary-fixed uppercase">
                    Grandmaster
                  </h3>
                </div>
                <span
                  className="material-symbols-outlined text-secondary-fixed text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  military_tech
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
                    Win Rate
                  </p>
                  <p className="font-headline text-2xl font-bold">
                    68.4<span className="text-sm text-primary ml-1">%</span>
                  </p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
                    Tricks Hit
                  </p>
                  <p className="font-headline text-2xl font-bold">1,402</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Play Now Card */}
          <Link
            href="/arena"
            className="group relative overflow-hidden glass-card p-1 rounded-[2.5rem] transition-all hover:translate-y-[-8px] cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-surface-container-highest/60 rounded-[2.4rem] p-8 h-full flex flex-col justify-between border border-white/5">
              <div className="mb-12">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                  <span
                    className="material-symbols-outlined text-primary text-4xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    bolt
                  </span>
                </div>
                <h2 className="font-headline text-4xl font-bold mb-4 tracking-tight">
                  Play Now
                </h2>
                <p className="font-body text-on-surface-variant leading-relaxed">
                  Jump directly into a competitive ranked match with players of
                  your skill level.
                </p>
              </div>
              <div className="flex items-center gap-2 text-primary font-label font-bold uppercase tracking-widest text-sm group-hover:gap-4 transition-all">
                Enter Queue{" "}
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
            </div>
          </Link>

          {/* Join Room Card */}
          <div className="group relative overflow-hidden glass-card p-1 rounded-[2.5rem] transition-all hover:translate-y-[-8px] cursor-pointer">
            <div className="relative bg-surface-container-highest/60 rounded-[2.4rem] p-8 h-full flex flex-col justify-between border border-white/5">
              <div className="mb-12">
                <div className="w-16 h-16 rounded-2xl bg-tertiary-container/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-tertiary-container text-4xl">
                    key
                  </span>
                </div>
                <h2 className="font-headline text-4xl font-bold mb-4 tracking-tight">
                  Join Room
                </h2>
                <p className="font-body text-on-surface-variant leading-relaxed">
                  Enter a private lobby code to play with friends or join a
                  specific custom tournament.
                </p>
              </div>
              <div className="flex items-center gap-2 text-tertiary-container font-label font-bold uppercase tracking-widest text-sm group-hover:gap-4 transition-all">
                Find Table{" "}
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
            </div>
          </div>

          {/* Create Room Card */}
          <div className="group relative overflow-hidden glass-card p-1 rounded-[2.5rem] transition-all hover:translate-y-[-8px] cursor-pointer">
            <div className="relative bg-surface-container-highest/60 rounded-[2.4rem] p-8 h-full flex flex-col justify-between border border-white/5">
              <div className="mb-12">
                <div className="w-16 h-16 rounded-2xl bg-secondary-fixed/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-secondary-fixed text-4xl">
                    add_circle
                  </span>
                </div>
                <h2 className="font-headline text-4xl font-bold mb-4 tracking-tight">
                  Create Room
                </h2>
                <p className="font-body text-on-surface-variant leading-relaxed">
                  Host your own game. Customize rules, round count, and invite
                  your inner circle.
                </p>
              </div>
              <div className="flex items-center gap-2 text-secondary-fixed font-label font-bold uppercase tracking-widest text-sm group-hover:gap-4 transition-all">
                New Session{" "}
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
            </div>
          </div>
        </section>

        {/* Active Tables / Social Bento */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-[2rem] p-8 border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-xl font-bold tracking-tight uppercase">
                Live Tables
              </h3>
              <span className="text-xs font-label text-primary bg-primary/10 px-3 py-1 rounded-full">
                241 Active
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></div>
                  <span className="font-body font-medium">Wizard&apos;s Den #04</span>
                </div>
                <span className="text-on-surface-variant text-sm font-label">
                  4/6 Players
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary-fixed"></div>
                  <span className="font-body font-medium">Tournament Finals</span>
                </div>
                <span className="text-on-surface-variant text-sm font-label">
                  5/6 Players
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-on-surface-variant"></div>
                  <span className="font-body font-medium">Casual Friday</span>
                </div>
                <span className="text-on-surface-variant text-sm font-label">
                  Full
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-8 border border-white/5 flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10">
              <Image
                alt="Background Cards"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-OYK3CYpwtR93lI6uYOj5PvZN7E5WZC0Ye2PfN4PARm4kLQCsrSQlaoZtEJs7hsZdoxiN0izbG44MdiHu0otZeIKhbSwFWG-rO9mAUQCqDCY7JUJN0L7j0Gm6p2cg2oD5vYN2F0iDbM0hzLK2xnwNx-tmpWWQVGcP2mOhLxfSTgKXtqgfjTWlUBrF11tgbNWQeHByRmaVGzrjiNgQ43YMCELYOAmQ2tbgTpZzQK3xhvHcwxS6s-ZuckbnguYVs-WvZhWtp8vVYb7W"
                fill
              />
            </div>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-primary text-6xl mb-4">
                auto_awesome
              </span>
              <h3 className="font-headline text-2xl font-bold mb-2">
                Weekly Challenge
              </h3>
              <p className="text-on-surface-variant mb-6 px-8">
                Win 5 games without missing a single trick prediction to earn
                the &apos;Oracle&apos; badge.
              </p>
              <button className="bg-primary text-on-primary font-label font-bold uppercase tracking-widest text-xs px-8 py-3 rounded-full shadow-[0_10px_30px_rgba(145,126,255,0.3)] hover:scale-105 active:scale-95 transition-all">
                View Rewards
              </button>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
