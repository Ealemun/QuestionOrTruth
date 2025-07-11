import { describe, it, expect, beforeEach } from 'vitest'
import { QuestionOrTruthGame } from '../engine/GameLogic'
import { GameAction } from '../types'

function buildGame(): QuestionOrTruthGame {
  const game = new QuestionOrTruthGame(['A', 'B'])

  // Simuler la fin de la phase de setup
  const dummyCards = Array(8).fill(0).map((_, i) => ({
    rank: (i % 13 + 1) as any,
    suit: ['spades', 'hearts', 'diamonds', 'clubs'][i % 4] as any,
  }))

  game.setPlayerCards('A', dummyCards)
  game.setPlayerCards('B', dummyCards)

  return game
}

describe('betting phase', () => {
  let game: QuestionOrTruthGame

  beforeEach(() => {
    game = buildGame()
  })

  it('should accept valid bets during betting phase', () => {
    const actionA: GameAction = { type: 'bet', bet: 4 }
    const actionB: GameAction = { type: 'bet', bet: 6 }

    game.applyAction('A', actionA)
    game.applyAction('B', actionB)

    const bets = (game as any).bets
    expect(bets['A']).toBe(4)
    expect(bets['B']).toBe(6)
  })

  it('should throw on invalid bets (negative or too high)', () => {
    expect(() =>
      game.applyAction('A', { type: 'bet', bet: -1 }),
    ).toThrowError()

    expect(() =>
      game.applyAction('A', { type: 'bet', bet: 11 }), // > 10
    ).toThrowError()
  })

  it('should resolve betting phase correctly: winner is higher bidder', () => {
    game.applyAction('A', { type: 'bet', bet: 3 })
    game.applyAction('B', { type: 'bet', bet: 6 })

    const result = (game as any).resolveBettingPhase()
    expect(result).toEqual({ winner: 'B', actionAllowed: true })

    const gameState = (game as any)
    expect(gameState.playerStates['A'].tokens).toBe(9) // -3 +2
    expect(gameState.playerStates['B'].tokens).toBe(6) // -6 +2
  })

  it('should resolve tie with no winner', () => {
    game.applyAction('A', { type: 'bet', bet: 5 })
    game.applyAction('B', { type: 'bet', bet: 5 })

    const result = (game as any).resolveBettingPhase()
    expect(result).toEqual({ winner: null, actionAllowed: false })

    const gameState = (game as any)
    expect(gameState.playerStates['A'].tokens).toBe(7) // -5 +2
    expect(gameState.playerStates['B'].tokens).toBe(7)
  })

  it('should not allow multiple bets per player', () => {
    game.applyAction('A', { type: 'bet', bet: 4 })
    expect(() =>
      game.applyAction('A', { type: 'bet', bet: 2 }),
    ).toThrowError()
  })
})
