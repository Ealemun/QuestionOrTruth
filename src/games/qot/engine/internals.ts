import { NB_CARDS_TO_GUESS } from "../config";
import { Card, GameAction, GamePhase, PlayerId, Question, QuestionOrTruthGame, QuestionResponse, Suit, Value } from "../types";
import { isFigure, isNumerical } from "../utils";

/**
 * @brief Validates the order of cards for a player.
 * This function checks if the provided card order is valid according to the game's rules.
 * Cards must be arranged such that cards of the same suit are in ascending order from left to right, but suits do not need to be consecutive.
 * @param cards - The array of cards to validate.
 * @return A tuple where the first element is a boolean indicating if the order is valid, and the second element is the suit of the first card that breaks the order, or null if the order is valid.
 */
export function validateCardOrder(
  cards: Card[]
): [boolean: boolean, value: Suit | null] {
  if (cards.length !== NB_CARDS_TO_GUESS) return [false, null];
  const suits: Record<Suit, Card[]> = {
    spades: [],
    hearts: [],
    diamonds: [],
    clubs: [],
  };
  for (const card of cards) {
    suits[card.suit].push(card);
  }

  for (const suit in suits) {
    const cardsOfSuit = suits[suit as Suit];

    for (let i = 1; i < cardsOfSuit.length; i++) {
      if (cardsOfSuit[i - 1].rank > cardsOfSuit[i].rank) {
        return [false, suit as Suit];
      }
      if (cardsOfSuit[i - 1].rank === cardsOfSuit[i].rank) {
        return [false, null]; // Two cards of the same rank in the same suit
      }
    }
  }

  return [true, null];
}

/**
 * @brief Gets the current observation for a player.
 * @param None
 * @returns An object containing the current game state relevant to the player.
 */
export function resolveBettingPhase(game: QuestionOrTruthGame): void {
  const [p1, p2] = game.players;
  const b1 = game.bets[p1];
  const b2 = game.bets[p2];

  game.playerStates[p1].chips -= b1;
  game.playerStates[p2].chips -= b2;

  if (b1 !== b2) {
    turnPhase(game, "RESOLUTION");
    updateBetWinner(game);
  } else prepareNextTurn(game);
}

/**
 * @brief Resolves the action taken by a player, such as answering a question or making a guess.
 * @param playerId - The ID of the player whose action is being resolved.
 * @param action - The action to resolve, which can be a question or a truth guess.
 */
export function resolvePlayerAction(
  game: QuestionOrTruthGame,
  playerId: PlayerId,
  action: GameAction
): { success: boolean; answer?: boolean | QuestionResponse } {
  const state = game.playerStates[playerId];
  if (action.type === "truth") {
    const isCorrect = checkTruth(game, playerId, action.guess!);
    if (isCorrect) {
      game.winner = playerId;
      turnPhase(game, "END");
      console.log("HERE THE GUESS IS TRUE AND THE PHASE IS: ", game.phase)
      return { success: true, answer: true };
    }
    return { success: true, answer: false };
  } else if (action.type === "question") {
    const opponentId = getOpponent(game, playerId);
    const response = answerQuestion(game, opponentId, action.question!);
    state.receivedInfo.push(response);
    return { success: true, answer: response };
  }
  return { success: false };
}

/**
 * @brief Prepares the game for the next turn after resolving the current actions.
 * Increments the turn count and resets player submissions.
 */
export function prepareNextTurn(game: QuestionOrTruthGame): void {
  const [p1, p2] = game.players;
  game.playerStates[p1].chips += 2;
  game.playerStates[p2].chips += 2;

  game.bets = {};
  turnPhase(game, "BETTING");
  game.currentTurn += 1;
  game.betWinner = null; // Reset the bet winner for the next turn
}

/**
 * @brief Checks if the action is valid for the current game phase.
 * @param action - The action to validate.
 * @return True if the action is valid, false otherwise.
 */
export function checkGameActionValidity(
  game: QuestionOrTruthGame,
  action: GameAction
): boolean {
  if (game.phase === "BETTING") {
    return action.type === "bet" && typeof action.bet === "number";
  } else if (game.phase === "RESOLUTION") {
    switch (action.type) {
      case "bet":
        return false; // Betting is not allowed in resolution phase
      case "question":
        if (!action.question) {
          return false;
        }
        if (action.question.type === "SUM") {
          if (action.question.variant === "positions") {
            for (const i of action.question.positions) {
              if (i < 0 || i >= NB_CARDS_TO_GUESS) {
                // throw new Error(`Invalid card index: ${i}`);
                return false;
              }
            }
          }
        }
        return true;
      case "truth":
        return action.guess?.length === NB_CARDS_TO_GUESS;
    }
  }
  return false;
}

/**
 * @brief Checks if a guess made by a player is correct.
 * @param guesserId - The ID of the player making the guess.
 * @param guess - The array of cards guessed by the player.
 * @returns True if the guess is correct, false otherwise.
 */
export function checkTruth(
  game: QuestionOrTruthGame,
  guesserId: PlayerId,
  guess: Value[]
): boolean {
  const opponentId = getOpponent(game, guesserId);
  const target = game.playerStates[opponentId].hand;
  return target.every((card, i) => card.rank === guess[i]);
}

/**
 * @brief Answers a question posed by an opponent.
 * @param opponentId - The ID of the opponent asking the question.
 * @param question - The question being answered.
 * @returns The answer to the question, which can vary based on the type of question.
 */
export function answerQuestion(
  game: QuestionOrTruthGame,
  opponentId: PlayerId,
  question: Question
): QuestionResponse {
  const hand = game.playerStates[opponentId].hand;

  switch (question.type) {
    case "SUM":
      switch (question.variant) {
        case "positions":
          // for (const i of question.positions) {
          //   if (i < 0 || i >= NB_CARDS_TO_GUESS) {
          //     throw new Error(`Invalid card index: ${i}`);
          //   }
          // }
          const values = question.positions.map((i) => hand[i]?.rank ?? 0);
          return {
            question: question,
            value: values.reduce((a, b) => a + b, 0),
          };
        case "color":
          return {
            question: question,
            value: hand
              .filter((c) => c.suit === question.suit)
              .reduce((sum, c) => sum + c.rank, 0),
          };
        case "figures":
          return {
            question: question,
            value: hand
              .filter((c) => isFigure(c.rank))
              .reduce((sum, c) => sum + c.rank, 0),
          };
        case "numerical":
          return {
            question: question,
            value: hand
              .filter((c) => isNumerical(c.rank))
              .reduce((sum, c) => sum + c.rank, 0),
          };
      }

    case "COUNT":
      switch (question.variant) {
        case "figures":
          return {
            question: question,
            value: hand.filter((c) => isFigure(c.rank)).length,
          };
        case "numerical":
          return {
            question: question,
            value: hand.filter((c) => isNumerical(c.rank)).length,
          };
        case "value":
          return {
            question: question,
            value: hand.filter((c) => c.rank === question.rank).length,
          };
      }

    case "POSITION":
      switch (question.variant) {
        case "color":
          return {
            question: question,
            positions: hand
              .map((c, i) => (c.suit === question.suit ? i : -1))
              .filter((i) => i >= 0),
          };
        case "value":
          return {
            question: question,
            positions: hand
              .map((c, i) => (c.rank === question.rank ? i : -1))
              .filter((i) => i >= 0),
          };
        case "consecutive":
          return {
            question,
            positions: hand
              .map((card, index) => ({ val: card.rank, index }))
              .filter(
                (current, i, arr) => i > 0 && arr[i - 1].val + 1 === current.val
              )
              .map((entry) => entry.index),
          };

        case "max":
          const max = Math.max(...hand.map((c) => c.rank));
          return {
            question: question,
            positions: hand
              .map((c, i) => (c.rank === max ? i : -1))
              .filter((i) => i >= 0),
          };
        case "min":
          const min = Math.min(...hand.map((c) => c.rank));
          return {
            question: question,
            positions: hand
              .map((c, i) => (c.rank === min ? i : -1))
              .filter((i) => i >= 0),
          };
      }
  }

  throw new Error("Unsupported question");
}

/**
 * @brief Resets the submission status of all players.
 * This is typically called at the start of a new turn.
 */
export function resetSubmitted(game: QuestionOrTruthGame) {
  game.players.forEach((pid) => {
    game.playerStates[pid].hasSubmitted = false;
  });
}

/**
 * @brief Checks if all players have submitted their actions for the current phase.
 * @returns True if all players are ready, false otherwise.
 */
export function allPlayersReady(game: QuestionOrTruthGame): boolean {
  return game.players.every((pid) => game.playerStates[pid].hasSubmitted);
}

/**
 * @brief Gets the opponent of a given player.
 * @param pid - The ID of the player whose opponent is being requested.
 * @returns The ID of the opponent player.
 */
export function getOpponent(game: QuestionOrTruthGame, pid: PlayerId): PlayerId {
  return game.players.find((p) => p !== pid)!;
}

/**
 * @brief Sets the game phase and resets player submissions.
 * @param phase - The new game phase to set.
 */
export function turnPhase(game: QuestionOrTruthGame, phase: GamePhase): void {
  game.phase = phase;
  resetSubmitted(game);
}

/**
 * @brief Updates the bet winner based on the current bets.
 * This function determines which player has the higher bet and sets them as the bet winner.
 */
export function updateBetWinner(game: QuestionOrTruthGame): void {
  const [p1, p2] = game.players;
  const b1 = game.bets[p1];
  const b2 = game.bets[p2];

  if (b1 > b2) {
    game.betWinner = p1;
  } else {
    game.betWinner = p2;
  }
}