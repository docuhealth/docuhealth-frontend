import { useState } from "react";

/**
 * The text in a masked field whose form value only exists once the text is complete (a date,
 * a time). Typing keeps whatever's half-typed; a value set from outside (a picker, a reset)
 * rewrites the text.
 */
export function useTypedValue({
  value,
  onChange,
  toText,
  parse,
}: {
  value: string;
  onChange: (value: string) => void;
  /** The text for a value. */
  toText: (value: string) => string;
  /** The value for some text, or "" while it isn't one yet. */
  parse: (text: string) => string;
}) {
  const [text, setText] = useState(() => toText(value));
  const [shown, setShown] = useState(value);

  // Adjusting state while rendering, as React suggests, rather than in an effect.
  if (value !== shown) {
    setShown(value);
    if (parse(text) !== value) setText(toText(value));
  }

  function type(next: string) {
    setText(next);
    const parsed = parse(next);
    setShown(parsed);
    if (parsed !== value) onChange(parsed);
  }

  return { text, type };
}
