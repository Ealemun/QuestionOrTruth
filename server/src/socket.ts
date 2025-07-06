import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { createRoom, joinRoom, removePlayer, promotePlayer, toggleReady } from './services/gameManager';

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
      const room = removePlayer(socket.id, "disconnection");
      if (room){
        socket.leave(room.id)
      }
    });

    // Exemple : écoute d'une mise
    socket.on('player:bet', (amount: number) => {
      console.log(`💰 Player bet ${amount} chips`);
      // ici tu broadcast, sauvegardes, etc.
    });

    socket.on('player:create_room', (playerName: string, callback) => {
        const room = createRoom(socket.id, playerName);
        socket.join(room.id);
        console.log(`🆕 Room created: ${room.id}`);
        callback({room: room});
      });
      
      socket.on('player:join_room', (roomId: string, playerName: string, callback) => {
        const room = joinRoom(roomId, socket.id, playerName);
        if (!room) {
          callback({ error: 'Room full or not found' });
          return;
        }
      
        socket.join(room.id);
        console.log(`✅ Player ${socket.id} joined room ${roomId}`);
        io.to(roomId).emit('room:update', room);
        callback({room: room});
      });

      socket.on('player:leave_room', (roomId: string, playerId: string) => {
        const room = removePlayer(playerId, "leave");
        socket.leave(roomId)
        if (room) {
          io.to(roomId).emit('room:update', room);
        }
      });

      socket.on('player:promote_master', (roomId: string, playerId: string) => {
        const room = promotePlayer(playerId);
        if (room) {
          io.to(roomId).emit('room:update', room);
        }
      });

      socket.on('player:kick_player', (roomId: string, targetPlayerId: string) => {
        
        const kickedSocket = io.sockets.sockets.get(targetPlayerId);
        if (kickedSocket) {
          kickedSocket.emit('room:kicked'); // 👈 frontend réagit à ça
          kickedSocket.leave(roomId);
          console.log(`On envoie un room:kicked à ${targetPlayerId}`)
        }

        const updatedRoom = removePlayer(targetPlayerId, "kick"); // même fonction
        if (updatedRoom) {
          io.to(roomId).emit('room:update', updatedRoom);
        }
      });

      socket.on('player:toggle_ready', () => {
        const room = toggleReady(socket.id);
        if (room) {
          io.to(room.id).emit('room:update', room);
        }
      });

  });

  return io;
};
