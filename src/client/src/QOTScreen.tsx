import React, { useState } from "react";
import socket from "./socket";
import { useTranslation } from "react-i18next";
import type { GameRoom } from "../../shared/types";
import ChatBox from "./ChatBox";

interface Props {
  room: GameRoom;
  playerName: string;
  onLeave: () => void;
}
const faceMap = {
  "A": 1,
  "J": 11,
  "Q": 12,
  "K": 13,
};

const suitMap = {
  '♠': 'spades',
  '♥': 'hearts',
  '♦': 'diamonds',
  '♣': 'clubs',
};

const displayCards = [
  ...[...'A23456789'].map((v) => v),
  '10', 'J', 'Q', 'K'
];

const suits = ['♠', '♥', '♦', '♣'];

const allOptions = displayCards.flatMap((value) =>
  suits.map((suit) => ({
    label: `${value}${suit}`,
    rank: isNaN(parseInt(value))
      ? faceMap[value as keyof typeof faceMap]
      : parseInt(value),
    suit: suitMap[suit as keyof typeof suitMap]
  }))
);

const QOT: React.FC<Props> = ({ room, playerName, onLeave }) => {
  const { t } = useTranslation();

  const leaveRoom = () => {
    socket.emit("player:leave_room", room.id, playerName);
    onLeave();
  const [cards, setCards] = useState(Array(8).fill(null));

  const handleChange = (index, selectedValue) => {
    const card = allOptions.find((opt) => opt.label === selectedValue);
    const newCards = [...cards];
    newCards[index] = card;
    setCards(newCards);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {cards.map((card, i) => (
        <select
          key={i}
          value={card?.label || ''}
          onChange={(e) => handleChange(i, e.target.value)}
        >
          <option value="">--</option>
          {allOptions.map((opt) => (
            <option key={opt.label} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      <pre>{JSON.stringify(cards, null, 2)}</pre>
    </div>
  );
}
}


export default QOT;
