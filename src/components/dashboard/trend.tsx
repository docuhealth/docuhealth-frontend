import { ArrowCircleDownIcon, ArrowCircleUpIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * A stat card's note: "12% vs. last 7 days", with the change and its arrow (up or down) in green
 * when it's good news and red when it isn't. `amount` replaces the "12%", e.g. "2 fewer".
 */
export function Trend({
  change,
  since,
  goodWhen = "up",
  amount = `${Math.abs(change)}%`,
}: {
  change: number;
  since: string;
  goodWhen?: "up" | "down";
  amount?: string;
}) {
  const up = change >= 0;
  const Arrow = up ? ArrowCircleUpIcon : ArrowCircleDownIcon;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span
        className={cn(
          "inline-flex items-center gap-1",
          up === (goodWhen === "up") ? "text-success-500" : "text-error-500",
        )}
      >
        <Arrow weight="fill" className="size-4" />
        <span className="sr-only">{up ? "Up" : "Down"}</span>
        {amount}
      </span>
      vs. {since}
    </span>
  );
}
