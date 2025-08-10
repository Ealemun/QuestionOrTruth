import { RoomResponse } from "shared/types";
import socket from "../socket";
import { AppDispatch } from "client/app/store";
import { initializeRoomData } from "../../features/roomDataSlice";
import { t } from "i18next";

export const handleCreate = (
  playerName: string,
  dispatch: AppDispatch
): Promise<string | false> => {
  if (!playerName) return Promise.resolve(false);


  return new Promise((resolve) => {
    socket.emit("player:create_room", playerName, (response: RoomResponse) => {
      if (response.success) {
        console.log(`Room created: ${response.room.id}`);
        dispatch(
          initializeRoomData({
            roomData: response.room,
            playerName: playerName,
          })
        );
        resolve(response.room.id);
      } else {
        console.error('Error creating a room')
        resolve(false);
      }
    });
  });
};

export const handleJoin = (
  playerName: string,
  roomCode: string,
  dispatch: AppDispatch
): Promise<boolean> => {
  if (!playerName || !roomCode) return Promise.resolve(false);

  return new Promise((resolve) => {
    socket.emit(
      "player:join_room",
      roomCode,
      playerName,
      (response: RoomResponse) => {
        if (!response.success) {
          alert(t("room.cantJoin"));
          resolve(false);
        } else {
          dispatch(
            initializeRoomData({
              roomData: response.room,
              playerName: playerName,
            })
          );
          resolve(true);
        }
      }
    );
  });
};

