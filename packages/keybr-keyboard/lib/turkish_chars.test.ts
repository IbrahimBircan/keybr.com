import { test } from "node:test";
import { equal } from "rich-assert";
import { KeyModifier } from "./keymodifier.ts";
import { Layout } from "./layout.ts";
import { loadKeyboard } from "./load.ts";

test("Turkish specific characters mapping", () => {
  const keyboard = loadKeyboard(Layout.TR_TR_Q);
  const { None, Shift } = KeyModifier;

  // Character mappings for Turkish QWERTY (ISO-102)
  // ş: Semicolon (0x15f)
  // Ş: Semicolon (0x15e)
  // ç: Period (0xe7)
  // Ç: Period (0xc7)
  // ö: Comma (0xf6)
  // Ö: Comma (0xd6)
  // ğ: BracketLeft (0x11f)
  // Ğ: BracketLeft (0x11e)
  // ü: BracketRight (0xfc)
  // Ü: BracketRight (0xdc)
  // ı: KeyI (0x131)
  // I: KeyI (0x49)
  // i: Quote (0x69)
  // İ: Quote (0x130)

  const testChars = [
    { char: 0x015f, key: "Semicolon", mod: None },
    { char: 0x015e, key: "Semicolon", mod: Shift },
    { char: 0x00e7, key: "Period", mod: None },
    { char: 0x00c7, key: "Period", mod: Shift },
    { char: 0x00f6, key: "Comma", mod: None },
    { char: 0x00d6, key: "Comma", mod: Shift },
    { char: 0x011f, key: "BracketLeft", mod: None },
    { char: 0x011e, key: "BracketLeft", mod: Shift },
    { char: 0x00fc, key: "BracketRight", mod: None },
    { char: 0x00dc, key: "BracketRight", mod: Shift },
    { char: 0x0131, key: "KeyI", mod: None },
    { char: 0x0049, key: "KeyI", mod: Shift },
    { char: 0x0069, key: "Quote", mod: None },
    { char: 0x0130, key: "Quote", mod: Shift },
  ];

  for (const { char, key, mod } of testChars) {
    const combo = keyboard.getCombo(char);
    equal(combo?.id, key, `Character 0x${char.toString(16)} should be on key ${key}`);
    equal(combo?.modifier, mod, `Character 0x${char.toString(16)} should have modifier ${mod}`);
  }
});
