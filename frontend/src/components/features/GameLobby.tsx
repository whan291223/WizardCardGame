import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useGameStore } from '../../store/gameStore';

export const GameLobby: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { setCurrentPlayer } = useGameStore();

  const handleCreateGame = async () => {
    if (!playerName.trim()) return;
    setIsCreating(true);
    try {
      const player = await apiService.createPlayer(playerName);
      setCurrentPlayer(player);
      const game = await apiService.createGame(playerName, player.id);
      // await apiService.joinGame(game.id, player.id);
      navigate(`/game/${game.id}`);
    } catch (error) {
      console.error('Error creating game:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Wizard Game Lobby</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              placeholder="Enter your name"
            />
          </div>
          <button
            onClick={handleCreateGame}
            disabled={isCreating || !playerName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create New Game'}
          </button>
        </div>
      </div>
    </div>
  );
};
