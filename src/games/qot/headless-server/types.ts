import { GameObservation, GameAction, PlayerId, Card } from '../types'

export type StepInput = {
  player: PlayerId
  action: GameAction | Card[]
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
