import { Card, Value, Suit, PlayerId, GameAction } from '../types'
import { QuestionOrTruthGame } from '../engine/GameLogic'

// -------------------------------------
// Types
// -------------------------------------

export type TestPlayerId = 'Alice' | 'Bob'

// -------------------------------------
// Card Helpers
// -------------------------------------

export function createCard(rank: Value, suit: Suit): Card {
  return { rank, suit }
}

export function createValidCardSet(set = 1): Card[] {
  if (set === 2) {
    return [
      createCard(2, 'spades'),
      createCard(5, 'hearts'),
      createCard(2, 'diamonds'),
      createCard(1, 'clubs'),
      createCard(7, 'hearts'),
      createCard(4, 'spades'),
      createCard(13, 'clubs'),
      createCard(6, 'diamonds'),
    ]
  }

  return [
    createCard(1, 'clubs'),
    createCard(5, 'hearts'),
    createCard(7, 'hearts'),
    createCard(2, 'spades'),
    createCard(4, 'spades'),
    createCard(2, 'diamonds'),
    createCard(6, 'diamonds'),
    createCard(13, 'clubs'),
  ]
}

export function createInvalidCardSet(set = 1): Card[] {
  if (set === 2) {
    return [
      createCard(2, 'spades'),
      createCard(5, 'hearts'),
      createCard(2, 'diamonds'),
      createCard(1, 'clubs'),
      createCard(3, 'hearts'),
      createCard(4, 'spades'),
      createCard(13, 'clubs'),
      createCard(6, 'diamonds'),
    ]
  } else if (set === 3) {
    [
        createCard(10, 'clubs'),
        createCard(5, 'hearts'),
        createCard(7, 'hearts'),
        createCard(4, 'spades'),
        createCard(2, 'spades'), // invalid order: 4 before 2
        createCard(2, 'diamonds'),
        createCard(6, 'diamonds'),
        createCard(1, 'clubs'),
    ]
    }

  return [
    createCard(1, 'clubs'),
    createCard(5, 'hearts'),
    createCard(7, 'hearts'),
    createCard(7, 'spades'),
    createCard(4, 'spades'),
    createCard(2, 'diamonds'),
    createCard(6, 'diamonds'),
    createCard(13, 'clubs'),
  ]
}

// -------------------------------------
// Game Setup Helpers
// -------------------------------------

export function buildTestGame(): QuestionOrTruthGame {
  const game = new QuestionOrTruthGame(['Alice', 'Bob'])

  const cards = createValidCardSet()
  game.setPlayerCards('Alice', cards)
  game.setPlayerCards('Bob', cards)

  return game
}

export function buildGameInSetup(): QuestionOrTruthGame {
  return new QuestionOrTruthGame(['Alice', 'Bob'])
}

export function buildGameWithSetup(): QuestionOrTruthGame {
  const game = buildGameInSetup()
  const cardsA = createValidCardSet()
  const cardsB = createValidCardSet(2)

  game.setPlayerCards("Alice", cardsA)
  game.setPlayerCards("Bob", cardsB)

  return game
}

export function getPrivate<T = any>(obj: any, key: string): T {
  return obj[key] as T
}

export function setPrivate<T = any>(obj: any, key: string, value: T): void {
  obj[key] = value
}

export function applySetup(game: QuestionOrTruthGame, cardsA = exampleHand, cardsB = exampleHand): void {
  game.setPlayerCards('Alice', cardsA)
  game.setPlayerCards('Bob', cardsB)
}


export function applyBet(game: QuestionOrTruthGame, pid: PlayerId, amount: number): ReturnType<typeof game.applyAction> {
  const action: GameAction = { type: 'bet', bet: amount }
  return game.applyAction(pid, action)
}

export function applyTruth(game: QuestionOrTruthGame, pid: PlayerId, guess: Value[]): ReturnType<typeof game.applyAction> {
  const action: GameAction = { type: 'truth', guess }
  return game.applyAction(pid, action)
}

export function applyQuestion(game: QuestionOrTruthGame, pid: PlayerId, question: any): ReturnType<typeof game.applyAction> {
  const action: GameAction = { type: 'question', question }
  return game.applyAction(pid, action)
}

export function getChips(game: QuestionOrTruthGame, pid: PlayerId): number {
  return getPrivate(game, 'playerStates')[pid].chips
}

export function getHand(game: QuestionOrTruthGame, pid: PlayerId): Card[] {
  return getPrivate(game, 'playerStates')[pid].hand
}

export function getPhase(game: QuestionOrTruthGame): string {
  return getPrivate(game, 'phase')
}

export function getTurn(game: QuestionOrTruthGame): number {
  return getPrivate(game, 'currentTurn')
}

export function callResolvePlayerAction(game: QuestionOrTruthGame, pid: PlayerId, action: GameAction) {
  return (game as any).resolvePlayerAction(pid, action)
}

export function callTurnPhase(game: QuestionOrTruthGame) {
  return (game as any).turnPhase()
}



// -------------------------------------
// Example Hands & Guesses
// -------------------------------------

export const exampleHand: Card[] = [
  { suit: "hearts", rank: 3 },
  { suit: "spades", rank: 11 },
  { suit: "clubs", rank: 6 },
  { suit: "diamonds", rank: 2 },
  { suit: "hearts", rank: 10 },
  { suit: "spades", rank: 1 },
  { suit: "clubs", rank: 12 },
  { suit: "diamonds", rank: 4 }
]

export const exampleWrongHand: Card[] = [
  { suit: "hearts", rank: 3 },
  { suit: "spades", rank: 11 },
  { suit: "clubs", rank: 6 }
]

export const correctGuess1: Value[] = [1, 5, 7, 2, 4, 2, 6, 13] // correct order of createValidCardSet(1)
export const correctGuess2: Value[] = [2, 5, 2, 1, 7, 4, 13, 6] // correct order of createValidCardSet(2)
export const correctGuess: Value[] = [3, 11, 6, 2, 10, 1, 12, 4] // correct order of exampleHand
export const incorrectGuess1: Value[] = [4, 11, 6] // too short
export const incorrectGuess2: Value[] = [3, 11, 6, 2, 10, 3, 1, 12] // wrong values/order
export const incorrectGuess3: Value[] = [3, 11, 6, 2, 10, 1, 12, 4, 5] // too long