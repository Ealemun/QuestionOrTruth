import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { GameRoom } from 'shared/types'

interface InitialState {
    roomData: GameRoom | null,
    playerName: string,
}

const initialState: InitialState = {
    roomData: null,
    playerName: ''
}

export const roomDataSlice = createSlice({
  name: 'roomDataSlice',
  initialState: initialState,
  reducers: {
    initializeRoomData: (state, action: PayloadAction<{roomData: GameRoom, playerName: string}>) => {
      state.playerName = action.payload.playerName;
      state.roomData = action.payload.roomData;
    },
    resetRoomData: (state) => {
        state.playerName = initialState.playerName;
        state.roomData = initialState.roomData;
    }

  },
})

// Action creators are generated for each case reducer function
export const { initializeRoomData, resetRoomData } = roomDataSlice.actions

export default roomDataSlice.reducer