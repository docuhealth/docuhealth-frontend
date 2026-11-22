import { z } from "zod";

const optional = (label: string, max = 2000) =>
  z
    .string()
    .trim()
    .max(max, `Keep the ${label} to ${max.toLocaleString("en-GB")} characters`);

/** "One per line" boxes: each line becomes an item. */
const list = (label: string) => optional(label, 4000);

/** Step 1 of an encounter note: the history and examination. */
export const historySchema = z.object({
  chiefComplaint: z
    .string()
    .trim()
    .min(1, "Write the chief complaint")
    .max(1000, "Keep the chief complaint to 1,000 characters"),
  historyOfComplaint: optional("history"),
  pastMedicalHistory: optional("past medical history"),
  drugHistoryAllergies: list("drug history"),
  familyHistory: optional("family history"),
  socialHistory: optional("social history"),
  review: optional("review of systems"),
  generalExam: list("general examination"),
  systemicExam: list("systemic examination"),
  bedsideTests: list("bedside tests"),
  investigations: list("investigations"),
});

/** Step 2: the assessment and plan. */
const planSchema = z.object({
  primaryDiagnosis: z
    .string()
    .trim()
    .min(1, "Write the primary diagnosis")
    .max(500, "Keep the diagnosis to 500 characters"),
  differentialDiagnosis: optional("differential diagnosis"),
  problems: list("problems"),
  treatmentPlan: list("treatment plan"),
  careInstructions: list("care instructions").refine(
    (text) => text.trim() !== "",
    "Write at least one care instruction",
  ),
  patientEducation: optional("patient education"),
  shareWithNurses: z.boolean(),
});

/** The whole encounter (SOAP) note. */
export const encounterNoteSchema = historySchema.extend(planSchema.shape);
export type EncounterNoteValues = z.infer<typeof encounterNoteSchema>;

export const emptyEncounterNote: EncounterNoteValues = {
  chiefComplaint: "",
  historyOfComplaint: "",
  pastMedicalHistory: "",
  drugHistoryAllergies: "",
  familyHistory: "",
  socialHistory: "",
  review: "",
  generalExam: "",
  systemicExam: "",
  bedsideTests: "",
  investigations: "",
  primaryDiagnosis: "",
  differentialDiagnosis: "",
  problems: "",
  treatmentPlan: "",
  careInstructions: "",
  patientEducation: "",
  shareWithNurses: false,
};

/** A note added to an encounter note after it's written. */
export const additionalNoteSchema = z.object({
  note: z.string().trim().min(1, "Write the note").max(2000, "Keep the note to 2,000 characters"),
});
export type AdditionalNoteValues = z.infer<typeof additionalNoteSchema>;

/** Asking for the patient's vitals: which nurse ("any" for whoever's free), and why. */
export const vitalsRequestSchema = z.object({
  nurse: z.string(),
  note: optional("note", 500),
});
export type VitalsRequestValues = z.infer<typeof vitalsRequestSchema>;

/** How often a drug is taken: the API's codes, in words, most used first. */
export const frequencyLabels = {
  od: "Once daily",
  bd: "Twice daily",
  tds: "Three times daily",
  qid: "Four times daily",
  q4h: "Every 4 hours",
  q6h: "Every 6 hours",
  q8h: "Every 8 hours",
  q12h: "Every 12 hours",
  mane: "Every morning",
  nocte: "Every night",
  prn: "As needed",
  stat: "Immediately (stat)",
  once: "Once",
  alt_days: "Every other day",
  weekly: "Weekly",
  monthly: "Monthly",
} as const;
type Frequency = keyof typeof frequencyLabels;

export const durationRateLabels = { days: "Days", weeks: "Weeks", months: "Months" } as const;
type DurationRate = keyof typeof durationRateLabels;

const positive = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter the ${label}`)
    .refine((value) => Number(value) > 0, `Enter the ${label} as a number above 0`);

/** One drug on a prescription; `code` is set when it's picked from the catalogue. */
const drugRowSchema = z.object({
  code: z.string(),
  name: z.string().trim().min(1, "Pick or type the drug"),
  strength: z.string().trim(),
  form: z.string().trim(),
  route: z.string().trim().min(1, "Enter the route, e.g. Oral"),
  quantity: positive("dose"),
  unit: z.string().trim().min(1, "Enter the unit, e.g. mg"),
  frequency: z
    .string()
    .pipe(z.enum(Object.keys(frequencyLabels) as [Frequency, ...Frequency[]], "Choose how often")),
  durationValue: positive("duration"),
  durationRate: z.enum(Object.keys(durationRateLabels) as [DurationRate, ...DurationRate[]]),
});

export const prescriptionSchema = z.object({
  drugs: z.array(drugRowSchema).min(1, "Add at least one drug"),
  allergies: z.string().trim().max(1000, "Keep the allergies to 1,000 characters"),
});
export type PrescriptionInput = z.input<typeof prescriptionSchema>;
export type PrescriptionValues = z.output<typeof prescriptionSchema>;

export const emptyDrugRow: PrescriptionInput["drugs"][number] = {
  code: "",
  name: "",
  strength: "",
  form: "",
  route: "Oral",
  quantity: "",
  unit: "mg",
  frequency: "",
  durationValue: "",
  durationRate: "days",
};

/** Moving a patient to a bed: an admission request or a transfer. */
export const bedSchema = z.object({
  ward: z.string().min(1, "Choose a ward"),
  bed: z.string().min(1, "Choose a bed"),
});
export type BedValues = z.infer<typeof bedSchema>;

/** Referring the patient to another hospital. */
export const referralSchema = z.object({
  hospital: z.string().min(1, "Choose the hospital"),
  reason: z
    .string()
    .trim()
    .min(1, "Say why you’re referring them")
    .max(1000, "Keep the reason to 1,000 characters"),
});
export type ReferralValues = z.infer<typeof referralSchema>;
