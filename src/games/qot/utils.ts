import { FaceValue, NumericalValue, Value } from "./types";

export const isFigure = (rank: Value): rank is FaceValue =>
  [1, 11, 12, 13].includes(rank);

export const isNumerical = (rank: Value): rank is NumericalValue =>
  rank >= 2 && rank <= 10;
