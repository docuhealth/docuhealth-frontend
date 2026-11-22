import { z } from "zod";
import { personSchema, type VitalSigns, vitalSignsSchema } from "@/lib/clinical";
import { type PatientSex, sexOf } from "@/lib/patient-record";
import { fullName, optionalText, text } from "@/lib/staff-profile";

// The nurse's front line on the real API (docs/api/openapi.json, and staging where the schema is
// loose): the check-in queue, the doctor's vitals requests, and who's admitted. TODO(api) marks
// what's missing.

/** The nursing encounter queue's tabs, as the API filters them. */
export const queueTabLabels = {
  pending: "Pending",
  sent_to_doctor: "Sent to doctor",
  closed: "Closed",
} as const;
export type QueueTab = keyof typeof queueTabLabels;

export const triageLabels = {
  routine: "Routine",
  urgent: "Urgent",
  emergency: "Emergency",
} as const;
export type Triage = keyof typeof triageLabels;

type Patient = { name: string; hin: string; dateOfBirth: string | null; sex: PatientSex };

/** Someone holding a check-in: their staff sqid (to tell if it's me) and name. */
type Holder = { id: string | null; name: string | null };

export type QueueEntry = {
  /** The check-in's sqid. */
  id: string;
  /** The API's status: pending, nursing_active, doctor_idle, doctor_active, doctor_seen, closed… */
  status: string;
  patient: Patient;
  checkedInAt: string;
  sentToDoctorAt: string | null;
  closedAt: string | null;
  triage: Triage | null;
  /** The nurse who took it, while it's theirs. */
  reservedBy: Holder | null;
  /** The doctor seeing them, once sent on. */
  claimedBy: Holder | null;
  latestVitals: VitalSigns | null;
};

export type QueuePage = {
  total: number;
  counts: Record<QueueTab, number>;
  items: QueueEntry[];
};

export type VitalsRequest = {
  id: string;
  patient: Patient;
  /** The nurse it's meant for, if the doctor picked one. TODO(api): who asked isn't sent. */
  assignedTo: string | null;
  note: string | null;
  requestedAt: string;
};

export type VitalsRequestPage = { total: number; items: VitalsRequest[] };

export type Admission = {
  /** The admission's sqid, which is also its patient page's visit. */
  id: string;
  patient: { name: string; hin: string };
  ward: string | null;
  bed: string | null;
  requestedBy: string | null;
  admittedAt: string;
  /** TODO(api): read from `admission_note_info`; `false` until one's recorded. */
  hasAdmissionNote: boolean;
};

export type AdmissionPage = { total: number; items: Admission[] };

// ---------------------------------------------------------------------------------------------
// The real API's shapes.

const count = z.number().int().nonnegative();
const dateTime = z.iso.datetime({ offset: true });

/** Only a list's total, e.g. `?size=1` to count a tab. */
export const countOnlySchema = z.object({ count: count }).transform(({ count }) => count);

/** Any reply; for actions whose reply the screen doesn't need. */
export const anyResponseSchema = z.unknown();

const patientInfo = z
  .object({
    hin: text,
    firstname: text,
    lastname: text,
    dob: z.string().nullish(),
    gender: optionalText,
  })
  .transform((info): Patient => ({
    name: fullName(info.firstname, info.lastname) || info.hin,
    hin: info.hin,
    dateOfBirth: info.dob ?? null,
    sex: sexOf(info.gender),
  }));

/**
 * `reserved_by` / `claimed_by`: typed as strings in the schema (TODO(api)); staging has sent
 * null, and v1 read an object with a staff sqid (`sqid`, `staff_id` or `id`) and a name.
 */
const holder = z.unknown().transform((value): Holder | null => {
  if (!value) return null;
  if (typeof value === "string") return { id: value, name: null };
  if (typeof value !== "object") return null;
  const object = value as Record<string, unknown>;
  const pick = (key: string) => (typeof object[key] === "string" ? (object[key] as string) : "");
  const id = pick("sqid") || pick("staff_id") || pick("id") || null;
  const name = fullName(pick("firstname"), pick("lastname")) || pick("name") || null;
  return id || name ? { id, name } : null;
});

const triageOf = (value: string | null): Triage | null =>
  value === "routine" || value === "urgent" || value === "emergency" ? value : null;

/** `NurseCheckInQueue`. */
export const queuePageSchema = z.object({
  count: count,
  results: z.array(
    z
      .object({
        sqid: z.string(),
        status: text,
        patient_info: patientInfo,
        created_at: dateTime,
        escalated_at: dateTime.nullish(),
        closed_at: dateTime.nullish(),
        triage_priority: optionalText,
        reserved_by: holder,
        claimed_by: holder,
        latest_vitals: vitalSignsSchema.nullish().catch(null),
      })
      .transform((entry): QueueEntry => ({
        id: entry.sqid,
        status: entry.status,
        patient: entry.patient_info,
        checkedInAt: entry.created_at,
        sentToDoctorAt: entry.escalated_at ?? null,
        closedAt: entry.closed_at ?? null,
        triage: triageOf(entry.triage_priority),
        reservedBy: entry.reserved_by,
        claimedBy: entry.claimed_by,
        latestVitals: entry.latest_vitals ?? null,
      })),
  ),
});

/** `VitalSignsRequest`: a doctor asking for a patient's vitals. */
export const vitalsRequestPageSchema = z.object({
  count: count,
  results: z.array(
    z
      .object({
        sqid: z.string(),
        patient: patientInfo,
        staff_info: personSchema,
        note: optionalText,
        created_at: dateTime,
      })
      .transform((request): VitalsRequest => ({
        id: request.sqid,
        patient: request.patient,
        assignedTo: request.staff_info,
        note: request.note,
        requestedAt: request.created_at,
      })),
  ),
});

/** `WardAdmissionRead`: an active admission. */
export const admissionPageSchema = z.object({
  count: count,
  results: z.array(
    z
      .object({
        sqid: z.string(),
        patient_info: z.object({ hin: text, firstname: text, lastname: text }),
        ward_info: z.object({ name: text }).nullish(),
        bed_info: z.object({ bed_number: z.union([z.number(), z.string()]) }).nullish(),
        requested_by_info: personSchema,
        admission_note_info: z.unknown(),
        created_at: dateTime,
      })
      .transform((admission): Admission => ({
        id: admission.sqid,
        patient: {
          name:
            fullName(admission.patient_info.firstname, admission.patient_info.lastname) ||
            admission.patient_info.hin,
          hin: admission.patient_info.hin,
        },
        ward: admission.ward_info?.name || null,
        bed: admission.bed_info ? String(admission.bed_info.bed_number) : null,
        requestedBy: admission.requested_by_info,
        admittedAt: admission.created_at,
        hasAdmissionNote: !!admission.admission_note_info,
      })),
  ),
});
