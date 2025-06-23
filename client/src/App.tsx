import './App.css';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher';
import RoomSetup from './RoomSetup';


function App() {
  const { t } = useTranslation();

  return (
    <div className="App">
      <LanguageSwitcher />
      <h1>{t('title')}</h1>
      <p>{t('welcome')}</p>
      <RoomSetup />
    </div>
  );
}

export default App;
