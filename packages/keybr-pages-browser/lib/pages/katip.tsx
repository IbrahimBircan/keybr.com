import { KeyboardProvider } from "@keybr/keyboard";
import { KatipPage } from "@keybr/page-katip";
import { ResultLoader } from "@keybr/result-loader";

export default function Page() {
  return (
    <ResultLoader>
      <KeyboardProvider>
        <KatipPage />
      </KeyboardProvider>
    </ResultLoader>
  );
}