import { Card } from './card';

export interface Player {
  id: string;
  name: string;
  is_bot: boolean;
  score: number;
  position: number;
}

export interface PlayerHand {
  cards: Card[];
  bid?: number;
  tricks_won: number;
}

export interface PlayerStats {
  games_played: number;
  games_won: number;
  total_score: number;
  average_score: number;
}
