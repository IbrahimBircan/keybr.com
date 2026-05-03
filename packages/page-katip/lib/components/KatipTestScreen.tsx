import { Screen } from "@keybr/pages-shared";
import { Box, Para, Spacer, useView } from "@keybr/widget";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  type TextGenerator,
  TextGeneratorLoader,
} from "../generators/index.ts";
import { DurationType, type KatipTestResult } from "../session/index.ts";
import { type CompositeSettings, useCompositeSettings } from "../settings.ts";
import { views } from "../views.tsx";
import { TestProgress } from "./TestProgress.tsx";
import { Toolbar } from "./Toolbar.tsx";
import * as styles from "./KatipTestScreen.module.less";

export function KatipTestScreen() {
  return (
    <TextGeneratorLoader>
      {(generator) => (
        <KatipController generator={generator} mark={generator.mark()} />
      )}
    </TextGeneratorLoader>
  );
}

function generateWords(
  generator: TextGenerator,
  settings: CompositeSettings,
): string {
  const wordCount =
    settings.duration.type === DurationType.Time
      ? Math.min(600, Math.ceil((settings.duration.value / 60_000) * 130) + 60)
      : Math.min(600, settings.duration.value + 100);
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(generator.nextWord());
  }
  return words.join(" ");
}

function parseTyped(typedText: string): {
  committedWords: string[];
  currentIndex: number;
} {
  const normalized = typedText.replace(/\n/g, " ");
  const parts = normalized.split(" ");
  const committedWords = parts.slice(0, -1);
  return { committedWords, currentIndex: committedWords.length };
}

function countCommittedWords(typedText: string): number {
  return parseTyped(typedText).committedWords.filter((w) => w.length > 0)
    .length;
}

function KatipController({
  generator,
  mark,
}: {
  generator: TextGenerator;
  mark: unknown;
}) {
  const { setView } = useView(views);
  const settings = useCompositeSettings();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const targetDivRef = useRef<HTMLDivElement>(null);

  const targetText = useMemo(() => {
    generator.reset(mark);
    return generateWords(generator, settings);
  }, [generator, mark, settings]);

  const [typedText, setTypedText] = useState("");
  const typedTextRef = useRef("");
  const startTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const [progress, setProgress] = useState({
    time: 0,
    length: 0,
    progress: 0,
    speed: 0,
  });

  const finishRef = useRef<() => void>(() => {});
  finishRef.current = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    const elapsedTime = startTimeRef.current
      ? performance.now() - startTimeRef.current
      : 0;
    setView("report", {
      result: {
        duration: settings.duration,
        targetText,
        typedText: typedTextRef.current,
        elapsedTime,
      } satisfies KatipTestResult,
    });
  };

  // RAF loop for time-based sessions
  useEffect(() => {
    if (settings.duration.type !== DurationType.Time) return;
    completedRef.current = false;
    let rafId: number;
    const tick = () => {
      if (!startTimeRef.current) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      const elapsed = performance.now() - startTimeRef.current;
      const p = Math.min(1, elapsed / settings.duration.value);
      setProgress({ time: elapsed, length: 0, progress: p, speed: 0 });
      if (elapsed >= settings.duration.value) {
        finishRef.current();
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [settings.duration]);

  // Scroll active word into view
  useEffect(() => {
    const container = targetDivRef.current;
    if (!container) return;
    const current = container.querySelector<HTMLElement>("[data-current]");
    if (!current) return;
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const wordTop = current.offsetTop;
    const wordBottom = wordTop + current.offsetHeight;
    if (wordTop < containerTop || wordBottom > containerBottom) {
      container.scrollTop = wordTop - container.clientHeight / 2;
    }
  }, [typedText]);

  // Reset on generator/settings change
  useEffect(() => {
    setTypedText("");
    typedTextRef.current = "";
    startTimeRef.current = null;
    completedRef.current = false;
    setProgress({ time: 0, length: 0, progress: 0, speed: 0 });
    textareaRef.current?.focus();
  }, [targetText]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;

    if (!startTimeRef.current && newText.length > 0) {
      startTimeRef.current = performance.now();
    }

    typedTextRef.current = newText;
    setTypedText(newText);

    if (settings.duration.type === DurationType.Length) {
      const wordsDone = countCommittedWords(newText);
      const p = Math.min(1, wordsDone / settings.duration.value);
      setProgress({ time: 0, length: wordsDone, progress: p, speed: 0 });
      if (wordsDone >= settings.duration.value) {
        finishRef.current();
      }
    }
  };

  return (
    <Screen>
      <Toolbar
        onConfigure={() => setView("settings")}
        onChange={() => textareaRef.current?.focus()}
      />
      <Spacer size={4} />
      <Box alignItems="stretch" justifyContent="center">
        <div className={styles.container}>
          <div className={styles.label}>Kaynak Metin</div>
          <div className={styles.targetText} ref={targetDivRef}>
            <TargetWords targetText={targetText} typedText={typedText} />
          </div>
          <div className={styles.label}>Yazı Alanı</div>
          <textarea
            ref={textareaRef}
            className={styles.inputArea}
            value={typedText}
            onChange={handleChange}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
          <TestProgress progress={progress} />
        </div>
      </Box>
      <Spacer size={2} />
      <Para align="center">
        <strong>
          ⚠ Bu uygulama yalnızca pratik amaçlıdır; resmi katiplik sınavı
          koşullarını tam olarak yansıtmayabilir.
        </strong>
      </Para>
    </Screen>
  );
}

function TargetWords({
  targetText,
  typedText,
}: {
  targetText: string;
  typedText: string;
}) {
  const targetWords = targetText.split(" ");
  const { committedWords, currentIndex } = parseTyped(typedText);

  return (
    <>
      {targetWords.map((word, i) => {
        let className: string | undefined;
        if (i < currentIndex) {
          const typed = committedWords[i] ?? "";
          className =
            typed === word ? styles.wordCorrect : styles.wordIncorrect;
        } else if (i === currentIndex) {
          className = styles.wordCurrent;
        }
        return (
          <span key={i}>
            <span
              className={className}
              data-current={i === currentIndex ? "" : undefined}
            >
              {word}
            </span>
            {i < targetWords.length - 1 ? " " : ""}
          </span>
        );
      })}
    </>
  );
}
