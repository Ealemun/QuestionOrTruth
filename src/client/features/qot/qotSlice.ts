import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { QuestionOrTruthGame } from "games/qot/engine/GameLogic";
import { Card } from "games/qot/types";

interface InitialState {
    qotGame: QuestionOrTruthGame | null
}

const initialState: InitialState = {
    qotGame: null
}

const qotSlice = createSlice({
    name: 'qotSlice',
    initialState,
    reducers: {
        iniitalizeQOT(state, action: PayloadAction<QuestionOrTruthGame>) {
            state.qotGame = action.payload
        },

        deleteQOT(state) {
            state.qotGame = null
        }
    }
})

export const { iniitalizeQOT, deleteQOT } = qotSlice.actions
export default qotSlice.reducer