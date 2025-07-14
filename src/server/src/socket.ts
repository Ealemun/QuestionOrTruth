import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { createRoom, joinRoom, removePlayer, promotePlayer, toggleReady, addMessage, isMaster } from './services/roomManager';
import { ChatMessage, ClientToServerEvents, ServerToClientEvents } from '../../shared/types';

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
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

    // // Exemple : écoute d'une mise
    // socket.on('player:bet', (amount: number) => {
    //   console.log(`💰 Player bet ${amount} chips`);
    //   // ici tu broadcast, sauvegardes, etc.
    // });

    socket.on('player:create_room', (playerName: string, callback) => {
        const room = createRoom(socket.id, playerName);
        socket.join(room.id);
        console.log(`🆕 Room created: ${room.id}`);
        callback({success: true, room: room});
      });
      
    socket.on('player:join_room', (roomId: string, playerName: string, callback) => {
      const room = joinRoom(roomId, socket.id, playerName);
      if (!room) {
        callback({ success: false, error: 'Room full or not found' });
        return null;
      }
    
      socket.join(room.id);
      console.log(`✅ Player ${socket.id} joined room ${roomId}`);
      io.to(roomId).emit('room:update', room);
      callback({success: true, room: room});
      
    });

    socket.on('player:leave_room', (roomId: string, playerName: string) => {
      const playerId = socket.id
      const room = removePlayer(playerId, "leave", playerName);
      socket.leave(roomId)
      if (room) {
        io.to(roomId).emit('room:update', room);
      }
    });

    socket.on('player:promote_master', (roomId: string, targetPlayerId: string, targetPlayerName: string) => {
      if (!isMaster(roomId, socket.id)) {
        console.log(`❌ Player ${socket.id} tried to promote a master in room ${roomId}`);
        socket.emit('error', { message: 'Not authorized' });
        return;
      }else if (targetPlayerId === socket.id) {
        console.log(`❌ Player ${socket.id} tried to promote themselves as master in room ${roomId}`);
        socket.emit('error', { message: 'Cannot promote yourself' });
        return;
      } else {
        const room = promotePlayer(targetPlayerId, targetPlayerName);
        if (room) {
          io.to(roomId).emit('room:update', room);
        }
      }
    });

    socket.on('player:kick_player', (roomId: string, targetPlayerId: string, playerName: string) => {
      if (!isMaster(roomId, socket.id)) {
        console.log(`❌ Player ${socket.id} tried to kick ${targetPlayerId} in room ${roomId}`);
        socket.emit('error', { message: 'Not authorized' });
        return;
      }else if (targetPlayerId === socket.id) {
        console.log(`❌ Player ${socket.id} tried to kick themselves in room ${roomId}`);
        socket.emit('error', { message: 'Cannot kick yourself' });
        return;
      } else {
        const kickedSocket = io.sockets.sockets.get(targetPlayerId);
        if (kickedSocket) {
          kickedSocket.emit('room:kicked'); // 👈 frontend réagit à ça
          kickedSocket.leave(roomId);
          console.log(`On envoie un room:kicked à ${targetPlayerId}`)
        }

        const updatedRoom = removePlayer(targetPlayerId, "kick", playerName); // même fonction
        if (updatedRoom) {
          io.to(roomId).emit('room:update', updatedRoom);
        }
      }
    });

    socket.on('player:toggle_ready', () => {
      const room = toggleReady(socket.id);
      if (room) {
        io.to(room.id).emit('room:update', room);
      }
    });


    socket.on('chat:message', ({roomId, senderName, text}) => {
      const message: ChatMessage = {
        senderId: socket.id,
        senderName: senderName,
        text: text,
        time: formatTime(),
      };

      const updatedRoom = addMessage(roomId, message);
      if (updatedRoom) {
        io.to(roomId).emit('room:update', updatedRoom);
        console.log(JSON.stringify(updatedRoom.messages, null, 2));
      }
    });

  });

  return io;
};


function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}