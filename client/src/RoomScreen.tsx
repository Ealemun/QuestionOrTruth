import React, { useState } from 'react';
import socket from './socket';
import { useTranslation } from 'react-i18next';

interface Props {
  room: any;
  // playerName: string;
  onLeave: () => void;
}

const RoomScreen: React.FC<Props> = ({ room, onLeave }) => {
  const { t } = useTranslation();
  const [newMessage, setNewMessage] = useState('');

  const leaveRoom = () => {
    socket.emit('player:leave_room', room.id, socket.id);
    onLeave();
  };

  const handleKick = (roomId: string, playerId: string, playerName: string) => {
    socket.emit('player:kick_player', roomId, playerId, playerName);
  };

  const handlePromote = (roomId: string, playerId: string, playerName:string) => {
    socket.emit('player:promote_master', roomId, playerId, playerName)
  }

  const toggleReady = () => {
    socket.emit('player:toggle_ready');
  };

  const launchGame = () => {
    socket.emit('room:start_game', room.id); // À brancher plus tard
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">{t('room.inRoom', { roomId: room.id })}</h2>
      <ul>
        {room.players.map((p: any, i: number) => (
          <li key={i}>
            {p.name ?? '???'}
            {room.roomMaster === p.id && (
          <span className="text-sm italic text-gray-500 ml-2">
            ({ t('room.master')})
          </span>
            )}

          {p.isReady ? (
            <span className="text-green-500 ml-2">✔️ {t('room.ready')}</span>
          ) : (
            <span className="text-red-500 ml-2">❌ {t('room.notReady')}</span>
          )}            

            {/* Buttons for the current player */}
            {p.id === socket.id && (
              <button
                onClick={toggleReady}
                className="text-xs bg-yellow-500 text-white px-2 py-1 rounded"
              >
                {p.isReady ? t('room.notReady') : t('room.ready')}
              </button>
            )}
          
          {/* Moderation buttons for the room master */}
          {room.roomMaster === socket.id && p.id !== socket.id && (
            <div className="flex gap-2">
              <button
                onClick={() => handlePromote(room.id, p.id, p.name)}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
              >
                {t('room.makeMaster')}
              </button>
              <button
                onClick={() => handleKick(room.id, p.id, p.name)}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded"
              >
                {t('room.kick')}
              </button>
            </div>
        )}
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t pt-2">
        <h3 className="font-semibold">{t('chat.title')}</h3>
        <div className="max-h-64 overflow-y-auto mb-2">
          {room.messages.map((msg: any, i: number) => (
            <div key={i} className={msg.system ? 'text-gray-500 italic text-sm' : 'text-sm'}>
              <span className="text-xs text-gray-400 mr-2">[{msg.time}]</span>
              {msg.system
              ? String(t(`${msg.messageKey}`, msg.messageParams))
              : <><strong>{msg.senderName}:</strong> {msg.text}</>}
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newMessage.trim()) {
            socket.emit('chat:message', {
              roomId: room.id,
              //TODO add senderName
              text: newMessage,
            });
            setNewMessage('');
          }
        }}
        className="flex gap-2"
      >
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded p-1 text-sm"
          placeholder={t('chat.placeholder')}
        />
        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
          {t('chat.send')}
        </button>
      </form>



      <div className="space-y-2">
        {/* Lancer la partie */}
        {room.roomMaster === socket.id && (
          <button
            onClick={launchGame}
            className={`p-2 rounded text-white w-full ${
              room.status === 'ready'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={room.status !== 'ready'}
          >
            {t('room.start')}
          </button>
        )}
        <button onClick={leaveRoom} className="bg-red-500 text-white p-2 rounded">
          {t('room.leave')}
        </button>
      </div>
    </div>
  );
};

export default RoomScreen;
