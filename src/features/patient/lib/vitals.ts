import type { VitalReading } from "@/features/patient/api/schemas";

// Working out the Vital signs and Trends pages from the patient's readings (newest first):
// where each reading sits against usual adult ranges, how weight has moved, earlier readings by
// visit, and a vital's readings bucketed for the Trends chart. The ranges are widely used adult
// reference ranges, worded plainly; they are a guide, not a diagnosis.

/** The eight vital signs a reading can hold, in the order the pages show them. */
export type VitalKey =
  | "bloodPressure"
  | "heartRate"
  | "temperature"
  | "spo2"
  | "weight"
  | "bmi"
  | "height"
  | "breathingRate";

export const vitalKeys: VitalKey[] = [
  "bloodPressure",
  "heartRate",
  "temperature",
  "spo2",
  "weight",
  "bmi",
  "height",
  "breathingRate",
];

export const vitalLabels: Record<VitalKey, string> = {
  bloodPressure: "Blood pressure",
  heartRate: "Pulse",
  temperature: "Temperature",
  spo2: "Oxygen (SpO₂)",
  weight: "Weight",
  bmi: "BMI",
  height: "Height",
  breathingRate: "Breathing rate",
};

export const vitalUnits: Record<VitalKey, string> = {
  bloodPressure: "mmHg",
  heartRate: "bpm",
  temperature: "°C",
  spo2: "%",
  weight: "kg",
  bmi: "kg/m²",
  height: "cm",
  breathingRate: "/min",
};

/** A blood pressure reading's two numbers, or null if it isn't "systolic/diastolic". */
function splitBloodPressure(reading: string | null) {
  const [systolic, diastolic] = (reading ?? "").split("/").map((part) => Number(part.trim()));
  return systolic && diastolic ? { systolic, diastolic } : null;
}

/** A reading's value for `key` as the pages print it ("128/80", "36.8"), or null if not taken. */
export function vitalValue(reading: VitalReading, key: VitalKey): string | null {
  if (key === "bloodPressure") {
    const pressure = splitBloodPressure(reading.bloodPressure);
    return pressure ? `${pressure.systolic}/${pressure.diastolic}` : null;
  }
  const value = reading[key];
  return value == null ? null : String(value);
}

/**
 * Where a reading sits: below, inside or above the usual adult range, and whether it's far
 * enough out to flag strongly (`severe`).
 */
export type VitalStatus = { level: "low" | "normal" | "high"; severe: boolean };

const normal: VitalStatus = { level: "normal", severe: false };
const slightlyHigh: VitalStatus = { level: "high", severe: false };
const high: VitalStatus = { level: "high", severe: true };
const slightlyLow: VitalStatus = { level: "low", severe: false };
const low: VitalStatus = { level: "low", severe: true };

/**
 * Within what range `value` falls: below `low` is low (severely below `veryLow`), above `high`
 * is high (severely above `veryHigh`).
 */
function banded(
  value: number,
  range: { veryLow?: number; low: number; high: number; veryHigh?: number },
): VitalStatus {
  if (range.veryLow != null && value < range.veryLow) return low;
  if (value < range.low) return range.veryLow == null ? low : slightlyLow;
  if (range.veryHigh != null && value > range.veryHigh) return high;
  if (value > range.high) return range.veryHigh == null ? high : slightlyHigh;
  return normal;
}

/**
 * Blood pressure by the ESC/ISH bands: normal under 130/85; elevated (high-normal) up to
 * 139/89; high from 140/90. Under 90/60 is low.
 */
export function bloodPressureStatus(reading: string | null): VitalStatus | null {
  const pressure = splitBloodPressure(reading);
  if (!pressure) return null;
  const { systolic, diastolic } = pressure;
  if (systolic >= 140 || diastolic >= 90) return high;
  if (systolic >= 130 || diastolic >= 85) return slightlyHigh;
  if (systolic < 90 || diastolic < 60) return slightlyLow;
  return normal;
}

/** Where a reading's `key` sits, or null when it wasn't taken or has no usual range. */
export function vitalStatus(reading: VitalReading, key: VitalKey): VitalStatus | null {
  if (key === "bloodPressure") return bloodPressureStatus(reading.bloodPressure);
  const value = reading[key];
  if (value == null) return null;
  switch (key) {
    // Resting pulse 60–100 bpm.
    case "heartRate":
      return banded(value, { veryLow: 50, low: 60, high: 100, veryHigh: 120 });
    // 36.1–37.2 °C; from 38 °C is a fever; under 35 °C is hypothermia.
    case "temperature":
      return banded(value, { veryLow: 35, low: 36.1, high: 37.2, veryHigh: 37.9 });
    // 95% and up; under 92% needs attention.
    case "spo2":
      return banded(value, { veryLow: 92, low: 95, high: 100 });
    // BMI 18.5–24.9 is healthy; 25–29.9 overweight; 30 and up obese.
    case "bmi":
      return banded(value, { low: 18.5, high: 24.9, veryHigh: 29.9 });
    // 12–20 breaths a minute at rest.
    case "breathingRate":
      return banded(value, { veryLow: 10, low: 12, high: 20, veryHigh: 24 });
    default:
      return null;
  }
}

/** A status in the words of a vital tile's note: "Normal", "Slightly high"… */
export function statusNote(status: VitalStatus, key: VitalKey) {
  if (status.level === "normal") return key === "bloodPressure" ? "Within target" : "Normal";
  if (status.level === "high") return status.severe ? "High" : "Slightly high";
  return status.severe ? "Low" : "Slightly low";
}

/** A status in the words of a reading's tag: "Normal", "Elevated", "High", "Low". */
export function statusTag(status: VitalStatus) {
  if (status.level === "normal") return "Normal";
  if (status.level === "high") return status.severe ? "High" : "Elevated";
  return "Low";
}

/** How loud a status is: green inside the range, amber just out of it, red far out. */
export function statusTone(status: VitalStatus) {
  if (status.level === "normal") return "good" as const;
  return status.severe ? ("watch" as const) : ("near" as const);
}

const month = new Intl.DateTimeFormat("en-GB", { month: "short" });
const monthYear = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });

/** e.g. "Mar 2025". */
const formatMonthYear = (at: string) => monthYear.format(new Date(at));

/** The newest reading that has `key`, if any. */
export function latestWith(readings: VitalReading[], key: VitalKey) {
  return readings.find((reading) => vitalValue(reading, key) != null) ?? null;
}

/**
 * How the newest weight compares with the last different one before it: "−2 kg since Oct"
 * (the month, with the year if it isn't the newest reading's), or null with nothing to compare.
 */
export function weightChange(readings: VitalReading[]) {
  const withWeight = readings.filter((reading) => reading.weight != null);
  const latest = withWeight[0];
  if (!latest) return null;
  const before = withWeight.find((reading) => reading.weight !== latest.weight);
  if (!before) return null;
  const change = Math.round((latest.weight! - before.weight!) * 10) / 10;
  const when = new Date(before.at);
  const since =
    when.getFullYear() === new Date(latest.at).getFullYear()
      ? month.format(when)
      : monthYear.format(when);
  return `${change > 0 ? "+" : "−"}${Math.abs(change)} kg since ${since}`;
}

/** Readings taken on one day at one facility, e.g. at one visit. */
export type ReadingGroup = {
  key: string;
  at: string;
  facility: string | null;
  readings: VitalReading[];
  /** How many of the eight vital signs were recorded. */
  count: number;
};

const dayOf = (at: string) => new Date(at).toDateString();

/** Readings grouped by day and facility, newest first. */
export function groupReadings(readings: VitalReading[]): ReadingGroup[] {
  const groups: ReadingGroup[] = [];
  for (const reading of readings) {
    const key = `${dayOf(reading.at)}|${reading.facility ?? ""}`;
    const group = groups.find((entry) => entry.key === key);
    if (group) group.readings.push(reading);
    else
      groups.push({
        key,
        at: reading.at,
        facility: reading.facility,
        readings: [reading],
        count: 0,
      });
  }
  return groups.map((group) => ({
    ...group,
    count: vitalKeys.filter((key) =>
      group.readings.some((reading) => vitalValue(reading, key) != null),
    ).length,
  }));
}

/** How far back the Trends chart looks: every reading, the last year, or the last 5 years. */
export type TrendPeriod = "all" | "1y" | "5y";

/** One bar group on the Trends chart: a year's or month's latest reading of a vital. */
export type TrendBucket = {
  key: string;
  /** Under the bars, e.g. "2024" or "Oct". */
  label: string;
  /** For the tooltip and screen readers, e.g. "October 2026". */
  longLabel: string;
  /** One value per series: systolic and diastolic for blood pressure, else the one value. */
  values: number[];
};

const longMonth = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

/** The numbers a reading charts for `key`: [systolic, diastolic] for blood pressure. */
function chartValues(reading: VitalReading, key: VitalKey): number[] | null {
  if (key === "bloodPressure") {
    const pressure = splitBloodPressure(reading.bloodPressure);
    return pressure ? [pressure.systolic, pressure.diastolic] : null;
  }
  const value = reading[key];
  return value == null ? null : [value];
}

/**
 * A vital's readings for the chart, oldest first: the latest reading of each year (all, 5Y) or
 * of each month (1Y), for the periods that have one.
 */
export function trendBuckets(
  readings: VitalReading[],
  key: VitalKey,
  period: TrendPeriod,
  now = new Date(),
): TrendBucket[] {
  const from = new Date(now);
  if (period === "1y") from.setFullYear(now.getFullYear() - 1);
  // The last five calendar years, this one included.
  if (period === "5y") from.setFullYear(now.getFullYear() - 4, 0, 1);
  if (period !== "all") from.setHours(0, 0, 0, 0);

  const buckets = new Map<string, TrendBucket>();
  for (const reading of readings) {
    const at = new Date(reading.at);
    if (period !== "all" && at < from) continue;
    const values = chartValues(reading, key);
    if (!values) continue;
    const bucketKey =
      period === "1y" ? `${at.getFullYear()}-${at.getMonth()}` : String(at.getFullYear());
    // Newest first, so the first reading in each bucket is its latest.
    if (buckets.has(bucketKey)) continue;
    buckets.set(
      bucketKey,
      period === "1y"
        ? { key: bucketKey, label: month.format(at), longLabel: longMonth.format(at), values }
        : {
            key: bucketKey,
            label: String(at.getFullYear()),
            longLabel: String(at.getFullYear()),
            values,
          },
    );
  }
  return [...buckets.values()].reverse();
}

/**
 * The shaded band on a vital's chart, or null when it has none (weight, height). For blood
 * pressure it spans the diastolic ceiling to the systolic one (85–130): a reading in range has
 * its diastolic bar below the band and its systolic bar inside it.
 */
export const targetRanges: Partial<Record<VitalKey, { low: number; high: number }>> = {
  // One band for both series, as the design draws it: diastolic 80 up to systolic 140.
  bloodPressure: { low: 80, high: 140 },
  heartRate: { low: 60, high: 100 },
  temperature: { low: 36.1, high: 37.2 },
  spo2: { low: 95, high: 100 },
  bmi: { low: 18.5, high: 24.9 },
  breathingRate: { low: 12, high: 20 },
};

/**
 * A line under a vital's value: how it sits (green in range, amber just out, red far out) or a
 * plain fact in grey ("−2 kg since Jul").
 */
export type VitalNote = { label: string; tone: "good" | "near" | "watch" | "info" };

/**
 * A vital's tile on the Vital signs page: the newest reading's value and how it sits. Height
 * changes rarely, so it's the newest height taken, with when.
 */
export function vitalTile(readings: VitalReading[], key: VitalKey) {
  const latest = readings[0];
  if (key === "height") {
    const measured = latestWith(readings, "height");
    return {
      value: measured && vitalValue(measured, "height"),
      note: measured && { label: `Recorded ${formatMonthYear(measured.at)}`, tone: "info" },
    } satisfies { value: string | null; note: VitalNote | null };
  }
  if (!latest) return { value: null, note: null };
  if (key === "weight") {
    const change = weightChange(readings);
    return {
      value: vitalValue(latest, key),
      note: latest.weight != null && change ? { label: change, tone: "info" } : null,
    } satisfies { value: string | null; note: VitalNote | null };
  }
  const status = vitalStatus(latest, key);
  return {
    value: vitalValue(latest, key),
    note: status && { label: statusNote(status, key), tone: statusTone(status) },
  } satisfies { value: string | null; note: VitalNote | null };
}
