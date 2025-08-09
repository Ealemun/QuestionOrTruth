import { describe, it, expect, beforeEach } from 'vitest'
import {
  buildGameWithSetup,
  getPhase,
  getPrivate,
  applyBet,
  applyQuestion,
  applyTruth,
  getHand,
  getTurn
} from './helpers'
import { getBetWinner, getWinner, isGameOver } from '../engine/GameLogic'

const Alice = 'Alice'
const Bob = 'Bob'

describe('internal - game integrity & phase logic', () => {
  let game: ReturnType<typeof buildGameWithSetup>

  beforeEach(() => {
    game = buildGameWithSetup()
  })

  it('starts in BETTING phase after setup', () => {
    expect(getPhase(game)).toBe('BETTING')
  })

  it('sets correct bet winner and transitions to RESOLUTION', () => {
    applyBet(game, Alice, 1)
    applyBet(game, Bob, 3)

    expect(getPhase(game)).toBe('RESOLUTION')
    expect(getBetWinner(game)).toBe(Bob)
  })

  it('allows a question then moves to next turn (back to BETTING)', () => {
    applyBet(game, Alice, 1)
    applyBet(game, Bob, 3)

    const result = applyQuestion(game, Bob, { type: 'COUNT', variant: 'figures' })
    expect(!isGameOver(game)).toBe(true)
    expect(result.success).toBe(true)

    expect(getPhase(game)).toBe('BETTING') // tour suivant
    expect(getTurn(game)).toBe(2)
  })

  it('ends the game on correct truth', () => {
    applyBet(game, Alice, 2)
    applyBet(game, Bob, 3)

    const opponentHand = getHand(game, Alice)
    const guess = opponentHand.map(c => c.rank)

    const result = applyTruth(game, Bob, guess)
    expect(result.success).toBe(true)
    expect(getPhase(game)).toBe('END')
    expect(getWinner(game)).toBe(Bob)
  })

  it('continues if truth is incorrect', () => {
    applyBet(game, Alice, 2)
    applyBet(game, Bob, 3)

    const wrongGuess = Array(8).fill(13) // intentionally wrong
    const result = applyTruth(game, Bob, wrongGuess)

    expect(result.success).toBe(true)
    expect(getPhase(game)).toBe('BETTING')
    expect(getTurn(game)).toBe(2)
  })

  it('hands remain intact across turns', () => {
    const before = structuredClone(getHand(game, Alice))

    applyBet(game, Alice, 2)
    applyBet(game, Bob, 3)
    applyQuestion(game, Bob, { type: 'COUNT', variant: 'figures' })

    const after = getHand(game, Alice)
    expect(after).toEqual(before)
  })

  it('maintains isolated receivedInfo per player', () => {
    applyBet(game, Alice, 1)
    applyBet(game, Bob, 3)
    applyQuestion(game, Bob, { type: 'COUNT', variant: 'figures' })

    const aliceInfo = getPrivate(game, 'playerStates')[Alice].receivedInfo
    const bobInfo = getPrivate(game, 'playerStates')[Bob].receivedInfo

    expect(aliceInfo).toHaveLength(0)
    expect(bobInfo).toHaveLength(1)
  })
})
