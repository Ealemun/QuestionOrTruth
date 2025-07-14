import { GameObservation, GameAction, PlayerId } from '../types'

export type StepInput = {
  player: PlayerId
  action: GameAction
}

export type StepOutput = {
  obs: GameObservation
  reward: number
  done: boolean
  info: Record<string, any>
}

export type ResetOutput = {
  obs: GameObservation
}
