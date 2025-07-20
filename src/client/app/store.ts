import { configureStore } from '@reduxjs/toolkit'
import roomDataReducer from '../features/roomDataSlice'

export const store = configureStore({
  reducer: {
    roomDataSlice: roomDataReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch