import { StatusPill } from "@/components/dashboard/status-pill";
import {
  type DrugStatus,
  drugStatusLabels,
  type PrescriptionStatus,
  prescriptionStatusLabels,
} from "@/features/pharmacy/api/schemas";

const prescriptionTones = {
  pending: "warning",
  partial: "info",
  dispensed: "success",
  unavailable: "error",
} as const satisfies Record<PrescriptionStatus, string>;

const drugTones = {
  pending: "warning",
  dispensed: "success",
  unavailable: "error",
} as const satisfies Record<DrugStatus, string>;

export function PrescriptionStatusPill({ status }: { status: PrescriptionStatus }) {
  return (
    <StatusPill tone={prescriptionTones[status]}>{prescriptionStatusLabels[status]}</StatusPill>
  );
}

export function DrugStatusPill({ status }: { status: DrugStatus }) {
  return <StatusPill tone={drugTones[status]}>{drugStatusLabels[status]}</StatusPill>;
}
