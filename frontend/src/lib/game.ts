import { useState, useEffect, useCallback } from "react";

export type Card = {
  type: "normal" | "wizard" | "jester";
  suit?: string;
  value?: number;
};

export type Player = {
  id: number;
  user_id: number;
  username: string;
  order: number;
  bid: number | null;
  tricks_won: number;
  score: number;
  hand_count: number;
};

export type GameState = {
  id: number;
  name: string;
  status: "waiting" | "bidding" | "playing" | "finished";
  current_round: number;
  max_rounds: number;
  trump_suit: string | null;
  lead_suit: string | null;
  current_player_id: number | null;
  players: Player[];
  hand: Card[];
  current_trick: Card[];
};

export function useGameState(gameId: number | null, userId: number | null) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    if (!gameId || !userId) return;
    try {
      const response = await fetch(`/api/v1/games/${gameId}?user_id=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch game state");
      const data = await response.json();
      setGameState(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [gameId, userId]);

  useEffect(() => {
    if (gameId && userId) {
      fetchState();
      const interval = setInterval(fetchState, 3000);
      return () => clearInterval(interval);
    }
  }, [gameId, userId, fetchState]);

  const joinGame = async (id: number, uid: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/games/${id}/join?user_id=${uid}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to join game");
      const data = await response.json();
      setGameState(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    if (!gameId) return;
    try {
      await fetch(`/api/v1/games/${gameId}/start`, { method: "POST" });
      fetchState();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const placeBid = async (player_id: number, bid: number) => {
    if (!gameId) return;
    try {
      await fetch(`/api/v1/games/${gameId}/bid?player_id=${player_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bid }),
      });
      fetchState();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const playCard = async (player_id: number, cardIndex: number) => {
    if (!gameId) return;
    try {
      await fetch(`/api/v1/games/${gameId}/play?player_id=${player_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_index: cardIndex }),
      });
      fetchState();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { gameState, loading, error, joinGame, startGame, placeBid, playCard, refresh: fetchState };
}
