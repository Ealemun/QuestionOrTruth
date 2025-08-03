import { QuestionOrTruthGame } from "games/qot/engine/GameLogic";
import { ChatMessage, GameRoom, Player } from "../../../shared/types";
import { STARTING_CHIPS } from "../config";

const rooms: Record<string, GameRoom> = {};
const playerToRoom: Record<string, string> = {};

export function createRoom(playerId: string, playerName: string): GameRoom {
  const roomId = generateRoomId();
  const roomCreationMessage: ChatMessage = {
    system: true,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    messageKey: "chat.roomCreated",
    messageParams: { roomId: roomId, playerName: playerName },
  };

  const room: GameRoom = {
    id: roomId,
    players: [],
    roomMaster: playerId,
    status: "waiting",
    messages: [roomCreationMessage],
  };

  rooms[room.id] = room;
  joinRoom(roomId, playerId, playerName);

  return room;
}

export function joinRoom(
  roomId: string,
  playerId: string,
  playerName: string
): GameRoom | null {
  const room = rooms[roomId];
  if (!room || room.players.length >= 3) return null;

  const player: Player = {
    id: playerId,
    name: playerName,
    isReady: false,
    // chips: STARTING_CHIPS,
    // cards: []
  };

  const joinMessage: ChatMessage = {
    system: true,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    messageKey: "chat.joined", // key for the frontend
    messageParams: { playerName: playerName },
  };

  room.players.push(player);
  room.messages.push(joinMessage);
  playerToRoom[playerId] = room.id;
  return room;
}

export function promotePlayer(
  playerId: string,
  playerName: string
): GameRoom | null {
  // on demande le nom pour le message
  const roomId = playerToRoom[playerId];
  const room = rooms[roomId];
  room.roomMaster = playerId;
  console.log(`👑 New room master for room ${roomId} is ${room.roomMaster}.`);
  const promotionMessage: ChatMessage = {
    system: true,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    messageKey: "chat.promoted",
    messageParams: { playerName: playerName },
  };
  room.messages.push(promotionMessage);

  return room;
}

export function removePlayer(
  playerId: string | undefined,
  way: string,
  playerName?: string
): GameRoom | null {
  if (playerId === undefined) {
    console.warn("🚨 Attempted to remove a player with undefined ID.");
    return null;
  }
  console.log("id defined, kicking");
  const roomId = playerToRoom[playerId];
  const room = rooms[roomId];
  if (!room) return null;

  if (!playerName) {
    playerName = room.players.find((p) => p.id === playerId)?.name || "Unknown";
  }

  room.players = room.players.filter((player) => player.id !== playerId);
  delete playerToRoom[playerId];
  console.log(`🏃🚪 Player ${playerId} removed (${way}) from room ${roomId}.`);

  const leaveMessage: ChatMessage = {
    system: true,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    messageKey: `chat.${way}`, // ways: "leave", "kick", "disconnection"
    messageParams: { playerName: playerName },
  };
  room.messages.push(leaveMessage);

  if (room.players.length === 0) {
    delete rooms[roomId];
    console.log(`🗑️ Room ${roomId} deleted because it is empty.`);
    return null;
  } else {
    if (room.roomMaster === playerId) {
      promotePlayer(room.players[0].id, room.players[0].name); // Promote the first player in the list to room master
    }
  }

  return rooms[roomId];
}

export function toggleReady(playerId: string): GameRoom | null {
  const roomId = playerToRoom[playerId];
  const room = rooms[roomId];
  if (!room) return null;

  const player = room.players.find((p) => p.id === playerId); // Keep this line while the number of players is low (<< 1000), else use a map
  if (!player) return null;

  player.isReady = !player.isReady;

  // Check if all the players are ready
  const allReady =
    room.players.length > 1 && room.players.every((p) => p.isReady);
  room.status = allReady ? "ready" : "waiting";

  return room;
}

export function addMessage(
  roomId: string,
  message: ChatMessage
): GameRoom | null {
  const room = rooms[roomId];
  if (!room) return null;

  room.messages.push(message);
  return room;
}

export function isMaster(roomId: string, playerId: string): boolean {
  const room = rooms[roomId];
  if (!room) return false;
  return room.roomMaster === playerId;
}

export function startGame(roomId: string): [GameRoom, QuestionOrTruthGame] {
  const room = rooms[roomId];
  const playerIds = room.players.slice(0, 2).map(player => player.id);
  room.status = "in_progress"
  const game = new QuestionOrTruthGame(playerIds);
  return [room, game]
}

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase(); // example : "K9X2D1"
}
