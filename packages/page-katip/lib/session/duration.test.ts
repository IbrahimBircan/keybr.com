import { test } from "node:test";
import { type Step } from "@keybr/textinput";
import { like } from "rich-assert";
import { computeProgress, duration_90_words } from "./duration.ts";

const steps: readonly Step[] = [
  { timeStamp: 1001, codePoint: /* "a" */ 0x0061, timeToType: 100, typo: false },
  { timeStamp: 1201, codePoint: /* "b" */ 0x0062, timeToType: 100, typo: false },
  { timeStamp: 1401, codePoint: /* "c" */ 0x0063, timeToType: 100, typo: false },
];

test("progress", () => {
  like(computeProgress(duration_90_words, []), {
    progress: { time: 0, length: 0, progress: 0, speed: 0 },
    completed: false,
  });
  like(computeProgress(duration_90_words, steps.slice(0, 1)), {
    progress: { time: 0, length: 1, progress: 0.011111111111111112, speed: 0 },
    completed: false,
  });
  like(computeProgress(duration_90_words, steps.slice(0, 2)), {
    progress: { time: 200, length: 2, progress: 0.022222222222222223, speed: 600 },
    completed: false,
  });
  like(computeProgress(duration_90_words, steps.slice(0, 3)), {
    progress: { time: 400, length: 3, progress: 0.03333333333333333, speed: 450 },
    completed: false,
  });
});