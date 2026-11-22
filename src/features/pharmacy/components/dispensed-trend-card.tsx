import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { dispensedTrendQuery } from "@/features/pharmacy/api/queries";
import {
  type DispensedTrend,
  type TrendPeriod,
  trendPeriodLabels,
} from "@/features/pharmacy/api/schemas";
import { cn } from "@/lib/utils";

const DAY = 24 * 60 * 60_000;

/** A period's start as the API buckets it (UTC), e.g. "2026-10" for October. */
function bucketKey(date: Date, period: TrendPeriod) {
  const iso = date.toISOString();
  return period === "monthly"
    ? iso.slice(0, 7)
    : period === "yearly"
      ? iso.slice(0, 4)
      : iso.slice(0, 10);
}

/**
 * Every bar the chart shows: the API only sends periods with drugs dispensed, so the days and
 * months between come in at zero (the last 14 days, the last 12 months); weeks and years show as
 * sent.
 */
function barsFor(trend: DispensedTrend, period: TrendPeriod, now: Date) {
  const counts = new Map(
    trend.map(({ date, count }) => [bucketKey(new Date(date), period), count]),
  );
  if (period === "daily" || period === "monthly") {
    const steps = period === "daily" ? 14 : 12;
    return Array.from({ length: steps }, (_, index) => {
      const back = steps - 1 - index;
      const date =
        period === "daily"
          ? new Date(now.getTime() - back * DAY)
          : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
      return { date, count: counts.get(bucketKey(date, period)) ?? 0 };
    });
  }
  return trend.map(({ date, count }) => ({ date: new Date(date), count }));
}

const labelOf = (date: Date, period: TrendPeriod) =>
  period === "yearly"
    ? String(date.getUTCFullYear())
    : period === "monthly"
      ? date.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })
      : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

const longLabelOf = (date: Date, period: TrendPeriod) =>
  period === "yearly"
    ? String(date.getUTCFullYear())
    : period === "monthly"
      ? date.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })
      : period === "weekly"
        ? `Week of ${date.toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" })}`
        : date.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "long",
            timeZone: "UTC",
          });

/** Drugs dispensed per day, week, month or year, as bars: one series, so one color. */
export function DispensedTrendCard() {
  const [period, setPeriod] = useState<TrendPeriod>("monthly");
  const { data, isError } = useQuery(dispensedTrendQuery(period));
  // When the page opened, for the last 14 days and 12 months.
  const [now] = useState(() => new Date());
  const [hovered, setHovered] = useState<number | null>(null);

  const bars = data ? barsFor(data, period, now) : [];
  const max = Math.max(1, ...bars.map(({ count }) => count));
  // A few round gridlines up the side, e.g. 0, 5, 10.
  const step = Math.max(1, Math.ceil(max / 4));
  const top = step * Math.ceil(max / step);
  const ticks = Array.from({ length: Math.floor(top / step) + 1 }, (_, index) => index * step);
  const total = bars.reduce((sum, { count }) => sum + count, 0);
  // Label every other bar when there are many, so they don't collide.
  const labelEvery = bars.length > 8 ? 2 : 1;

  return (
    <DashboardCard
      title="Dispensed drugs"
      action={
        <FilterSelect
          label="Period"
          size="sm"
          value={period}
          options={trendPeriodLabels}
          onChange={(next) => {
            setPeriod(next);
            setHovered(null);
          }}
        />
      }
    >
      <p className="mt-1 type-body-sm-regular text-fg-caption">
        {data ? `${total.toLocaleString("en-GB")} drugs in this view` : " "}
      </p>
      {isError ? (
        <p className="py-16 text-center type-body-sm-regular text-fg-caption">
          We couldn’t load the trend. Try again in a moment.
        </p>
      ) : data && bars.length === 0 ? (
        <p className="py-16 text-center type-body-sm-regular text-fg-caption">
          No drugs have been dispensed yet.
        </p>
      ) : (
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
                    key={bar.date.toISOString()}
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
                      style={{ height: `${(bar.count / top) * 100}%` }}
                    />
                    {hovered === index && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 rounded-md border bg-card px-2.5 py-1.5 whitespace-nowrap shadow-sm">
                        <p className="type-caption text-fg-caption">
                          {longLabelOf(bar.date, period)}
                        </p>
                        <p className="type-body-sm-medium text-fg-heading">
                          {bar.count} {bar.count === 1 ? "drug" : "drugs"}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 flex gap-0.5">
              {bars.map((bar, index) => (
                <span
                  key={bar.date.toISOString()}
                  className="flex-1 truncate text-center type-caption text-fg-caption"
                >
                  {index % labelEvery === 0 ? labelOf(bar.date, period) : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* The chart's numbers, for screen readers. */}
      {bars.length > 0 && (
        <table className="sr-only">
          <caption>Dispensed drugs, {trendPeriodLabels[period].toLowerCase()}</caption>
          <thead>
            <tr>
              <th scope="col">Period</th>
              <th scope="col">Drugs dispensed</th>
            </tr>
          </thead>
          <tbody>
            {bars.map((bar) => (
              <tr key={bar.date.toISOString()}>
                <th scope="row">{longLabelOf(bar.date, period)}</th>
                <td>{bar.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardCard>
  );
}
