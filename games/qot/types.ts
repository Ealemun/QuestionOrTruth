export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs'; // pique, cœur, carreau, trèfle

export type NumericalValue = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type FaceValue = 1 | 11 | 12 | 13; // valet, dame, roi, as

export type Value = NumericalValue | FaceValue;

export type Card = {
  rank: Value; 
  suit: Suit;
}

export type PlayerId = string

export type PlayerState = {
  hand: Card[]
  chips: number
  revealedInfo: QuestionResponse[] // à détailler
  hasSubmitted: boolean
  lowChips: boolean // si l'adversaire a moins de 5 jetons
}

export type GamePhase = "SETUP" | "BETTING" | "RESOLUTION" | "END"

export type GameAction = {
  type: "bet" | "question" | "truth"
  bet?: number
  question?: Question // à typer selon la catégorie
  guess?: Value[] // si type === "truth"
}

export interface GameObservation {
  phase: GamePhase
  turn: number
  hand: Card[]
  chips: number
  revealedInfo: QuestionResponse[]
  opponentChipsKnownLow: boolean
  canAct: boolean
}


export type Question =
  | { type: 'SUM'; variant: 'positions'; positions: [number, number, number] }
  | { type: 'SUM'; variant: 'color'; suit: Suit }
  | { type: 'SUM'; variant: 'figures' }
  | { type: 'SUM'; variant: 'numerical' }
  | { type: 'COUNT'; variant: 'figures' }
  | { type: 'COUNT'; variant: 'numerical' }
  | { type: 'COUNT'; variant: 'value'; rank: Value }
  | { type: 'POSITION'; variant: 'color'; suit: Suit }
  | { type: 'POSITION'; variant: 'value'; rank: Value }
  | { type: 'POSITION'; variant: 'consecutive' }
  | { type: 'POSITION'; variant: 'max' }
  | { type: 'POSITION'; variant: 'min' }

export type QuestionResponse =
  | { question: Question; value: number } // SUM and COUNT
  | { question: Question; positions: number[] } // POSITION
