import type { GameRoom } from './';

export type RoomResponse =
  | { success: true; room: GameRoom }
  | { success: false; error: string };