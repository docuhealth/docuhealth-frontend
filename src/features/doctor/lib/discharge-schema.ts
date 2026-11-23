import { z } from "zod";
import { drugRowSchema } from "@/features/doctor/lib/schemas";

/** The patient's condition on leaving, as v1 offered it (TODO(api): the API takes any text). */
export const dischargeConditionLabels = {
  stable: "Stable",
  improved: "Improved",
  unchanged: "Unchanged",
  deteriorated: "Deteriorated",
  deceased: "Deceased",
} as const;
type DischargeCondition = keyof typeof dischargeConditionLabels;

export const followUpLabels = {
  here: "At this hospital",
  elsewhere: "At another clinic",
  none: "No follow-up",
} as const;
type FollowUp = keyof typeof followUpLabels;

const required = (label: string) => z.string().trim().min(1, `Enter the ${label}`);

/** Step 1: how the stay went. */
export const dischargeSummaryFields = [
  ["chiefComplaint", "Chief complaint", "What brought the patient in"],
  ["primaryDiagnosis", "Primary diagnosis", "e.g. Community-acquired pneumonia"],
  ["secondaryDiagnosis", "Secondary diagnosis", "e.g. Dehydration, or None"],
  ["comorbidities", "Comorbidities", "e.g. Type 2 diabetes, or None"],
  ["treatmentPlan", "Treatment plan", "What was done during the stay"],
  ["hospitalCourse", "Hospital course", "How the stay went, day by day"],
] as const;

/**
 * The doctor's discharge form: the stay's summary (step 1), then the condition at discharge,
 * care instructions, investigations, drugs to take home and the follow-up (step 2). A follow-up
 * needs a date and a time, and one at another clinic its name.
 */
export const dischargeSchema = z.object({
  chiefComplaint: required("chief complaint"),
  primaryDiagnosis: required("primary diagnosis"),
  secondaryDiagnosis: required("secondary diagnosis"),
  comorbidities: required("comorbidities"),
  treatmentPlan: required("treatment plan"),
  hospitalCourse: required("hospital course"),
  condition: z
    .string()
    .pipe(
      z.enum(
        Object.keys(dischargeConditionLabels) as [DischargeCondition, ...DischargeCondition[]],
        "Choose the condition at discharge",
      ),
    ),
  careInstructions: required("care instructions"),
  completed: z.array(z.string()),
  pending: z.array(z.string()),
  drugs: z.array(drugRowSchema),
  allergies: z.string(),
  // Its own group, so its checks run even while other boxes are empty.
  followUp: z
    .object({
      plan: z.enum(Object.keys(followUpLabels) as [FollowUp, ...FollowUp[]]),
      clinic: z.string().trim(),
      date: z.string(),
      time: z.string(),
      instructions: z.string().trim(),
    })
    .superRefine((followUp, context) => {
      if (followUp.plan === "none") return;
      if (followUp.plan === "elsewhere" && !followUp.clinic) {
        context.addIssue({ code: "custom", path: ["clinic"], message: "Enter the clinic" });
      }
      if (!followUp.date) {
        context.addIssue({ code: "custom", path: ["date"], message: "Choose the follow-up date" });
      }
      if (!followUp.time) {
        context.addIssue({ code: "custom", path: ["time"], message: "Choose the follow-up time" });
      }
    }),
});
export type DischargeInput = z.input<typeof dischargeSchema>;
export type DischargeValues = z.output<typeof dischargeSchema>;

export const emptyDischarge: DischargeInput = {
  chiefComplaint: "",
  primaryDiagnosis: "",
  secondaryDiagnosis: "",
  comorbidities: "",
  treatmentPlan: "",
  hospitalCourse: "",
  condition: "",
  careInstructions: "",
  completed: [],
  pending: [],
  drugs: [],
  allergies: "",
  followUp: { plan: "here", clinic: "", date: "", time: "", instructions: "" },
};
