import { useState } from "react";
import { cn } from "@/lib/utils";

export type Bar = {
  key: string;
  /** Under the bar, e.g. "Oct". */
  label: string;
  /** In the tooltip and for screen readers, e.g. "October 2026". */
  longLabel: string;
  value: number;
};

/**
 * One series as bars (so one color), with a few round gridlines up the side and a tooltip on
 * hover. `describe` words a bar's value, e.g. "3 drugs"; `caption` and `columns` name the table
 * screen readers get instead.
 */
export function BarChart({
  bars,
  describe,
  caption,
  columns,
}: {
  bars: Bar[];
  describe: (value: number) => string;
  caption: string;
  columns: [string, string];
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...bars.map(({ value }) => value));
  // A few round gridlines up the side, e.g. 0, 5, 10.
  const step = Math.max(1, Math.ceil(max / 4));
  const top = step * Math.ceil(max / step);
  const ticks = Array.from({ length: Math.floor(top / step) + 1 }, (_, index) => index * step);
  // Label every other bar when there are many, so they don't collide.
  const labelEvery = bars.length > 8 ? 2 : 1;

  return (
    <>
      <div className="mt-4 flex gap-2" aria-hidden>
        {/* The value axis: recessive labels beside faint gridlines. */}
        <div className="relative h-48 w-6 shrink-0">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 translate-y-1/2 type-caption text-fg-caption"
              style={{ bottom: `${(tick / top) * 100}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-48">
            {ticks.map((tick) => (
              <div
                key={tick}
                className={cn(
                  "absolute inset-x-0 border-t",
                  tick === 0 ? "border-divider" : "border-line",
                )}
                style={{ bottom: `${(tick / top) * 100}%` }}
              />
            ))}
            <div className="absolute inset-0 flex items-end gap-0.5">
              {bars.map((bar, index) => (
                <div
                  key={bar.key}
                  className="group relative flex h-full flex-1 items-end justify-center"
                  // The whole column is the hover target, not just the bar.
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div
                    className={cn(
                      "w-full max-w-8 rounded-t-[4px] bg-primary transition-opacity",
                      hovered !== null && hovered !== index && "opacity-50",
                    )}
                    style={{ height: `${(bar.value / top) * 100}%` }}
                  />
                  {hovered === index && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 rounded-md border bg-card px-2.5 py-1.5 whitespace-nowrap shadow-sm">
                      <p className="type-caption text-fg-caption">{bar.longLabel}</p>
                      <p className="type-body-sm-medium text-fg-heading">{describe(bar.value)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex gap-0.5">
            {bars.map((bar, index) => (
              <span
                key={bar.key}
                className="flex-1 truncate text-center type-caption text-fg-caption"
              >
                {index % labelEvery === 0 ? bar.label : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* The chart's numbers, for screen readers. */}
      {bars.length > 0 && (
        <table className="sr-only">
          <caption>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">{columns[0]}</th>
              <th scope="col">{columns[1]}</th>
            </tr>
          </thead>
          <tbody>
            {bars.map((bar) => (
              <tr key={bar.key}>
                <th scope="row">{bar.longLabel}</th>
                <td>{bar.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
