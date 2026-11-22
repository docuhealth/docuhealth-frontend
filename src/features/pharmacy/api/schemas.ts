import { z } from "zod";
import { type PatientSex, sexOf } from "@/lib/patient-record";
import {
  durationOf,
  durationSchema,
  frequencyOf,
  personSchema,
  type VitalSigns,
  vitalSignsSchema,
} from "@/lib/clinical";
import { fullName, optionalText, staffProfileSchema, text } from "@/lib/staff-profile";

// The pharmacy dashboard's screen models, then the real API's shapes (docs/api/openapi.json, and
// staging where the schema is wrong) and how they become them. TODO(api) marks what's missing.

/**
 * The signed-in pharmacist and their hospital, for the shell and greeting, from
 * `GET /api/auth/staff/profile`. TODO(api): no notification or message counts yet.
 */
export const pharmacyProfileSchema = staffProfileSchema.transform(({ user, hospital }) => ({
  hospital: { name: hospital.name, bannerUrl: hospital.bannerUrl },
  user: {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatarUrl: null as string | null,
  },
  unreadNotifications: 0,
  unreadMessages: 0,
}));
export type PharmacyProfile = z.infer<typeof pharmacyProfileSchema>;

/** Where a prescription stands, across its drugs. */
export const prescriptionStatusLabels = {
  pending: "Pending",
  partial: "Partly dispensed",
  dispensed: "Dispensed",
  unavailable: "Unavailable",
} as const;
export type PrescriptionStatus = keyof typeof prescriptionStatusLabels;

export const drugStatusLabels = {
  pending: "Pending",
  dispensed: "Dispensed",
  unavailable: "Unavailable",
} as const;
export type DrugStatus = keyof typeof drugStatusLabels;

type Patient = { name: string; hin: string; dateOfBirth: string | null; sex: PatientSex };

export type Prescription = {
  id: string;
  status: PrescriptionStatus;
  patient: Patient;
  /** e.g. "Dr. Tola Bello". */
  orderedBy: string | null;
  provider: { name: string; email: string | null } | null;
  createdAt: string;
  drugs: {
    id: string;
    name: string;
    /** e.g. "500 mg tablet", or null when the doctor gave neither. */
    form: string | null;
    /** e.g. "500 mg". */
    dose: string;
    route: string | null;
    frequency: string | null;
    /** e.g. "3 days". */
    duration: string | null;
    status: DrugStatus;
    dispensedBy: string | null;
    dispensedAt: string | null;
    unavailableReason: string | null;
  }[];
  /** Noted with the drugs; TODO(api): untyped, so only plain text is read. */
  allergies: string[];
  /** The patient's latest vitals, as the hospital recorded them. */
  vitals: VitalSigns | null;
};

export type PrescriptionList = {
  total: number;
  counts: { pending: number; settled: number };
  items: Prescription[];
};

export type PharmacyOverview = {
  pending: number;
  settled: number;
  /** Patients given drugs in the last 7 days. */
  recentPatients: number;
};

export const trendPeriodLabels = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
} as const;
export type TrendPeriod = keyof typeof trendPeriodLabels;

/** Drugs dispensed in each day, week, month or year (`date` is when it starts). */
export type DispensedTrend = { date: string; count: number }[];

export type RecentPatient = Patient & { lastDispensedAt: string };
export type RecentPatientList = { total: number; items: RecentPatient[] };

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

const drugStatusOf = (status: string): DrugStatus =>
  status === "dispensed" || status === "unavailable" ? status : "pending";

/** The API's `aggregate_status` (pending, partial, all_dispensed, all_unavailable…). */
function prescriptionStatusOf(status: string | null): PrescriptionStatus {
  if (status === "all_dispensed" || status === "dispensed") return "dispensed";
  if (status === "all_unavailable" || status === "unavailable") return "unavailable";
  if (status === "partial" || status === "partially_dispensed") return "partial";
  return "pending";
}

const drugItem = z
  .object({
    sqid: z.string(),
    status: z.string(),
    dispensed_by: personSchema,
    dispensed_at: dateTime.nullish(),
    unavailable_reason: optionalText,
    drug_record: z.object({
      name: text,
      strength: optionalText,
      dose_form: optionalText,
      route: optionalText,
      quantity: z.union([z.number(), z.string()]).nullish(),
      unit: optionalText,
      frequency: optionalText,
      duration: durationSchema,
      allergies: z.unknown(),
    }),
  })
  .transform((item) => {
    const drug = item.drug_record;
    return {
      id: item.sqid,
      name: drug.name,
      form: [drug.strength, drug.dose_form].filter(Boolean).join(" ") || null,
      dose: [drug.quantity, drug.unit].filter((part) => part != null && part !== "").join(" "),
      route: drug.route,
      frequency: frequencyOf(drug.frequency),
      duration: durationOf(drug.duration),
      status: drugStatusOf(item.status),
      dispensedBy: item.dispensed_by,
      dispensedAt: item.dispensed_at ?? null,
      unavailableReason: item.unavailable_reason,
      allergies: z.array(z.string()).catch([]).parse(drug.allergies),
    };
  });

/** `DrugOrderRead`: a doctor's prescription, with its drugs. */
export const prescriptionSchema = z
  .object({
    sqid: z.string(),
    aggregate_status: optionalText,
    created_at: dateTime,
    patient_info: patientInfo,
    ordered_by_info: personSchema,
    hospital_info: z.object({ name: text, email: optionalText }).nullish(),
    drugs_info: z.array(drugItem),
    // TODO(api): typed as a string in the schema; an object (or null) in practice.
    latest_vitals: vitalSignsSchema.nullish().catch(null),
  })
  .transform((order): Prescription => ({
    id: order.sqid,
    status: prescriptionStatusOf(order.aggregate_status),
    patient: order.patient_info,
    orderedBy: order.ordered_by_info,
    provider: order.hospital_info
      ? { name: order.hospital_info.name, email: order.hospital_info.email }
      : null,
    createdAt: order.created_at,
    drugs: order.drugs_info.map(({ allergies: _allergies, ...drug }) => drug),
    allergies: [
      ...new Set(
        order.drugs_info
          .flatMap(({ allergies }) => allergies)
          .map((allergy) => allergy.trim())
          .filter((allergy) => allergy && !/^(no|none|nil|n\/a)\b/i.test(allergy)),
      ),
    ],
    vitals: order.latest_vitals ?? null,
  }));

export const prescriptionPageSchema = z.object({
  count: count,
  results: z.array(prescriptionSchema),
});

/** `GET /api/pharmacy/orders/trend`; TODO(api): documented as a page of orders, but it's this. */
export const dispensedTrendSchema = z.array(
  z.object({ date: dateTime, count: z.coerce.number().int().nonnegative() }),
);

/** `GET /api/pharmacy/patients/recent`. */
export const recentPatientPageSchema = z.object({
  count: count,
  results: z.array(
    z
      .object({
        hin: text,
        firstname: text,
        lastname: text,
        dob: z.string().nullish(),
        gender: optionalText,
        last_dispensed_at: dateTime,
      })
      .transform((patient): RecentPatient => ({
        name: fullName(patient.firstname, patient.lastname) || patient.hin,
        hin: patient.hin,
        dateOfBirth: patient.dob ?? null,
        sex: sexOf(patient.gender),
        lastDispensedAt: patient.last_dispensed_at,
      })),
  ),
});
