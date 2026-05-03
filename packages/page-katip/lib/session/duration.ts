import { computeSpeed, type Step } from "@keybr/textinput";
import { type Duration, DurationType, type Progress } from "./types.ts";

export function timeDuration(time: number): Duration {
  return { type: DurationType.Time, value: time };
}

export function lengthDuration(length: number): Duration {
  return { type: DurationType.Length, value: length };
}

export const duration_1_minute = timeDuration(60_000);
export const duration_3_minutes = timeDuration(180_000);
export const duration_5_minutes = timeDuration(300_000);
export const duration_10_minutes = timeDuration(600_000);
export const duration_30_minutes = timeDuration(1_800_000);
export const duration_90_words = lengthDuration(90);
export const duration_120_words = lengthDuration(120);
export const duration_150_words = lengthDuration(150);
export const duration_200_words = lengthDuration(200);
export const duration_300_words = lengthDuration(300);

export type NamedDuration = {
  readonly label: string;
  readonly duration: Duration;
};

export const durations: readonly NamedDuration[] = [
  { label: "1 dakika", duration: duration_1_minute },
  { label: "3 dakika", duration: duration_3_minutes },
  { label: "5 dakika", duration: duration_5_minutes },
  { label: "10 dakika", duration: duration_10_minutes },
  { label: "30 dakika", duration: duration_30_minutes },
  { label: "90 kelime", duration: duration_90_words },
  { label: "120 kelime", duration: duration_120_words },
  { label: "150 kelime", duration: duration_150_words },
  { label: "200 kelime", duration: duration_200_words },
  { label: "300 kelime", duration: duration_300_words },
];

export function computeProgress(
  duration: Duration,
  steps: readonly Step[],
): { progress: Progress; completed: boolean } {
  const { length } = steps;
  let time = 0;
  let progress = 0;
  let speed = 0;
  let completed = false;
  if (length > 0) {
    const head = steps[0];
    const curr = steps[length - 1];
    time = curr.timeStamp - head.timeStamp;
    speed = computeSpeed(length, time);
    switch (duration.type) {
      case DurationType.Time: {
        progress = time / duration.value;
        completed = time >= duration.value;
        break;
      }
      case DurationType.Length: {
        progress = length / duration.value;
        completed = length >= duration.value;
        break;
      }
    }
  }
  return {
    progress: {
      time,
      length,
      progress,
      speed,
    },
    completed,
  };
}