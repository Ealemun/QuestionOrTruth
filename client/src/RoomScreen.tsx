import React from 'react';
import socket from './socket';
import { useTranslation } from 'react-i18next';

interface Props {
  room: any;
  // playerName: string;
  onLeave: () => void;
}

const RoomScreen: React.FC<Props> = ({ room, onLeave }) => {
  const { t } = useTranslation();

  const leaveRoom = () => {
    socket.emit('player:leave_room', room.id, socket.id);
    onLeave();
  };

  const handleKick = (roomId: string, playerId: string) => {
    socket.emit('player:kick_player', roomId, playerId);
  };

  const handlePromote = (roomId: string, playerId: string) => {
    socket.emit('player:promote_master', roomId, playerId)
  }

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
          {room.roomMaster === socket.id && p.id !== socket.id && (
            <div className="flex gap-2">
              <button
                onClick={() => handlePromote(room.id, p.id)}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
              >
                {t('room.makeMaster')}
              </button>
              <button
                onClick={() => handleKick(room.id, p.id)}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded"
              >
                {t('room.kick')}
              </button>
            </div>
        )}
          </li>
        ))}
      </ul>
      <button onClick={leaveRoom} className="bg-red-500 text-white p-2 rounded">
        {t('room.leave')}
      </button>
    </div>
  );
};

export default RoomScreen;
