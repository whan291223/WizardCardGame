import { Card, CardInPlay } from './card';
import { Player } from './player';

export enum GameStatus {
  WAITING = 'waiting',
  BIDDING = 'bidding',
  PLAYING = 'playing',
  ROUND_END = 'round_end',
  FINISHED = 'finished',
}

export interface GameState {
  id: string;
  name: string;
  status: GameStatus;
  current_round: number;
  max_rounds: number;
  trump_suit?: string;
  players: Player[];
  current_trick: CardInPlay[];
  current_player_index?: number;
  current_player_id?: string;
}

export interface RoundInfo {
  round_number: number;
  bids: Record<string, number>;
  tricks_won: Record<string, number>;
  scores: Record<string, number>;
}

export interface GameConfig {
  max_rounds: number;
  num_players: number;
  enable_sound: boolean;
  animation_speed: 'slow' | 'normal' | 'fast';
}
