import type { GameRoom, RoomResponse } from './';

export interface ServerToClientEvents {
  'room:update': (room: GameRoom) => void;
  'room:kicked': () => void;
  'error': (error: { message: string }) => void;
//   'chat:message': (message: ChatMessage) => void;
  // autres événements émis du serveur vers le client
}

export interface ClientToServerEvents {
  'player:create_room': (
    playerName: string,
    callback: (res: RoomResponse) => void
  ) => void;

  'player:join_room': (
    roomId: string,
    playerName: string,
    callback: (res: RoomResponse) => void
  ) => void;

  'player:leave_room': (roomId: string, playerName: string) => void; 

  'player:promote_master': (roomId: string, playerId: string, playerName: string) => void;

  'player:kick_player': (roomId: string, playerId: string, playerName: string) => void;

  'player:toggle_ready': () => void;

  'chat:message': (data: {
    roomId: string;
    senderName: string, 
    text: string;
  }) => void;

  'room:start_game': (roomId: string) => void;

  // etc.
}
