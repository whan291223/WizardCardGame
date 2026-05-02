import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType, CardType as CType, Suit } from '../../types/card';
import { clsx } from 'clsx';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  showBack?: boolean;
}

const suitSymbols: Record<Suit, string> = {
  [Suit.STAR]: '♠',
  [Suit.FLARE]: '♥',
  [Suit.POTTED_PLANT]: '♣',
  [Suit.NEARBY]: '♦',
};

const suitColors: Record<Suit, string> = {
  [Suit.STAR]: '#378ADD',
  [Suit.FLARE]: '#E24B4A',
  [Suit.POTTED_PLANT]: '#378ADD',
  [Suit.NEARBY]: '#E24B4A',
};

export const Card: React.FC<CardProps> = ({
  card,
  onClick,
  selected = false,
  disabled = false,
  size = 'medium',
  showBack = false,
}) => {
  const getDisplayValue = () => {
    if (card.type === CType.WIZARD) return 'W';
    if (card.type === CType.JESTER) return 'J';

    const valueMap: Record<number, string> = {
      11: 'J',
      12: 'Q',
      13: 'K',
      14: 'A',
    };
    return valueMap[card.value!] || card.value?.toString();
  };

  const sizeClasses = {
    small: 'w-14 h-20',
    medium: 'w-[70px] h-[100px]',
    large: 'w-24 h-36',
  };

  const cardClasses = clsx(
    'rounded-lg border-2 flex flex-col items-center justify-center relative font-medium cursor-pointer transition-all duration-150',
    sizeClasses[size],
    {
      'hover:-translate-y-2': !disabled && !selected,
      '-translate-y-3 ring-2 ring-blue-500': selected,
      'opacity-50 cursor-not-allowed': disabled,
      'bg-gradient-to-br from-purple-600 to-purple-400 text-white border-purple-700':
        card.type === CType.WIZARD,
      'bg-gradient-to-br from-pink-400 to-pink-200 text-red-700 border-red-400':
        card.type === CType.JESTER,
      'bg-white text-gray-900': card.type === CType.NORMAL,
      'bg-gradient-to-br from-blue-600 to-blue-800': showBack,
    }
  );

  const cardStyle =
    card.type === CType.NORMAL && card.suit
      ? {
          borderColor: suitColors[card.suit],
          color: suitColors[card.suit],
        }
      : {};

  if (showBack) {
    return (
      <motion.div
        className={cardClasses}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 180 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-white text-2xl">🎴</div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={cardClasses}
        style={cardStyle}
        onClick={!disabled ? onClick : undefined}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        {card.type === CType.NORMAL && (
          <>
            <div className="absolute top-1.5 left-2 text-sm">
              {getDisplayValue()}
            </div>
            <div className="text-3xl">{getDisplayValue()}</div>
            <div className="text-lg mt-1">{suitSymbols[card.suit!]}</div>
          </>
        )}

        {card.type === CType.WIZARD && (
          <>
            <div className="text-3xl">W</div>
            <div className="text-xs mt-1">Wizard</div>
          </>
        )}

        {card.type === CType.JESTER && (
          <>
            <div className="text-3xl">J</div>
            <div className="text-xs mt-1">Jester</div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
