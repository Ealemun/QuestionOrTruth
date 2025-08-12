import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Card } from "games/qot/types";

interface InitialState {
  hand: (Card | null)[];
}

const initialState: InitialState = {
  hand: new Array(8).fill(null),
};

function areCardsEqual(card1: Card, card2: Card): boolean {
  return card1.rank === card2.rank && card1.suit === card2.suit;
}

const setupCardsQot = createSlice({
  name: "setupCardsQot",
  initialState,
  reducers: {
    /* add a card at the first free spot of the list */
    addCard(state, action: PayloadAction<Card>) {
      /* if the card is already in the hand remove it, else add it */
      let firstNull: number | null = null;
      const card = action.payload;

      for (let i = 0; i < state.hand.length; i++) {
        const current = state.hand[i];

        if (current === null) {
          if (firstNull === null) {
            firstNull = i; 
          }
        } else if (areCardsEqual(card, current)) {
          state.hand[i] = null;
          return;
        }
      }

      // If the card is not in the hand we add it
      if (firstNull !== null) {
        state.hand[firstNull] = card;
      }
    },

    removeCard(state, action: PayloadAction<number>) {},
  },
});

export const { addCard, removeCard } = setupCardsQot.actions;
export default setupCardsQot.reducer;
