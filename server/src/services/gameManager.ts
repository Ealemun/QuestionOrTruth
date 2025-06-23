import { GameRoom, Player } from '../types/game';
import { STARTING_CHIPS } from '../config';

const rooms: Record<string, GameRoom> = {};

export function createRoom(playerId: string): GameRoom {
  const player: Player = {
    id: playerId,
    isReady: false,
    chips: STARTING_CHIPS,
    cards: []
  };

  const room: GameRoom = {
    id: generateRoomId(),
    players: [player],
    status: 'waiting'
  };

  rooms[room.id] = room;
  return room;
}

export function joinRoom(roomId: string, playerId: string): GameRoom | null {
  const room = rooms[roomId];
  if (!room || room.players.length >= 2) return null;

  const player: Player = {
    id: playerId,
    isReady: false,
    chips: STARTING_CHIPS,
    cards: []
  };

  room.players.push(player);
  room.status = 'ready';
  return room;
}


function generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase(); // exemple : "K9X2D1"
  }
  