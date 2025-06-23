import React from 'react';
import socket from './socket';
import { useTranslation } from 'react-i18next';

interface Props {
  room: any;
  playerName: string;
  onLeave: () => void;
}

const RoomScreen: React.FC<Props> = ({ room, playerName, onLeave }) => {
  const { t } = useTranslation();

  const leaveRoom = () => {
    socket.emit('player:leave_room', room.id); // backend à implémenter
    onLeave();
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">{t('room.inRoom', { roomId: room.id })}</h2>
      <ul>
        {room.players.map((p: any, i: number) => (
          <li key={i}>{p.name ?? '???'}</li>
        ))}
      </ul>
      <button onClick={leaveRoom} className="bg-red-500 text-white p-2 rounded">
        {t('room.leave')}
      </button>
    </div>
  );
};

export default RoomScreen;
