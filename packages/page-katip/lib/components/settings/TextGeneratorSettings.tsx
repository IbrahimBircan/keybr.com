import { useSettings } from "@keybr/settings";
import { CheckBox, Field, FieldList, FieldSet } from "@keybr/widget";
import { katipProps } from "../../settings.ts";
import { BookSettings } from "./text/BookSettings.tsx";

export function TextGeneratorSettings() {
  const { settings, updateSettings } = useSettings();
  return (
    <>
      <BookSettings />

      <FieldSet legend="Metin Seçenekleri">
        <FieldList>
          <Field>
            <CheckBox
              label="Noktalama işaretlerini kaldır"
              checked={settings.get(katipProps.stripPunctuation)}
              onChange={(value) => {
                updateSettings(settings.set(katipProps.stripPunctuation, value));
              }}
            />
          </Field>
        </FieldList>
        <FieldList>
          <Field>
            <CheckBox
              label="Büyük harfleri küçült"
              checked={settings.get(katipProps.stripCapitals)}
              onChange={(value) => {
                updateSettings(settings.set(katipProps.stripCapitals, value));
              }}
            />
          </Field>
        </FieldList>
      </FieldSet>
    </>
  );
}
