import { describe, it, expect, beforeEach } from 'vitest'
import {
  buildGameWithSetup,
  applyBet,
  applyQuestion,
  getPrivate,
  getReceivedInfo,
  callAnswerQuestion,
  getPhase,
  getHand,
  createCard,
  setHand
} from './helpers'

const Alice = 'Alice'
const Bob = 'Bob'

//  [ // ALICE card set
//     createCard(1, 'clubs'),
//     createCard(5, 'hearts'),
//     createCard(7, 'hearts'),
//     createCard(2, 'spades'),
//     createCard(4, 'spades'),
//     createCard(2, 'diamonds'),
//     createCard(6, 'diamonds'),
//     createCard(13, 'clubs'),
//   ]

// [    BOB card set
//       createCard(2, 'spades'),
//       createCard(5, 'hearts'),
//       createCard(1, 'diamonds'),
//       createCard(1, 'clubs'),
//       createCard(12, 'hearts'),
//       createCard(4, 'spades'),
//       createCard(13, 'clubs'),
//       createCard(6, 'diamonds'),
//     ]
describe('questionAction - all variants', () => {
  let game: ReturnType<typeof buildGameWithSetup>

  beforeEach(() => {
    game = buildGameWithSetup()
    applyBet(game, Alice, 1)
    applyBet(game, Bob, 2) // Bob = bet winner
  })

  function expectValidQuestion(q: any) {
    const result = applyQuestion(game, Bob, q)

    expect(result.success).toBe(true)

    const revealed = getReceivedInfo(game, Bob)
    expect(revealed[revealed.length - 1].question).toEqual(q)
  }

  // SUM
  it('SUM.positions', () => {
    const q = { type: 'SUM', variant: 'positions', positions: [0, 2, 5] }
    expectValidQuestion(q)
    const qa1 = callAnswerQuestion(game, Alice, q)
    expect(qa1).toEqual({ question: q, value: 10 }) // 1 + 7 + 2
    const qa2 = callAnswerQuestion(game, Bob, q)
    expect(qa2).toEqual({ question: q, value: 7 }) // 2 + 1 + 4
  })

  it('SUM.color', () => {
    const q = { type: 'SUM', variant: 'color', suit: 'hearts' }
    expectValidQuestion(q)
    const qa1 = callAnswerQuestion(game, Alice, q)
    expect(qa1).toEqual({ question: q, value: 12 }) // 5 + 7
    const qa2 = callAnswerQuestion(game, Bob, q)
    expect(qa2).toEqual({ question: q, value: 17 }) // 5 + 12 
  })

  it('SUM.figures', () => {
    const q = { type: 'SUM', variant: 'figures' }
    expectValidQuestion(q)
    const qa1 = callAnswerQuestion(game, Alice, q)
    expect(qa1).toEqual({ question: q, value: 14 }) // 1 + 13
    const qa2 = callAnswerQuestion(game, Bob, q)
    expect(qa2).toEqual({ question: q, value: 27 }) // 1 + 1 + 12 + 13
  })

  it('SUM.numerical', () => {
    const q = { type: 'SUM', variant: 'numerical' }
    expectValidQuestion(q)
    const qa1 = callAnswerQuestion(game, Alice, q)
    expect(qa1).toEqual({ question: q, value: 26 }) // 5 + 7 + 2 + 4 + 2 + 6
    const qa2 = callAnswerQuestion(game, Bob, q)
    expect(qa2).toEqual({ question: q, value: 17 }) // 2 + 5 + 4 + 6
  })

  // COUNT
  it('COUNT.figures', () => {
    const q = { type: 'COUNT', variant: 'figures' }
    expectValidQuestion(q)
    const qa1 = callAnswerQuestion(game, Alice, q)
    expect(qa1).toEqual({ question: q, value: 2 }) // 1 + 13
    const qa2 = callAnswerQuestion(game, Bob, q)
    expect(qa2).toEqual({ question: q, value: 4 }) // 1 + 1 + 12 + 13
  })

  it('COUNT.numerical', () => {
    const q = { type: 'COUNT', variant: 'numerical' }
    expectValidQuestion(q)
    const qa1 = callAnswerQuestion(game, Alice, q)
    expect(qa1).toEqual({ question: q, value: 6 }) // 5 + 7 + 2 + 4 + 2 + 6
    const qa2 = callAnswerQuestion(game, Bob, q)
    expect(qa2).toEqual({ question: q, value: 4 }) // 2 + 5 + 4 + 6
  })

  it('COUNT.value', () => {
    const q = { type: 'COUNT', variant: 'value', rank: 7 }
    expectValidQuestion(q)
    const qa1 = callAnswerQuestion(game, Alice, q)
    expect(qa1).toEqual({ question: q, value: 1 }) // 5 + 7 + 2 + 4 + 2 + 6
    const qa2 = callAnswerQuestion(game, Bob, q)
    expect(qa2).toEqual({ question: q, value: 0 }) // 2 + 5 + 4 + 6
  })

  // POSITION
  it('POSITION.color', () => {
    const q = { type: 'POSITION', variant: 'color', suit: 'clubs' }
    expectValidQuestion(q)
    const qa1 = callAnswerQuestion(game, Alice, q)
    expect(qa1).toEqual({ question: q, positions: [0, 7] }) 
    const qa2 = callAnswerQuestion(game, Bob, q)
    expect(qa2).toEqual({ question: q, positions: [3, 6] }) 
  })

  it('POSITION.value', () => {
    const q = { type: 'POSITION', variant: 'value', rank: 1 }
    expectValidQuestion(q) // As
    const qa1 = callAnswerQuestion(game, Alice, q)
    expect(qa1).toEqual({ question: q, positions: [0] }) 
    const qa2 = callAnswerQuestion(game, Bob, q)
    expect(qa2).toEqual({ question: q, positions: [2, 3] }) 
  })

  it('POSITION.consecutive', () => {
    const q = { type: 'POSITION', variant: 'consecutive' }
    const cardSet1 = [ // ALICE card set
    createCard(1, 'clubs'),
    createCard(5, 'hearts'),
    createCard(6, 'hearts'),
    createCard(2, 'spades'),
    createCard(4, 'spades'),
    createCard(5, 'diamonds'),
    createCard(12, 'diamonds'),
    createCard(13, 'clubs'),
  ]

  const cardSet2 = [ // ALICE card set
    createCard(1, 'clubs'),
    createCard(2, 'hearts'),
    createCard(3, 'hearts'),
    createCard(4, 'spades'),
    createCard(5, 'spades'),
    createCard(6, 'diamonds'),
    createCard(7, 'diamonds'),
    createCard(8, 'clubs'),
  ]
    expectValidQuestion(q)
    setHand(game, Alice, cardSet1)

    const qa1 = callAnswerQuestion(game, Alice, q)
    expect(qa1).toEqual({ question: q, positions: [2, 5, 7] }) 
    const qa2 = callAnswerQuestion(game, Bob, q)
    expect(qa2).toEqual({ question: q, positions: [] }) 

    setHand(game, Alice, cardSet2)
    const qa3 = callAnswerQuestion(game, Alice, q)
    expect(qa3).toEqual({ question: q, positions: [1, 2, 3, 4, 5, 6, 7] }) 
  })

  it('POSITION.max', () => {
    const q = { type: 'POSITION', variant: 'max' }
    expectValidQuestion(q)
    const qa1 = callAnswerQuestion(game, Alice, q)
    expect(qa1).toEqual({ question: q, positions: [7] }) 
    const qa2 = callAnswerQuestion(game, Bob, q)
    expect(qa2).toEqual({ question: q, positions: [6] }) 
  })

  it('POSITION.min', () => {
    const q = { type: 'POSITION', variant: 'min' }
    expectValidQuestion(q)
    const qa1 = callAnswerQuestion(game, Alice, q)
    expect(qa1).toEqual({ question: q, positions: [0] }) 
    const qa2 = callAnswerQuestion(game, Bob, q)
    expect(qa2).toEqual({ question: q, positions: [2, 3] }) 
  })
})
