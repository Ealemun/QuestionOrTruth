import { describe, it, expect, beforeEach } from 'vitest'
import {
  buildGameInSetup,
  applySetup,
  applyBet,
  applyTruth,
  getPhase,
  getChips,
  correctGuess1,
  incorrectGuess1,
  incorrectGuess2,
  exampleHand,
  buildGameWithSetup,
  callResolvePlayerAction,
  getPrivate,
  callTurnPhase,
  createValidCardSet
} from './helpers'
import { GameAction, QuestionResponse } from '../types'
import { getWinner, isGameOver } from '../engine/GameLogic'

const Alice = 'Alice'
const Bob = 'Bob'

describe("resolvePlayerAction", () => {
  let game: ReturnType<typeof buildGameInSetup>

  beforeEach(() => {
    game = buildGameInSetup()
  })

  it("resolvePlayerAction should store revealed info for question", () => {
    applySetup(game, createValidCardSet(), createValidCardSet(2))
    applyBet(game, 'Alice', 1)
    applyBet(game, 'Bob', 3)

    const question: GameAction = {
        type: 'question',
        question: { type: 'COUNT', variant: 'figures' }
    }

    const result = callResolvePlayerAction(game, 'Bob', question)

    expect(result.success).toBe(true)
    expect((result.answer as QuestionResponse).question.type).toBe("COUNT")
    expect((result.answer as QuestionResponse).question.variant).toBe("figures")
    const resultWithValue = result.answer as { value: number };
    expect(resultWithValue.value).toBe(2)
    const revealed = getPrivate(game, 'playerStates')['Bob'].receivedInfo
    expect(revealed.length).toBe(1)
    expect(revealed[0].question.type).toBe("COUNT")
    expect(revealed[0].question.variant).toBe("figures")
    expect(revealed[0].value).toBe(2)
})


  it("should end the game when a correct truth is submitted", () => {
    applySetup(game, createValidCardSet(), createValidCardSet(2))
    applyBet(game, Alice, 1)
    applyBet(game, Bob, 2)

    expect(getPhase(game)).toBe('RESOLUTION')
    const result = applyTruth(game, Bob, correctGuess1)
    expect(result).toEqual({ success: true })
    expect(isGameOver(game)).toBe(true)
    expect(getWinner(game)).toBe(Bob)
  })

  it("should not end the game with an incorrect truth", () => {
    applySetup(game, createValidCardSet(), createValidCardSet(2))
    applyBet(game, Alice, 2)
    applyBet(game, Bob, 3)

    const result = applyTruth(game, Bob, incorrectGuess2)
    expect(result).toEqual({ success: true })
    expect(isGameOver(game)).toBe(false)
  })

  it("should not allow truth action if not the bet winner", () => {
    applySetup(game, createValidCardSet(), createValidCardSet(2))
    applyBet(game, Alice, 2)
    applyBet(game, Bob, 3)

    const result = applyTruth(game, Alice, correctGuess1)
    expect(result).toEqual({ success: false, reason: "Action not allowed in current phase." })
  })

  it("should not allow truth action if not in resolution phase", () => {
    applySetup(game, createValidCardSet(), createValidCardSet(2))

    const result = applyTruth(game, Alice, correctGuess1)
    expect(result).toEqual({ success: false, reason: "Invalid action for the current phase." })
  })

  it("should not allow truth if guess length is invalid", () => {
    applySetup(game, createValidCardSet(), createValidCardSet(2))
    applyBet(game, Alice, 2)
    applyBet(game, Bob, 3)

    const result = applyTruth(game, Bob, incorrectGuess1)
    expect(result).toEqual({ success: false, reason: "Invalid action for the current phase." })
  })
})

describe ("nextTurn", () => {
    it("turnPhase should end game on correct truth", () => {
    const game = buildGameWithSetup()
    applyBet(game, 'Alice', 2)
    applyBet(game, 'Bob', 3)

    // Solve without applyAction
    const result = callResolvePlayerAction(game, 'Bob', { type: 'truth', guess: correctGuess1 })
    expect(result.success).toBe(true)
    expect(result.answer).toBe(true)

    expect(isGameOver(game)).toBe(true)
    expect(getWinner(game)).toBe('Bob')
})
})
