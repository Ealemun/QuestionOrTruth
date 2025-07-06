import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '../../shared/types/socketEvents';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({ // ajouter 'http://localhost:3001' si besoin
  autoConnect: false,
});

export default socket;
