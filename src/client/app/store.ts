import { configureStore } from '@reduxjs/toolkit'
import roomDataReducer from '../features/roomDataSlice'
import setupCardsQotReducer from '../features/qot/setupCardsQot'
import qotSliceReducer from '../features/qot/qotSlice'

export const store = configureStore({
  reducer: {
    roomDataSlice: roomDataReducer,
    setupCardsQot: setupCardsQotReducer,
    qotSlicer: qotSliceReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch