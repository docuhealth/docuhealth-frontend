import { describe, expect, it } from "vitest";
import type { DrugRecord, VisitSummary } from "@/features/patient/api/schemas";
import { attentionItems } from "@/features/patient/lib/attention";

const now = new Date("2026-11-25T10:00:00Z");
const visit = (at: string, labTests: VisitSummary["labTests"]) =>
  ({ id: at, at, labTests }) as VisitSummary;
const drug = (id: string, at: string, status: DrugRecord["status"]) =>
  ({ id, name: id, at, status, how: "" }) as DrugRecord;

describe("attentionItems", () => {
  it("lists recent results, current medicines and the newest prescription", () => {
    const items = attentionItems(
      [
        visit("2026-11-20T10:00:00Z", [{ name: "Full Blood Count", status: "result_ready" }]),
        visit("2026-10-01T10:00:00Z", [{ name: "Malaria", status: "result_ready" }]),
      ],
      [
        drug("Amlodipine", "2026-11-20T10:00:00Z", "ongoing"),
        drug("Old", "2026-01-01", "completed"),
      ],
      now,
    );
    expect(items.map((item) => [item.key, item.value, item.newCount])).toEqual([
      ["results", "Full Blood Count", 1],
      ["medications", "Amlodipine", 0],
      ["prescription", "Amlodipine", 1],
    ]);
  });

  it("skips visits without tests, and marks old or pending results as not new", () => {
    const items = attentionItems(
      [
        visit("2026-11-24T10:00:00Z", []),
        visit("2026-11-20T10:00:00Z", [{ name: "Lipid Profile", status: "pending" }]),
      ],
      [],
      now,
    );
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ key: "results", value: "Lipid Profile", newCount: 0 });
  });

  it("is empty when there's nothing to look at", () => {
    expect(attentionItems([], [], now)).toEqual([]);
  });
});
