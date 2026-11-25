import { useState } from "react";
import { TrendChart } from "@/features/patient/components/trend-chart";
import { TrendPeriodSwitch } from "@/features/patient/components/trend-period-switch";
import {
  type LabTest,
  rangeBand,
  type ResultPeriod,
  type ResultValue,
  valueTrend,
} from "@/features/patient/lib/results";

const periods: { value: ResultPeriod; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "1y", label: "1 Year" },
  { value: "3y", label: "3 Years" },
];

const periodWords: Record<ResultPeriod, string> = {
  all: "since your first test",
  "1y": "in the last year",
  "3y": "in the last 3 years",
};

/** A value's readings over time as bars, with its normal range shaded behind them. */
export function ResultTrendCard({ value, test }: { value: ResultValue; test: LabTest }) {
  const [period, setPeriod] = useState<ResultPeriod>("all");
  const buckets = valueTrend(value, test, period);

  return (
    <section
      aria-labelledby="result-trend"
      className="flex flex-col gap-4 rounded-xl border bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="result-trend" className="type-body-sm-medium text-fg-heading">
          Your trend
        </h2>
        <TrendPeriodSwitch value={period} options={periods} onChange={setPeriod} />
      </div>
      {buckets.length > 0 ? (
        <TrendChart
          buckets={buckets}
          series={[{ name: value.name, color: "bg-info-500" }]}
          band={rangeBand(value)}
          unit={value.unit}
          caption={`${value.name} ${periodWords[period]}`}
        />
      ) : (
        <p className="py-10 text-center type-body-sm-regular text-fg-caption">
          No readings {periodWords[period]}.
        </p>
      )}
    </section>
  );
}
