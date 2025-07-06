import type { GameRoom, RoomResponse, ChatMessage } from './';

export interface ServerToClientEvents {
  'room:update': (room: GameRoom) => void;
  'room:kicked': () => void;
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

  'player:leave_room': (roomId: string, playerId: string | undefined) => void; // TODO add playerName

  'player:promote_master': (roomId: string, playerId: string, playerName: string) => void;

  'player:kick_player': (roomId: string, playerId: string, playerName?: string) => void;

  'player:toggle_ready': () => void;

  'chat:message': (data: {
    roomId: string;// TODO add senderName
    // senderName: string, // TODO add senderName
    text: string;
  }) => void;

  'room:start_game': (roomId: string) => void;

  // etc.
}
