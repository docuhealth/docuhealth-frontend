import { useState } from "react";
import type { TrendBucket, TrendSeries } from "@/features/patient/lib/vitals";
import { cn } from "@/lib/utils";

/** A round step for about four gridlines up to `max`: 1, 2, 2.5, 4 or 5 times a power of ten. */
function niceStep(max: number) {
  const raw = Math.max(max, 1) / 4;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 4, 5, 10].find((factor) => factor * power >= raw) ?? 10;
  return step * power;
}

/**
 * A vital's readings over time as grouped bars (one bar per series in each period) from a zero
 * baseline, with value labels on the caps, a shaded target band behind them, a hover/focus
 * tooltip per period, a legend for two or more series, and a table for screen readers.
 */
export function TrendChart({
  buckets,
  series,
  band,
  unit,
  caption,
}: {
  buckets: TrendBucket[];
  series: TrendSeries[];
  band: { low: number; high: number } | null;
  unit: string;
  caption: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, band?.high ?? 0, ...buckets.flatMap((bucket) => bucket.values));
  const step = niceStep(max);
  // Head-room over the tallest bar for its value label.
  const top = step * Math.ceil((max * 1.08) / step);
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, index) =>
    Number((index * step).toFixed(2)),
  );
  const at = (value: number) => `${(value / top) * 100}%`;
  // Labels on every cap while they fit; past that the tooltip and table carry the values.
  const labelled = buckets.length * series.length <= 16;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2" aria-hidden>
        {/* The value axis: recessive labels beside faint gridlines. */}
        <div className="relative h-56 w-7 shrink-0">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 translate-y-1/2 type-caption text-fg-caption tabular-nums"
              style={{ bottom: at(tick) }}
            >
              {tick}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-56">
            {band && (
              <div
                className="absolute inset-x-0 bg-success-100"
                style={{ bottom: at(band.low), height: at(band.high - band.low) }}
              />
            )}
            {ticks.map((tick) => (
              <div
                key={tick}
                className={cn(
                  "absolute inset-x-0 border-t",
                  tick === 0 ? "border-divider" : "border-line",
                )}
                style={{ bottom: at(tick) }}
              />
            ))}
            <div className="absolute inset-0 flex items-end">
              {buckets.map((bucket, index) => (
                <div
                  key={bucket.key}
                  className="relative flex h-full flex-1 items-end justify-center gap-0.5 px-1 outline-none"
                  // The whole column is the hover target, not just the bars.
                  onMouseEnter={() => setActive(index)}
                  onMouseLeave={() => setActive(null)}
                >
                  {bucket.values.map((value, slot) => (
                    <div
                      key={series[slot]?.name ?? slot}
                      className={cn(
                        "relative w-full max-w-5 rounded-t-[4px] transition-opacity",
                        series[slot]?.color,
                        active !== null && active !== index && "opacity-50",
                      )}
                      style={{ height: at(value) }}
                    >
                      {labelled && (
                        <span className="absolute bottom-full left-1/2 mb-0.5 -translate-x-1/2 type-caption text-fg-heading tabular-nums">
                          {value}
                        </span>
                      )}
                    </div>
                  ))}
                  {active === index && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 rounded-md border bg-card px-2.5 py-1.5 whitespace-nowrap shadow-sm">
                      <p className="type-caption text-fg-caption">{bucket.longLabel}</p>
                      {bucket.values.map((value, slot) => (
                        <p
                          key={series[slot]?.name ?? slot}
                          className="flex items-center gap-1.5 type-body-sm-medium text-fg-heading"
                        >
                          <span className={cn("h-0.5 w-2.5 rounded-full", series[slot]?.color)} />
                          {value} {unit}
                          {series.length > 1 && (
                            <span className="type-caption text-fg-caption">
                              {series[slot]?.name}
                            </span>
                          )}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex">
            {buckets.map((bucket) => (
              <span
                key={bucket.key}
                className="flex-1 truncate text-center type-caption text-fg-caption"
              >
                {bucket.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      {(series.length > 1 || band) && (
        <ul aria-label="Legend" className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {series.length > 1 &&
            series.map((entry) => (
              <li key={entry.name} className="flex items-center gap-1.5 type-caption text-fg-body">
                <span aria-hidden className={cn("size-2.5 rounded-full", entry.color)} />
                {entry.name}
              </li>
            ))}
          {band && (
            <li className="flex items-center gap-1.5 type-caption text-fg-body">
              <span aria-hidden className="size-2.5 rounded-full bg-success-100" />
              Target range
            </li>
          )}
        </ul>
      )}
      {/* The chart's numbers, for screen readers. */}
      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            {series.map((entry) => (
              <th key={entry.name} scope="col">
                {entry.name} ({unit})
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {buckets.map((bucket) => (
            <tr key={bucket.key}>
              <th scope="row">{bucket.longLabel}</th>
              {bucket.values.map((value, slot) => (
                <td key={series[slot]?.name ?? slot}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
