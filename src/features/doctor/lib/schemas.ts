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
