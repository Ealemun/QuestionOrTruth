import { GameRoom, Player } from '../types/game';
import { STARTING_CHIPS } from '../config';

const rooms: Record<string, GameRoom> = {};
const playerToRoom: Record<string, string> = {};

export function createRoom(playerId: string, playerName: string): GameRoom {
  const player: Player = {
    id: playerId,
    name: playerName,
    isReady: false,
    // chips: STARTING_CHIPS,
    // cards: []
  };

  const room: GameRoom = {
    id: generateRoomId(),
    players: [player],
    roomMaster: playerId,
    status: 'waiting'
  };

  rooms[room.id] = room;
  playerToRoom[playerId] = room.id;
  return room;
}

export function joinRoom(roomId: string, playerId: string, playerName: string): GameRoom | null {
  const room = rooms[roomId];
  if (!room || room.players.length >= 3) return null;

  const player: Player = {
    id: playerId,
    name: playerName,
    isReady: false,
    // chips: STARTING_CHIPS,
    // cards: []
  };

  room.players.push(player);
  room.status = 'ready';
  playerToRoom[playerId] = room.id;
  return room;
}

export function promotePlayer(playerId: string): GameRoom | null {
  const roomId = playerToRoom[playerId]
  const room = rooms[roomId];
  room.roomMaster = playerId;
  console.log(`👑 New room master for room ${roomId} is ${room.roomMaster}.`);

  return room;
}

export function removePlayer(playerId: string, way: string): GameRoom | null {
  const roomId = playerToRoom[playerId]
  const room = rooms[roomId];
  if (!room) return null;

  room.players = room.players.filter(player => player.id !== playerId);
  delete playerToRoom[playerId];
  console.log(`🏃🚪 Player ${playerId} removed (${way}) from room ${roomId}.`);

  if (room.players.length === 0) {
    delete rooms[roomId];
    console.log(`🗑️ Room ${roomId} deleted because it is empty.`);
    return null;
  } else {
    if(room.roomMaster === playerId){
      promotePlayer(room.players[0].id)
    }
  }

  return rooms[roomId]
}


export function toggleReady(playerId: string): GameRoom | null {
  const roomId = playerToRoom[playerId]
  const room = rooms[roomId];
  if (!room) return null;

  const player = room.players.find(p => p.id === playerId); // Keep this line while the number of players is low (<< 1000), else use a map
  if (!player) return null;

  player.isReady = !player.isReady;

  // Check if all the players are ready
  const allReady = room.players.length > 1 && room.players.every(p => p.isReady);
  room.status = allReady ? 'ready' : 'waiting';

  return room;
}



function generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase(); // example : "K9X2D1"
  }
  