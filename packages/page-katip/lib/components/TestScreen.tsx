import { Screen } from "@keybr/pages-shared";
import { type LineList, makeStats } from "@keybr/textinput";
import { useSoundPlayer } from "@keybr/textinput-sounds";
import { TextArea } from "@keybr/textinput-ui";
import { Box, type Focusable, Para, Spacer, useView } from "@keybr/widget";
import { useEffect, useRef, useState } from "react";
import {
  type TextGenerator,
  TextGeneratorLoader,
} from "../generators/index.ts";
import { DurationType, Session, type TestResult } from "../session/index.ts";
import { type CompositeSettings, useCompositeSettings } from "../settings.ts";
import { views } from "../views.tsx";
import { LineTemplate } from "./LineTemplate.tsx";
import { TestProgress } from "./TestProgress.tsx";
import * as styles from "./TestScreen.module.less";
import { Toolbar } from "./Toolbar.tsx";

export function TestScreen() {
  return (
    <TextGeneratorLoader>
      {(generator) => (
        <Controller generator={generator} mark={generator.mark()} />
      )}
    </TextGeneratorLoader>
  );
}

function Controller({
  generator,
  mark,
}: {
  generator: TextGenerator;
  mark: unknown;
}) {
  const { setView } = useView(views);
  const settings = useCompositeSettings();
  const focusRef = useRef<Focusable>(null);
  const player = useSoundPlayer();
  const [session, setSession] = useState(() => nextTest(settings, generator));
  const [lines, setLines] = useState<LineList>(Session.emptyLines);
  const [progress, setProgress] = useState(Session.emptyProgress);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const completedRef = useRef(false);

  useEffect(() => {
    generator.reset(mark);
    const session = nextTest(settings, generator);
    setSession(session);
    setLines(session.getLines());
  }, [settings, generator, mark]);

  // Continuously update progress bar for time-based sessions
  useEffect(() => {
    completedRef.current = false;
    if (session.settings.duration.type !== DurationType.Time) return;
    let rafId: number;
    const tick = () => {
      const { progress: liveProgress, completed: done } =
        sessionRef.current.getLiveProgress();
      setProgress(liveProgress);
      if (done && sessionRef.current.getSteps().length > 0 && !completedRef.current) {
        completedRef.current = true;
        setView("report", { result: makeResult(sessionRef.current) });
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [session, setView]);
  return (
    <Screen>
      <Toolbar
        onConfigure={() => {
          setView("settings");
        }}
        onChange={() => {
          focusRef.current?.focus();
        }}
      />
      <Spacer size={10} />
      <Box alignItems="center" justifyContent="center">
        <div className={styles.text}>
          <TextArea
            focusRef={focusRef}
            settings={settings.textDisplay}
            lines={lines}
            wrap={false}
            onFocus={() => {
              generator.reset(mark);
              const session = nextTest(settings, generator);
              setSession(session);
              setLines(session.getLines());
            }}
            onKeyDown={session.handleKeyDown}
            onKeyUp={session.handleKeyUp}
            onInput={(event) => {
              const { feedback, progress, completed } =
                session.handleInput(event);
              setLines(session.getLines());
              setProgress(progress);
              player(feedback);
              if (completed) {
                setView("report", { result: makeResult(session) });
              }
            }}
            lineTemplate={LineTemplate}
          />
          <TestProgress progress={progress} />
        </div>
      </Box>
      <Para align="center">
        <strong>
          ⚠ Bu uygulama yalnızca pratik amaçlıdır; resmi katiplik sınavı koşullarını tam olarak yansıtmayabilir.
        </strong>
      </Para>
    </Screen>
  );
}

function nextTest(settings: CompositeSettings, generator: TextGenerator) {
  return new Session({ ...settings, numLines: 10, numCols: 60 }, generator);
}

function makeResult(session: Session): TestResult {
  const steps = session.getSteps();
  const events = session.getEvents();
  return {
    duration: session.settings.duration,
    stats: makeStats(steps),
    steps,
    events,
  };
}
