import { z } from "zod";
import {
  durationOf,
  durationSchema,
  frequencyOf,
  personSchema,
  type VitalSigns,
  vitalSignsSchema,
} from "@/lib/clinical";
import { type PatientRecord, patientRecordSchema } from "@/lib/patient-record";
import { fullName, optionalText, staffProfileSchema, text } from "@/lib/staff-profile";

// What the doctor and nurse dashboards share: who's signed in, the hospital's patients by visit,
// one visit's patient page and its records. The real API's shapes (docs/api/openapi.json, and
// staging where the schema is loose) become these models; TODO(api) marks what's missing.

/** The doctor's or nurse's dashboard. */
export type ClinicalDashboard = "doctor" | "nurse";

/**
 * The signed-in doctor or nurse and their hospital, from `GET /api/auth/staff/profile`.
 * TODO(api): no notification or message counts yet.
 */
export const clinicalProfileSchema = staffProfileSchema.transform(({ user, hospital }) => ({
  hospital: { name: hospital.name, bannerUrl: hospital.bannerUrl },
  user: {
    /** Their staff sqid: who claimed a check-in or task is compared with it. */
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    avatarUrl: null as string | null,
  },
  unreadNotifications: 0,
  unreadMessages: 0,
}));
export type ClinicalProfile = z.infer<typeof clinicalProfileSchema>;

/** The hospital's patients by where their visit stands; `GET /api/hospital-ops/patients?status=`. */
export const visitListLabels = {
  inpatient: "Admitted",
  outpatient: "Checked in",
  outpatient_discharge: "Checked out",
  inpatient_discharge: "Discharged",
} as const;
export type VisitList = keyof typeof visitListLabels;
export const visitListSchema = z.enum(Object.keys(visitListLabels) as [VisitList, ...VisitList[]]);

/** An admission's or check-in's status, in words. */
const visitStatusLabels: Record<string, string> = {
  active: "Admitted",
  awaiting_nurse_discharge: "Awaiting nurse discharge",
  discharged: "Discharged",
  pending: "Waiting for the nurse",
  reserved: "With the nurse",
  sent_to_doctor: "Sent to the doctor",
  doctor_idle: "Waiting for a doctor",
  doctor_active: "With the doctor",
  doctor_seen: "Seen by the doctor",
  closed: "Checked out",
};

const sentence = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replaceAll("_", " ");

export const visitStatusLabel = (status: string | null) =>
  status ? (visitStatusLabels[status] ?? sentence(status)) : null;

/** One visit: an admission (admitted, discharged) or a check-in (checked in, checked out). */
export type Visit = {
  /** The admission's or check-in's sqid. */
  id: string;
  list: VisitList;
  kind: "admission" | "check_in";
  /** The API's own status, e.g. `awaiting_nurse_discharge` or `doctor_active`. */
  status: string | null;
  patient: PatientRecord;
  ward: string | null;
  bed: string | null;
  /** The doctor who asked for the admission. */
  requestedBy: string | null;
  /** Admitted or checked in. */
  startedAt: string | null;
  /** Discharged or checked out. */
  endedAt: string | null;
  endedBy: string | null;
};

export type VisitPage = { total: number; items: Visit[] };

const dateTime = z.iso.datetime({ offset: true });
const count = z.number().int().nonnegative();

/** A row of any of `GET /api/hospital-ops/patients`' four lists (TODO(api): no response schema). */
const visitRow = z.object({
  sqid: z.string(),
  status: optionalText,
  patient_info: patientRecordSchema,
  requested_by_info: personSchema,
  discharged_by_info: personSchema,
  closed_by_info: personSchema,
  ward_info: z.object({ name: text }).nullish(),
  bed_info: z.object({ bed_number: z.union([z.number(), z.string()]) }).nullish(),
  created_at: dateTime.nullish(),
  closed_at: dateTime.nullish(),
  discharge_date: dateTime.nullish(),
});

export const visitPageSchema = (list: VisitList) =>
  z.object({
    count: count,
    results: z.array(
      visitRow.transform((row): Visit => ({
        id: row.sqid,
        list,
        kind: list === "inpatient" || list === "inpatient_discharge" ? "admission" : "check_in",
        // Discharged and checked-out rows don't say; their list does.
        status:
          row.status ??
          (list === "inpatient_discharge"
            ? "discharged"
            : list === "outpatient_discharge"
              ? "closed"
              : null),
        patient: row.patient_info,
        ward: row.ward_info?.name || null,
        bed: row.bed_info ? String(row.bed_info.bed_number) : null,
        requestedBy: row.requested_by_info,
        startedAt: row.created_at ?? null,
        endedAt: row.discharge_date ?? row.closed_at ?? null,
        endedBy: row.discharged_by_info ?? row.closed_by_info,
      })),
    ),
  });

/** A drug the patient is on, from their info. */
type OngoingDrug = {
  name: string;
  dose: string;
  route: string | null;
  frequency: string | null;
  duration: string | null;
};

export type PatientInfo = {
  latestVitals: VitalSigns | null;
  ongoingDrugs: OngoingDrug[];
};

/** `GET /api/patients/{hin}/info`: the latest vitals and ongoing drugs (its record is the list's). */
export const patientInfoSchema = z
  .object({
    latest_vitals: vitalSignsSchema.nullish().catch(null),
    ongoing_drugs: z
      .array(
        z.object({
          name: text,
          route: optionalText,
          quantity: z.union([z.number(), z.string()]).nullish(),
          unit: optionalText,
          frequency: optionalText,
          duration: durationSchema,
        }),
      )
      .catch([]),
  })
  .transform((info): PatientInfo => ({
    latestVitals: info.latest_vitals ?? null,
    // The same drug comes once per prescription; once is enough here.
    ongoingDrugs: [
      ...new Map(
        info.ongoing_drugs.map((drug) => {
          const ongoing: OngoingDrug = {
            name: drug.name,
            dose: [drug.quantity, drug.unit]
              .filter((part) => part != null && part !== "")
              .join(" "),
            route: drug.route,
            frequency: frequencyOf(drug.frequency),
            duration: durationOf(drug.duration),
          };
          return [JSON.stringify(ongoing), ongoing] as const;
        }),
      ).values(),
    ],
  }));

/** What each kind of record is called on the timeline. */
const recordTypeLabels: Record<string, string> = {
  admission: "Admission",
  admission_request: "Admission request",
  admission_note: "Admission note",
  care_plan: "Care plan",
  case_note: "Case note",
  doctor_discharge_form: "Doctor’s discharge summary",
  nurse_discharge_form: "Nurse’s discharge checklist",
  drug_record: "Medication",
  glucose_record: "Glucose reading",
  input_record: "Fluid intake",
  output_record: "Fluid output",
  iv_fluid_record: "IV fluid",
  lab_test_order: "Lab test order",
  lab_test_result: "Lab result",
  nursing_assessment: "Nursing assessment",
  drug_order: "Drug order",
  scan_result: "Scan result",
  procedure_record: "Procedure",
  progress_note: "Progress note",
  seizure_event_log: "Seizure event",
  vital_signs: "Vital signs",
  soap_note: "Encounter note",
};

/** Keys a record carries that aren't for reading (ids, links, nested people and patients). */
const hiddenKeys = new Set(["sqid", "id", "patient", "hospital", "admission", "check_in", "item"]);

/** "chief_complaint" → "Chief complaint". */
const labelOf = (key: string) => sentence(key);

/** A record's value as text, or null when there's nothing worth showing. */
function textOf(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    return /^\d{4}-\d{2}-\d{2}T/.test(value)
      ? new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
      : value;
  }
  if (Array.isArray(value)) {
    const items = value.map(textOf).filter(Boolean);
    return items.length ? items.join(", ") : null;
  }
  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    // A drug-style duration, a person, or anything with a name.
    if ("value" in object && "rate" in object) {
      return durationOf({ value: Number(object.value), rate: String(object.rate) });
    }
    if ("firstname" in object) {
      const part = (value: unknown) => (typeof value === "string" ? value : "");
      return fullName(part(object.firstname), part(object.lastname)) || null;
    }
    if ("name" in object) return textOf(object.name);
  }
  return null;
}

/** An untyped record's fields worth reading, as label and value, in the order sent. */
export function recordDetails(record: Record<string, unknown>) {
  return Object.entries(record).flatMap(([key, value]) => {
    if (hiddenKeys.has(key) || key.endsWith("_info") || key.endsWith("_at")) return [];
    const shown = textOf(value);
    return shown ? [{ label: labelOf(key), value: shown }] : [];
  });
}

export type VisitRecord = {
  id: string;
  type: string;
  title: string;
  at: string;
  by: string | null;
};

/**
 * `WorkflowRecordEvent`: one record made during the visit. Its `record` is untyped (TODO(api)), so
 * the record is read in full from its event when it's opened (`recordEventSchema`).
 */
export const visitRecordPageSchema = z.object({
  count: count,
  results: z.array(
    z
      .object({
        sqid: z.string(),
        record_type: text,
        created_at: dateTime,
        staff_info: personSchema,
      })
      .transform((event): VisitRecord => ({
        id: event.sqid,
        type: event.record_type,
        title: recordTypeLabels[event.record_type] ?? sentence(event.record_type),
        at: event.created_at,
        by: event.staff_info,
      })),
  ),
});

/** An admission's charts, as the API names them. */
export const chartLabels = {
  "vital-signs": "Vital signs",
  medications: "Medications",
  "fluid-balance": "Fluid intake and output",
  glucose: "Blood glucose",
  "iv-fluids": "IV fluids",
  procedures: "Procedures",
  seizures: "Seizures",
} as const;
export type Chart = keyof typeof chartLabels;

export type ChartEntry = {
  id: string;
  at: string | null;
  by: string | null;
  details: { label: string; value: string }[];
};

/** The staff named on a chart entry, under whichever key the chart uses. */
const byKeys = ["recorded_by_info", "completed_by_info", "staff_info", "administered_by_info"];

/**
 * `GET /api/records/admissions/{sqid}/charts/{chart}`: a page of entries. TODO(api): there's no
 * response schema, so each entry's fields are shown as sent.
 */
export const chartPageSchema = z.object({
  count: count,
  results: z.array(
    z.record(z.string(), z.unknown()).transform((entry, context): ChartEntry => {
      const id = entry.sqid ?? entry.id;
      if (typeof id !== "string" && typeof id !== "number") {
        context.addIssue({ code: "custom", message: "A chart entry without an id" });
        return z.NEVER;
      }
      const at = [entry.recorded_at, entry.created_at, entry.completed_at].find(
        (value): value is string => typeof value === "string",
      );
      const by = byKeys
        .map((key) => personSchema.safeParse(entry[key]))
        .find((parsed) => parsed.success && parsed.data)?.data;
      return { id: String(id), at: at ?? null, by: by ?? null, details: recordDetails(entry) };
    }),
  ),
});

/** `GET /api/records/admissions/{sqid}/fluid-balance`: today's intake, output and balance (ml). */
export const fluidBalanceSchema = z
  .object({
    total_intake: z.coerce.number(),
    total_output: z.coerce.number(),
    fluid_balance: z.coerce.number(),
  })
  .transform((balance) => ({
    intake: balance.total_intake,
    output: balance.total_output,
    balance: balance.fluid_balance,
  }));
