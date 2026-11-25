import { HospitalIcon } from "@phosphor-icons/react";
import { useState } from "react";
import type { VitalReading } from "@/features/patient/api/schemas";
import { TrendPeriodSwitch } from "@/features/patient/components/trend-period-switch";
import { TrendChart, type TrendSeries } from "@/features/patient/components/trend-chart";
import {
  latestWith,
  targetRanges,
  type TrendPeriod,
  trendBuckets,
  type VitalKey,
  vitalLabels,
  vitalUnits,
  vitalValue,
} from "@/features/patient/lib/vitals";
import { formatDay } from "@/lib/format";

const periods: { value: TrendPeriod; label: string }[] = [
  { value: "all", label: "All" },
  { value: "1y", label: "1Y" },
  { value: "5y", label: "5Y" },
];

const periodWords: Record<TrendPeriod, string> = {
  all: "since your first reading",
  "1y": "in the last year",
  "5y": "in the last 5 years",
};

/** The vital's latest reading, and its history as a bar chart over the chosen period. */
export function TrendLatestCard({
  readings,
  vital,
}: {
  readings: VitalReading[];
  vital: VitalKey;
}) {
  const [period, setPeriod] = useState<TrendPeriod>("all");
  const latest = latestWith(readings, vital);
  const buckets = trendBuckets(readings, vital, period);
  const unit = vitalUnits[vital];
  const series: TrendSeries[] =
    vital === "bloodPressure"
      ? [
          { name: "Systolic", color: "bg-info-500" },
          { name: "Diastolic", color: "bg-warning-500" },
        ]
      : [{ name: vitalLabels[vital], color: "bg-info-500" }];

  return (
    <section
      aria-labelledby="latest-reading"
      className="flex flex-col gap-4 rounded-xl border bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="latest-reading" className="type-body-sm-medium text-fg-heading">
          Latest reading
        </h2>
        <TrendPeriodSwitch value={period} options={periods} onChange={setPeriod} />
      </div>
      {latest ? (
        <div className="flex flex-col gap-1">
          <p className="type-accent-h1 text-fg-heading">
            {vitalValue(latest, vital)}{" "}
            <span className="type-accent-h4 text-fg-caption">{unit}</span>
          </p>
          <p className="flex items-center gap-1.5 type-caption text-fg-caption">
            <HospitalIcon className="size-3.5" aria-hidden />
            {[formatDay(new Date(latest.at)), latest.facility].filter(Boolean).join(" · ")}
          </p>
        </div>
      ) : (
        <p className="type-body-sm-regular text-fg-caption">
          No {vitalLabels[vital].toLowerCase()} readings yet.
        </p>
      )}
      {buckets.length > 0 ? (
        <TrendChart
          key={vital}
          buckets={buckets}
          series={series}
          band={targetRanges[vital] ?? null}
          unit={unit}
          caption={`${vitalLabels[vital]} ${periodWords[period]}: the latest reading of each ${period === "1y" ? "month" : "year"}`}
        />
      ) : (
        latest && (
          <p className="py-10 text-center type-body-sm-regular text-fg-caption">
            No readings {periodWords[period]}.
          </p>
        )
      )}
    </section>
  );
}
