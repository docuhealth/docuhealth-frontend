import { useState } from "react";
import type { DependantExtras } from "@/features/patient/api/pending-family";
import { TrendChart } from "@/features/patient/components/trend-chart";
import { TrendPeriodSwitch } from "@/features/patient/components/trend-period-switch";
import { growthBuckets, percentileLabel } from "@/features/patient/lib/family";

type Measure = keyof DependantExtras["growth"];

const measures: { value: Measure; label: string }[] = [
  { value: "weight", label: "Weight" },
  { value: "height", label: "Height" },
  { value: "bmi", label: "BMI" },
];

const series = [{ name: "Reading", color: "bg-info-500" }];

/**
 * A child's growth: weight, height or BMI, the latest reading and its percentile, and a bar per
 * year of age. `growth` is null when there's none on record. TODO(api): growth is pending data.
 */
export function DependantGrowthCard({
  name,
  growth,
}: {
  name: string;
  growth: DependantExtras["growth"] | null;
}) {
  const [measure, setMeasure] = useState<Measure>("weight");
  const metric = growth?.[measure];
  const latest = metric?.points.at(-1);
  const label = measures.find((each) => each.value === measure)!.label;

  return (
    <section
      aria-labelledby="growth-heading"
      className="flex flex-col gap-4 rounded-xl border bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="growth-heading" className="type-body-sm-medium text-fg-heading">
          Growth
        </h2>
        <TrendPeriodSwitch value={measure} options={measures} onChange={setMeasure} />
      </div>
      {metric && latest ? (
        <>
          <div className="flex flex-col gap-1">
            <p className="type-accent-h1 text-fg-heading">
              {latest.value} <span className="type-accent-h4 text-fg-caption">{metric.unit}</span>
            </p>
            {metric.percentile !== null && (
              <p className="type-caption text-fg-caption">{percentileLabel(metric.percentile)}</p>
            )}
          </div>
          <TrendChart
            key={measure}
            buckets={growthBuckets(metric)}
            series={series}
            band={null}
            unit={metric.unit}
            caption={`${name}’s ${label.toLowerCase()} by age`}
          />
        </>
      ) : (
        <p className="py-10 text-center type-body-sm-regular text-fg-caption">
          No {label === "BMI" ? "BMI" : label.toLowerCase()} readings yet.
        </p>
      )}
    </section>
  );
}
