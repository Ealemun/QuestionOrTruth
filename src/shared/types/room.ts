import type { Player } from "./player";
import type { ChatMessage } from "./chat";

export interface GameRoom {
  id: string;
  players: Player[];
  roomMaster: string;
  status: 'waiting' | 'ready' | 'in_progress' | 'finished';
  messages: ChatMessage[];
}