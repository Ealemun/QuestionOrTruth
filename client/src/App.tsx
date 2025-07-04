import './App.css';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher';
import MenuScreen from './MenuScreen';
import RoomScreen from './RoomScreen';
import { useState } from 'react';

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

  return (
    <div className="App p-4">
      <LanguageSwitcher />
      <h1>{t('title')}</h1>
      <p>{t('welcome')}</p>

      {!room ? (
        <MenuScreen onRoomJoined={handleRoomJoin} />
      ) : (
        <RoomScreen room={room} playerName={playerName} onLeave={leaveRoom} />
      )}
    </div>
  );
}

export default App;
