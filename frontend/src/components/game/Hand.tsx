import React from 'react';
import { Card as CardComponent } from '../ui/Card';
import { Card } from '../../types/card';
import { useGameStore } from '../../store/gameStore';
import { motion } from 'framer-motion';

interface HandProps {
  cards: Card[];
  canPlay: boolean;
}

export const Hand: React.FC<HandProps> = ({ cards, canPlay }) => {
  const { selectedCard, selectCard } = useGameStore();

  const handleCardClick = (card: Card) => {
    if (!canPlay) return;

    const isSelected =
      selectedCard?.type === card.type &&
      selectedCard?.suit === card.suit &&
      selectedCard?.value === card.value;

    selectCard(isSelected ? null : card);
  };

  return (
    <div className="bg-gray-100 rounded-xl p-6 border border-gray-200">
      <div className="font-semibold mb-4 text-gray-700">Your Hand</div>

      <motion.div
        className="flex justify-center flex-wrap gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
      >
        {cards.length === 0 ? (
          <div className="text-gray-400 py-8">No cards in hand</div>
        ) : (
          cards.map((card, index) => {
            const isSelected =
              selectedCard?.type === card.type &&
              selectedCard?.suit === card.suit &&
              selectedCard?.value === card.value;

            return (
              <motion.div
                key={`${card.type}-${card.suit}-${card.value}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CardComponent
                  card={card}
                  onClick={() => handleCardClick(card)}
                  selected={isSelected}
                  disabled={!canPlay}
                />
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
};
