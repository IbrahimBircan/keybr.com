import {
  AccuracyHistogram,
  makeAccuracyDistribution,
  makeSpeedDistribution,
  RollingSpeedChart,
  SpeedHistogram,
  TimeToTypeHistogram,
} from "@keybr/chart";
import { useIntlNumbers } from "@keybr/intl";
import { useFormatter } from "@keybr/lesson-ui";
import { Screen } from "@keybr/pages-shared";
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
import { type TestResult } from "../session/index.ts";
import { views } from "../views.tsx";
import { Replay } from "./Replay.tsx";
import * as styles from "./ReportScreen.module.less";

export function ReportScreen({ result }: { result: TestResult }) {
  const { setView } = useView(views);
  const { formatNumber, formatPercents } = useIntlNumbers();
  const { speedUnit, formatSpeed } = useFormatter();

  const handleNext = () => setView("test");

  useHotkeys({
    ["Enter"]: handleNext,
  });

  const { time, speed, length, errors, accuracy } = result.stats;

  const dSpeed = makeSpeedDistribution();
  const dAccuracy = makeAccuracyDistribution();
  const pSpeed = dSpeed.cdf(speed);
  const pAccuracy = dAccuracy.cdf(dAccuracy.scale(accuracy));

  return (
    <Screen>
      <Box alignItems="center" justifyContent="center">
        <Indicator
          name="Hız"
          value={
            <Metric
              value={formatSpeed(speed, { unit: false })}
              unit={speedUnit.id}
            />
          }
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
        <NameValue name="Karakter" value={formatNumber(length)} />
        <NameValue name="Hata" value={formatNumber(errors)} />
        <NameValue
          name="Süre"
          value={formatDuration(time, { showMillis: true })}
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
          Diğer kullanıcıların <Value value={formatPercents(pSpeed)} /> kısmından daha hızlısınız.
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
          Diğer kullanıcıların <Value value={formatPercents(pAccuracy)} /> kısmından daha doğrusunuz.
        </Name>{" "}
        <Name>
          İlk <Value value={formatPercents(top(pAccuracy))} /> içindesiniz.
        </Name>
      </Para>

      <Box alignItems="center" justifyContent="center">
        <TimeToTypeHistogram
          steps={result.steps}
          width="45rem"
          height="15rem"
        />
      </Box>

      <Para align="center">Bir karakteri yazma süresi histogramı.</Para>

      <Box alignItems="center" justifyContent="center">
        <RollingSpeedChart
          stats={result.stats}
          steps={result.steps}
          width="45rem"
          height="15rem"
        />
      </Box>

      <Para align="center">Zaman içinde yazma hızı değişim grafiği.</Para>

      <Spacer size={3} />

      <Replay result={result} />

      <Spacer size={3} />

      <FieldList>
        <Field.Filler />
        <Field>
          <Button
            label="Sonraki test"
            icon={<Icon shape={mdiSkipNext} />}
            onClick={handleNext}
          />
        </Field>
        <Field.Filler />
      </FieldList>

      <Para align="center">
        Yeni bir test başlatmak için <Kbd>Enter</Kbd> tuşuna basın.
      </Para>
    </Screen>
  );
}

function Indicator({ name, value }: { name: ReactNode; value: ReactNode }) {
  return (
    <div className={styles.indicator}>
      <div className={styles.indicatorValue}>
        <Value>{value}</Value>
      </div>
      <div className={styles.indicatorName}>
        <Name>{name}</Name>
      </div>
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
  return Math.max(0, 1 - value); // Takes care of negative zero.
}
