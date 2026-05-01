import React from 'react';
import { Card as CardComponent } from '../ui/Card';
import { CardInPlay } from '../../types/card';
import { motion } from 'framer-motion';

interface TrickAreaProps {
  trick: CardInPlay[];
  playerNames: Record<string, string>;
}

export const TrickArea: React.FC<TrickAreaProps> = ({ trick, playerNames }) => {
  return (
    <div className="bg-green-700 rounded-xl p-8 min-h-[200px] flex items-center justify-center">
      {trick.length === 0 ? (
        <div className="text-green-200 text-sm">
          Cards will appear here when played
        </div>
      ) : (
        <div className="flex gap-6 flex-wrap justify-center">
          {trick.map((cardInPlay, index) => (
            <motion.div
              key={`${cardInPlay.player_id}-${index}`}
              className="text-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: index * 0.15,
              }}
            >
              <div className="text-xs text-green-100 mb-2">
                {playerNames[cardInPlay.player_id] || 'Player'}
              </div>
              <CardComponent card={cardInPlay.card} disabled />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
