import type { ComponentProps } from "react";
import { Trend } from "@/components/dashboard/trend";

// For stat cards whose figure the backend doesn't send yet: the card stays, with a muted dash
// and "Not available yet" in place of the number and its change.

/** A count, or a muted dash while there's no figure. */
export function Figure({ value }: { value: number | null }) {
  return value === null ? (
    <span className="text-fg-caption">—</span>
  ) : (
    <>{value.toLocaleString("en-GB")}</>
  );
}

/** The change since `since`, or "Not available yet" while there's no figure. */
export function Change({
  change,
  ...props
}: Omit<ComponentProps<typeof Trend>, "change"> & { change: number | null }) {
  return change === null ? <>Not available yet</> : <Trend change={change} {...props} />;
}
