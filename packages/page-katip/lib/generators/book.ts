import {
  type BookContent,
  flattenContent,
  splitParagraph,
} from "@keybr/content";
import { clamp } from "@keybr/lang";
import { type TextGenerator } from "./types.ts";

type BookSettings = {
  readonly paragraphIndex: number;
  readonly stripPunctuation: boolean;
  readonly stripCapitals: boolean;
};

type Mark = {
  readonly paragraphIndex: number;
  readonly wordIndex: number;
};

export class BookParagraphsGenerator implements TextGenerator<Mark> {
  readonly #paragraphs: readonly string[];
  readonly #stripPunctuation: boolean;
  readonly #stripCapitals: boolean;
  #paragraphIndex: number;
  #words: readonly string[] = [];
  #wordIndex: number = 0;

  constructor(settings: BookSettings, { content }: BookContent) {
    const paragraphs = flattenContent(content);
    const paragraphIndex = clamp(settings.paragraphIndex, 0, paragraphs.length);
    this.#paragraphs = paragraphs;
    this.#stripPunctuation = settings.stripPunctuation;
    this.#stripCapitals = settings.stripCapitals;
    this.#paragraphIndex = paragraphIndex;
    this.#words = splitParagraph(paragraphs[paragraphIndex]);
    this.#wordIndex = 0;
  }

  mark(): Mark {
    return {
      paragraphIndex: this.#paragraphIndex,
      wordIndex: this.#wordIndex,
    };
  }

  reset({ paragraphIndex, wordIndex }: Mark): void {
    this.#paragraphIndex = paragraphIndex;
    this.#words = splitParagraph(this.#paragraphs[this.#paragraphIndex]);
    this.#wordIndex = wordIndex;
  }

  nextWord(): string {
    if (this.#wordIndex >= this.#words.length) {
      this.#paragraphIndex += 1;
      if (this.#paragraphIndex >= this.#paragraphs.length) {
        this.#paragraphIndex = 0;
      }
      this.#words = splitParagraph(this.#paragraphs[this.#paragraphIndex]);
      this.#wordIndex = 0;
    }
    let word = this.#words[this.#wordIndex];
    this.#wordIndex += 1;
    if (this.#stripPunctuation) {
      word = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
    }
    if (this.#stripCapitals) {
      word = word.toLowerCase();
    }
    return word || this.nextWord();
  }
}
