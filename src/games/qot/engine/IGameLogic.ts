import type { PlayerId, Card, GameAction, GamePhase, GameObservation, Value, Suit, PlayerState } from "../types";
// import { generateInitialDeck, validateCardOrder } from "../utils";
// import { getInitialchips, getReward } from "../config";

export interface IQuestionOrTruthGame {

    /**
     * @brief Sets the cards for a player in the game.
     * @param playerId - The ID of the player whose cards are being set.
     * @param cards - The array of cards to be assigned to the player.
     * @returns An object indicating success or failure, with a reason if applicable.
     */
    setPlayerCards(playerId: PlayerId, cards: Card[]): { success: true } | { success: false; reason: string };

    /**
     * @brief Applies an action taken by a player during the game.
     * @param playerId - The ID of the player taking the action.
     * @param action - The action being applied, which can include betting or resolving a question/answer.
     * @returns An object indicating success or failure of the action, with a reason if applicable.
     */
    applyAction(playerId: PlayerId, action: GameAction): { success: true } | { success: false; reason: string };
}

