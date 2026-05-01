import React from 'react';
import { useParams } from 'react-router-dom';
import { useGame } from '../../hooks/useGame';
import { useGameActions } from '../../hooks/useGameActions';
import { useGameStore } from '../../store/gameStore';
import { GameStatus } from '../../types/game';
import { ScoreBoard } from './ScoreBoard';
import { TrickArea } from './TrickArea';
import { Hand } from './Hand';
import { BiddingPanel } from './BiddingPanel';
import { TrumpIndicator } from './TrumpIndicator';

export const GameBoard: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { gameState, isLoading } = useGame(gameId || null);
  const { playerHand, currentPlayer } = useGameStore();
  const { handleSubmitBid, handlePlayCard, isSubmittingBid, canPlayCard } =
    useGameActions(gameId || null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading game...</div>
      </div>
    );
  }

  if (!gameState || !currentPlayer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Game not found</div>
      </div>
    );
  }

  const playerNames = gameState.players.reduce(
    (acc, player) => {
      acc[player.id] = player.name;
      return acc;
    },
    {} as Record<string, string>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Wizard Card Game</h1>
        <div className="text-lg">
          Round <span className="font-bold">{gameState.current_round}</span> / 15
        </div>
      </div>

      <ScoreBoard players={gameState.players} currentRound={gameState.current_round} />

      {gameState.trump_suit && <TrumpIndicator trumpSuit={gameState.trump_suit} />}

      {gameState.status === GameStatus.BIDDING && (
        <BiddingPanel
          maxBid={gameState.current_round}
          onSubmitBid={handleSubmitBid}
          isSubmitting={isSubmittingBid}
        />
      )}

      <TrickArea trick={gameState.current_trick} playerNames={playerNames} />

      <div className="mt-6">
        <Hand cards={playerHand} canPlay={gameState.status === GameStatus.PLAYING} />
      </div>

      {gameState.status === GameStatus.PLAYING && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handlePlayCard}
            disabled={!canPlayCard}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Play Selected Card
          </button>
        </div>
      )}

      {gameState.status === GameStatus.FINISHED && (
        <div className="mt-6 bg-blue-50 border-2 border-blue-400 rounded-lg p-6 text-center">
          <div className="text-2xl font-bold mb-2">Game Over!</div>
          <div className="text-lg">
            Winner:{' '}
            {gameState.players.reduce((prev, current) =>
              prev.score > current.score ? prev : current
            ).name}
          </div>
        </div>
      )}
    </div>
  );
};
