import { Book } from "@keybr/content";
import { BookContentLoader } from "@keybr/content-books";
import { type ReactNode } from "react";
import { TextSourceType, useCompositeSettings } from "../settings.ts";
import { BookParagraphsGenerator } from "./book.ts";
import { type TextGenerator } from "./types.ts";

export function TextGeneratorLoader({
  children,
}: {
  children: (generator: TextGenerator) => ReactNode;
}) {
  const { textSource, stripPunctuation, stripCapitals } = useCompositeSettings();
  const paragraphIndex =
    textSource.type === TextSourceType.Book ? textSource.paragraphIndex : 0;
  return (
    <BookContentLoader book={Book.TR_KATIP}>
      {(bookContent) =>
        children(
          new BookParagraphsGenerator(
            { paragraphIndex, stripPunctuation, stripCapitals },
            bookContent,
          ),
        )
      }
    </BookContentLoader>
  );
}
