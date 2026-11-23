import { z } from "zod";
import {
  noteText,
  personSchema,
  soapSectionLabels,
  type VitalSigns,
  vitalSignsSchema,
} from "@/lib/clinical";
import { type PatientSex, sexOf } from "@/lib/patient-record";
import { fullName, optionalText, staffMemberSchema, text } from "@/lib/staff-profile";

// The doctor's front line on the real API (docs/api/openapi.json, and staging where the schema
// is loose): the doctors' check-in queue, encounter (SOAP) notes, lab results, vitals requests.
// TODO(api) marks what's missing.

/** The doctor queue's tabs, as the API filters them. */
export const doctorQueueTabLabels = {
  doctor_idle: "Waiting",
  doctor_active: "In consultation",
  doctor_seen: "Seen",
} as const;
export type DoctorQueueTab = keyof typeof doctorQueueTabLabels;

export const triageLabels = {
  routine: "Routine",
  urgent: "Urgent",
  emergency: "Emergency",
} as const;
export type Triage = keyof typeof triageLabels;

type Patient = { name: string; hin: string; dateOfBirth: string | null; sex: PatientSex };

/** Someone holding a check-in: their staff sqid (to tell if it's me) and name. */
type Holder = { id: string | null; name: string | null };

export type DoctorQueueEntry = {
  /** The check-in's sqid. */
  id: string;
  status: string;
  patient: Patient;
  checkedInAt: string;
  /** When the nurse sent them on. */
  sentAt: string | null;
  triage: Triage | null;
  /** The nurse who sent them. */
  sentBy: string | null;
  /** The doctor seeing them. */
  claimedBy: Holder | null;
  latestVitals: VitalSigns | null;
};

export type DoctorQueuePage = {
  total: number;
  counts: Record<DoctorQueueTab, number>;
  items: DoctorQueueEntry[];
};

/** One section of an encounter note, as heading and text (a list becomes one line each). */
type NoteSection = { label: string; text: string };

export type EncounterNote = {
  id: string;
  at: string;
  by: string | null;
  chiefComplaint: string;
  primaryDiagnosis: string;
  sharedWithNurses: boolean;
  /** Everything else written, in the note's order, leaving out what's blank. */
  sections: NoteSection[];
  nextAppointment: string | null;
  additionalNotes: { id: string; at: string; note: string }[];
};

export type EncounterNotePage = { total: number; items: EncounterNote[] };

export type LabOrder = {
  id: string;
  at: string;
  orderedBy: string | null;
  note: string | null;
  tests: {
    id: string;
    name: string;
    status: string;
    /** The result's values, once it's in. */
    values: { name: string; value: string }[];
    interpretation: string | null;
  }[];
};

export type LabOrderPage = { total: number; items: LabOrder[] };

/** A nurse to send a vitals request to. */
export type Nurse = { id: string; name: string };

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
 * `claimed_by` / `escalated_by`: typed as strings in the schema (TODO(api)); in practice null or
 * an object with a staff sqid (`sqid`, `staff_id` or `id`) and a name.
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

/** `DoctorCheckInQueue`. */
export const doctorQueuePageSchema = z.object({
  count: count,
  results: z.array(
    z
      .object({
        sqid: z.string(),
        status: text,
        patient_info: patientInfo,
        created_at: dateTime,
        escalated_at: dateTime.nullish(),
        triage_priority: optionalText,
        escalated_by: holder,
        claimed_by: holder,
        latest_vitals: vitalSignsSchema.nullish().catch(null),
      })
      .transform((entry): DoctorQueueEntry => ({
        id: entry.sqid,
        status: entry.status,
        patient: entry.patient_info,
        checkedInAt: entry.created_at,
        sentAt: entry.escalated_at ?? null,
        triage: triageOf(entry.triage_priority),
        sentBy: entry.escalated_by?.name ?? null,
        claimedBy: entry.claimed_by,
        latestVitals: entry.latest_vitals ?? null,
      })),
  ),
});

/** `SoapNoteRead`. */
const encounterNoteSchema = z
  .object({
    sqid: z.string(),
    created_at: dateTime,
    staff_info: personSchema,
    chief_complaint: text,
    primary_diagnosis: text,
    is_shared: z.boolean().nullish(),
    next_appointment_info: z.object({ scheduled_time: dateTime }).loose().nullish().catch(null),
    additional_notes: z
      .array(z.object({ id: z.union([z.number(), z.string()]), note: text, created_at: dateTime }))
      .catch([]),
    ...Object.fromEntries(soapSectionLabels.map(([key]) => [key, noteText])),
  })
  .transform((note): EncounterNote => {
    const fields = note as unknown as Record<string, string>;
    return {
      id: note.sqid,
      at: note.created_at,
      by: note.staff_info,
      chiefComplaint: note.chief_complaint,
      primaryDiagnosis: note.primary_diagnosis,
      sharedWithNurses: !!note.is_shared,
      sections: soapSectionLabels.flatMap(([key, label]) =>
        fields[key] ? [{ label, text: fields[key] }] : [],
      ),
      nextAppointment: note.next_appointment_info?.scheduled_time ?? null,
      additionalNotes: note.additional_notes.map((added) => ({
        id: String(added.id),
        at: added.created_at,
        note: added.note,
      })),
    };
  });

export const encounterNotePageSchema = z.object({
  count: count,
  results: z.array(encounterNoteSchema),
});

/** A lab test's result (TODO(api): `result_info` is untyped): its values, with units, and the
 * interpretation. Nothing until it's in. */
export const labResultSchema = z
  .object({
    interpretation: optionalText,
    parameters_info: z
      .array(
        z.object({
          value: z.union([z.string(), z.number()]).nullish(),
          parameter_info: z.object({ name: text, unit: optionalText }).nullish(),
        }),
      )
      .catch([]),
  })
  .nullish()
  .catch(null)
  .transform((result) => ({
    values: (result?.parameters_info ?? []).flatMap(({ value, parameter_info }) =>
      parameter_info?.name && value != null && value !== ""
        ? [
            {
              name: parameter_info.name,
              value: parameter_info.unit ? `${value} ${parameter_info.unit}` : String(value),
            },
          ]
        : [],
    ),
    interpretation: result?.interpretation ?? null,
  }));

/** `LabTestOrder`, with each test's result once it's in. */
export const labOrderPageSchema = z.object({
  count: count,
  results: z.array(
    z
      .object({
        sqid: z.string(),
        created_at: dateTime,
        ordered_by_info: personSchema,
        note: optionalText,
        items_info: z.array(
          z.object({
            sqid: z.string(),
            status: text,
            test_info: z.object({ name: text }),
            result_info: labResultSchema,
          }),
        ),
      })
      .transform((order): LabOrder => ({
        id: order.sqid,
        at: order.created_at,
        orderedBy: order.ordered_by_info,
        note: order.note,
        tests: order.items_info.map((item) => ({
          id: item.sqid,
          name: item.test_info.name,
          status: item.status,
          ...item.result_info,
        })),
      })),
  ),
});

/** `GET /api/auth/staff?role=nurse`: the hospital's nurses, active ones only. */
export const nursePageSchema = z
  .object({ results: z.array(staffMemberSchema) })
  .transform(({ results }): Nurse[] =>
    results.filter(({ active }) => active).map(({ id, name }) => ({ id, name })),
  );
