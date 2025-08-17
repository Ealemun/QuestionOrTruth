import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Card, CardMap, Suit, Value } from "games/qot/types";

interface InitialState {
  hand: (Card | null)[];
  availableCards: CardMap; // 0: available, 1: not available (card < a card already selected), 2: already selected
}

const suits: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
const values: Value[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function createCardMap(): CardMap {
  return Object.fromEntries(
    suits.map((suit) => [
      suit,
      Object.fromEntries(values.map((v) => [v, 0])) as Record<Value, number>,
    ])
  ) as CardMap;
}
const initialState: InitialState = {
  hand: new Array(8).fill(null),
  availableCards: createCardMap(),
};

function areCardsEqual(card1: Card, card2: Card): boolean {
  return card1.rank === card2.rank && card1.suit === card2.suit;
}

function handleRemoveCard(hand: (Card | null)[], index: number, availableCards: CardMap) {
  const card: Card | null = hand[index];
  if (card === null) {
    return;
  } else {
    hand[index] = null;
    availableCards[card.suit][card.rank] = 0;
    // for (let j = card.rank - 1; j > 0; j--){
    for (let j = 1; j <= values.length; j++) {
      if (availableCards[card.suit][j as Value] === 2) {
        // BUG: pick a and b from hearts, b>a+1, c from spades, select a, c, b, unselect c, should be able to pick a+1
        // BUG: pick and b from the same suit, b> a+1, select a, b, unselect b, should be able to pick a+1 and not a-1
        return;
      }
      availableCards[card.suit][j as Value] = 0;
    }
    return;
  }
}

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
