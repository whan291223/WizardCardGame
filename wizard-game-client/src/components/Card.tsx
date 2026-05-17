import React from 'react';
import type { Card as CardType } from '../types/game.types';
import { getCardDisplayValue, getCardColor, getSuitSymbol } from '../utils/cardUtils';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  small?: boolean;
}

export const Card: React.FC<CardProps> = ({
  card,
  onClick,
  selected = false,
  disabled = false,
  small = false
}) => {
  const isSpecial = card.value === 'wizard' || card.value === 'jester';
  const color = getCardColor(card.suit);
  const displayValue = getCardDisplayValue(card);
  const suitSymbol = getSuitSymbol(card.suit);

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        ${small ? 'w-16 h-24' : 'w-20 h-28'}
        bg-white border-2 rounded-lg shadow-md
        flex flex-col items-center justify-between p-2
        transition-all duration-200
        ${onClick && !disabled ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}
        ${selected ? 'ring-4 ring-blue-500 -translate-y-2' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isSpecial ? 'bg-gradient-to-br from-purple-100 to-blue-100' : ''}
      `}
      style={{ borderColor: color }}
    >
      <div className="text-left w-full">
        <div className={`font-bold ${small ? 'text-xs' : 'text-sm'}`} style={{ color }}>
          {displayValue}
        </div>
        {suitSymbol && (
          <div className={small ? 'text-[10px]' : 'text-xs'} style={{ color }}>
            {suitSymbol}
          </div>
        )}
      </div>

      <div className={`${small ? 'text-xl' : 'text-3xl'}`} style={{ color }}>
        {isSpecial ? (card.value === 'wizard' ? '🧙' : '🃏') : suitSymbol}
      </div>

      <div className="text-right w-full transform rotate-180">
        <div className={`font-bold ${small ? 'text-xs' : 'text-sm'}`} style={{ color }}>
          {displayValue}
        </div>
        {suitSymbol && (
          <div className={small ? 'text-[10px]' : 'text-xs'} style={{ color }}>
            {suitSymbol}
          </div>
        )}
      </div>
    </div>
  );
};
