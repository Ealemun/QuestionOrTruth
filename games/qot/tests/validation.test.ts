import { describe, it, expect } from 'vitest'
import { QuestionOrTruthGame } from '../engine/GameLogic'
import { Card } from '../types'

function c(rank: number, suit: string): Card {
  return { rank: rank as any, suit: suit as any }
}

function buildGame(): QuestionOrTruthGame {
  return new QuestionOrTruthGame(['A', 'B'])
}

describe('validateCardOrder', () => {

    it('returns true for valid order', () => {
        const game = buildGame()
    
        const cards: Card[] = [
        c(2, 'spades'),
        c(5, 'hearts'),
        c(2, 'diamonds'),
        c(1, 'clubs'),
        c(7, 'hearts'),
        c(4, 'spades'),
        c(13, 'clubs'),
        c(6, 'diamonds'),
        ]
    
        const [isValid, suit] = (game as any).validateCardOrder(cards)
        expect(isValid).toBe(true)
        expect(suit).toBe(null)
    })

  it('returns false for invalid order', () => {
    const game = buildGame()

    const cards: Card[] = [
      c(2, 'spades'),
      c(5, 'hearts'),
      c(6, 'diamonds'),
      c(1, 'clubs'),
      c(7, 'hearts'),
      c(4, 'spades'),
      c(13, 'clubs'),
      c(2, 'diamonds'), // diamonds: 6 → 2 wrong
    ]

    const [isValid, suit] = (game as any).validateCardOrder(cards)
    expect(isValid).toBe(false)
    expect(suit).toBe("diamonds")
  })

  it('returns false for invalid order in one suit', () => {
    const game = buildGame()

    const cards: Card[] = [
      c(2, 'spades'),
      c(5, 'hearts'),
      c(6, 'diamonds'),
      c(1, 'clubs'),
      c(3, 'hearts'),
      c(4, 'spades'), // spades: 2 then 4 is OK
      c(13, 'clubs'),
      c(2, 'hearts'), // hearts: 5 → 3 → 2 is invalid
    ]

    const [isValid, suit] = (game as any).validateCardOrder(cards)
    expect(isValid).toBe(false)
    expect(suit).toBe('hearts')
  })

  it('returns false if there are not exactly 8 cards', () => {
    const game = buildGame()

    const cards: Card[] = [
      c(2, 'spades'),
      c(5, 'hearts'),
      c(6, 'diamonds'),
      c(1, 'clubs'),
      c(3, 'hearts'),
      c(4, 'spades'),
    ]

    const [isValid, suit] = (game as any).validateCardOrder(cards)
    expect(isValid).toBe(false)
    expect(suit).toBe(null)
  })

  it('returns false if one suit is not sorted even if others are', () => {
    const game = buildGame()

    const cards: Card[] = [
      c(2, 'clubs'),
      c(13, 'clubs'),
      c(4, 'clubs'), // clubs: 2 → 13 → 4 is invalid
      c(1, 'hearts'),
      c(2, 'hearts'),
      c(3, 'hearts'),
      c(2, 'spades'),
      c(4, 'spades'),
    ]

    const [isValid, suit] = (game as any).validateCardOrder(cards)
    expect(isValid).toBe(false)
    expect(suit).toBe('clubs')
  })

  it('returns false if duplicate ranks exist in same suit', () => {
  const game = buildGame()

  const cards: Card[] = [
    c(2, 'spades'),
    c(5, 'hearts'),
    c(2, 'spades'), // duplicate rank in spades
    c(1, 'clubs'),
    c(7, 'hearts'),
    c(4, 'spades'),
    c(13, 'clubs'),
    c(6, 'diamonds'),
  ]

  const [isValid, suit] = (game as any).validateCardOrder(cards)
  expect(isValid).toBe(false)
  expect(suit).toBe(null) // car condition === => null
})

    it('returns true with one card per suit (no order to break)', () => {
    const game = buildGame()

    const cards: Card[] = [
        c(1, 'clubs'),
        c(2, 'spades'),
        c(3, 'hearts'),
        c(4, 'diamonds'),
        c(5, 'clubs'),
        c(6, 'spades'),
        c(7, 'hearts'),
        c(8, 'diamonds'),
    ]

    const [isValid, suit] = (game as any).validateCardOrder(cards)
    expect(isValid).toBe(true)
    expect(suit).toBe(null)
    })

    it('returns true when all cards are in the same suit and sorted', () => {
    const game = buildGame()

    const cards: Card[] = [
        c(1, 'clubs'),
        c(2, 'clubs'),
        c(3, 'clubs'),
        c(4, 'clubs'),
        c(5, 'clubs'),
        c(6, 'clubs'),
        c(7, 'clubs'),
        c(8, 'clubs'),
    ]

    const [isValid, suit] = (game as any).validateCardOrder(cards)
    expect(isValid).toBe(true)
    expect(suit).toBe(null)
    })

    it('returns first suit with invalid order if multiple are invalid', () => {
    const game = buildGame()

    const cards: Card[] = [
        c(3, 'spades'),
        c(2, 'spades'), // wrong
        c(7, 'hearts'),
        c(5, 'hearts'), // wrong
        c(4, 'diamonds'),
        c(6, 'diamonds'),
        c(1, 'clubs'),
        c(13, 'clubs'),
    ]

    const [isValid, suit] = (game as any).validateCardOrder(cards)
    expect(isValid).toBe(false)
    expect(suit).toBe('spades') // doit retourner le premier suit invalide
    })

})
