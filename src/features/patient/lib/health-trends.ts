import type { LabResult } from "@/features/patient/api/pending";
import type { LabReading } from "@/features/patient/api/pending-health";
import type { VisitSummary, VitalReading } from "@/features/patient/api/schemas";
import {
  type TrendMetric,
  type TrendPoint,
  type VitalStatus,
  vitalTrend,
} from "@/features/patient/lib/vitals";

// The Health page's Trends: blood pressure and weight from the vital signs, and HbA1c,
// haemoglobin and creatinine from lab results (the visits' results, then earlier values from
// the pending lab history). The bands are usual adult reference ranges, a guide only.

export type HealthTrendKey = "bloodPressure" | "weight" | "hba1c" | "haemoglobin" | "creatinine";

export const healthTrendOptions: { value: HealthTrendKey; label: string }[] = [
  { value: "bloodPressure", label: "Blood pressure" },
  { value: "weight", label: "Weight" },
  { value: "hba1c", label: "HbA1c" },
  { value: "haemoglobin", label: "Haemoglobin" },
  { value: "creatinine", label: "Creatinine" },
];

type LabKey = Exclude<HealthTrendKey, "bloodPressure" | "weight">;

const labMetrics: Record<
  LabKey,
  { label: string; names: string[]; unit: string; band: { low: number; high: number } }
> = {
  // Under 5.7 % is the usual non-diabetic range.
  hba1c: { label: "HbA1c", names: ["hba1c"], unit: "%", band: { low: 4, high: 5.6 } },
  // Adult range across sexes, roughly 12–17 g/dL.
  haemoglobin: {
    label: "Haemoglobin",
    names: ["haemoglobin", "hemoglobin", "hb"],
    unit: "g/dL",
    band: { low: 12, high: 17 },
  },
  creatinine: {
    label: "Creatinine",
    names: ["creatinine"],
    unit: "µmol/L",
    band: { low: 60, high: 110 },
  },
};

const flagStatus: Record<LabReading["flag"], VitalStatus> = {
  normal: { level: "normal", severe: false },
  high: { level: "high", severe: false },
  low: { level: "low", severe: true },
};

/** A lab value's readings over time, newest first: the visits' results, then earlier ones. */
function labTrend(
  key: LabKey,
  results: LabResult[],
  visits: VisitSummary[],
  history: LabReading[],
): TrendMetric {
  const metric = labMetrics[key];
  const matches = (name: string) => metric.names.includes(name.trim().toLowerCase());
  const fromVisits = results.flatMap((result) => {
    const visit = visits.find((candidate) => candidate.id === result.visitId);
    const entry = result.values.find((value) => matches(value.name));
    const value = entry ? Number(entry.value) : Number.NaN;
    if (!visit || !entry || !Number.isFinite(value)) return [];
    return [
      {
        id: `${result.visitId}-${result.test}`,
        at: visit.at,
        facility: visit.facility,
        values: [value],
        value: entry.value,
        status: flagStatus[entry.flag],
        unit: entry.unit,
      },
    ];
  });
  const earlier = history
    .filter((reading) => matches(reading.name))
    .map((reading) => ({
      id: reading.id,
      at: reading.at,
      facility: reading.facility,
      values: [reading.value],
      value: String(reading.value),
      status: flagStatus[reading.flag],
      unit: reading.unit,
    }));
  const points = [...fromVisits, ...earlier].sort((a, b) => b.at.localeCompare(a.at));
  return {
    label: metric.label,
    unit: points[0]?.unit || metric.unit,
    series: [{ name: metric.label, color: "bg-info-500" }],
    band: metric.band,
    points: points.map(({ unit: _unit, ...point }): TrendPoint => point),
  };
}

/** One of the Health Trends chips' trends. */
export function healthTrend(
  key: HealthTrendKey,
  sources: {
    vitals: VitalReading[];
    results: LabResult[];
    visits: VisitSummary[];
    history: LabReading[];
  },
): TrendMetric {
  if (key === "bloodPressure" || key === "weight") return vitalTrend(sources.vitals, key);
  return labTrend(key, sources.results, sources.visits, sources.history);
}
