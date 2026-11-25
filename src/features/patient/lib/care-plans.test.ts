import { describe, expect, it } from "vitest";
import type { CarePlan } from "@/features/patient/api/pending";
import {
  goalLatest,
  planByline,
  planItemLine,
  planLine,
  splitPlans,
} from "@/features/patient/lib/care-plans";

const plan = (overrides: Partial<CarePlan>) =>
  ({
    id: "plan",
    name: "Hypertension plan",
    status: "active",
    facility: "ABC Hospital",
    setBy: "Dr. Adaeze Okafor",
    updatedAt: "2026-10-25T10:00:00Z",
    nextReview: "2026-12-15T10:00:00Z",
    endedAt: null,
    ...overrides,
  }) as CarePlan;

describe("care plans", () => {
  it("splits running plans from ended ones", () => {
    const { active, ended } = splitPlans([
      plan({ id: "a" }),
      plan({ id: "b", status: "completed" }),
      plan({ id: "c", status: "stopped" }),
    ]);
    expect(active.map((p) => p.id)).toEqual(["a"]);
    expect(ended.map((p) => p.id)).toEqual(["b", "c"]);
  });

  it("says when a plan is reviewed, or when it ended", () => {
    expect(planLine(plan({}))).toBe("ABC Hospital · Review 15 Dec 2026");
    expect(
      planLine(plan({ status: "completed", facility: "LUTH", endedAt: "2026-08-30T10:00:00Z" })),
    ).toBe("LUTH · Ended 30 Aug 2026");
    expect(planByline(plan({}))).toBe(
      "Set by Dr. Adaeze Okafor · ABC Hospital · Updated 25 Oct 2026",
    );
  });

  it("words the goal's latest reading", () => {
    const goal = {
      target: "128/80",
      unit: "mmHg",
      latest: "128/80",
      latestAt: "2026-10-25T10:00:00Z",
      onTrack: true,
    };
    expect(goalLatest(goal)).toBe("Latest 128/80 on 25 Oct");
    expect(goalLatest({ ...goal, latest: null })).toBeNull();
  });

  it("dates a booked visit from the next appointment", () => {
    const visit = { kind: "visit" as const, title: "Follow-up visit", detail: "Booked" };
    expect(planItemLine(visit, "2026-12-15T10:00:00Z")).toBe("15 Dec 2026 · Booked");
    expect(planItemLine(visit, null)).toBe("Booked");
  });
});
