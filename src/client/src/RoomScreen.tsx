import { useEffect, useState } from "react";
import socket from "./socket";
import { useTranslation } from "react-i18next";
import ChatBox from "./ChatBox";
import { RootState } from "client/app/store";
import { useDispatch, useSelector } from "react-redux";
import { resetRoomData } from "../features/roomDataSlice";
import { useNavigate } from "react-router";
import LanguageSwitcher from "./components/LanguageSwitcher";

const RoomScreen = () => {
  const { t } = useTranslation();
  const room = useSelector((state: RootState) => state.roomDataSlice.roomData);
  const playerName = useSelector(
    (state: RootState) => state.roomDataSlice.playerName
  );
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);

  /* redirect to game page when starting */
  useEffect(() => {
    if (room?.status == "in_progress") {
      navigate("/qot/" + room.id);
    }
  }, [room]);

  const leaveRoom = () => {
    socket.emit("player:leave_room", room?.id || "", playerName);
    dispatch(resetRoomData());
    navigate("/");
  };

  const handleKick = (roomId: string, playerId: string, playerName: string) => {
    socket.emit("player:kick_player", roomId, playerId, playerName);
  };

  const handlePromote = (
    roomId: string,
    playerId: string,
    playerName: string
  ) => {
    socket.emit("player:promote_master", roomId, playerId, playerName);
  };

  const toggleReady = () => {
    socket.emit("player:toggle_ready");
  };

  const launchGame = () => {
    console.log("FRONT LAUNCH");
    socket.emit("room:start_game", room?.id || ""); // À brancher plus tard
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(room?.id || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error during the copy :", err);
    }
  };

  return (
    <div className="p-4 space-y-4 flex flex-col items-center justify-center">
      <LanguageSwitcher />
      <div className="flex items-center space-x-2">
        <h2 className="text-xl font-bold">
          {t("room.inRoom", { roomId: room?.id || "" })}
        </h2>
        <button
          onClick={handleCopy}
          title="Copy the ID"
          // className="w-1 h-1 p-0 m-0 flex items-center justify-center overflow-hidden"
          style={{
            width: "4rem",
            height: "4rem",
            padding: 0,
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            border: "none",
            background: "none",
          }}
        >
          <img
            src={
              copied
                ? "../icons/copy-blue.svg"
                : "../icons/copy-bw.svg"
            }
            alt="Copy"
            // className="w-full h-full hover:opacity-70 transition-opacity"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
          {/* <span>Cr</span> */}
        </button>
      </div>
      <ul>
        {room?.players.map((p: any, i: number) => (
          <li key={i}>
            {p.name ?? "???"}
            {room?.roomMaster === p.id && (
              <span className="text-sm italic text-gray-500 ml-2">
                ({t("room.master")})
              </span>
            )}

            {p.isReady ? (
              <span className="text-green-500 ml-2">✔️ {t("room.ready")}</span>
            ) : (
              <span className="text-red-500 ml-2">❌ {t("room.notReady")}</span>
            )}

            {/* Buttons for the current player */}
            {p.id === socket.id && (
              <button
                onClick={toggleReady}
                className="text-xs bg-yellow-500 text-white px-2 py-1 rounded"
              >
                {p.isReady ? t("room.notReady") : t("room.ready")}
              </button>
            )}

            {/* Moderation buttons for the room master */}
            {room.roomMaster === socket.id && p.id !== socket.id && (
              <div className="flex gap-2">
                <button
                  onClick={() => handlePromote(room.id, p.id, p.name)}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                >
                  {t("room.makeMaster")}
                </button>
                <button
                  onClick={() => handleKick(room.id, p.id, p.name)}
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                >
                  {t("room.kick")}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <ChatBox messages={room?.messages || []} />

      <div className="space-y-2">
        {/* Lancer la partie */}
        {room?.roomMaster === socket.id && (
          <button
            onClick={launchGame}
            className={`p-2 rounded text-white w-full ${
              room?.status === "ready"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400"
            }`}
            disabled={room?.status !== "ready"}
          >
            {t("room.start")}
          </button>
        )}
        <button
          onClick={leaveRoom}
          className="bg-red-500 text-white p-2 rounded"
        >
          {t("room.leave")}
        </button>
      </div>
    </div>
  );
};

export default RoomScreen;
