import { describe, it, expect } from 'vitest'
import { QuestionOrTruthGame } from '../engine/GameLogic'
import { Card } from '../types'
import {
  createCard
} from './helpers'


function buildGame(): QuestionOrTruthGame {
  return new QuestionOrTruthGame(['A', 'B'])
}

describe('validateCardOrder', () => {

    it('returns true for valid order', () => {
        const game = buildGame()
    
        const cards: Card[] = [
        createCard(2, 'spades'),
        createCard(5, 'hearts'),
        createCard(2, 'diamonds'),
        createCard(1, 'clubs'),
        createCard(7, 'hearts'),
        createCard(4, 'spades'),
        createCard(13, 'clubs'),
        createCard(6, 'diamonds'),
        ]
    
        const [isValid, suit] = (game as any).validateCardOrder(cards)
        expect(isValid).toBe(true)
        expect(suit).toBe(null)
    })

  it('returns false for invalid order', () => {
    const game = buildGame()

    const cards: Card[] = [
      createCard(2, 'spades'),
      createCard(5, 'hearts'),
      createCard(6, 'diamonds'),
      createCard(1, 'clubs'),
      createCard(7, 'hearts'),
      createCard(4, 'spades'),
      createCard(13, 'clubs'),
      createCard(2, 'diamonds'), // diamonds: 6 → 2 wrong
    ]

    const [isValid, suit] = (game as any).validateCardOrder(cards)
    expect(isValid).toBe(false)
    expect(suit).toBe("diamonds")
  })

  it('returns false for invalid order in one suit', () => {
    const game = buildGame()

    const cards: Card[] = [
      createCard(2, 'spades'),
      createCard(5, 'hearts'),
      createCard(6, 'diamonds'),
      createCard(1, 'clubs'),
      createCard(3, 'hearts'),
      createCard(4, 'spades'), // spades: 2 then 4 is OK
      createCard(13, 'clubs'),
      createCard(2, 'hearts'), // hearts: 5 → 3 → 2 is invalid
    ]

    const [isValid, suit] = (game as any).validateCardOrder(cards)
    expect(isValid).toBe(false)
    expect(suit).toBe('hearts')
  })

  it('returns false if there are not exactly 8 cards', () => {
    const game = buildGame()

    const cards: Card[] = [
      createCard(2, 'spades'),
      createCard(5, 'hearts'),
      createCard(6, 'diamonds'),
      createCard(1, 'clubs'),
      createCard(3, 'hearts'),
      createCard(4, 'spades'),
    ]

    const [isValid, suit] = (game as any).validateCardOrder(cards)
    expect(isValid).toBe(false)
    expect(suit).toBe(null)
  })

  it('returns false if one suit is not sorted even if others are', () => {
    const game = buildGame()

    const cards: Card[] = [
      createCard(2, 'clubs'),
      createCard(13, 'clubs'),
      createCard(4, 'clubs'), // clubs: 2 → 13 → 4 is invalid
      createCard(1, 'hearts'),
      createCard(2, 'hearts'),
      createCard(3, 'hearts'),
      createCard(2, 'spades'),
      createCard(4, 'spades'),
    ]

    const [isValid, suit] = (game as any).validateCardOrder(cards)
    expect(isValid).toBe(false)
    expect(suit).toBe('clubs')
  })

  it('returns false if duplicate ranks exist in same suit', () => {
  const game = buildGame()

  const cards: Card[] = [
    createCard(2, 'spades'),
    createCard(5, 'hearts'),
    createCard(2, 'spades'), // duplicate rank in spades
    createCard(1, 'clubs'),
    createCard(7, 'hearts'),
    createCard(4, 'spades'),
    createCard(13, 'clubs'),
    createCard(6, 'diamonds'),
  ]

  const [isValid, suit] = (game as any).validateCardOrder(cards)
  expect(isValid).toBe(false)
  expect(suit).toBe(null) // car condition === => null
})

    it('returns true with one card per suit (no order to break)', () => {
    const game = buildGame()

    const cards: Card[] = [
        createCard(1, 'clubs'),
        createCard(2, 'spades'),
        createCard(3, 'hearts'),
        createCard(4, 'diamonds'),
        createCard(5, 'clubs'),
        createCard(6, 'spades'),
        createCard(7, 'hearts'),
        createCard(8, 'diamonds'),
    ]

    const [isValid, suit] = (game as any).validateCardOrder(cards)
    expect(isValid).toBe(true)
    expect(suit).toBe(null)
    })

    it('returns true when all cards are in the same suit and sorted', () => {
    const game = buildGame()

    const cards: Card[] = [
        createCard(1, 'clubs'),
        createCard(2, 'clubs'),
        createCard(3, 'clubs'),
        createCard(4, 'clubs'),
        createCard(5, 'clubs'),
        createCard(6, 'clubs'),
        createCard(7, 'clubs'),
        createCard(8, 'clubs'),
    ]

    const [isValid, suit] = (game as any).validateCardOrder(cards)
    expect(isValid).toBe(true)
    expect(suit).toBe(null)
    })

    it('returns first suit with invalid order if multiple are invalid', () => {
    const game = buildGame()

    const cards: Card[] = [
        createCard(3, 'spades'),
        createCard(2, 'spades'), // wrong
        createCard(7, 'hearts'),
        createCard(5, 'hearts'), // wrong
        createCard(4, 'diamonds'),
        createCard(6, 'diamonds'),
        createCard(1, 'clubs'),
        createCard(13, 'clubs'),
    ]

    const [isValid, suit] = (game as any).validateCardOrder(cards)
    expect(isValid).toBe(false)
    expect(suit).toBe('spades') // doit retourner le premier suit invalide
    })

})
