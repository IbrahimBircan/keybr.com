import { type Duration } from "./types.ts";

export type KatipTestResult = {
  readonly duration: Duration;
  readonly targetText: string;
  readonly typedText: string;
  readonly elapsedTime: number;
};
