import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BarChart } from "@/components/dashboard/bar-chart";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { dispensedTrendQuery } from "@/features/pharmacy/api/queries";
import {
  type DispensedTrend,
  type TrendPeriod,
  trendPeriodLabels,
} from "@/features/pharmacy/api/schemas";

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

  const bars = data ? barsFor(data, period, now) : [];
  const total = bars.reduce((sum, { count }) => sum + count, 0);

  return (
    <DashboardCard
      title="Dispensed drugs"
      action={
        <FilterSelect
          label="Period"
          size="sm"
          value={period}
          options={trendPeriodLabels}
          onChange={setPeriod}
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
        <BarChart
          key={period}
          bars={bars.map((bar) => ({
            key: bar.date.toISOString(),
            label: labelOf(bar.date, period),
            longLabel: longLabelOf(bar.date, period),
            value: bar.count,
          }))}
          describe={(count) => `${count} ${count === 1 ? "drug" : "drugs"}`}
          caption={`Dispensed drugs, ${trendPeriodLabels[period].toLowerCase()}`}
          columns={["Period", "Drugs dispensed"]}
        />
      )}
    </DashboardCard>
  );
}
