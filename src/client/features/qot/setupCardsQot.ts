import { createCardMap, areCardsEqual, handleRemoveCard } from "@client/utils/qotCards";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Card, CardMap, Value } from "games/qot/types";

interface InitialState {
  hand: (Card | null)[];
  availableCards: CardMap; // 0: available, 1: not available (card < a card already selected), 2: already selected
}

const initialState: InitialState = {
  hand: new Array(8).fill(null),
  availableCards: createCardMap(),
};

const setupCardsQot = createSlice({
  name: "setupCardsQot",
  initialState,
  reducers: {
    /* add a card at the first free spot of the list */
    addCard(state, action: PayloadAction<Card>) {
      // TODO treat the case a<b from the same suit, select a, select b, unselect a
      /* if the card is already in the hand remove it, else add it */
      const card = action.payload;
      if (state.availableCards[card.suit][card.rank] === 1) {
        // if the card is unavailable, do nothing
        return;
      }

      let firstNull: number | null = null;
      for (let i = 0; i < state.hand.length; i++) {
        const current = state.hand[i];

        if (current === null) {
          if (firstNull === null) {
            firstNull = i;
          }
        } else if (areCardsEqual(card, current)) {
          // if the card is already selected, remove it
          handleRemoveCard(state.hand, i, state.availableCards)
          return
      }
    }

      // If the card is not in the hand we add it
      if (firstNull !== null) {
        state.hand[firstNull] = card;
        state.availableCards[card.suit][card.rank] = 2;
        for (let i = 1; i < card.rank; i++) {
          if (state.availableCards[card.suit][i as Value] !== 2) {
            state.availableCards[card.suit][i as Value] = 1;
          }
        }
      }
    },

    removeCard(state, action: PayloadAction<number>) {
      handleRemoveCard(state.hand, action.payload, state.availableCards)
      return
    },
  },
});

export const { addCard, removeCard } = setupCardsQot.actions;
export default setupCardsQot.reducer;
