import { describe, expect, it } from "vitest";
import type { CarePlan } from "@/features/patient/api/pending";
import type { VitalReading } from "@/features/patient/api/schemas";
import {
  bloodPressureLine,
  carePlanFor,
  carePlanLine,
  conditionLine,
  latestBloodPressure,
  tracksBloodPressure,
} from "@/features/patient/lib/conditions";

const plan: CarePlan = {
  id: "plan-1",
  name: "Hypertension plan",
  status: "active",
  facility: null,
  setBy: null,
  startedAt: "2025-03-14T10:00:00",
  updatedAt: "2026-11-25T10:00:00",
  nextReview: null,
  endedAt: null,
  careTeam: null,
  conditionId: "7",
  goal: {
    target: "140/90",
    unit: "mmHg",
    latest: "128/80",
    latestAt: "2026-11-25T10:00:00",
    onTrack: true,
  },
  items: [],
};

const reading = (at: string, bloodPressure: string | null) =>
  ({ id: at, at, bloodPressure }) as VitalReading;

describe("conditions", () => {
  const base = { id: "7", name: "Malaria", facility: null, clinician: null };

  it("says since when an active condition has been, and when a past one was", () => {
    expect(conditionLine({ ...base, at: "2025-11-03T10:00:00", active: true })).toBe(
      "Since Nov 2025",
    );
    expect(conditionLine({ ...base, at: "2026-08-12T10:00:00", active: false })).toBe(
      "12 Aug 2026",
    );
  });

  it("finds the care plan for a condition and sums it up", () => {
    expect(carePlanFor([plan], "7")).toBe(plan);
    expect(carePlanFor([plan], "5")).toBeNull();
    expect(carePlanLine(plan)).toBe("Care plan · goal under 140/90");
    expect(carePlanLine({ ...plan, goal: null })).toBe("Care plan");
  });

  it("shows blood pressure for a blood pressure plan or condition", () => {
    expect(tracksBloodPressure("Malaria", plan)).toBe(true);
    expect(tracksBloodPressure("High blood pressure", null)).toBe(true);
    expect(tracksBloodPressure("Malaria", null)).toBe(false);
  });

  it("takes the newest blood pressure and says how it sits against the goal", () => {
    const latest = latestBloodPressure([
      reading("2026-01-01T10:00:00", "140/90"),
      reading("2026-11-25T10:00:00", "128/80"),
      reading("2026-10-01T10:00:00", null),
    ]);
    expect(latest?.bloodPressure).toBe("128/80");
    expect(latest && bloodPressureLine(latest, plan)).toBe("Latest · 25 Nov 2026 · within target");
    expect(latest && bloodPressureLine(latest, null)).toBe("Latest · 25 Nov 2026");
  });
});
