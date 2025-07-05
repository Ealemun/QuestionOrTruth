import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import socket from './socket';

interface Props {
  onRoomJoined: (roomData: any, playerName: string) => void;
}

const MenuScreen: React.FC<Props> = ({ onRoomJoined }) => {
  const { t } = useTranslation();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCreate = () => {
    if (!playerName) return;
    socket.emit('player:create_room', playerName, (response: any) => {
      if (response.room) {
        onRoomJoined(response.room, playerName);
      }
    });
  };

  const handleJoin = () => {
    if (!playerName || !roomCode) return;
    socket.emit('player:join_room', roomCode, playerName, (response: any) => {
      if (response.error) {
        alert(response.error);
      } else {
        onRoomJoined(response.room, playerName);
      }
    });
  };

  return (
    <div className="p-4 space-y-4">
      <input
        placeholder={t('room.name')}
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="border p-2 w-full"
      />
      <button onClick={handleCreate} className="bg-blue-500 text-white p-2 w-full rounded">
        {t('room.create')}
      </button>
      <input
        placeholder={t('room.enterCode')}
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
        className="border p-2 w-full"
      />
      <button onClick={handleJoin} className="bg-green-500 text-white p-2 w-full rounded">
        {t('room.join')}
      </button>
    </div>
  );
};

export default MenuScreen;
