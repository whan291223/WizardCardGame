import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import WizardCard from "@/components/WizardCard";
import Image from "next/image";

export default function Arena() {
  const opponents = [
    { name: "Morgan", status: "THINKING...", tricks: "3/5", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDH760al6leIovzqh9Lig2qw12zxpx8J9gAClKuAh6T_yEt-0EWfag0g_chOyAC7eGjrW-TFjIsbLlT_LHsguT_kfNEdwF5PGIacSPg9vviNTEuele9WUOhRttE3RKu_1m6gVUKjVgL28MYBJpNTpOdxJ9Ga9bhPXdVgxXrgvnTP77bYK5o1t1hx56Z0jvtBJf1f8utdGACvtoURtUbD7N2SX9xQbBUwiuu0n0kiHsHWTdXFp2VjH8U0RHqCH14TjUdHZsU9UZe61wA", position: "left-10 top-1/2 -translate-y-1/2" },
    { name: "Arch-Mage Alex", tricks: "1/2", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4I0ke99Y0_bLcbSjHF8x-pz3GlvJNgiiCXXL4NfoSMo1pn4n-SRiX3HD7AEWxYBIPs4mfE3i5w2A1d47uQnJZ91E_51HMmGhrzKPgxvAPU_s8ULt6Lr8nrIqgqtAn9xp8b8pO5KEVNx6Ru8MzxVRMxulQ03Xbv4ivkdzrgA7t6hjGJhphvx7yeuBGuY6_auRGQC-uLqVXIYdyjY3EI73mnZNjjbYyXpbd2ZkvuYt-BKv0ysfLwrnf9G1_k_TaUkp9_6FEhfJtq0SJ", position: "top-10 left-1/2 -translate-x-1/2" },
    { name: "Sasha", tricks: "0/1", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5caPnZ2vrXhISd6O5AaOFS87qzjtCPER1H6JUlUwD3Z2nDzHSSa6V_aBjwH-NC17mK14qXsAPbPuVprCJU-2QS75e43KoBaTnvk8Iu8EQTL-k8p7xaHy2HgKEi1woy1BNf0Ya9PFyNH5YzA8VcpNRG3QLPRF9gvseAGmopNmw68zC19RdT30wsLyO3arKEGwtoNPYhmYtLJm-CBs2izFqYQaNB2p2jyAtlMVEjRIcn2a-shPf54-FpK9MnhazGz5i89elzneKWpvc", position: "right-40 top-1/2 -translate-y-1/2" },
  ];

  const hand = [
    { value: "13", suit: "flare" as const },
    { value: "W", suit: "auto_awesome" as const, isWizard: true },
    { value: "11", suit: "flare" as const },
    { value: "2", suit: "potted_plant" as const, color: "text-on-surface" },
    { value: "Z", suit: "nearby" as const, isJester: true },
  ];

  return (
    <div className="bg-background text-on-background font-body select-none overflow-hidden h-screen flex flex-col">
      <TopBar showProfileInfo={false} />

      <main className="flex-grow relative felt-texture glowing-edge overflow-hidden">
        {/* Table Center / Trick Area */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[300px] border border-primary/10 rounded-[100px] flex items-center justify-center gap-4 relative">
            {/* Played Card 1 (Top) */}
            <div className="absolute -top-12 w-24 h-36 bg-surface-container-highest rounded-xl border border-outline-variant/30 flex flex-col items-center justify-center shadow-2xl transform rotate-3">
              <span className="text-primary font-headline text-2xl font-bold">12</span>
              <span className="material-symbols-outlined text-primary text-4xl">flare</span>
            </div>
            {/* Played Card 2 (Left) */}
            <div className="absolute -left-16 w-24 h-36 bg-surface-container-highest rounded-xl border border-outline-variant/30 flex flex-col items-center justify-center shadow-2xl transform -rotate-12">
              <span className="text-on-surface font-headline text-2xl font-bold">7</span>
              <span className="material-symbols-outlined text-on-surface text-4xl">potted_plant</span>
            </div>
            {/* Played Card 3 (Right) */}
            <div className="absolute -right-16 w-24 h-36 bg-surface-container-highest rounded-xl border border-outline-variant/30 flex flex-col items-center justify-center shadow-2xl transform rotate-12">
              <span className="text-error font-headline text-2xl font-bold">W</span>
              <span className="material-symbols-outlined text-error text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            {/* Played Card 4 (Bottom) - Active Turn indicator area */}
            <div className="absolute -bottom-8 w-24 h-36 bg-primary/5 border-2 border-dashed border-primary/40 rounded-xl flex items-center justify-center">
              <span className="text-primary/40 text-xs font-label uppercase tracking-widest text-center px-2">Play Card</span>
            </div>
          </div>
        </div>

        {/* Trump Card Slot (Side) */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
          <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em]">Trump Suit</span>
          <WizardCard value="9" suit="star" isTrump={true} color="text-secondary-fixed" className="!w-24 !h-36 !p-2" />
        </div>

        {/* Opponents */}
        {opponents.map((opp) => (
          <div key={opp.name} className={`absolute ${opp.position} flex flex-col items-center gap-4`}>
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-outline-variant overflow-hidden">
                <Image src={opp.avatar} alt={opp.name} width={64} height={64} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-surface-container-high border border-outline-variant/30 rounded-lg px-2 py-0.5 text-xs font-bold text-secondary-fixed shadow-lg">
                {opp.tricks}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-on-surface text-sm font-bold font-headline uppercase tracking-tighter">{opp.name}</span>
              {opp.status && <span className="text-on-surface-variant text-[10px] font-label">{opp.status}</span>}
            </div>
          </div>
        ))}

        {/* Round Info & Scoreboard Overlay (Top Right) */}
        <div className="absolute top-8 right-8 bg-surface-container-low/40 backdrop-blur-md border border-outline-variant/20 p-4 rounded-2xl flex flex-col gap-1">
          <div className="flex justify-between items-center gap-8">
            <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">Round</span>
            <span className="text-primary font-headline font-bold">5 / 15</span>
          </div>
          <div className="flex justify-between items-center gap-8">
            <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">Dealer</span>
            <span className="text-secondary-fixed font-headline font-bold text-xs">YOU</span>
          </div>
        </div>

        {/* Hand Area (Bottom) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl pb-10">
          <div className="relative h-64 flex justify-center items-end card-fan">
            {hand.map((card, idx) => (
              <WizardCard
                key={idx}
                value={card.value}
                suit={card.suit}
                isWizard={card.isWizard}
                isJester={card.isJester}
                color={card.color}
                className={idx === 2 ? "-translate-y-12 z-10" : "hover:-translate-y-8"}
              />
            ))}
          </div>
        </div>

        {/* User Bid Stats (Floating bottom left) */}
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

        {/* Action Panel (Floating bottom right) */}
        <div className="absolute bottom-12 right-12 flex flex-col gap-4 items-end">
          <button className="bg-primary-container text-on-primary-container px-8 py-3 rounded-full font-headline font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(145,126,255,0.4)] hover:shadow-[0_0_35px_rgba(145,126,255,0.6)] active:scale-95 transition-all">
            Play Spell
          </button>
          <div className="flex gap-2">
            <button className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined">chat</span>
            </button>
            <button className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined">history</span>
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
