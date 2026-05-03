import { KatipTestScreen } from "./components/KatipTestScreen.tsx";
import { ReportScreen } from "./components/ReportScreen.tsx";
import { SettingsScreen } from "./components/SettingsScreen.tsx";

export const views = {
  test: KatipTestScreen,
  report: ReportScreen,
  settings: SettingsScreen,
} as const;
