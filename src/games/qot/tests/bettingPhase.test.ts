import { describe, it, expect, beforeEach } from 'vitest'
import {
  buildTestGame,
  applyBet,
  getChips,
  getPhase,
  getTurn
} from './helpers'
import { getBetWinner } from '../engine/GameLogic'

const Alice = 'Alice'
const Bob = 'Bob'

describe('betting phase', () => {
  let game: ReturnType<typeof buildTestGame>

  beforeEach(() => {
    game = buildTestGame()
  })

  it('should accept valid bets during betting phase', () => {
    const resA = applyBet(game, Alice, 4)
    expect(resA).toEqual({ success: true })

    const resB = applyBet(game, Bob, 6)
    expect(resB).toEqual({ success: true })

    expect(getBetWinner(game)).toBe('Bob')
  })

  it('should return failure on invalid bets (negative or too high)', () => {
    const resNeg = applyBet(game, Alice, -1)
    expect(resNeg).toEqual({ success: false, reason: 'Invalid bet amount.' })

    const resOver = applyBet(game, Bob, 11)
    expect(resOver).toEqual({ success: false, reason: 'Invalid bet amount.' })
  })

  it('should resolve betting phase correctly: winner is higher bidder', () => {
    applyBet(game, Alice, 3)
    applyBet(game, Bob, 6)

    expect(getBetWinner(game)).toBe('Bob')
    expect(getChips(game, Alice)).toBe(7) // 10 - 3 + 0
    expect(getChips(game, Bob)).toBe(4)   // 10 - 6 + 0
    expect(getPhase(game)).toBe('RESOLUTION')
    expect(getTurn(game)).toBe(1)
  })

  it('should resolve tie with no winner and carry over pot', () => {
    applyBet(game, Alice, 5)
    applyBet(game, Bob, 5)

    expect(getBetWinner(game)).toBe(null)
    expect(getChips(game, Alice)).toBe(7)
    expect(getChips(game, Bob)).toBe(7)
    expect(getPhase(game)).toBe('BETTING')
    expect(getTurn(game)).toBe(2)
  })

  it('should allow multiple bets per player with last one counting', () => {
    applyBet(game, Alice, 8)
    applyBet(game, Alice, 2) // last bet counts
    applyBet(game, Bob, 6)

    expect(getBetWinner(game)).toBe('Bob')
    expect(getChips(game, Alice)).toBe(8) // 10 - 2
    expect(getChips(game, Bob)).toBe(4)   // 10 - 6
    expect(getPhase(game)).toBe('RESOLUTION')
    expect(getTurn(game)).toBe(1)
  })

  it('should allow bet of 0 to skip betting', () => {
    applyBet(game, Alice, 0)
    applyBet(game, Bob, 5)

    expect(getBetWinner(game)).toBe('Bob')
    expect(getChips(game, Alice)).toBe(10) // no bet
    expect(getChips(game, Bob)).toBe(5)   // 10 - 5
    expect(getPhase(game)).toBe('RESOLUTION')
    expect(getTurn(game)).toBe(1)
  })
})
