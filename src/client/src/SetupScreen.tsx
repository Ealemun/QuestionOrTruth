// import React, { useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { useUser } from './contexts/UserContext';

// const AVAILABLE_GAMES = [
//   { id: 'poker', name: 'Poker' },
//   { id: 'quiz', name: 'Quiz' },
//   { id: 'devils_plan', name: "Devil's Plan" },
// ] as const;

// type GameId = typeof AVAILABLE_GAMES[number]['id'];

// interface Props {
//   onContinue: () => void;
// }

// const SetupScreen: React.FC = () => {
//   const { t } = useTranslation();
//   const { setPlayerName, setSelectedGame } = useUser();
//   const [tempName, setTempName] = useState('');
//   const [tempGame, setTempGame] = useState<GameId | null>(null);


//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (tempName.trim() && tempGame) {
//       setPlayerName(tempName.trim());
//       setSelectedGame(tempGame);
//       onContinue();
//     }
//   };

//   const isValid = tempName.trim() !== '' && tempGame !== null;

//   return (
//     <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg">
//       <h1 className="text-2xl font-bold mb-6 text-center">{t('setup.title')}</h1>
      
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="playerName" className="block text-sm font-medium mb-2">
//             {t('setup.playerName')}
//           </label>
//           <input
//             id="playerName"
//             type="text"
//             value={tempName}
//             onChange={(e) => setTempName(e.target.value)}
//             className="w-full border rounded px-3 py-2"
//             placeholder={t('setup.enterName')}
//             maxLength={20}
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">
//             {t('setup.selectGame')}
//           </label>
//           <div className="space-y-2">
//             {AVAILABLE_GAMES.map((game) => (
//               <label key={game.id} className="flex items-center">
//                 <input
//                   type="radio"
//                   name="game"
//                   value={game.id}
//                   checked={tempGame === game.id}
//                   onChange={(e) => setTempGame(e.target.value)}
//                   className="mr-2"
//                 />
//                 {game.name}
//               </label>
//             ))}
//           </div>
//         </div>

//         <button
//           type="submit"
//           disabled={!isValid}
//           className={`w-full py-2 px-4 rounded font-medium ${
//             isValid
//               ? 'bg-blue-500 text-white hover:bg-blue-600'
//               : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//           }`}
//         >
//           {t('setup.continue')}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default SetupScreen;