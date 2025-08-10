import "./index.css";
import MenuScreen from "./MenuScreen";
import RoomScreen from "./RoomScreen";
import { Route, Routes, useNavigate } from "react-router-dom";
import { initializeRoomData, resetRoomData } from "../features/roomDataSlice";
import { t } from "i18next";
import { useEffect } from "react";
import { GameRoom } from "shared/types";
import socket from "./socket";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../app/store";
import QOTScreen from "./QOTScreen";
import { QuestionOrTruthGame } from "games/qot/types";
import { iniitalizeQOT } from "../features/qot/qotSlice";

function App() {

  const dispatch = useDispatch();
  const playerName = useSelector(
    (state: RootState) => state.roomDataSlice.playerName
  );
  const navigate = useNavigate();

   useEffect(() => {
      if (!socket.connected) {
        socket.connect();
      }
      socket.on("room:update", (roomData: GameRoom) => {
        dispatch(initializeRoomData({ roomData, playerName }));
      });
      socket.on("room:kicked", () => {
        alert(t("room.kicked"));
        dispatch(resetRoomData());
        navigate('/')
      });

      socket.on("game:start", (roomData: GameRoom, qotGame: QuestionOrTruthGame) => {
        dispatch(initializeRoomData({roomData, playerName}));
        dispatch(iniitalizeQOT(qotGame))
      })

      return () => {
    socket.off('room:update');
    socket.off('room:kicked');
    socket.off('game:start')
  };
    }, [playerName, t, navigate]);
  
    
  return (
    <Routes>
      <Route path="/" element={<MenuScreen />} />
      <Route path="/room/:roomid" element={<RoomScreen />} />
      <Route path="/qot/:roomid" element={<QOTScreen />} />
    </Routes>
  );
}

export default App;
