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

  // Access the roomData slice state
  const dispatch = useDispatch();

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
            const newId: false | string = await handleCreate(playerName, dispatch);
            if (newId) navigate(`/room/${newId}`);
          }}
          className="bg-blue-500 text-white p-2 w-full rounded"
        >
          {t("room.create")}
        </button>
        <input
          placeholder={t("room.enterCode")}
          value={roomCodeJoin}
          onChange={(e) => setRoomCodeJoin(e.target.value.toUpperCase())}
          className="border p-2 w-full"
        />
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
