import './App.css';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher';
import MenuScreen from './MenuScreen';
import RoomScreen from './RoomScreen';
import { useState, useEffect } from 'react';
import socket from './socket';

function App() {
  const { t } = useTranslation();
  const [playerName, setPlayerName] = useState('');
  const [room, setRoom] = useState<any>(null);

  const handleRoomJoin = (roomData: any, name: string) => {
    setPlayerName(name);
    setRoom(roomData);
  };

  const leaveRoom = () => {
    setRoom(null);
  };

useEffect(() => {
  socket.on('room:update', (roomData) => {
    setRoom(roomData);
});
  socket.on('room:kicked', () => {
    alert(t('room.kicked'));
    setRoom(null);
  });

  return () => {
    socket.off('room:update');
    socket.off('room:kicked');
  };
}, [t]);



  return (
    <div className="App p-4">
      <LanguageSwitcher />
      <h1>{t('title')}</h1>
      <p>{t('welcome')}</p>

      {!room ? (
        <MenuScreen onRoomJoined={handleRoomJoin} />
      ) : (
        <RoomScreen room={room} onLeave={leaveRoom} />
      )}
    </div>
  );
}

export default App;
