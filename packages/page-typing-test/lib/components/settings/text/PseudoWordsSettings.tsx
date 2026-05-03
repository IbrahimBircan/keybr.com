import { useIntlDisplayNames } from "@keybr/intl";
import { Language } from "@keybr/keyboard";
import { Alphabet, Filter, type PhoneticModel } from "@keybr/phonetic-model";
import { PhoneticModelLoader } from "@keybr/phonetic-model-loader";
import { useSettings } from "@keybr/settings";
import { Field, FieldList, FieldSet, OptionList, Para } from "@keybr/widget";
import { useIntl } from "react-intl";
import { typingTestProps } from "../../../settings.ts";

export function PseudoWordsSettings() {
  const { settings } = useSettings();
  return (
    <PhoneticModelLoader language={settings.get(typingTestProps.language)}>
      {(model) => <Content model={model} />}
    </PhoneticModelLoader>
  );
}

function Content({ model }: { model: PhoneticModel }) {
  const { settings, updateSettings } = useSettings();
  const { formatMessage } = useIntl();
  const { formatLanguageName } = useIntlDisplayNames();
  const words = [];
  for (let i = 0; i < 50; i++) {
    words.push(model.nextWord(Filter.empty));
  }
  return (
    <FieldSet legend="Sözde kelimeler">
      <Para>
        Dilinizin fonetik kurallarına göre bir algoritma tarafından üretilen sözde kelimeleri yazın.
      </Para>

      <FieldList>
        <Field>
          {formatMessage({
            id: "t_Language:",
            defaultMessage: "Dil:",
          })}
        </Field>

        <Field>
          <OptionList
            options={Language.ALL.map((item) => ({
              value: item.id,
              name: formatLanguageName(item.id),
            }))}
            value={String(settings.get(typingTestProps.language))}
            onSelect={(id) => {
              updateSettings(
                settings.set(typingTestProps.language, Language.ALL.get(id)),
              );
            }}
          />
        </Field>
      </FieldList>

      <FieldList>
        <Field>Alfabe:</Field>
        <Field>
          <Alphabet model={model} />
        </Field>
      </FieldList>

      <FieldList>
        <Field>Örnek:</Field>
        <Field>
          <em>{words.join(" ")}</em>
        </Field>
      </FieldList>
    </FieldSet>
  );
}
