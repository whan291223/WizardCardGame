import React from 'react';

interface TrumpIndicatorProps {
  trumpSuit: string;
}

export const TrumpIndicator: React.FC<TrumpIndicatorProps> = ({ trumpSuit }) => {
  return (
    <div className="mb-4 inline-block bg-white border border-gray-200 rounded px-3 py-1 text-sm font-medium">
      Trump: <span className="capitalize">{trumpSuit}</span>
    </div>
  );
};
