import { describe, expect, it } from "vitest";
import type { MedicationDetail } from "@/features/patient/api/pending";
import type { DrugRecord } from "@/features/patient/api/schemas";
import {
  detailFor,
  dispensedQuantity,
  durationLabel,
  medicationTag,
  paymentTag,
  splitMedications,
} from "@/features/patient/lib/medications";

const drug = (id: string, fields: Partial<DrugRecord> = {}) =>
  ({
    id,
    name: id,
    how: "Tablet · Oral · Once daily",
    quantity: "90 tablets",
    duration: "90 days",
    status: "ongoing",
    at: "2026-11-20T10:00:00Z",
    dispensing: "dispensed",
    dispensedAt: "2026-11-20T11:40:00Z",
    ...fields,
  }) as DrugRecord;

const detail = (fields: Partial<MedicationDetail> = {}): MedicationDetail => ({
  drugId: "a",
  prescribedBy: null,
  facility: null,
  pharmacy: null,
  dispensedBy: null,
  refills: null,
  paymentStatus: null,
  instructions: null,
  endsAt: null,
  ...fields,
});

describe("medications", () => {
  it("splits current from past and tags them", () => {
    const { current, past } = splitMedications([
      drug("a"),
      drug("b", { status: "stopped" }),
      drug("c", { status: "completed" }),
    ]);
    expect(current.map((d) => d.id)).toEqual(["a"]);
    expect(past.map((d) => d.id)).toEqual(["b", "c"]);
    expect(medicationTag(drug("a")).label).toBe("Active");
    expect(medicationTag(drug("b", { status: "stopped" })).label).toBe("Stopped");
  });

  it("says how much was dispensed", () => {
    expect(dispensedQuantity(drug("a"))).toBe("90 of 90 tablets");
    expect(dispensedQuantity(drug("a", { dispensing: "pending" }))).toBe("90 tablets");
    expect(dispensedQuantity(drug("a", { quantity: null }))).toBeNull();
  });

  it("adds the end date to the duration, and finds details and payment", () => {
    const found = detailFor(
      [detail({ endsAt: "2026-12-24T10:00:00Z", paymentStatus: "paid" })],
      drug("a"),
    );
    expect(durationLabel(drug("a"), found)).toBe("90 days · ends 24 Dec");
    expect(durationLabel(drug("a"), null)).toBe("90 days");
    expect(paymentTag(found)?.label).toBe("Paid");
    expect(paymentTag(null)).toBeNull();
    expect(detailFor([], drug("a"))).toBeNull();
  });
});
