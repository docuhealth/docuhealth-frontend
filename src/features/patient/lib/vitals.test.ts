import { describe, expect, it } from "vitest";
import type { VitalReading } from "@/features/patient/api/schemas";
import {
  bloodPressureStatus,
  groupReadings,
  statusNote,
  statusTag,
  trendBuckets,
  vitalStatus,
  vitalTile,
  weightChange,
} from "@/features/patient/lib/vitals";

const reading = (at: string, values: Partial<VitalReading> = {}): VitalReading => ({
  id: at,
  at,
  bloodPressure: null,
  temperature: null,
  breathingRate: null,
  heartRate: null,
  height: null,
  weight: null,
  spo2: null,
  bmi: null,
  recordedBy: null,
  facility: "ABC Hospital",
  ...values,
});

describe("bloodPressureStatus", () => {
  it("reads normal, elevated, high and low", () => {
    expect(statusTag(bloodPressureStatus("128/80")!)).toBe("Normal");
    expect(statusNote(bloodPressureStatus("128/80")!, "bloodPressure")).toBe("Within target");
    expect(statusTag(bloodPressureStatus("136/86")!)).toBe("Elevated");
    expect(statusTag(bloodPressureStatus("125/87")!)).toBe("Elevated");
    expect(statusTag(bloodPressureStatus("160/100")!)).toBe("High");
    expect(statusTag(bloodPressureStatus("85/55")!)).toBe("Low");
    expect(bloodPressureStatus("n/a")).toBeNull();
    expect(bloodPressureStatus(null)).toBeNull();
  });
});

describe("vitalStatus", () => {
  const note = (values: Partial<VitalReading>, key: Parameters<typeof vitalStatus>[1]) => {
    const status = vitalStatus(reading("2026-01-01", values), key);
    return status && statusNote(status, key);
  };

  it("words each vital against its usual range", () => {
    expect(note({ heartRate: 72 }, "heartRate")).toBe("Normal");
    expect(note({ heartRate: 110 }, "heartRate")).toBe("Slightly high");
    expect(note({ heartRate: 130 }, "heartRate")).toBe("High");
    expect(note({ temperature: 36.8 }, "temperature")).toBe("Normal");
    expect(note({ temperature: 38.4 }, "temperature")).toBe("High");
    expect(note({ spo2: 98 }, "spo2")).toBe("Normal");
    expect(note({ spo2: 93 }, "spo2")).toBe("Slightly low");
    expect(note({ spo2: 89 }, "spo2")).toBe("Low");
    expect(note({ bmi: 25.5 }, "bmi")).toBe("Slightly high");
    expect(note({ bmi: 31 }, "bmi")).toBe("High");
    expect(note({ breathingRate: 16 }, "breathingRate")).toBe("Normal");
    expect(note({ breathingRate: 22 }, "breathingRate")).toBe("Slightly high");
  });

  it("has no status for a missing value or for weight and height", () => {
    expect(vitalStatus(reading("2026-01-01"), "heartRate")).toBeNull();
    expect(vitalStatus(reading("2026-01-01", { weight: 78 }), "weight")).toBeNull();
    expect(vitalStatus(reading("2026-01-01", { height: 175 }), "height")).toBeNull();
  });
});

describe("weightChange", () => {
  it("compares the newest weight with the last different one", () => {
    expect(
      weightChange([
        reading("2026-09-25T10:00:00", { weight: 78 }),
        reading("2026-09-18T10:00:00", { weight: 78 }),
        reading("2026-07-02T10:00:00", { weight: 80 }),
      ]),
    ).toBe("−2 kg since Jul");
    expect(
      weightChange([
        reading("2026-01-25T10:00:00", { weight: 81.5 }),
        reading("2025-11-02T10:00:00", { weight: 80 }),
      ]),
    ).toBe("+1.5 kg since Nov 2025");
  });

  it("has nothing to say without a change", () => {
    expect(weightChange([reading("2026-09-25", { weight: 78 })])).toBeNull();
    expect(weightChange([])).toBeNull();
  });
});

describe("groupReadings", () => {
  it("groups by day and facility and counts the vitals recorded", () => {
    const groups = groupReadings([
      reading("2026-09-18T11:00:00", { bloodPressure: "130/82", heartRate: 70 }),
      reading("2026-09-18T09:00:00", { weight: 78, heartRate: 72 }),
      reading("2026-09-18T08:00:00", { spo2: 98, facility: "LUTH" }),
      reading("2026-08-12T10:00:00", { temperature: 36.8 }),
    ]);
    expect(groups.map((group) => [group.facility, group.readings.length, group.count])).toEqual([
      ["ABC Hospital", 2, 3],
      ["LUTH", 1, 1],
      ["ABC Hospital", 1, 1],
    ]);
  });
});

describe("trendBuckets", () => {
  const now = new Date("2026-11-25T10:00:00");
  const readings = [
    reading("2026-11-20T10:00:00", { bloodPressure: "128/80", heartRate: 72 }),
    reading("2026-10-16T10:00:00", { bloodPressure: "136/86" }),
    reading("2026-10-10T10:00:00", { bloodPressure: "138/88" }),
    reading("2024-10-20T10:00:00", { bloodPressure: "136/86", heartRate: 80 }),
    reading("2019-03-01T10:00:00", { bloodPressure: "150/100" }),
  ];

  it("takes each year's latest reading, oldest first", () => {
    expect(trendBuckets(readings, "bloodPressure", "all", now)).toEqual([
      { key: "2019", label: "2019", longLabel: "2019", values: [150, 100] },
      { key: "2024", label: "2024", longLabel: "2024", values: [136, 86] },
      { key: "2026", label: "2026", longLabel: "2026", values: [128, 80] },
    ]);
  });

  it("keeps the last five years, or the last year by month", () => {
    expect(trendBuckets(readings, "bloodPressure", "5y", now).map((b) => b.label)).toEqual([
      "2024",
      "2026",
    ]);
    expect(trendBuckets(readings, "bloodPressure", "1y", now)).toEqual([
      { key: "2026-9", label: "Oct", longLabel: "October 2026", values: [136, 86] },
      { key: "2026-10", label: "Nov", longLabel: "November 2026", values: [128, 80] },
    ]);
  });

  it("charts one value for other vitals and skips readings without it", () => {
    expect(trendBuckets(readings, "heartRate", "all", now).map((b) => b.values)).toEqual([
      [80],
      [72],
    ]);
  });
});

describe("vitalTile", () => {
  const readings = [
    reading("2026-09-25T10:00:00", { bloodPressure: "128/80", weight: 78, bmi: 25.5 }),
    reading("2026-07-02T10:00:00", { weight: 80 }),
    reading("2025-03-10T10:00:00", { height: 175 }),
  ];

  it("shows the newest value and how it sits", () => {
    expect(vitalTile(readings, "bloodPressure")).toEqual({
      value: "128/80",
      note: { label: "Within target", tone: "good" },
    });
    expect(vitalTile(readings, "bmi").note).toEqual({ label: "Slightly high", tone: "near" });
    expect(vitalTile(readings, "weight").note).toEqual({
      label: "−2 kg since Jul",
      tone: "info",
    });
    expect(vitalTile(readings, "heartRate")).toEqual({ value: null, note: null });
  });

  it("shows the newest height taken, with when", () => {
    expect(vitalTile(readings, "height")).toEqual({
      value: "175",
      note: { label: "Recorded Mar 2025", tone: "info" },
    });
    expect(vitalTile([], "height")).toEqual({ value: null, note: null });
  });
});
