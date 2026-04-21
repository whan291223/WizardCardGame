import React from "react";
import { TopBar } from "../components/TopBar";
import { BottomNav } from "../components/BottomNav";
import { Bolt, Key, PlusCircle, Award, Sparkles, MoveRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const userId = 1; // Simplified: hardcoded user ID

  const handleCreateRoom = async () => {
    try {
      const response = await fetch("/api/v1/games/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Game ${Math.floor(Math.random() * 1000)}` }),
      });
      if (!response.ok) throw new Error("Failed to create game");
      const game = await response.json();

      // Join the game after creating it
      await fetch(`/api/v1/games/${game.id}/join?user_id=${userId}`, { method: "POST" });

      navigate(`/arena?gameId=${game.id}&userId=${userId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinRoom = async () => {
    const gameId = prompt("Enter Game ID:");
    if (!gameId) return;
    try {
      await fetch(`/api/v1/games/${gameId}/join?user_id=${userId}`, { method: "POST" });
      navigate(`/arena?gameId=${gameId}&userId=${userId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col wizard-gradient">
      <TopBar />
      <main className="grow container mx-auto px-6 py-12 mb-24 overflow-y-auto">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h1 className="font-headline font-black text-6xl md:text-8xl text-on-surface tracking-tighter leading-[0.9] mb-6 uppercase">
                Ready Your <br /> <span className="text-primary">Spells.</span>
              </h1>
              <p className="font-body text-xl text-on-surface-variant max-w-xl">
                The Grand Tournament of the Northern Isles is now live. Predict your tricks, outsmart the Jesters, and claim the Wizard's mantle.
              </p>
            </div>
            {/* Profile Stats Card */}
            <div className="lg:col-span-4 glass-card p-8 rounded-4xl border border-primary/10 arcane-glow">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="font-label text-xs uppercase tracking-widest text-primary mb-1">Current Rank</p>
                  <h3 className="font-headline text-3xl font-bold text-secondary-fixed uppercase">Grandmaster</h3>
                </div>
                <Award className="text-secondary-fixed w-10 h-10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Win Rate</p>
                  <p className="font-headline text-2xl font-bold">
                    68.4<span className="text-sm text-primary ml-1">%</span>
                  </p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Tricks Hit</p>
                  <p className="font-headline text-2xl font-bold">1,402</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            title="Play Now"
            description="Jump directly into a competitive ranked match with players of your skill level."
            icon={<Bolt className="w-10 h-10 text-primary" />}
            accentColor="from-primary/20"
            buttonLabel="Enter Queue"
            buttonColor="text-primary"
            onClick={handleCreateRoom}
          />
          <ActionCard
            title="Join Room"
            description="Enter a private lobby code to play with friends or join a specific custom tournament."
            icon={<Key className="w-10 h-10 text-tertiary-container" />}
            accentColor="from-tertiary-container/20"
            buttonLabel="Find Table"
            buttonColor="text-tertiary-container"
            onClick={handleJoinRoom}
          />
          <ActionCard
            title="Create Room"
            description="Host your own game. Customize rules, round count, and invite your inner circle."
            icon={<PlusCircle className="w-10 h-10 text-secondary-fixed" />}
            accentColor="from-secondary-fixed/20"
            buttonLabel="New Session"
            buttonColor="text-secondary-fixed"
            onClick={handleCreateRoom}
          />
        </section>

        {/* Active Tables / Social Bento */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-4xl p-8 border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-xl font-bold tracking-tight uppercase">Live Tables</h3>
              <span className="text-xs font-label text-primary bg-primary/10 px-3 py-1 rounded-full">241 Active</span>
            </div>
            <div className="space-y-4">
              <LiveTableItem name="Wizard's Den #04" players="4/6" active />
              <LiveTableItem name="Tournament Finals" players="5/6" active />
              <LiveTableItem name="Casual Friday" players="Full" />
            </div>
          </div>
          <div className="glass-card rounded-4xl p-8 border border-white/5 flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10">
              <img
                alt="Background Cards"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-OYK3CYpwtR93lI6uYOj5PvZN7E5WZC0Ye2PfN4PARm4kLQCsrSQlaoZtEJs7hsZdoxiN0izbG44MdiHu0otZeIKhbSwFWG-rO9mAUQCqDCY7JUJN0L7j0Gm6p2cg2oD5vYN2F0iDbM0hzLK2xnwNx-tmpWWQVGcP2mOhLxfSTgKXtqgfjTWlUBrF11tgbNWQeHByRmaVGzrjiNgQ43YMCELYOAmQ2tbgTpZzQK3xhvHcwxS6s-ZuckbnguYVs-WvZhWtp8vVYb7W"
              />
            </div>
            <div className="relative z-10">
              <Sparkles className="text-primary w-14 h-14 mx-auto mb-4" />
              <h3 className="font-headline text-2xl font-bold mb-2">Weekly Challenge</h3>
              <p className="text-on-surface-variant mb-6 px-8">
                Win 5 games without missing a single trick prediction to earn the 'Oracle' badge.
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
};

const ActionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  buttonLabel: string;
  buttonColor: string;
  onClick?: () => void;
}> = ({ title, description, icon, accentColor, buttonLabel, buttonColor, onClick }) => (
  <div onClick={onClick} className="group relative overflow-hidden glass-card p-1 rounded-[2.5rem] transition-all hover:-translate-y-2 cursor-pointer">
    <div className={`absolute inset-0 bg-linear-to-br ${accentColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
    <div className="relative bg-surface-container-highest/60 rounded-[2.4rem] p-8 h-full flex flex-col justify-between border border-white/5">
      <div className="mb-12">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">{icon}</div>
        <h2 className="font-headline text-4xl font-bold mb-4 tracking-tight">{title}</h2>
        <p className="font-body text-on-surface-variant leading-relaxed">{description}</p>
      </div>
      <div className={`flex items-center gap-2 ${buttonColor} font-label font-bold uppercase tracking-widest text-sm group-hover:gap-4 transition-all`}>
        {buttonLabel} <MoveRight className="w-5 h-5" />
      </div>
    </div>
  </div>
);

const LiveTableItem: React.FC<{ name: string; players: string; active?: boolean }> = ({ name, players, active }) => (
  <div className={`flex items-center justify-between p-4 bg-surface-container rounded-xl ${!active && "opacity-60"}`}>
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${active ? "bg-secondary-fixed animate-pulse" : "bg-on-surface-variant"}`} />
      <span className="font-body font-medium">{name}</span>
    </div>
    <span className="text-on-surface-variant text-sm font-label">{players} Players</span>
  </div>
);
