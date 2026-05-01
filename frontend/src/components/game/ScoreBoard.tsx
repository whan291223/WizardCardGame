import React from 'react';
import { Player } from '../../types/player';
import { motion } from 'framer-motion';

interface ScoreBoardProps {
  players: Player[];
  currentRound: number;
  bids?: Record<string, number>;
  tricksWon?: Record<string, number>;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  bids = {},
  tricksWon = {},
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {players.map((player) => (
        <motion.div
          key={player.id}
          className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-gray-800">{player.name}</div>
            {player.is_bot && (
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                Bot
              </span>
            )}
          </div>

          <div className="text-2xl font-bold text-blue-600 mb-2">
            {player.score}
          </div>

          {bids[player.id] !== undefined && (
            <div className="text-xs text-gray-600">
              Bid: {bids[player.id]} | Won: {tricksWon[player.id] || 0}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};
