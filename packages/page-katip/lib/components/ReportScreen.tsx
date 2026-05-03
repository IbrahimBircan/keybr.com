import {
  AccuracyHistogram,
  makeAccuracyDistribution,
  makeSpeedDistribution,
  SpeedHistogram,
} from "@keybr/chart";
import { useIntlNumbers } from "@keybr/intl";
import { useFormatter } from "@keybr/lesson-ui";
import { Screen } from "@keybr/pages-shared";
import { computeSpeed } from "@keybr/textinput";
import {
  Box,
  Button,
  Field,
  FieldList,
  formatDuration,
  Icon,
  Kbd,
  Name,
  NameValue,
  Para,
  Spacer,
  useHotkeys,
  useView,
  Value,
} from "@keybr/widget";
import { mdiSkipNext } from "@mdi/js";
import { type ReactNode } from "react";
import { DurationType, type KatipTestResult } from "../session/index.ts";
import { duration_3_minutes } from "../session/duration.ts";
import { views } from "../views.tsx";
import * as styles from "./ReportScreen.module.less";

const KATIP_PASS_WORDS = 90;

function parseTyped(typedText: string): string[] {
  return typedText.replace(/\n/g, " ").split(" ").slice(0, -1);
}

function computeWords(
  targetText: string,
  typedText: string,
): { correct: number; incorrect: number } {
  const targetWords = targetText.split(" ");
  const committedWords = parseTyped(typedText);
  let correct = 0;
  let incorrect = 0;
  for (let i = 0; i < committedWords.length; i++) {
    const typed = committedWords[i];
    if (typed.length === 0) continue;
    if (typed === (targetWords[i] ?? "")) correct++;
    else incorrect++;
  }
  return { correct, incorrect };
}

function computeAccuracy(targetText: string, typedText: string): number {
  const targetWords = targetText.split(" ");
  const committedWords = parseTyped(typedText);
  let correctChars = 0;
  let totalChars = 0;
  for (let i = 0; i < committedWords.length; i++) {
    const typed = committedWords[i];
    const target = targetWords[i] ?? "";
    for (let j = 0; j < typed.length; j++) {
      totalChars++;
      if (typed[j] === target[j]) correctChars++;
    }
  }
  return totalChars > 0 ? correctChars / totalChars : 1;
}

export function ReportScreen({ result }: { result: KatipTestResult }) {
  const { setView } = useView(views);
  const { formatNumber, formatPercents } = useIntlNumbers();
  const { speedUnit, formatSpeed } = useFormatter();

  const handleNext = () => setView("test");
  useHotkeys({ ["Enter"]: handleNext });

  const { correct: correctWords, incorrect: incorrectWords } = computeWords(
    result.targetText,
    result.typedText,
  );

  const accuracy = computeAccuracy(result.targetText, result.typedText);
  const totalCharsTyped = result.typedText.length;
  const speed = computeSpeed(totalCharsTyped, result.elapsedTime);
  const wpm =
    result.elapsedTime > 0
      ? Math.round((totalCharsTyped / 5) / (result.elapsedTime / 60_000))
      : 0;
  const errors = parseTyped(result.typedText).filter(
    (w, i) => w.length > 0 && w !== (result.targetText.split(" ")[i] ?? ""),
  ).length;

  const dSpeed = makeSpeedDistribution();
  const dAccuracy = makeAccuracyDistribution();
  const pSpeed = dSpeed.cdf(speed);
  const pAccuracy = dAccuracy.cdf(dAccuracy.scale(accuracy));

  const is3MinExam =
    result.duration.type === DurationType.Time &&
    result.duration.value === duration_3_minutes.value;

  return (
    <Screen>
      {is3MinExam && (
        <Para align="center">
          {correctWords >= KATIP_PASS_WORDS ? (
            <span className={styles.pass}>
              Sınavı Kazandınız! ({correctWords} doğru kelime)
            </span>
          ) : (
            <span className={styles.fail}>
              Sınavı Kaybettiniz. ({correctWords}/90 doğru kelime)
            </span>
          )}
        </Para>
      )}

      <Box alignItems="center" justifyContent="center">
        <Indicator
          name="Doğru Kelime"
          value={<Metric value={formatNumber(correctWords)} unit="kelime" />}
        />
        <Separator />
        <Indicator
          name="Yanlış Kelime"
          value={<Metric value={formatNumber(incorrectWords)} unit="kelime" />}
        />
        <Separator />
        <Indicator
          name="Hız (WPM)"
          note="Dakika başına kelime. Her 5 karakter 1 kelime sayılır."
          value={<Metric value={String(wpm)} unit="wpm" />}
        />
        <Separator />
        <Indicator
          name="Doğruluk"
          value={
            <Metric value={`${formatNumber(accuracy * 100, 2)}`} unit="%" />
          }
        />
      </Box>

      <Para align="center">
        <strong>
          ⚠ Bu uygulama yalnızca pratik amaçlıdır; resmi katiplik sınavı
          koşullarını tam olarak yansıtmayabilir.
        </strong>
      </Para>

      <Para align="center">
        <NameValue name="Hata" value={formatNumber(errors)} />
        <NameValue
          name="Süre"
          value={formatDuration(result.elapsedTime, { showMillis: false })}
        />
      </Para>

      <Box alignItems="center" justifyContent="center">
        <SpeedHistogram
          distribution={dSpeed}
          thresholds={[{ label: "Hız", value: speed }]}
          width="45rem"
          height="15rem"
        />
      </Box>

      <Para align="center">
        <Name>
          Diğer kullanıcıların <Value value={formatPercents(pSpeed)} /> kadarından
          daha hızlısınız.
        </Name>{" "}
        <Name>
          İlk <Value value={formatPercents(top(pSpeed))} /> içindesiniz.
        </Name>
      </Para>

      <Box alignItems="center" justifyContent="center">
        <AccuracyHistogram
          distribution={dAccuracy}
          thresholds={[{ label: "Doğruluk", value: accuracy }]}
          width="45rem"
          height="15rem"
        />
      </Box>

      <Para align="center">
        <Name>
          Diğer kullanıcıların <Value value={formatPercents(pAccuracy)} /> kadarından
          daha doğrusunuz.
        </Name>{" "}
        <Name>
          İlk <Value value={formatPercents(top(pAccuracy))} /> içindesiniz.
        </Name>
      </Para>

      <Spacer size={3} />

      <FieldList>
        <Field.Filler />
        <Field>
          <Button
            label="Yeni Test"
            icon={<Icon shape={mdiSkipNext} />}
            onClick={handleNext}
          />
        </Field>
        <Field.Filler />
      </FieldList>

      <Para align="center">
        Yeni bir teste başlamak için <Kbd>Enter</Kbd> tuşuna basın.
      </Para>
    </Screen>
  );
}

function Indicator({
  name,
  value,
  note,
}: {
  name: ReactNode;
  value: ReactNode;
  note?: ReactNode;
}) {
  return (
    <div className={styles.indicator}>
      <div className={styles.indicatorValue}>
        <Value>{value}</Value>
      </div>
      <div className={styles.indicatorName}>
        <Name>{name}</Name>
      </div>
      {note && <div className={styles.indicatorNote}>{note}</div>}
    </div>
  );
}

function Metric({ value, unit }: { value: ReactNode; unit: ReactNode }) {
  return (
    <>
      <span className={styles.valueLabel}>{value}</span>
      <span className={styles.unitLabel}>{unit}</span>
    </>
  );
}

function Separator() {
  return <div className={styles.separator} />;
}

function top(value: number) {
  return Math.max(0, 1 - value);
}
