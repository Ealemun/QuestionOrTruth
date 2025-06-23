import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { createRoom, joinRoom } from './services/gameManager';

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ New client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Exemple : écoute d'une mise
    socket.on('player:bet', (amount: number) => {
      console.log(`💰 Player bet ${amount} chips`);
      // ici tu broadcast, sauvegardes, etc.
    });

    socket.on('player:create_room', (_, callback) => {
        const room = createRoom(socket.id);
        socket.join(room.id);
        console.log(`🆕 Room created: ${room.id}`);
        callback({ roomId: room.id, status: room.status });
      });
      
      socket.on('player:join_room', (roomId: string, callback) => {
        const room = joinRoom(roomId, socket.id);
        if (!room) {
          callback({ error: 'Room full or not found' });
          return;
        }
      
        socket.join(room.id);
        console.log(`✅ Player ${socket.id} joined room ${roomId}`);
        callback({ roomId: room.id, status: room.status });
      });
  });

  return io;
};
