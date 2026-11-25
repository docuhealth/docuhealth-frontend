import { describe, expect, it } from "vitest";
import type { ScanReport } from "@/features/patient/api/pending";
import {
  dayLabel,
  groupByDay,
  progressSteps,
  type Scan,
  scanRowDetail,
  scanTag,
  scanViews,
} from "@/features/patient/lib/scans";

const now = new Date("2026-11-25T15:00:00");
const scan = (id: string, at: string, status: string | null = null): Scan => ({
  id,
  visitId: id,
  name: `Scan ${id}`,
  status,
  at,
  facility: "ABC Hospital",
  orderedBy: "Dr. Adaeze Okafor",
});
const report = (scanId: string, fields: Partial<ScanReport>): ScanReport => ({
  scanId,
  stage: "ready",
  scannedAt: "2026-11-20T09:00:00",
  capturedAt: "2026-11-20T09:30:00",
  images: 2,
  bodyPart: "Chest",
  type: "X-ray",
  reportedBy: "Dr. Tunde Bello",
  reportedAt: "2026-11-21T11:00:00",
  impression: "Clear.",
  findings: "Clear.",
  ...fields,
});

describe("scanViews", () => {
  it("works out each scan's state, newness and tag, newest first", () => {
    const views = scanViews(
      [
        scan("old", "2026-01-01T10:00:00", "completed"),
        scan("recent", "2026-11-20T09:00:00"),
        scan("today", "2026-11-25T09:20:00", "in_progress"),
        scan("pending", "2026-11-24T09:00:00", "in_progress"),
      ],
      [
        report("recent", {}),
        report("today", { stage: "reviewing", scannedAt: "2026-11-25T09:20:00" }),
      ],
      now,
    );
    expect(views.map((view) => [view.id, scanTag(view).label])).toEqual([
      ["today", "Awaiting report"],
      ["pending", "Awaiting report"],
      ["recent", "New"],
      ["old", "Final"],
    ]);
  });

  it("stops calling a report new after two weeks", () => {
    const [view] = scanViews(
      [scan("a", "2026-10-01T09:00:00")],
      [report("a", { reportedAt: "2026-10-02T09:00:00" })],
      now,
    );
    expect(view?.isNew).toBe(false);
  });
});

describe("groupByDay and scanRowDetail", () => {
  it("groups by day and says the time, images or report only", () => {
    const views = scanViews(
      [
        scan("today", "2026-11-25T09:20:00", "in_progress"),
        scan("x", "2026-10-25T09:00:00"),
        scan("y", "2026-07-02T09:00:00"),
      ],
      [
        report("x", { scannedAt: "2026-10-25T09:00:00" }),
        report("y", { scannedAt: "2026-07-02T09:00:00", images: 0 }),
      ],
      now,
    );
    expect(groupByDay(views, now).map((group) => group.label)).toEqual([
      "Today",
      "25 Oct, 2026",
      "2 Jul, 2026",
    ]);
    expect(views.map((view) => scanRowDetail(view, now))).toEqual([
      "ABC Hospital · 9:20 AM",
      "ABC Hospital · 2 images",
      "ABC Hospital · Report only",
    ]);
  });

  it("labels yesterday", () => {
    expect(dayLabel(new Date("2026-11-24T08:00:00"), now)).toBe("Yesterday");
  });
});

describe("progressSteps", () => {
  it("marks steps done up to the specialist's review", () => {
    const [view] = scanViews(
      [scan("a", "2026-11-25T09:20:00")],
      [report("a", { stage: "reviewing", scannedAt: "2026-11-25T09:20:00" })],
      now,
    );
    expect(view && progressSteps(view, now)).toEqual([
      { label: "Scan done", state: "done", detail: "Today, 9:20 AM" },
      { label: "Images captured", state: "done", detail: "20 Nov 2026, 9:30 AM" },
      { label: "Specialist reviewing", state: "current", detail: "Usually 2–3 working days" },
      { label: "Report ready", state: "pending", detail: "We’ll notify you" },
    ]);
  });

  it("knows only the scan itself without a report", () => {
    const [view] = scanViews([scan("a", "2026-11-25T09:20:00", "in_progress")], [], now);
    expect(view && progressSteps(view, now).map((step) => step.state)).toEqual([
      "done",
      "current",
      "pending",
      "pending",
    ]);
  });
});
