import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Card } from "games/qot/types";

interface InitialState {
    hand: Card | null []
}

const initialState: InitialState = {
    hand: new Array(8)
}

const setupCardsQot = createSlice({
    name: 'setupCardsQot',
    initialState,
    reducers: {
        /* add a card at the first free spot of the list */
        addCard(state, action: PayloadAction<Card>) {
            /* if the card is already in the hand remove it, else add it */
        },

        removeCard(state, action: PayloadAction<number>) {

        }
    }
})

export const { addCard, removeCard } = setupCardsQot.actions
export default setupCardsQot.reducer