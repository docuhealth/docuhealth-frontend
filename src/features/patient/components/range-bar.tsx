import { cn } from "@/lib/utils";

const markers = {
  low: "border-warning-500",
  normal: "border-success-500",
  high: "border-error-500",
};

/**
 * A value against its normal range: three equal zones (low in amber, normal in green, high in
 * red) and a ringed marker at `position` (0–100) in its zone's color. Decorative: the card says
 * the same in words.
 */
export function RangeBar({ position, flag }: { position: number; flag: keyof typeof markers }) {
  return (
    <div aria-hidden className="relative py-1.5">
      <div className="flex gap-1">
        <span className="h-1.5 flex-1 rounded-full bg-warning-100" />
        <span className="h-1.5 flex-1 rounded-full bg-success-100" />
        <span className="h-1.5 flex-1 rounded-full bg-error-100" />
      </div>
      <span
        className={cn(
          "absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] bg-card",
          markers[flag],
        )}
        style={{ left: `${position}%` }}
      />
    </div>
  );
}
