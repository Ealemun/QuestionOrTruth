import { QuestionOrTruthGame } from "../engine/GameLogic";
import { StepInput, StepOutput, ResetOutput } from "./types";
import { PlayerId, GamePhase, Card, GameAction } from "../types";
import { createValidCardSet } from "../tests/helpers";

export class GameSession {
  private game: QuestionOrTruthGame;
  private done: boolean = false;
  private readonly players: [PlayerId, PlayerId] = ["Alice", "Bob"];

  constructor() {
    this.game = new QuestionOrTruthGame(this.players);
    this.reset();
  }

  reset(): ResetOutput {
    this.game.setup();
    this.done = false;
    const cards = createValidCardSet()
    this.game.setPlayerCards("Bob", cards)

    return {
      obs: this.game.getObservationForPlayer("Alice"),
    };
  }

  step(input: StepInput): StepOutput {
    if (this.done) throw new Error("Game is over. Call reset().");
    const { player, action } = input;
    let res = { success: false };
    if (this.game.isSetupPhase()) {
      // console.log("Received action:", JSON.stringify(action));
      if (!isCardArray(action)) {
        throw new Error("Expected Card[] during setup.");
      }
      res = this.game.setPlayerCards(player, action);
      // console.error(
      //   "[DEBUG] [index] setPlayerCards returned:",
      //   JSON.stringify(res)
      // );
    } else {
      if (!isGameAction(action)) {
        throw new Error("Expected GameAction after setup.");
      }
      res = this.game.applyAction(player, action);
    }

    if (!res.success) throw new Error("Invalid action");
    // console.log("Result is a success ! ");
    const obs = this.game.getObservationForPlayer(player);
    const phase = obs.phase;

    const reward = phase === "END" ? this.computeReward(player) : 0;

    const done = phase === "END";
    this.done = done;

    const fullreturn = {
      obs,
      reward,
      done,
      info: {}, // logs internes si besoin
    };

    // console.log("Full return:", JSON.stringify(fullreturn));

    return fullreturn;
  }
  isSetupPhase() {
    throw new Error("Method not implemented.");
  }

  private computeReward(player: PlayerId): number {
    const winner = this.game.getWinner?.();
    if (!winner) return 0;
    return winner === player ? 1 : -1;
  }
}

function isCard(obj: any): obj is Card {
  return obj && typeof obj === "object" && "suit" in obj && "rank" in obj;
}

function isCardArray(action: any): action is Card[] {
  return Array.isArray(action) && action.every(isCard);
}

function isGameAction(action: any): action is GameAction {
  return action && typeof action === "object" && "type" in action;
}
