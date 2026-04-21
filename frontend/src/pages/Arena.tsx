import React from "react";
import { TopBar } from "../components/TopBar";
import { BottomNav } from "../components/BottomNav";
import { WizardCard } from "../components/WizardCard";
import { MessageSquare, History } from "lucide-react";

export const Arena: React.FC = () => {
  return (
    <div className="bg-background text-on-background font-body select-none overflow-hidden h-screen flex flex-col">
      <TopBar />
      <main className="flex-grow relative felt-texture glowing-edge overflow-hidden">
        {/* Table Center / Trick Area */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[300px] border border-primary/10 rounded-[100px] flex items-center justify-center gap-4 relative">
            {/* Played Cards */}
            <div className="absolute -top-12 transform rotate-3">
              <WizardCard value="12" suit="flare" className="w-24 h-36" />
            </div>
            <div className="absolute -left-16 transform -rotate-12">
              <WizardCard value="7" suit="potted_plant" className="w-24 h-36" />
            </div>
            <div className="absolute -right-16 transform rotate-12">
              <WizardCard value="W" suit="auto_awesome" isWizard className="w-24 h-36" />
            </div>
            {/* Active Turn indicator */}
            <div className="absolute -bottom-8 w-24 h-36 bg-primary/5 border-2 border-dashed border-primary/40 rounded-xl flex items-center justify-center">
              <span className="text-primary/40 text-xs font-label uppercase tracking-widest text-center px-2">
                Play Card
              </span>
            </div>
          </div>
        </div>

        {/* Trump Card Slot */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
          <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em]">Trump Suit</span>
          <WizardCard value="9" suit="star" className="w-24 h-36 border-2 border-secondary-fixed/30" />
        </div>

        {/* Opponents */}
        <OpponentHUD
          name="Morgan"
          status="THINKING..."
          tricks="3/5"
          position="left-10 top-1/2 -translate-y-1/2"
          avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuDH760al6leIovzqh9Lig2qw12zxpx8J9gAClKuAh6T_yEt-0EWfag0g_chOyAC7eGjrW-TFjIsbLlT_LHsguT_kfNEdwF5PGIacSPg9vviNTEuele9WUOhRttE3RKu_1m6gVUKjVgL28MYBJpNTpOdxJ9Ga9bhPXdVgxXrgvnTP77bYK5o1t1hx56Z0jvtBJf1f8utdGACvtoURtUbD7N2SX9xQbBUwiuu0n0kiHsHWTdXFp2VjH8U0RHqCH14TjUdHZsU9UZe61wA"
        />
        <OpponentHUD
          name="Arch-Mage Alex"
          tricks="1/2"
          position="top-10 left-1/2 -translate-x-1/2"
          avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuB4I0ke99Y0_bLcbSjHF8x-pz3GlvJNgiiCXXL4NfoSMo1pn4n-SRiX3HD7AEWxYBIPs4mfE3i5w2A1d47uQnJZ91E_51HMmGhrzKPgxvAPU_s8ULt6Lr8nrIqgqtAn9xp8b8pO5KEVNx6Ru8MzxVRMxulQ03Xbv4ivkdzrgA7t6hjGJhphvx7yeuBGuY6_auRGQC-uLqVXIYdyjY3EI73mnZNjjbYyXpbd2ZkvuYt-BKv0ysfLwrnf9G1_k_TaUkp9_6FEhfJtq0SJ"
        />
        <OpponentHUD
          name="Sasha"
          tricks="0/1"
          position="right-40 top-1/2 -translate-y-1/2"
          avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuC5caPnZ2vrXhISd6O5AaOFS87qzjtCPER1H6JUlUwD3Z2nDzHSSa6V_aBjwH-NC17mK14qXsAPbPuVprCJU-2QS75e43KoBaTnvk8Iu8EQTL-k8p7xaHy2HgKEi1woy1BNf0Ya9PFyNH5YzA8VcpNRG3QLPRF9gvseAGmopNmw68zC19RdT30wsLyO3arKEGwtoNPYhmYtLJm-CBs2izFqYQaNB2p2jyAtlMVEjRIcn2a-shPf54-FpK9MnhazGz5i89elzneKWpvc"
        />

        {/* Round Info Overlay */}
        <div className="absolute top-8 right-8 bg-surface-container-low/40 backdrop-blur-md border border-outline-variant/20 p-4 rounded-2xl flex flex-col gap-1">
          <div className="flex justify-between items-center gap-8">
            <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">Round</span>
            <span className="text-primary font-headline font-bold">5 / 15</span>
          </div>
          <div className="flex justify-between items-center gap-8">
            <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">Dealer</span>
            <span className="text-secondary-fixed font-headline font-bold text-xs uppercase">You</span>
          </div>
        </div>

        {/* Hand Area */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl pb-10">
          <div className="relative h-64 flex justify-center items-end card-fan">
            <WizardCard value="13" suit="flare" />
            <WizardCard value="W" suit="auto_awesome" isWizard />
            <WizardCard value="11" suit="flare" className="border-2 border-primary shadow-[0_0_40px_rgba(145,126,255,0.3)] -translate-y-12 z-10" />
            <WizardCard value="2" suit="potted_plant" />
            <WizardCard value="Z" suit="nearby" isJester />
          </div>
        </div>

        {/* Prediction Stats */}
        <div className="absolute bottom-12 left-12 flex flex-col gap-2">
          <span className="text-on-surface-variant font-label text-xs uppercase tracking-widest">Your Prediction</span>
          <div className="flex items-end gap-3">
            <div className="bg-surface-container-highest border-2 border-primary rounded-2xl p-4 flex flex-col items-center shadow-2xl">
              <span className="text-3xl font-headline font-black text-primary">2</span>
              <span className="text-[10px] font-label text-on-surface-variant uppercase">Tricks Bid</span>
            </div>
            <div className="bg-surface-container-highest border border-outline-variant/30 rounded-2xl p-4 flex flex-col items-center shadow-xl">
              <span className="text-3xl font-headline font-black text-secondary-fixed">1</span>
              <span className="text-[10px] font-label text-on-surface-variant uppercase">Current</span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="absolute bottom-12 right-12 flex flex-col gap-4 items-end">
          <button className="bg-primary-container text-on-primary-container px-8 py-3 rounded-full font-headline font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(145,126,255,0.4)] hover:shadow-[0_0_35px_rgba(145,126,255,0.6)] active:scale-95 transition-all">
            Play Spell
          </button>
          <div className="flex gap-2">
            <ActionButton icon={<MessageSquare className="w-5 h-5" />} />
            <ActionButton icon={<History className="w-5 h-5" />} />
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

const OpponentHUD: React.FC<{ name: string; avatar: string; tricks: string; position: string; status?: string }> = ({
  name,
  avatar,
  tricks,
  position,
  status,
}) => (
  <div className={`absolute ${position} flex flex-col items-center gap-4`}>
    <div className="relative">
      <div className="w-16 h-16 rounded-full border-2 border-outline-variant overflow-hidden">
        <img alt={name} className="w-full h-full object-cover" src={avatar} />
      </div>
      <div className="absolute -bottom-2 -right-2 bg-surface-container-high border border-outline-variant/30 rounded-lg px-2 py-0.5 text-xs font-bold text-secondary-fixed shadow-lg">
        {tricks}
      </div>
    </div>
    <div className="flex flex-col items-center">
      <span className="text-on-surface text-sm font-bold font-headline uppercase tracking-tighter">{name}</span>
      {status && <span className="text-on-surface-variant text-[10px] font-label">{status}</span>}
    </div>
  </div>
);

const ActionButton: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
  <button className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
    {icon}
  </button>
);
