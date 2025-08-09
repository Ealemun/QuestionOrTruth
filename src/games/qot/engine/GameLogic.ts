import type {
  PlayerId,
  Card,
  GameAction,
  GameObservation,
  QuestionOrTruthGame,
} from "../types";
import {
  LOW_CHIPS_THRESHOLD,
  STARTING_CHIPS,
} from "../config";
import { allPlayersReady, checkGameActionValidity, getOpponent, prepareNextTurn, resolveBettingPhase, resolvePlayerAction, turnPhase, validateCardOrder } from "./internals";

/**
 * @brief Resets an existing game object to its initial state.
 *
 * This function clears all dynamic game data such as hands, chips, bets,
 * turn count, phase, winner, and player submissions — while preserving
 * the current list of players.
 *
 * Use this to restart a game session without creating a new object.
 *
 * @param game - The existing `QuestionOrTruthGame` instance to reset.
 */
export function setup(game: QuestionOrTruthGame): void {
  game.playerStates = {};
  game.currentTurn = 0;
  game.bets = {};
  game.phase = "SETUP";
  game.betWinner = null;
  game.winner = null;

  game.players.forEach((pid) => {
    game.playerStates[pid] = {
      hand: [],
      chips: STARTING_CHIPS,
      receivedInfo: [],
      hasSubmitted: false,
    };
  });
}

/**
 * @brief Creates a new game state object with the given players.
 *
 * This function returns a freshly initialized `QuestionOrTruthGame` object.
 * It sets the players and calls `setup` to initialize all internal state
 * such as player hands, chips, turn count, phase, and other game data.
 *
 * Use this at the start of a new game session.
 *
 * @param players - The list of player IDs participating in the game.
 * @returns A fully initialized `QuestionOrTruthGame` object.
 */
export function createInitialGameState(
  players: PlayerId[]
): QuestionOrTruthGame {
  const game = {} as QuestionOrTruthGame;
  game.players = players;
  setup(game);
  return game;
}

/**
 * @brief Sets the cards for a player in the game.
 * @param game - The current game
 * @param playerId - The ID of the player whose cards are being set.
 * @param cards - The array of cards to be assigned to the player.
 * @returns An object indicating success or failure, with a reason if applicable.
 */
export function setPlayerCards(
  game: QuestionOrTruthGame,
  playerId: PlayerId,
  cards: Card[]
): { success: true } | { success: false; reason: string } {
  if (game.phase !== "SETUP") {
    return { success: false, reason: "Game already started." };
  }

  const [isValid, invalidSuit] = validateCardOrder(cards); // TODO check with the front if reason is needed
  if (!isValid) {
    if (invalidSuit === null) {
      return {
        success: false,
        reason: "Invalid card amout or presence of duplicates.",
      };
    }
    return {
      success: false,
      reason: `Invalid card order for suit: ${invalidSuit}`,
    };
  }
  if (!game.playerStates.hasOwnProperty(playerId)) {
    return { success: false, reason: "Unknown player." };
  }
  game.playerStates[playerId].hand = cards;
  game.playerStates[playerId].hasSubmitted = true;

  if (allPlayersReady(game)) {
    turnPhase(game, "BETTING");
    game.currentTurn = 1;
  }

  return { success: true };
}

/**
 * @brief Applies an action taken by a player during the game.
 * @param game - The current game
 * @param playerId - The ID of the player taking the action.
 * @param action - The action being applied, which can include betting or resolving a question/answer.
 * @returns An object indicating success or failure of the action, with a reason if applicable.
 */
export function applyAction(
  game: QuestionOrTruthGame,
  playerId: PlayerId,
  action: GameAction
): { success: true } | { success: false; reason: string } {
  // TODO check that the GameAction is valid
  if (!checkGameActionValidity(game, action)) {
    return {
      success: false,
      reason: "Invalid action for the current phase.",
    };
  }
  if (game.phase === "BETTING") {
    game.bets[playerId] = action.bet ?? 0;
    if (
      action.bet === undefined ||
      action.bet < 0 ||
      action.bet > game.playerStates[playerId].chips
    ) {
      return { success: false, reason: "Invalid bet amount." };
    }
    game.playerStates[playerId].hasSubmitted = true;

    if (allPlayersReady(game)) {
      resolveBettingPhase(game);
    }
    return { success: true };
  } else if (game.phase === "RESOLUTION" && playerId === getBetWinner(game)) {
    const action_result = resolvePlayerAction(game, playerId, action);
    if (action_result.success === true) {
      if (!isGameOver(game)) {
        prepareNextTurn(game);
      }
      return { success: true };
    }
  }
  return { success: false, reason: "Action not allowed in current phase." };
}

/**
 * @brief Gets the current observation for a specific player.
 * @param pid - The ID of the player for whom the observation is requested.
 * @returns An object containing the game state relevant to the player.
 */
export function getObservationForPlayer(
  game: QuestionOrTruthGame,
  pid: PlayerId
): GameObservation {
  const state = game.playerStates[pid];
  const opponent = getOpponent(game, pid);
  const opponentState = game.playerStates[opponent];

  return {
    phase: game.phase,
    turn: game.currentTurn,
    hand: state.hand,
    chips: state.chips,
    receivedInfo: state.receivedInfo,
    givenInfo: opponentState.receivedInfo,
    opponentChipsKnownLow: opponentState.chips <= LOW_CHIPS_THRESHOLD,
    canAct:
      game.phase === "RESOLUTION"
        ? getBetWinner(game) === pid
        : isGameOver(game)
        ? false
        : true, // can always act except in RESOLUTION phase and END phase
  };
}

/**
 * @brief Determines the winner of the current turn based on player bets.
 * @returns The ID of the player who won the turn, or null if there is no winner.
 */
export function getBetWinner(game: QuestionOrTruthGame): PlayerId | null {
  return game.betWinner;
}

/**
 * @brief Gets the winner of the game.
 * @returns The ID of the player who won the game, or null if there is no winner yet.
 */
export function getWinner(game: QuestionOrTruthGame): PlayerId | null {
  return game.winner;
}

/**
 * @brief Checks if the game is over.
 * @returns True if the game has ended, false otherwise.
 */
export function isGameOver(game: QuestionOrTruthGame): boolean {
  return game.phase === "END";
}

export function isSetupPhase(game: QuestionOrTruthGame): boolean {
  return game.phase === "SETUP";
}

// - setup.test.ts               (constructor, setPlayerCards)
// - validation.test.ts          (validateCardOrder)
// - bettingPhase.test.ts        (applyAction, resolveBettingPhase)
// - playerAction.test.ts        (resolvePlayerAction, prepareNextTurn, checkTruth)
// - questions.test.ts           (answerQuestion)
// - internals.test.ts           (resetSubmitted, allPlayersReady, getOpponent, getBetWinner, isGameOver)
// - observation.test.ts         (getObservationForPlayer)
