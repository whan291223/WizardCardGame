import axios, { AxiosInstance } from 'axios';
import { GameState } from '../types/game';
import { Card } from '../types/card';
import { Player } from '../types/player';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Game endpoints
  async createGame(playerName: string, playerId?: string): Promise<GameState> {
    const response = await this.client.post('/games/', {
      name: `${playerName}'s Game`,
      player_name: playerName,
      player_id: playerId,
    });
    return response.data;
  }

  async getGame(gameId: string, userId?: string): Promise<GameState> {
    const response = await this.client.get(`/games/${gameId}`, {
      params: { user_id: userId }
    });
    return response.data;
  }

  async submitBid(gameId: string, playerId: string, bid: number): Promise<void> {
    await this.client.post(`/games/${gameId}/bid`, {
      bid,
    }, {
      params: { player_id: playerId }
    });
  }

  async playCard(gameId: string, playerId: string, cardIndex: number): Promise<void> {
    await this.client.post(`/games/${gameId}/play`, {
      card_index: cardIndex,
    }, {
      params: { player_id: playerId }
    });
  }

  async joinGame(gameId: string, userId: string): Promise<GameState> {
    const response = await this.client.post(`/games/${gameId}/join`, null, {
      params: { user_id: userId }
    });
    return response.data;
  }

  async startGame(gameId: string): Promise<void> {
    await this.client.post(`/games/${gameId}/start`);
  }

  async getGameHistory(playerId: string): Promise<GameState[]> {
    const response = await this.client.get(`/players/${playerId}/games`);
    return response.data;
  }

  // Player endpoints
  async createPlayer(name: string): Promise<Player> {
    const response = await this.client.post('/players/', {
      name: name,
      is_bot: false,
    });
    const userData = response.data;
    return {
      id: userData.id.toString(),
      name: userData.name,
      is_bot: false,
      score: 0,
      position: 0
    };
  }

  async getPlayer(playerId: string): Promise<Player> {
    const response = await this.client.get(`/players/${playerId}`);
    return response.data;
  }

  async getLeaderboard(): Promise<Player[]> {
    const response = await this.client.get('/players/leaderboard');
    return response.data;
  }
}

export const apiService = new ApiService();
