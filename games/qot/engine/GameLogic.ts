import type { PlayerId, Card, GameAction, GamePhase, GameObservation, Value, Suit, Question, QuestionResponse, PlayerState } from "../types"
import { NB_CARDS_TO_GUESS, STARTING_CHIPS } from "../config"
import { IQuestionOrTruthGame } from "../engine/IGameLogic";
import { isFigure, isNumerical } from "../utils";


export class QuestionOrTruthGame implements IQuestionOrTruthGame {
  private players: PlayerId[]
  private playerStates: Record<PlayerId, PlayerState>
  private currentTurn: number
  private bets: Record<PlayerId, number>
  private phase: GamePhase
  private winner: PlayerId | null
 
  constructor(players: PlayerId[]) {
    this.players = players
    this.playerStates = {}
    this.currentTurn = 0
    this.bets = {}
    this.phase = "SETUP"
    this.winner = null

    players.forEach(pid => {
      this.playerStates[pid] = {
        hand: [],
        chips: STARTING_CHIPS,
        revealedInfo: [],
        hasSubmitted: false
      }
    })
  }

  public setPlayerCards(playerId: PlayerId, cards: Card[]): { success: true } | { success: false; reason: string } {
    if (this.phase !== "SETUP") {
      return { success: false, reason: "Game already started." }
    }

    const [isValid, invalidSuit] = this.validateCardOrder(cards) // TODO check with the front if reason is needed
    if (!isValid) {
      if (invalidSuit === null) {
        return { success: false, reason: "Invalid card amout or presence of duplicates." }
      }
      return { success: false, reason: `Invalid card order for suit: ${invalidSuit}` }
    }
    if (!this.playerStates.hasOwnProperty(playerId)) {
      return { success: false, reason: "Unknown player." }
    }
    this.playerStates[playerId].hand = cards
    this.playerStates[playerId].hasSubmitted = true // TODO reset hasSubmitted at each phase

    if (this.allPlayersReady()) {
      this.phase = "BETTING"
      this.resetSubmitted()
      this.currentTurn = 1
    }

    return { success: true }
  }


  public applyAction(playerId: PlayerId, action: GameAction): void { // TODO check that the bet amount is valid
    if (this.phase === "BETTING") {
      this.bets[playerId] = action.bet ?? 0
      this.playerStates[playerId].hasSubmitted = true

      if (this.allPlayersReady()) {
        this.resolveBettingPhase()
      }
    } else if (this.phase === "RESOLUTION" && playerId === this.getTurnWinner()) {
      this.resolvePlayerAction(playerId, action)
      this.prepareNextTurn()
    }
  }


    /**
   * @brief Validates the order of cards for a player.
   * This function checks if the provided card order is valid according to the game's rules.
   * Cards must be arranged such that cards of the same suit are in ascending order from left to right, but suits do not need to be consecutive.
   * @param cards - The array of cards to validate.
   * @return A tuple where the first element is a boolean indicating if the order is valid, and the second element is the suit of the first card that breaks the order, or null if the order is valid.
  */
  private validateCardOrder(cards: Card[]): [boolean: boolean, value:  Suit | null]  {
    if (cards.length !== NB_CARDS_TO_GUESS) return [false, null]
    const suits: Record<Suit, Card[]> = {
      "spades": [],
      "hearts": [],
      "diamonds": [],
      "clubs": []
    }
    for (const card of cards) {
      suits[card.suit].push(card)
    }

    for (const suit in suits) {
      
      const cardsOfSuit = suits[suit as Suit]

      for (let i = 1; i < cardsOfSuit.length; i++) {
        if (cardsOfSuit[i - 1].rank > cardsOfSuit[i].rank) {
          return [false, suit as Suit]
        }
        if (cardsOfSuit[i - 1].rank === cardsOfSuit[i].rank) {
          return [false, null] // Two cards of the same rank in the same suit
        }
      }
    }
    
    return [true, null]
  }

  /**
   * @brief Gets the current observation for a player.
   * @param None
   * @returns An object containing the current game state relevant to the player.
  */
  private resolveBettingPhase(): void {
    const [p1, p2] = this.players
    const b1 = this.bets[p1]
    const b2 = this.bets[p2]

    this.playerStates[p1].chips -= b1
    this.playerStates[p2].chips -= b2

    if (b1 > b2) this.phase = "RESOLUTION"
    else if (b2 > b1) this.phase = "RESOLUTION"
    else this.prepareNextTurn()
  }

  /**
   * @brief Resolves the action taken by a player, such as answering a question or making a guess.
   * @param playerId - The ID of the player whose action is being resolved.
   * @param action - The action to resolve, which can be a question or a truth guess.
  */
  private resolvePlayerAction(playerId: PlayerId, action: GameAction): void {
    // Résoudre Question ou Vérité
    const state = this.playerStates[playerId]
    if (action.type === "truth") {
      const isCorrect = this.checkTruth(playerId, action.guess!)
      if (isCorrect) {
        this.winner = playerId
        this.phase = "END"
      }
    } else if (action.type === "question") {
      const opponentId = this.getOpponent(playerId)
      const response = this.answerQuestion(opponentId, action.question!)
      state.revealedInfo.push(response)
    }
  }

  
  /**
   * @brief Prepares the game for the next turn after resolving the current actions.
   * Increments the turn count and resets player submissions.
   */
  private prepareNextTurn(): void {
    const [p1, p2] = this.players
    this.playerStates[p1].chips += 2
    this.playerStates[p2].chips += 2
    this.bets = {}
    this.phase = "BETTING"
    this.currentTurn += 1
    this.resetSubmitted()
  }

    /**
   * @brief Checks if a guess made by a player is correct.
   * @param guesserId - The ID of the player making the guess.
   * @param guess - The array of cards guessed by the player.
   * @returns True if the guess is correct, false otherwise.
   */
  private checkTruth(guesserId: PlayerId, guess: Value[]): boolean {
    const opponentId = this.getOpponent(guesserId)
    const target = this.playerStates[opponentId].hand
    return target.every((card, i) => card.rank === guess[i])
  }

    /**
   * @brief Answers a question posed by an opponent.
   * @param opponentId - The ID of the opponent asking the question.
   * @param question - The question being answered.
   * @returns The answer to the question, which can vary based on the type of question.
   */
  private answerQuestion(opponentId: PlayerId, question: Question): QuestionResponse {
  const hand = this.playerStates[opponentId].hand;

  switch (question.type) {
    case 'SUM':
      switch (question.variant) {
        case 'positions':
          for (const i of question.positions) {
            if (i < 0 || i >= NB_CARDS_TO_GUESS) {
              throw new Error(`Invalid card index: ${i}`);
            }
          }
          const values = question.positions.map(i => hand[i]?.rank ?? 0);
          return { type: 'SUM', value: values.reduce((a, b) => a + b, 0) };
        case 'color':
          return {
            type: 'SUM',
            value: hand
              .filter(c => c.suit === question.suit)
              .reduce((sum, c) => sum + c.rank, 0),
          };
        case 'figures':
          return {
            type: 'SUM',
            value: hand.filter(c => isFigure(c.rank)).reduce((sum, c) => sum + c.rank, 0),
          };
        case 'numerical':
          return {
            type: 'SUM',
            value: hand.filter(c => isNumerical(c.rank)).reduce((sum, c) => sum + c.rank, 0),
          };
      }

    case 'COUNT':
      switch (question.variant) {
        case 'figures':
          return { type: 'COUNT', value: hand.filter(c => isFigure(c.rank)).length };
        case 'numerical':
          return { type: 'COUNT', value: hand.filter(c => isNumerical(c.rank)).length };
        case 'value':
          return { type: 'COUNT', value: hand.filter(c => c.rank === question.rank).length };
      }

    case 'POSITION':
      switch (question.variant) {
        case 'color':
          return {
            type: 'POSITION',
            positions: hand.map((c, i) => (c.suit === question.suit ? i : -1)).filter(i => i >= 0),
          };
        case 'value':
          return {
            type: 'POSITION',
            positions: hand.map((c, i) => (c.rank === question.rank ? i : -1)).filter(i => i >= 0),
          };
        case 'consecutive':
          return {
            type: 'POSITION',
            positions: hand
              .map((c, i) => ({ i, val: c.rank }))
              .sort((a, b) => a.val - b.val)
              .filter((_, idx, arr) => idx > 0 && arr[idx].val === arr[idx - 1].val + 1)
              .map(({ i }) => i),
          };
        case 'max':
          const max = Math.max(...hand.map(c => c.rank));
          return {
            type: 'POSITION',
            positions: hand.map((c, i) => (c.rank === max ? i : -1)).filter(i => i >= 0),
          };
        case 'min':
          const min = Math.min(...hand.map(c => c.rank));
          return {
            type: 'POSITION',
            positions: hand.map((c, i) => (c.rank === min ? i : -1)).filter(i => i >= 0),
          };
      }
  }

  throw new Error("Unsupported question");
}



    /**
   * @brief Resets the submission status of all players.
   * This is typically called at the start of a new turn.
   */
  private resetSubmitted() {
    this.players.forEach(pid => {
      this.playerStates[pid].hasSubmitted = false
    })
  }

    /**
   * @brief Checks if all players have submitted their actions for the current phase.
   * @returns True if all players are ready, false otherwise.
   */
  private allPlayersReady(): boolean {
    return this.players.every(pid => this.playerStates[pid].hasSubmitted)
  }

  /**
 * @brief Gets the opponent of a given player.
 * @param pid - The ID of the player whose opponent is being requested.
 * @returns The ID of the opponent player.
 */
  private getOpponent(pid: PlayerId): PlayerId {
    return this.players.find(p => p !== pid)!
  }

  /**
   * @brief Gets the current observation for a specific player.
   * @param pid - The ID of the player for whom the observation is requested.
   * @returns An object containing the game state relevant to the player.
   */
  public getObservationForPlayer(pid: PlayerId): GameObservation {
    const state = this.playerStates[pid]
    const opponent = this.getOpponent(pid)
    const opponentState = this.playerStates[opponent]

    return {
      phase: this.phase,
      turn: this.currentTurn,
      hand: state.hand,
      chips: state.chips,
      revealedInfo: state.revealedInfo,
      opponentChipsKnownLow: opponentState.chips < 5,
      canAct: this.phase === "RESOLUTION" ? this.getTurnWinner() === pid : true
    }
  }

  /**
   * @brief Determines the winner of the current turn based on player bets.
   * @returns The ID of the player who won the turn, or null if there is no winner.
   */
  public getTurnWinner(): PlayerId | null {
    const [p1, p2] = this.players
    if (!this.bets[p1] || !this.bets[p2]) return null
    if (this.bets[p1] > this.bets[p2]) return p1
    if (this.bets[p2] > this.bets[p1]) return p2
    return null
  }

  /**
   * @brief Checks if the game is over.
   * @returns True if the game has ended, false otherwise.
   */
  public isGameOver(): boolean {
    return this.phase === "END"
  }

}
