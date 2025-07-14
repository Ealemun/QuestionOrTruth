import { describe, it, expect, beforeEach } from 'vitest'
import {
  buildGameWithSetup,
  applyBet,
  applyQuestion,
  applyTruth
} from './helpers'

const Alice = 'Alice'
const Bob = 'Bob'

describe('observation - per player game view', () => {
  let game: ReturnType<typeof buildGameWithSetup>

  beforeEach(() => {
    game = buildGameWithSetup()
  })

  it('returns correct initial observation for both players', () => {
    const obsA = game.getObservationForPlayer(Alice)
    const obsB = game.getObservationForPlayer(Bob)

    expect(obsA.phase).toBe('BETTING')
    expect(obsA.turn).toBe(1)
    expect(obsA.hand.length).toBeGreaterThan(0)
    expect(obsA.chips).toBeGreaterThan(0)
    expect(obsA.receivedInfo).toEqual([])
    expect(obsA.givenInfo).toEqual([])
    expect(typeof obsA.opponentChipsKnownLow).toBe('boolean')
    expect(obsA.canAct).toBe(true)

    // Symmetry check
    expect(obsB.phase).toBe(obsA.phase)
    expect(obsB.turn).toBe(obsA.turn)
  })

  it('shows correct chips and "canAct" depending on phase and turn', () => {
    applyBet(game, Alice, 2)
    applyBet(game, Bob, 3)

    const obsA = game.getObservationForPlayer(Alice)
    const obsB = game.getObservationForPlayer(Bob)

    expect(obsA.phase).toBe('RESOLUTION')
    expect(obsB.phase).toBe('RESOLUTION')

    // Only Bob (highest bet) should be able to act
    expect(obsA.canAct).toBe(false)
    expect(obsB.canAct).toBe(true)
  })

  it('tracks receivedInfo and givenInfo correctly after question', () => {
    applyBet(game, Alice, 1)
    applyBet(game, Bob, 3)

    applyQuestion(game, Bob, { type: 'COUNT', variant: 'figures' })

    const obsBob = game.getObservationForPlayer(Bob)
    const obsAlice = game.getObservationForPlayer(Alice)

    // Bob should have received info (his question answered)
    expect(obsBob.receivedInfo).toHaveLength(1)

    // Alice gave the info → it appears in her givenInfo
    expect(obsAlice.givenInfo).toHaveLength(1)

    // Info must match between both views
    expect(obsBob.receivedInfo[0]).toEqual(obsAlice.givenInfo[0])

    expect(obsBob.receivedInfo[0]).toMatchObject({
    question: { type: 'COUNT', variant: 'figures' },
    value: 2
  })

  })

  it('reflects opponentChipsKnownLow correctly', () => {
    // Drain Bob's chips
    for (let i = 0; i < 5; i++) {
      applyBet(game, Alice, 1)
      applyBet(game, Bob, 3)
      applyQuestion(game, Bob, { type: 'COUNT', variant: 'figures' })
    }

    const obsAlice = game.getObservationForPlayer(Alice)
    expect(obsAlice.opponentChipsKnownLow).toBe(true)
  })

  it('freezes state correctly on END phase', () => {
    // Intentionally force END phase by correct truth
    applyBet(game, Alice, 1)
    applyBet(game, Bob, 3)

    const oppHand = game.getObservationForPlayer(Alice).hand.map(c => c.rank)
    applyTruth(game, Bob, oppHand)

    const obsAlice = game.getObservationForPlayer(Alice)
    const obsBob = game.getObservationForPlayer(Bob)

    expect(obsAlice.phase).toBe('END')
    expect(obsBob.phase).toBe('END')

    expect(obsAlice.canAct).toBe(false)
    expect(obsBob.canAct).toBe(false)
  })

  it("doesn't reveal opponent's hand or givenInfo", () => {
  applyBet(game, Alice, 1)
  applyBet(game, Bob, 3)
  applyQuestion(game, Bob, { type: 'COUNT', variant: 'figures' })

  const obsBob = game.getObservationForPlayer(Bob)

  expect(obsBob.hand).not.toEqual(game.getObservationForPlayer(Alice).hand)
  expect(obsBob.givenInfo).toEqual([]) // Bob n'a rien donné
  })

  it('prevents action when it is not the player\'s turn', () => {
  applyBet(game, Alice, 1)
  applyBet(game, Bob, 3)

  const obsAlice = game.getObservationForPlayer(Alice)
  expect(obsAlice.canAct).toBe(false)
  })

  it('returns a copy of game state, not a reference', () => {
  const obsA = game.getObservationForPlayer(Alice)
  obsA.chips = 999 // Should not affect real game

  const newObsA = game.getObservationForPlayer(Alice)
  expect(newObsA.chips).not.toBe(999)
  })
})
