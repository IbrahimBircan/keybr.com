import { Book, type BookContent, flattenContent } from "@keybr/content";
import { BookContentLoader } from "@keybr/content-books";
import { useSettings } from "@keybr/settings";
import { Field, FieldList, FieldSet, OptionList, Para } from "@keybr/widget";
import { useMemo } from "react";
import { typingTestProps } from "../../../settings.ts";
import * as styles from "./BookSettings.module.less";

export function BookSettings() {
  return (
    <BookContentLoader book={Book.TR_KATIP}>
      {(bookContent) => <Content bookContent={bookContent} />}
    </BookContentLoader>
  );
}

type Chapter = {
  readonly title: string;
  readonly startIndex: number;
  readonly paragraphs: readonly string[];
};

function buildChapters(content: BookContent["content"]): readonly Chapter[] {
  const chapters: Chapter[] = [];
  let idx = 0;
  for (const [title, paragraphs] of content) {
    chapters.push({ title, startIndex: idx, paragraphs });
    idx += paragraphs.length;
  }
  return chapters;
}

function Content({ bookContent }: { bookContent: BookContent }) {
  const { settings, updateSettings } = useSettings();
  const chapters = useMemo(
    () => buildChapters(bookContent.content),
    [bookContent],
  );
  const paragraphIndex = settings.get(typingTestProps.bookParagraphIndex);

  const currentChapter =
    [...chapters].reverse().find((c) => c.startIndex <= paragraphIndex) ??
    chapters[0];

  return (
    <FieldSet legend="Sınav Metinleri">
      <Para>Yazılacak sınav metnini seçin.</Para>

      <FieldList>
        <Field>Metin:</Field>
        <Field>
          <OptionList
            options={chapters.map((c) => ({
              value: String(c.startIndex),
              name: c.title,
            }))}
            value={String(currentChapter?.startIndex ?? 0)}
            onSelect={(value) => {
              updateSettings(
                settings.set(typingTestProps.bookParagraphIndex, Number(value)),
              );
            }}
          />
        </Field>
      </FieldList>

      {currentChapter && (
        <div className={styles.preview}>
          {currentChapter.paragraphs.map((p, i) => (
            <p key={i} className={styles.previewParagraph}>
              {p}
            </p>
          ))}
        </div>
      )}
    </FieldSet>
  );
}
