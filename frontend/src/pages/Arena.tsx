import React, { useMemo } from "react";
import { TopBar } from "../components/TopBar";
import { BottomNav } from "../components/BottomNav";
import { WizardCard, type Suit } from "../components/WizardCard";
import { MessageSquare, History } from "lucide-react";
import { useGameState } from "../lib/game";
import { useLocation } from "react-router-dom";

export const Arena: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const gameId = parseInt(searchParams.get("gameId") || "1");
  const userId = parseInt(searchParams.get("userId") || "1");

  const { gameState, placeBid, playCard, startGame } = useGameState(gameId, userId);

  const currentPlayer = useMemo(() => {
    return gameState?.players.find((p) => p.user_id === userId);
  }, [gameState, userId]);

  const opponents = useMemo(() => {
    if (!gameState) return [];
    return gameState.players.filter((p) => p.user_id !== userId);
  }, [gameState, userId]);

  if (!gameState) return <div>Loading...</div>;

  return (
    <div className="bg-background text-on-background font-body select-none overflow-hidden h-screen flex flex-col">
      <TopBar />
      <main className="grow relative felt-texture glowing-edge overflow-hidden">
        {/* Table Center / Trick Area */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-125 h-75 border border-primary/10 rounded-[100px] flex items-center justify-center gap-4 relative">
            {/* Played Cards */}
            {gameState.current_trick.map((card, idx) => (
              <div
                key={idx}
                className="absolute transform"
                style={{
                  transform: `rotate(${idx * 15 - 15}deg) translate(${idx * 10 - 10}px, ${
                    idx % 2 === 0 ? -10 : 10
                  }px)`,
                }}
              >
                <WizardCard
                  value={card.type === "wizard" ? "W" : card.type === "jester" ? "Z" : card.value || ""}
                  suit={card.suit as Suit}
                  isWizard={card.type === "wizard"}
                  isJester={card.type === "jester"}
                  className="w-24 h-36"
                />
              </div>
            ))}

            {/* Active Turn indicator */}
            {gameState.status === "playing" && gameState.current_player_id === currentPlayer?.id && (
              <div className="absolute -bottom-8 w-24 h-36 bg-primary/5 border-2 border-dashed border-primary/40 rounded-xl flex items-center justify-center">
                <span className="text-primary/40 text-xs font-label uppercase tracking-widest text-center px-2">
                  Play Card
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Trump Card Slot */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
          <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em]">
            Trump Suit
          </span>
          <div className="w-24 h-36 border-2 border-secondary-fixed/30 rounded-xl flex items-center justify-center bg-surface-container-low">
            {gameState.trump_suit ? (
              <span className="material-symbols-outlined text-4xl text-secondary-fixed">
                {gameState.trump_suit}
              </span>
            ) : (
              <span className="text-on-surface-variant/20 text-xs uppercase">No Trump</span>
            )}
          </div>
        </div>

        {/* Opponents */}
        {opponents.map((opp, idx) => (
          <OpponentHUD
            key={opp.id}
            name={opp.username}
            tricks={`${opp.tricks_won}/${opp.bid || "?"}`}
            status={gameState.current_player_id === opp.id ? "THINKING..." : ""}
            position={
              idx === 0
                ? "left-10 top-1/2 -translate-y-1/2"
                : idx === 1
                ? "top-10 left-1/2 -translate-x-1/2"
                : "right-40 top-1/2 -translate-y-1/2"
            }
            avatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${opp.username}`}
          />
        ))}

        {/* Round Info Overlay */}
        <div className="absolute top-8 right-8 bg-surface-container-low/40 backdrop-blur-md border border-outline-variant/20 p-4 rounded-2xl flex flex-col gap-1">
          <div className="flex justify-between items-center gap-8">
            <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">
              Round
            </span>
            <span className="text-primary font-headline font-bold">
              {gameState.current_round} / {gameState.max_rounds}
            </span>
          </div>
          <div className="flex justify-between items-center gap-8">
            <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">
              Status
            </span>
            <span className="text-secondary-fixed font-headline font-bold text-xs uppercase">
              {gameState.status}
            </span>
          </div>
        </div>

        {/* Hand Area */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl pb-10">
          <div className="relative h-64 flex justify-center items-end card-fan">
            {gameState.hand.map((card, idx) => (
              <div
                key={idx}
                onClick={() =>
                  gameState.status === "playing" &&
                  gameState.current_player_id === currentPlayer?.id &&
                  playCard(currentPlayer!.id, idx)
                }
              >
                <WizardCard
                  value={card.type === "wizard" ? "W" : card.type === "jester" ? "Z" : card.value || ""}
                  suit={card.suit as Suit}
                  isWizard={card.type === "wizard"}
                  isJester={card.type === "jester"}
                  className={
                    gameState.current_player_id === currentPlayer?.id
                      ? "hover:-translate-y-4 transition-transform border-primary/50"
                      : ""
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Prediction Stats */}
        <div className="absolute bottom-12 left-12 flex flex-col gap-2">
          <span className="text-on-surface-variant font-label text-xs uppercase tracking-widest">
            Your Prediction
          </span>
          <div className="flex items-end gap-3">
            <div className="bg-surface-container-highest border-2 border-primary rounded-2xl p-4 flex flex-col items-center shadow-2xl">
              <span className="text-3xl font-headline font-black text-primary">
                {currentPlayer?.bid ?? "?"}
              </span>
              <span className="text-[10px] font-label text-on-surface-variant uppercase">Tricks Bid</span>
            </div>
            <div className="bg-surface-container-highest border border-outline-variant/30 rounded-2xl p-4 flex flex-col items-center shadow-xl">
              <span className="text-3xl font-headline font-black text-secondary-fixed">
                {currentPlayer?.tricks_won || 0}
              </span>
              <span className="text-[10px] font-label text-on-surface-variant uppercase">Current</span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="absolute bottom-12 right-12 flex flex-col gap-4 items-end">
          {gameState.status === "waiting" && (
            <button
              onClick={() => startGame()}
              className="bg-primary text-on-primary px-8 py-3 rounded-full font-headline font-bold uppercase tracking-widest shadow-lg"
            >
              Start Game
            </button>
          )}

          {gameState.status === "bidding" && gameState.current_player_id === currentPlayer?.id && (
            <div className="flex gap-2 bg-surface-container p-2 rounded-full border border-outline-variant">
              {[...Array(gameState.current_round + 1)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => placeBid(currentPlayer!.id, i)}
                  className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary hover:text-on-primary"
                >
                  {i}
                </button>
              ))}
            </div>
          )}

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
