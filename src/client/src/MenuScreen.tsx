import "./index.css";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { handleCreate, handleJoin } from "./utils/roomHandling";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import LanguageSwitcher from "./components/LanguageSwitcher";

const MenuScreen = () => {
  const { t } = useTranslation();
  const [playerName, setPlayerName] = useState("");
  const [roomCodeJoin, setRoomCodeJoin] = useState("");
  const navigate = useNavigate();
  const [paste, setPaste] = useState(false);

  // Access the roomData slice state
  const dispatch = useDispatch();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRoomCodeJoin(text.toUpperCase());
      setPaste(true);
    } catch (err) {
      console.error("Erreur lors du collage :", err);
    }
  };

  return (
    <div className="p-4 w-[full] flex flex-col justify-center items-center">
      <LanguageSwitcher />
      <h1>{t("title")}</h1>
      <p>{t("welcome")}</p>

      <div className="p-4 space-y-4 ">
        <input
          placeholder={t("room.name")}
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="border p-2 w-full"
        />
        <button
          onClick={async () => {
            const newId: false | string = await handleCreate(
              playerName,
              dispatch
            );
            if (newId) navigate(`/room/${newId}`);
          }}
          className="bg-blue-500 text-white p-2 w-full rounded"
        >
          {t("room.create")}
        </button>
        <div className="flex items-center space-x-2">
          <input
            placeholder={t("room.enterCode")}
            value={roomCodeJoin}
            onChange={(e) => setRoomCodeJoin(e.target.value.toUpperCase())}
            className="border p-2 w-full"
          />
          <button
            onClick={handlePaste}
            title="Coller depuis le presse-papier"
            className="p-2 border rounded hover:bg-gray-100"
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
                paste
                  ? "../icons/clipboard-blue.svg"
                  : "../icons/clipboard-bw.svg"
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
          </button>
        </div>
        <button
          onClick={async () => {
            if (await handleJoin(playerName, roomCodeJoin, dispatch)) {
              navigate(`/room/${roomCodeJoin}`);
            }
          }}
          className="bg-green-500 text-white p-2 w-full rounded"
        >
          {t("room.join")}
        </button>
      </div>
    </div>
  );
};

export default MenuScreen;
