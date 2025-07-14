import { QuestionOrTruthGame } from '../engine/GameLogic'
import { StepInput, StepOutput, ResetOutput } from './types'
import { PlayerId, GamePhase } from '../types'

export class GameSession {
  private game: QuestionOrTruthGame
  private done: boolean = false
  private readonly players: [PlayerId, PlayerId] = ['Alice', 'Bob']

  constructor() {
    this.game = new QuestionOrTruthGame(this.players)
    this.reset()
  }

  reset(): ResetOutput {
    this.game.setup()
    this.done = false

    return {
      obs: this.game.getObservationForPlayer('Alice')
    }
  }

  step(input: StepInput): StepOutput {
    if (this.done) throw new Error('Game is over. Call reset().')

    const { player, action } = input
    const success = this.game.applyAction(player, action)

    if (!success) throw new Error('Invalid action')

    const obs = this.game.getObservationForPlayer(player)
    const phase = obs.phase

    const reward = phase === 'END'
      ? this.computeReward(player)
      : 0

    const done = phase === 'END'
    this.done = done

    return {
      obs,
      reward,
      done,
      info: {} // logs internes si besoin
    }
  }

  private computeReward(player: PlayerId): number {
    const winner = this.game.getWinner?.()
    if (!winner) return 0
    return winner === player ? 1 : -1
  }
}
