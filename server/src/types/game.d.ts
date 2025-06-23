export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs'; // pique, cœur, carreau, trèfle

export interface Card {
  value: number; // 1 = As, 11 = Valet, 12 = Dame, 13 = Roi
  suit: Suit;
}

export interface Player {
  id: string;
  name?: string;
  isReady: boolean;
  chips: number;
  cards: Card[];
}

export interface GameRoom {
  id: string;
  players: Player[];
  status: 'waiting' | 'ready' | 'in_progress' | 'finished';
}
