import { DurationType, type KatipTestResult } from "./session/index.ts";

export function mockResult(): KatipTestResult {
  return {
    duration: { type: DurationType.Length, value: 100 },
    targetText:
      "bir iki üç dört beş altı yedi sekiz dokuz on on bir on iki on üç on dört",
    typedText: "bir iki üç dört beş ",
    elapsedTime: 45_000,
  };
}

