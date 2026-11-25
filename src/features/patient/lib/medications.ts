import type { MedicationDetail } from "@/features/patient/api/pending";
import type { DrugRecord } from "@/features/patient/api/schemas";
import { formatDayMonth } from "@/lib/format";

// Working out the medication pages' views from drug records and, where there is one, the
// prescribing and dispensing details. TODO(api): drug records don't say who prescribed or
// dispensed a medicine, where, refills, payment or instructions (api/pending.ts).

/** Current (ongoing) medicines and past ones (completed or stopped), each newest first. */
export function splitMedications(drugs: DrugRecord[]) {
  return {
    current: drugs.filter((drug) => drug.status === "ongoing"),
    past: drugs.filter((drug) => drug.status !== "ongoing"),
  };
}

/** A drug record's details, if the API has any for it. */
export function detailFor(details: MedicationDetail[], drug: DrugRecord) {
  return details.find((detail) => detail.drugId === drug.id) ?? null;
}

const statusTags = {
  ongoing: { tone: "success", label: "Active" },
  completed: { tone: "neutral", label: "Completed" },
  stopped: { tone: "neutral", label: "Stopped" },
} as const;

/** The tag a medicine wears: Active, Completed or Stopped. */
export function medicationTag(drug: DrugRecord) {
  return statusTags[drug.status ?? "completed"];
}

/**
 * How much the pharmacy gave: "90 of 90 tablets" once it's dispensed, else the prescribed
 * quantity. TODO(api): no dispensed amount, so a dispensed record counts as all of it.
 */
export function dispensedQuantity(drug: DrugRecord) {
  if (!drug.quantity) return null;
  const match = /^(\d+(?:\.\d+)?)\s*(.*)$/.exec(drug.quantity);
  const all = drug.dispensing === "dispensed" || drug.dispensing === "all_dispensed";
  if (!all || !match) return drug.quantity;
  return `${match[1]} of ${drug.quantity}`;
}

/** How long it's for, and when it ends: "90 days · ends 24 Dec". */
export function durationLabel(drug: DrugRecord, detail: MedicationDetail | null) {
  const ends = detail?.endsAt ? `ends ${formatDayMonth(new Date(detail.endsAt))}` : null;
  return [drug.duration, ends].filter(Boolean).join(" · ") || null;
}

const paymentTags = {
  paid: { tone: "success", label: "Paid" },
  covered: { tone: "info", label: "Covered" },
  unpaid: { tone: "warning", label: "Unpaid" },
} as const;

/** The payment status's tag, if it's known. */
export function paymentTag(detail: MedicationDetail | null) {
  return detail?.paymentStatus ? paymentTags[detail.paymentStatus] : null;
}
