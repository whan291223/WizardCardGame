# Wizard Card Game - Backend Guide (TypeScript + Socket.io)

## Overview
This guide covers building the backend server for the Wizard card game. The server manages game rooms, validates moves, and broadcasts state to all players.

---

## Project Setup

```bash
mkdir wizard-game-server
cd wizard-game-server
npm init -y
npm install express socket.io cors
npm install -D typescript @types/express @types/node @types/cors ts-node nodemon
```

### TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

---

## Type Definitions

Create `src/types/game.types.ts`:

```typescript
// Card Types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'none';
export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 'wizard' | 'jester';

export interface Card {
  suit: Suit;
  value: CardValue;
  id: string;
}

// Player Types
export interface Player {
  id: string;
  name: string;
  hand: Card[];
  tricksWon: number;
  bid: number | null;
  score: number;
  connected: boolean;
}

// Trick Types
export interface PlayedCard {
  card: Card;
  playerId: string;
}

export interface Trick {
  cards: PlayedCard[];
  leadSuit: Suit | null;
  winnerId: string | null;
}

// Game State
export type GamePhase = 'waiting' | 'bidding' | 'playing' | 'roundEnd' | 'gameEnd';

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  currentRound: number;
  maxRounds: number;
  trumpCard: Card | null;
  trumpSuit: Suit | null;
  currentTrick: Trick;
  completedTricks: Trick[];
  phase: GamePhase;
  deck: Card[];
}

// Room Types
export interface Room {
  id: string;
  gameState: GameState;
  hostId: string;
  maxPlayers: number;
  createdAt: Date;
}

// Socket Event Types
export interface ServerToClientEvents {
  gameStateUpdate: (state: GameState) => void;
  playerJoined: (player: Player) => void;
  playerLeft: (playerId: string) => void;
  error: (message: string) => void;
  roomCreated: (roomId: string) => void;
}

export interface ClientToServerEvents {
  createRoom: (data: { playerName: string; maxPlayers: number }) => void;
  joinRoom: (data: { roomId: string; playerId: string; playerName?: string }) => void;
  leaveRoom: (data: { roomId: string; playerId: string }) => void;
  startGame: (data: { roomId: string }) => void;
  placeBid: (data: { roomId: string; playerId: string; bid: number }) => void;
  playCard: (data: { roomId: string; playerId: string; cardId: string }) => void;
}
```

---

## Card Utilities

Create `src/utils/cardUtils.ts`:

```typescript
import { Card, Suit, CardValue } from '../types/game.types';

export function createDeck(): Card[] {
  const deck: Card[] = [];
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values: CardValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

  // Regular cards
  suits.forEach(suit => {
    values.forEach(value => {
      deck.push({
        suit,
        value,
        id: `${suit}-${value}`
      });
    });
  });

  // Add 4 Wizards
  for (let i = 0; i < 4; i++) {
    deck.push({
      suit: 'none',
      value: 'wizard',
      id: `wizard-${i}`
    });
  }

  // Add 4 Jesters
  for (let i = 0; i < 4; i++) {
    deck.push({
      suit: 'none',
      value: 'jester',
      id: `jester-${i}`
    });
  }

  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

---

## Game Logic

Create `src/utils/gameLogic.ts`:

```typescript
import { Card, Player, Trick, PlayedCard, Suit, GameState } from '../types/game.types';
import { createDeck, shuffleDeck } from './cardUtils';

export function determineLeadSuit(trick: Trick): Suit | null {
  for (const playedCard of trick.cards) {
    if (playedCard.card.value !== 'jester') {
      return playedCard.card.suit;
    }
  }
  return null;
}

export function determineTrickWinner(
  trick: Trick,
  trumpSuit: Suit | null
): string | null {
  if (trick.cards.length === 0) return null;

  let winningCard = trick.cards[0];

  for (let i = 1; i < trick.cards.length; i++) {
    const current = trick.cards[i];
    
    if (current.card.value === 'wizard') {
      winningCard = current;
      continue;
    }

    if (winningCard.card.value === 'wizard') continue;

    if (current.card.value === 'jester') continue;
    if (winningCard.card.value === 'jester') {
      winningCard = current;
      continue;
    }

    if (trumpSuit) {
      const currentIsTrump = current.card.suit === trumpSuit;
      const winningIsTrump = winningCard.card.suit === trumpSuit;

      if (currentIsTrump && !winningIsTrump) {
        winningCard = current;
        continue;
      }
      if (!currentIsTrump && winningIsTrump) continue;

      if (currentIsTrump && winningIsTrump) {
        if (getCardNumericValue(current.card) > getCardNumericValue(winningCard.card)) {
          winningCard = current;
        }
        continue;
      }
    }

    if (current.card.suit === winningCard.card.suit) {
      if (getCardNumericValue(current.card) > getCardNumericValue(winningCard.card)) {
        winningCard = current;
      }
    }
  }

  return winningCard.playerId;
}

function getCardNumericValue(card: Card): number {
  if (card.value === 'wizard') return 100;
  if (card.value === 'jester') return 0;
  return card.value as number;
}

export function canPlayCard(
  card: Card,
  hand: Card[],
  trick: Trick,
  trumpSuit: Suit | null
): boolean {
  if (trick.cards.length === 0) return true;

  if (card.value === 'wizard' || card.value === 'jester') return true;

  const leadSuit = determineLeadSuit(trick);
  
  if (!leadSuit) return true;

  if (card.suit === leadSuit) return true;

  const hasLeadSuit = hand.some(c => 
    c.suit === leadSuit && c.value !== 'wizard' && c.value !== 'jester'
  );

  return !hasLeadSuit;
}

export function calculateScore(player: Player): number {
  if (player.bid === null) return player.score;

  const tricksWon = player.tricksWon;
  const bid = player.bid;

  if (tricksWon === bid) {
    return player.score + 20 + (10 * bid);
  } else {
    const diff = Math.abs(tricksWon - bid);
    return player.score - (10 * diff);
  }
}

export function initializeRound(
  players: Player[],
  roundNumber: number
): GameState {
  const deck = shuffleDeck(createDeck());
  const cardsPerPlayer = roundNumber;
  
  const updatedPlayers = players.map(player => ({
    ...player,
    hand: [],
    tricksWon: 0,
    bid: null
  }));

  // Deal cards
  for (let i = 0; i < cardsPerPlayer; i++) {
    updatedPlayers.forEach(player => {
      if (deck.length > 0) {
        player.hand.push(deck.pop()!);
      }
    });
  }

  // Trump card
  const trumpCard = deck.length > 0 ? deck.pop()! : null;
  const trumpSuit = getTrumpSuit(trumpCard);

  return {
    players: updatedPlayers,
    currentPlayerIndex: 0,
    currentRound: roundNumber,
    maxRounds: Math.floor(60 / players.length),
    trumpCard,
    trumpSuit,
    currentTrick: { cards: [], leadSuit: null, winnerId: null },
    completedTricks: [],
    phase: 'bidding',
    deck
  };
}

export function getTrumpSuit(trumpCard: Card | null): Suit | null {
  if (!trumpCard) return null;
  if (trumpCard.value === 'wizard') return null; // Can implement dealer choice
  if (trumpCard.value === 'jester') return null;
  return trumpCard.suit;
}

export function initializeGame(players: Player[]): GameState {
  return initializeRound(players, 1);
}
```

---

## Room Manager

Create `src/managers/RoomManager.ts`:

```typescript
import { Room, GameState, Player } from '../types/game.types';
import { initializeGame } from '../utils/gameLogic';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(roomId: string, hostId: string, hostName: string, maxPlayers: number = 6): Room {
    const host: Player = {
      id: hostId,
      name: hostName,
      hand: [],
      tricksWon: 0,
      bid: null,
      score: 0,
      connected: true
    };

    const gameState: GameState = {
      players: [host],
      currentPlayerIndex: 0,
      currentRound: 1,
      maxRounds: Math.floor(60 / maxPlayers),
      trumpCard: null,
      trumpSuit: null,
      currentTrick: { cards: [], leadSuit: null, winnerId: null },
      completedTricks: [],
      phase: 'waiting',
      deck: []
    };

    const room: Room = {
      id: roomId,
      gameState,
      hostId,
      maxPlayers,
      createdAt: new Date()
    };

    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  addPlayer(roomId: string, playerId: string, playerName: string): Player | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.gameState.players.length >= room.maxPlayers) {
      return null;
    }

    if (room.gameState.phase !== 'waiting') {
      return null;
    }

    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      hand: [],
      tricksWon: 0,
      bid: null,
      score: 0,
      connected: true
    };

    room.gameState.players.push(newPlayer);
    return newPlayer;
  }

  removePlayer(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const playerIndex = room.gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return false;

    room.gameState.players.splice(playerIndex, 1);

    // If no players left, delete room
    if (room.gameState.players.length === 0) {
      this.rooms.delete(roomId);
    }

    return true;
  }

  startGame(roomId: string): GameState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.gameState.players.length < 3) {
      return null; // Need at least 3 players
    }

    room.gameState = initializeGame(room.gameState.players);
    return room.gameState;
  }

  updateGameState(roomId: string, gameState: GameState): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.gameState = gameState;
    }
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }
}
```

---

## Game Manager

Create `src/managers/GameManager.ts`:

```typescript
import { GameState, Player } from '../types/game.types';
import {
  canPlayCard,
  determineTrickWinner,
  calculateScore,
  initializeRound
} from '../utils/gameLogic';

export class GameManager {
  placeBid(gameState: GameState, playerId: string, bid: number): GameState {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return gameState;

    if (gameState.phase !== 'bidding') return gameState;
    if (gameState.players[gameState.currentPlayerIndex].id !== playerId) return gameState;

    const updatedPlayers = gameState.players.map(p =>
      p.id === playerId ? { ...p, bid } : p
    );

    const allBid = updatedPlayers.every(p => p.bid !== null);

    return {
      ...gameState,
      players: updatedPlayers,
      phase: allBid ? 'playing' : 'bidding',
      currentPlayerIndex: allBid ? 0 : (gameState.currentPlayerIndex + 1) % gameState.players.length
    };
  }

  playCard(gameState: GameState, playerId: string, cardId: string): GameState {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return gameState;

    if (gameState.phase !== 'playing') return gameState;
    if (gameState.players[gameState.currentPlayerIndex].id !== playerId) return gameState;

    const card = player.hand.find(c => c.id === cardId);
    if (!card) return gameState;

    // Validate card can be played
    if (!canPlayCard(card, player.hand, gameState.currentTrick, gameState.trumpSuit)) {
      return gameState;
    }

    // Remove card from hand and add to trick
    const updatedPlayers = gameState.players.map(p =>
      p.id === playerId
        ? { ...p, hand: p.hand.filter(c => c.id !== cardId) }
        : p
    );

    const updatedTrick = {
      ...gameState.currentTrick,
      cards: [...gameState.currentTrick.cards, { card, playerId }],
      leadSuit: gameState.currentTrick.cards.length === 0 
        ? (card.value === 'jester' ? null : card.suit)
        : gameState.currentTrick.leadSuit
    };

    // Check if trick is complete
    if (updatedTrick.cards.length === gameState.players.length) {
      const winnerId = determineTrickWinner(updatedTrick, gameState.trumpSuit);
      const winnerIndex = gameState.players.findIndex(p => p.id === winnerId);

      // Award trick to winner
      const playersWithTrick = updatedPlayers.map(p =>
        p.id === winnerId ? { ...p, tricksWon: p.tricksWon + 1 } : p
      );

      // Check if round is complete
      const roundComplete = playersWithTrick[0].hand.length === 0;

      if (roundComplete) {
        // Calculate scores
        const playersWithScores = playersWithTrick.map(p => ({
          ...p,
          score: calculateScore(p)
        }));

        return {
          ...gameState,
          players: playersWithScores,
          completedTricks: [...gameState.completedTricks, updatedTrick],
          currentTrick: { cards: [], leadSuit: null, winnerId: null },
          phase: 'roundEnd'
        };
      }

      // Start new trick
      return {
        ...gameState,
        players: playersWithTrick,
        currentTrick: { cards: [], leadSuit: null, winnerId: null },
        completedTricks: [...gameState.completedTricks, updatedTrick],
        currentPlayerIndex: winnerIndex
      };
    }

    // Continue current trick
    return {
      ...gameState,
      players: updatedPlayers,
      currentTrick: updatedTrick,
      currentPlayerIndex: (gameState.currentPlayerIndex + 1) % gameState.players.length
    };
  }

  startNextRound(gameState: GameState): GameState {
    const nextRound = gameState.currentRound + 1;

    if (nextRound > gameState.maxRounds) {
      return { ...gameState, phase: 'gameEnd' };
    }

    return initializeRound(gameState.players, nextRound);
  }
}
```

---

## Socket Server

Create `src/server.ts`:

```typescript
import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './managers/RoomManager';
import { GameManager } from './managers/GameManager';
import {
  ServerToClientEvents,
  ClientToServerEvents
} from './types/game.types';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const roomManager = new RoomManager();
const gameManager = new GameManager();

io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
  console.log('Client connected:', socket.id);

  // Create Room
  socket.on('createRoom', ({ playerName, maxPlayers }) => {
    const roomId = generateRoomId();
    const room = roomManager.createRoom(roomId, socket.id, playerName, maxPlayers);
    
    socket.join(roomId);
    socket.emit('roomCreated', roomId);
    socket.emit('gameStateUpdate', room.gameState);
    
    console.log(`Room created: ${roomId} by ${playerName}`);
  });

  // Join Room
  socket.on('joinRoom', ({ roomId, playerId, playerName }) => {
    const room = roomManager.getRoom(roomId);
    
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    // Check if player is rejoining
    const existingPlayer = room.gameState.players.find(p => p.id === playerId);
    
    if (existingPlayer) {
      // Reconnecting player
      existingPlayer.connected = true;
      socket.join(roomId);
      socket.emit('gameStateUpdate', room.gameState);
      io.to(roomId).emit('playerJoined', existingPlayer);
    } else {
      // New player
      if (!playerName) {
        socket.emit('error', 'Player name required');
        return;
      }

      const newPlayer = roomManager.addPlayer(roomId, socket.id, playerName);
      
      if (!newPlayer) {
        socket.emit('error', 'Cannot join room (full or game in progress)');
        return;
      }

      socket.join(roomId);
      io.to(roomId).emit('gameStateUpdate', room.gameState);
      io.to(roomId).emit('playerJoined', newPlayer);
    }

    console.log(`Player ${playerName || playerId} joined room ${roomId}`);
  });

  // Leave Room
  socket.on('leaveRoom', ({ roomId, playerId }) => {
    roomManager.removePlayer(roomId, playerId);
    socket.leave(roomId);
    io.to(roomId).emit('playerLeft', playerId);
    
    const room = roomManager.getRoom(roomId);
    if (room) {
      io.to(roomId).emit('gameStateUpdate', room.gameState);
    }
  });

  // Start Game
  socket.on('startGame', ({ roomId }) => {
    const gameState = roomManager.startGame(roomId);
    
    if (!gameState) {
      socket.emit('error', 'Cannot start game (need 3+ players)');
      return;
    }

    io.to(roomId).emit('gameStateUpdate', gameState);
    console.log(`Game started in room ${roomId}`);
  });

  // Place Bid
  socket.on('placeBid', ({ roomId, playerId, bid }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const updatedState = gameManager.placeBid(room.gameState, playerId, bid);
    roomManager.updateGameState(roomId, updatedState);
    
    io.to(roomId).emit('gameStateUpdate', updatedState);
    console.log(`Player ${playerId} bid ${bid} in room ${roomId}`);
  });

  // Play Card
  socket.on('playCard', ({ roomId, playerId, cardId }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const updatedState = gameManager.playCard(room.gameState, playerId, cardId);
    roomManager.updateGameState(roomId, updatedState);
    
    io.to(roomId).emit('gameStateUpdate', updatedState);
    console.log(`Player ${playerId} played card ${cardId} in room ${roomId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Mark player as disconnected in all rooms
    const rooms = roomManager.getAllRooms();
    rooms.forEach(room => {
      const player = room.gameState.players.find(p => p.id === socket.id);
      if (player) {
        player.connected = false;
        io.to(room.id).emit('gameStateUpdate', room.gameState);
      }
    });
  });
});

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Environment Configuration

Create `.env`:

```
PORT=3001
NODE_ENV=development
```

Create `.env.example`:

```
PORT=3001
NODE_ENV=development
```

---

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

---

## API Documentation

### Socket Events (Client → Server)

#### createRoom
```typescript
socket.emit('createRoom', {
  playerName: string,
  maxPlayers: number
});
```

#### joinRoom
```typescript
socket.emit('joinRoom', {
  roomId: string,
  playerId: string,
  playerName?: string
});
```

#### startGame
```typescript
socket.emit('startGame', {
  roomId: string
});
```

#### placeBid
```typescript
socket.emit('placeBid', {
  roomId: string,
  playerId: string,
  bid: number
});
```

#### playCard
```typescript
socket.emit('playCard', {
  roomId: string,
  playerId: string,
  cardId: string
});
```

### Socket Events (Server → Client)

#### gameStateUpdate
```typescript
socket.on('gameStateUpdate', (state: GameState) => {
  // Handle game state update
});
```

#### playerJoined
```typescript
socket.on('playerJoined', (player: Player) => {
  // Handle new player
});
```

#### playerLeft
```typescript
socket.on('playerLeft', (playerId: string) => {
  // Handle player leaving
});
```

#### error
```typescript
socket.on('error', (message: string) => {
  // Handle error
});
```

#### roomCreated
```typescript
socket.on('roomCreated', (roomId: string) => {
  // Handle room creation
});
```

---

## Testing with Multiple Clients

### Using Browser Console
```javascript
// Client 1
const socket = io('http://localhost:3001');
socket.emit('createRoom', { playerName: 'Alice', maxPlayers: 4 });

socket.on('roomCreated', (roomId) => {
  console.log('Room:', roomId);
});

socket.on('gameStateUpdate', (state) => {
  console.log('Game State:', state);
});

// Client 2
const socket2 = io('http://localhost:3001');
socket2.emit('joinRoom', { 
  roomId: 'ABC123', 
  playerId: socket2.id,
  playerName: 'Bob'
});
```

---

## Deployment

### Heroku
```bash
# Add Procfile
echo "web: npm start" > Procfile

# Deploy
git init
git add .
git commit -m "Initial commit"
heroku create wizard-card-game-server
git push heroku main
```

### Railway / Render
1. Connect GitHub repository
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add environment variable: `PORT=3001`

---

## Security Enhancements (Optional)

### Add Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);
```

### Add Authentication (JWT)
```typescript
import jwt from 'jsonwebtoken';

// Middleware to verify token
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    socket.data.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
```

---

## Summary

**Server Responsibilities:**
1. **Room Management** - Create/join/leave rooms
2. **State Authority** - Server is single source of truth
3. **Validation** - Validate all moves server-side
4. **Broadcasting** - Send state updates to all clients
5. **Reconnection** - Handle player disconnects/reconnects

**Key Principles:**
- Never trust client data - validate everything
- Server owns the game state
- Clients only send actions, receive state
- Broadcast state changes to all room members
- Handle edge cases (disconnects, invalid moves)