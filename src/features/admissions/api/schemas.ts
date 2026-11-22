import { z } from "zod";
import { type PatientSex, sexOf } from "@/lib/patient-record";
import { fullName, optionalText, text } from "@/lib/staff-profile";

// Doctors' requests to admit a patient to a ward bed, which the front desk admits or rejects
// (`GET /api/hospital-ops/admissions/requests`). The doctor picks the ward and bed.

export const admissionStatusLabels = {
  pending: "Pending",
  accepted: "Admitted",
  rejected: "Rejected",
} as const;
export type AdmissionStatus = keyof typeof admissionStatusLabels;

export type AdmissionRequest = {
  id: string;
  status: AdmissionStatus;
  requestedAt: string;
  patient: { name: string; hin: string; dateOfBirth: string | null; sex: PatientSex };
  ward: string | null;
  bed: string | null;
  /** e.g. "Dr. Tola Bello". */
  requestedBy: string | null;
  /** Who admitted or rejected it; older requests don't record it. */
  processedBy: string | null;
  processedAt: string | null;
  rejectionReason: string | null;
};

export type AdmissionRequestList = {
  total: number;
  counts: Record<AdmissionStatus, number>;
  items: AdmissionRequest[];
};

const dateTime = z.iso.datetime({ offset: true });
const count = z.number().int().nonnegative();

/** Someone named on a request (`*_by_info`). */
const person = z
  .object({ firstname: text, lastname: text, role: optionalText })
  .nullish()
  .transform((info) => {
    const name = info && fullName(info.firstname, info.lastname);
    if (!name) return null;
    return info.role === "doctor" ? `Dr. ${name}` : name;
  });

const statusOf = (status: string): AdmissionStatus =>
  status === "accepted" || status === "rejected" ? status : "pending";

const admissionRequestRead = z
  .object({
    sqid: z.string(),
    status: z.string(),
    created_at: dateTime,
    processed_at: dateTime.nullish(),
    rejection_reason: optionalText,
    patient_info: z.object({
      hin: text,
      firstname: text,
      lastname: text,
      dob: z.string().nullish(),
      gender: optionalText,
    }),
    ward_info: z.object({ name: text }).nullish(),
    bed_info: z.object({ bed_number: z.union([z.number(), z.string()]) }).nullish(),
    requested_by_info: person,
    processed_by_info: person,
  })
  .transform((request): AdmissionRequest => ({
    id: request.sqid,
    status: statusOf(request.status),
    requestedAt: request.created_at,
    patient: {
      name:
        fullName(request.patient_info.firstname, request.patient_info.lastname) ||
        request.patient_info.hin,
      hin: request.patient_info.hin,
      dateOfBirth: request.patient_info.dob ?? null,
      sex: sexOf(request.patient_info.gender),
    },
    ward: request.ward_info?.name || null,
    bed: request.bed_info ? String(request.bed_info.bed_number) : null,
    requestedBy: request.requested_by_info,
    processedBy: request.processed_by_info,
    processedAt: request.processed_at ?? null,
    rejectionReason: request.rejection_reason,
  }));

export const admissionRequestPageSchema = z.object({
  count: count,
  results: z.array(admissionRequestRead),
});

/** Only a list's total, e.g. `?size=1` to count a tab. */
export const countOnlySchema = z.object({ count: count }).transform(({ count }) => count);

/** The `{detail}` the accept and reject replies carry. */
export const detailSchema = z.object({ detail: z.string().nullish() }).loose();
