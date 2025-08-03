import React, { useState } from "react";
import socket from "./socket";
import { useTranslation } from "react-i18next";
import type { GameRoom } from "../../shared/types";
import ChatBox from "./ChatBox";
import { RootState } from "client/app/store";
import { useSelector } from "react-redux";
import { Setup } from "./components/qot/setup/Setup";
import { QuestionOrTruthGame } from "games/qot/engine/GameLogic";

const faceMap = {
  A: 1,
  J: 11,
  Q: 12,
  K: 13,
};

const suitMap = {
  "♠": "spades",
  "♥": "hearts",
  "♦": "diamonds",
  "♣": "clubs",
};

const displayCards = [...[..."A23456789"].map((v) => v), "10", "J", "Q", "K"];

const suits = ["♠", "♥", "♦", "♣"];

const allOptions = displayCards.flatMap((value) =>
  suits.map((suit) => ({
    label: `${value}${suit}`,
    rank: isNaN(parseInt(value))
      ? faceMap[value as keyof typeof faceMap]
      : parseInt(value),
    suit: suitMap[suit as keyof typeof suitMap],
  }))
);

const QOT = () => {
  const { t } = useTranslation();
  const room = useSelector((state: RootState) => state.roomDataSlice.roomData)!;
  const playerName = useSelector(
    (state: RootState) => state.roomDataSlice.playerName
  );
  const qotGameRawData = useSelector((state: RootState) => state.qotSlicer.qotGame);
  //const qotGame = qotGameRawData ? QuestionOrTruthGame.fromObject(qotGameRawData.) : null
  

  const [cards, setCards] = useState(Array(8).fill(null));

  const leaveRoom = () => {
    socket.emit("player:leave_room", room.id, playerName);
    //onLeave();

    const handleChange = (index: number, selectedValue: string) => {
      const card = allOptions.find((opt) => opt.label === selectedValue);
      const newCards = [...cards];
      newCards[index] = card;
      setCards(newCards);
    };
  };

  function handleChange(i: number, value: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div>
      {/*(qotGame && qotGame?.isSetupPhase()) && <Setup /> */}
    </div>
  );
};

export default QOT;
