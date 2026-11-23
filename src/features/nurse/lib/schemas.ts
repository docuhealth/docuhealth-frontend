import { z } from "zod";
import { vitalsFormSchema } from "@/lib/vitals-form";
import { type Triage, triageLabels } from "@/features/nurse/api/schemas";

/** The nursing assessment: vitals, how urgent, and notes for whoever sees them next. */
export const assessmentSchema = z.object({
  vitals: vitalsFormSchema(),
  triage: z
    .string()
    .pipe(z.enum(Object.keys(triageLabels) as [Triage, ...Triage[]], "Choose how urgent it is")),
  notes: z.string().trim().max(1000, "Keep the notes to 1,000 characters"),
});
export type AssessmentInput = z.input<typeof assessmentSchema>;
export type AssessmentValues = z.output<typeof assessmentSchema>;

/** Processing a doctor's vitals request: a full set, and any notes. */
export const vitalsRequestSchema = z.object({
  vitals: vitalsFormSchema(),
  notes: z.string().trim().max(1000, "Keep the notes to 1,000 characters"),
});
export type VitalsRequestValues = z.infer<typeof vitalsRequestSchema>;

/** The discharge checklist's ticks, as the API names them, in v1's words. */
export const dischargeChecks = {
  peripheral_iv_cannula_removed: "Peripheral IV cannula removed",
  surgical_dressing_clean: "Surgical dressing clean and intact",
  urinary_catheter_removed: "Urinary catheter removed (or none)",
  surgical_drains_removed: "Surgical drains removed (or none)",
  valuables_handed: "Valuables handed back (or none stored)",
  reviewed_discharge_meds: "Discharge drugs and their schedule reviewed with the patient",
  medication_explained: "Medication explained",
  warning_signs_explained: "Warning signs for coming back explained",
  will_continue_followup: "Patient will keep their follow-up",
} as const;
type DischargeCheck = keyof typeof dischargeChecks;

/** The checklist's choices, as the API takes them, in v1's words. */
export const dischargeChoices = {
  condition_on_discharge: {
    label: "Condition at discharge",
    options: { stable: "Stable", critical: "Critical", deceased: "Deceased" },
  },
  accompanied_by: {
    label: "Accompanied by",
    options: { relative: "Relative or family", solo: "Alone", escort: "Escort staff" },
  },
  mobility_status: {
    label: "Mobility",
    options: { mobile: "Fully mobile", assisted: "Walks with help", bedridden: "Bedridden" },
  },
  iv_sites_status: {
    label: "IV sites",
    options: {
      clean_intact_dry: "Clean, intact and dry",
      no_signs_phlebitis: "No signs of phlebitis or infiltration",
      mild_redness: "Mild redness, needs watching",
      dressing_applied: "Dressing applied and secured",
    },
  },
  wound_status: {
    label: "Wound",
    options: {
      na_no_wounds: "No wounds, skin intact",
      dressing_clean_dry: "Dressing clean and dry",
      slight_serous_oozing: "Slight serous oozing",
      infected_purulent: "Infected, purulent discharge",
    },
  },
} as const;
type DischargeChoice = keyof typeof dischargeChoices;

const choiceOf = <K extends DischargeChoice>(key: K) =>
  z.enum(
    Object.keys(dischargeChoices[key].options) as [
      keyof (typeof dischargeChoices)[K]["options"] & string,
      ...(keyof (typeof dischargeChoices)[K]["options"] & string)[],
    ],
  );

/**
 * The nurse's discharge checklist: final vitals, what's been done, the patient's state on
 * leaving, and what they were taught.
 */
export const dischargeChecklistSchema = z.object({
  vitals: vitalsFormSchema(),
  checks: z.array(z.enum(Object.keys(dischargeChecks) as [DischargeCheck, ...DischargeCheck[]])),
  condition_on_discharge: choiceOf("condition_on_discharge"),
  accompanied_by: choiceOf("accompanied_by"),
  mobility_status: choiceOf("mobility_status"),
  iv_sites_status: choiceOf("iv_sites_status"),
  wound_status: choiceOf("wound_status"),
  education_given: z.string().trim().min(1, "Enter what the patient was taught"),
  follow_up_instructions: z.string().trim().min(1, "Enter the follow-up instructions"),
});
export type DischargeChecklistValues = z.infer<typeof dischargeChecklistSchema>;
