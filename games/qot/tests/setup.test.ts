import { describe, it, expect, beforeEach } from 'vitest'
import { QuestionOrTruthGame } from '../engine/GameLogic'
import { STARTING_CHIPS } from '../config'
import {
  createValidCardSet,
  createInvalidCardSet,
  getHand,
  applySetup,
} from './helpers'
import { Card } from '../types'

const playerA = 'Alice'
const playerB = 'Bob'

describe('QuestionOrTruthGame setup', () => {
  let game: QuestionOrTruthGame

  beforeEach(() => {
    game = new QuestionOrTruthGame([playerA, playerB])
  })

  it('should initialize with two players', () => {
    expect(game['players']).toEqual([playerA, playerB])
    expect(game['phase']).toBe('SETUP')
    expect(Object.keys(game['playerStates'])).toHaveLength(2)
    expect(game['bets']).toEqual({})
  })

  it('should accept valid card setup and mark player as ready', () => {
    const cards = createValidCardSet()
    game.setPlayerCards(playerA, cards)

    expect(game['playerStates'][playerA].hand).toEqual(cards)
    expect(game['playerStates'][playerA].hasSubmitted).toBe(true)
    expect(game['phase']).toBe('SETUP') // second player hasn't submitted yet
  })

  it('should transition to BETTING phase once both players submit valid cards', () => {
    const cards = createValidCardSet()
    game.setPlayerCards(playerA, cards)
    game.setPlayerCards(playerB, cards)

    expect(game['phase']).toBe('BETTING')
    expect(game['currentTurn']).toBe(1)
  })

    it('should return failure if card order is invalid', () => {

    const result = game.setPlayerCards(playerA, createInvalidCardSet(3))

    expect(result).toEqual({
        success: false,
        reason: 'Invalid card order for suit: spades',
    })
    })


    it('should return failure if player tries to set cards outside SETUP phase', () => {
    const cards = createValidCardSet()
    game.setPlayerCards(playerA, cards)
    game.setPlayerCards(playerB, cards) // phase now becomes BETTING

    const result = game.setPlayerCards(playerA, cards)

    expect(result).toEqual({
        success: false,
        reason: 'Game already started.',
    })
    })

    it('should reset hasSubmitted flags after both players submit cards', () => {
    const cards = createValidCardSet()
    game.setPlayerCards(playerA, cards)
    game.setPlayerCards(playerB, cards) // triggers reset & phase change

    expect(game['playerStates'][playerA].hasSubmitted).toBe(false)
    expect(game['playerStates'][playerB].hasSubmitted).toBe(false)
    })

    it('should initialize player states with correct default values', () => {
    const state = game['playerStates'][playerA]
    expect(state.hand).toEqual([])
    expect(state.chips).toEqual(STARTING_CHIPS) 
    expect(state.revealedInfo).toEqual([])
    expect(state.hasSubmitted).toBe(false)
    })

    it('should allow player to resubmit cards during SETUP phase', () => {
    const cards1 = createValidCardSet()
    const cards2 = createValidCardSet(2)

    game.setPlayerCards(playerA, cards1)
    const result = game.setPlayerCards(playerA, cards2)

    expect(result).toEqual({ success: true })
    expect(game['playerStates'][playerA].hand).toEqual(cards2)
    })

    it('should return failure if unknown player tries to submit cards', () => {
    const cards = createValidCardSet()
    const result = game.setPlayerCards('intruder', cards as Card[])

    expect(result).toEqual({ success: false, reason: "Unknown player." })
    })

    it('should not change anything to setup again in betting phase', () => {
    const cards = createValidCardSet()
    const cards2 = createValidCardSet(2)
    const cards3 = createValidCardSet(3)

    game.setPlayerCards(playerA, cards)
    game.setPlayerCards(playerB, cards)
    expect(game['phase']).toBe('BETTING')
    expect(game['playerStates'][playerA].hasSubmitted).toBe(false)
    expect(game['playerStates'][playerB].hasSubmitted).toBe(false)
    expect(getHand(game, playerA)).toEqual(cards)
    expect(getHand(game, playerB)).toEqual(cards)
    
    applySetup(game, cards2, cards3)

    expect(game['phase']).toBe('BETTING')
    expect(game['playerStates'][playerA].hasSubmitted).toBe(false)
    expect(game['playerStates'][playerB].hasSubmitted).toBe(false)
    expect(getHand(game, playerA)).toEqual(cards)
    expect(getHand(game, playerB)).toEqual(cards)
    })

})
