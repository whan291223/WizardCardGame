import React, { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { Card } from './Card';

export const GameBoard: React.FC = () => {
  const { gameState, placeBid, playCard, startNextRound, resetGame } = useGameState(1);
  const [bidInput, setBidInput] = useState('');

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  const handleBid = () => {
    const bid = parseInt(bidInput);
    if (!isNaN(bid) && bid >= 0 && bid <= currentPlayer.hand.length) {
      placeBid(currentPlayer.id, bid);
      setBidInput('');
    }
  };

  const handlePlayCard = (cardId: string) => {
    playCard(currentPlayer.id, cardId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-4">
          <h1 className="text-2xl font-bold text-white text-center mb-2">Wizard (Single Player)</h1>
          <div className="flex justify-center gap-8 text-white">
            <div>Round: {gameState.currentRound}/{gameState.maxRounds}</div>
            <div>Phase: {gameState.phase}</div>
            {gameState.trumpCard && (
              <div className="flex items-center gap-2">
                Trump:
                <div className="inline-block scale-75 origin-left">
                  <Card card={gameState.trumpCard} small />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Player Status */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          {gameState.players.map((player, idx) => (
            <div
              key={player.id}
              className={`
                bg-white rounded-lg p-4 flex justify-between items-center
                ${idx === gameState.currentPlayerIndex ? 'ring-4 ring-yellow-400' : ''}
              `}
            >
              <div>
                <div className="font-bold text-lg">{player.name}</div>
                <div className="text-sm text-gray-600">Score: {player.score}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                    Bid: {player.bid ?? '-'} | Won: {player.tricksWon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Trick */}
        {gameState.currentTrick.cards.length > 0 && (
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-white mb-4 text-center">Played Card</h2>
            <div className="flex justify-center gap-4">
              {gameState.currentTrick.cards.map((playedCard, idx) => (
                <div key={idx} className="text-center">
                    <Card card={playedCard.card} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bidding Phase */}
        {gameState.phase === 'bidding' && (
          <div className="bg-white rounded-lg p-6 mb-4 text-center">
            <h2 className="text-xl font-bold mb-4">
              Place your bid
            </h2>
            <p className="mb-4 text-gray-600">How many tricks will you win with this hand?</p>
            <div className="flex justify-center gap-4">
              <input
                type="number"
                min="0"
                max={currentPlayer.hand.length}
                value={bidInput}
                onChange={(e) => setBidInput(e.target.value)}
                className="border-2 border-gray-300 rounded px-4 py-2 w-24 text-center text-lg"
                placeholder="0"
              />
              <button
                onClick={handleBid}
                className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                Bid
              </button>
            </div>
          </div>
        )}

        {/* Playing Phase - Current Player's Hand */}
        {(gameState.phase === 'playing' || gameState.phase === 'bidding') && (
          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6 text-center">
              Your Hand
            </h2>
            <div className="flex justify-center gap-2 flex-wrap">
              {currentPlayer.hand.map(card => (
                <Card
                  key={card.id}
                  card={card}
                  onClick={gameState.phase === 'playing' ? () => handlePlayCard(card.id) : undefined}
                  disabled={gameState.phase !== 'playing'}
                />
              ))}
            </div>
          </div>
        )}

        {/* Round End */}
        {gameState.phase === 'roundEnd' && (
          <div className="bg-white rounded-lg p-8 text-center shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-green-700">Round {gameState.currentRound} Complete!</h2>
            <div className="mb-6 space-y-2">
              {gameState.players.map(player => (
                <div key={player.id} className="text-xl">
                  {player.name}: Bid {player.bid}, Won {player.tricksWon}
                  <div className="font-bold text-2xl mt-1">Score: {player.score}</div>
                </div>
              ))}
            </div>
            <button
              onClick={startNextRound}
              className="bg-green-600 text-white px-10 py-3 rounded-xl font-bold text-xl hover:bg-green-700 transition-colors shadow-lg"
            >
              Start Round {gameState.currentRound + 1}
            </button>
          </div>
        )}

        {/* Game End */}
        {gameState.phase === 'gameEnd' && (
          <div className="bg-white rounded-lg p-8 text-center shadow-2xl">
            <h1 className="text-4xl font-bold mb-6 text-indigo-800">Game Over!</h1>
            <div className="mb-8">
              {gameState.players.map(player => (
                <div key={player.id} className="text-2xl">
                  Final Score: <span className="font-bold text-3xl text-indigo-600">{player.score}</span>
                </div>
              ))}
            </div>
            <button
              onClick={resetGame}
              className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-xl hover:bg-indigo-700 transition-colors shadow-lg"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
