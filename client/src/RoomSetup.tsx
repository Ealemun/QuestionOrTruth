import React, { useState } from 'react';
import socket from './socket';
import { useTranslation } from 'react-i18next';

const RoomSetup: React.FC = () => {
  const { t } = useTranslation();
  const [roomId, setRoomId] = useState('');
  const [result, setResult] = useState('');

  const createRoom = () => {
    socket.emit('player:create_room', null, (response: any) => {
      if (response.roomId) {
        setResult(t('room.created', { roomId: response.roomId }));
      } else {
        setResult(t('room.errorCreating'));
      }
    });
  };

  const joinRoom = () => {
    socket.emit('player:join_room', roomId, (response: any) => {
      if (response.error) {
        setResult(t('room.errorJoining', { error: response.error }));
      } else {
        setResult(t('room.joined', { roomId: response.roomId }));
      }
    });
  };

  return (
    <div className="p-4 space-y-4">
      <button onClick={createRoom} className="bg-blue-500 text-white p-2 rounded">
        {t('room.create')}
      </button>

      <div>
        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          placeholder={t('room.enterCode')}
          className="border p-2 mr-2"
        />
        <button onClick={joinRoom} className="bg-green-500 text-white p-2 rounded">
          {t('room.join')}
        </button>
      </div>

      <p>{result}</p>
    </div>
  );
};

export default RoomSetup;
