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
  receivedInfo: QuestionResponse[] // à détailler
  hasSubmitted: boolean
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
  receivedInfo: QuestionResponse[]
  givenInfo: QuestionResponse[]
  opponentChipsKnownLow: boolean
  canAct: boolean
}


export type Question =
  | { type: 'SUM'; variant: 'positions'; positions: [number, number, number] } // 56 poss 8!/(3!5!)
  | { type: 'SUM'; variant: 'color'; suit: Suit } // 4 poss
  | { type: 'SUM'; variant: 'figures' } // 1
  | { type: 'SUM'; variant: 'numerical' } // 1 
  | { type: 'COUNT'; variant: 'figures' } // 1
  | { type: 'COUNT'; variant: 'numerical' } // 1
  | { type: 'COUNT'; variant: 'value'; rank: Value } // 13
  | { type: 'POSITION'; variant: 'color'; suit: Suit } // 4
  | { type: 'POSITION'; variant: 'value'; rank: Value } // 13
  | { type: 'POSITION'; variant: 'consecutive' } // 1 
  | { type: 'POSITION'; variant: 'max' } // 1
  | { type: 'POSITION'; variant: 'min' } // 1

export type QuestionResponse =
  | { question: Question; value: number } // SUM and COUNT
  | { question: Question; positions: number[] } // POSITION
