import { Suit, Value, CardMap, Card } from "games/qot/types";

const suits: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
const values: Value[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

/** 0: available, 1: not available (card < a card already selected), 2: already selected */
export function createCardMap(): CardMap {
  return Object.fromEntries(
    suits.map((suit) => [
      suit,
      Object.fromEntries(values.map((v) => [v, 0])) as Record<Value, number>,
    ])
  ) as CardMap;
}

export function areCardsEqual(card1: Card, card2: Card): boolean {
  return card1.rank === card2.rank && card1.suit === card2.suit;
}

export function handleRemoveCard(hand: (Card | null)[], index: number, availableCards: CardMap) {
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