import { z } from "zod";
import { vitalsFormSchema } from "@/lib/vitals-form";

export const mobilityLabels = {
  fully_mobile: "Fully mobile",
  assisted_ambulation: "Walks with help",
  bedridden_immobile: "Bedridden or immobile",
} as const;
export type Mobility = keyof typeof mobilityLabels;

export const nutritionLabels = {
  well_nourished: "Well nourished",
  at_risk_of_malnutrition: "At risk of malnutrition",
  severely_malnourished: "Severely malnourished",
} as const;
export type Nutrition = keyof typeof nutritionLabels;

/** A box on a text-only note's form; `list` boxes take one item per line. */
export type NoteField = {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  list?: boolean;
};

/** The text-only notes: what each asks, as v1 did. */
export const textNotes = {
  case: {
    title: "New case note",
    description: "What you observed and did for",
    done: "The case note is saved.",
    fields: [
      {
        name: "observation",
        label: "Observation",
        placeholder: "e.g. Restless overnight, complained of pain at the drip site",
        required: true,
        list: true,
      },
      { name: "care", label: "Care given", placeholder: "e.g. Re-sited the cannula", list: true },
      {
        name: "response",
        label: "Response",
        placeholder: "e.g. Settled after 30 minutes",
        list: true,
      },
      {
        name: "abnormalities",
        label: "Abnormalities",
        placeholder: "e.g. Swelling at the old site",
        list: true,
      },
      {
        name: "followUp",
        label: "Follow-up",
        placeholder: "e.g. Check the site at 06:00",
        list: true,
      },
    ],
  },
  "care-plan": {
    title: "New care plan",
    description: "The nursing problem and how it’s being handled, for",
    done: "The care plan is saved.",
    fields: [
      {
        name: "problem",
        label: "Problem",
        placeholder: "e.g. Risk of pressure sores",
        required: true,
      },
      {
        name: "goals",
        label: "Goals",
        placeholder: "e.g. Skin stays intact through the stay",
        list: true,
      },
      {
        name: "intervention",
        label: "Intervention",
        placeholder: "e.g. Turn every 2 hours",
        list: true,
      },
      {
        name: "evaluation",
        label: "Evaluation",
        placeholder: "e.g. No redness on day 3",
        list: true,
      },
    ],
  },
  progress: {
    title: "New progress note",
    description: "Today’s review (SOAP) of",
    done: "The progress note is saved.",
    fields: [
      {
        name: "subjective",
        label: "Subjective",
        placeholder: "What the patient reports",
        required: true,
      },
      {
        name: "objective",
        label: "Objective",
        placeholder: "Examination and results",
        required: true,
      },
      {
        name: "assessment",
        label: "Assessment",
        placeholder: "e.g. Improving community-acquired pneumonia",
        required: true,
      },
      {
        name: "plan",
        label: "Plan",
        placeholder: "e.g. Switch to oral antibiotics tomorrow",
        required: true,
      },
    ],
  },
} satisfies Record<
  string,
  { title: string; description: string; done: string; fields: NoteField[] }
>;
export type TextNoteKind = keyof typeof textNotes;

/** A text-only note's form: each required box must be filled in. */
export const textNoteSchema = (fields: readonly NoteField[]) =>
  z.object(
    Object.fromEntries(
      fields.map(({ name, label, required }) => [
        name,
        required ? z.string().trim().min(1, `Enter the ${label.toLowerCase()}`) : z.string().trim(),
      ]),
    ),
  );

const choice = <T extends string>(labels: Record<T, string>) =>
  z.union([z.enum(Object.keys(labels) as [T, ...T[]]), z.literal("")]);

/** The nurse's admission note: a full set of vitals, then the nursing assessment. */
export const admissionNoteSchema = z.object({
  vitals: vitalsFormSchema(),
  allergies: z.string().trim(),
  mobility: choice<Mobility>(mobilityLabels),
  nutrition: choice<Nutrition>(nutritionLabels),
  fallRisk: z.string().trim(),
  skin: z.string().trim(),
  concern: z.string().trim().min(1, "Enter the initial nursing concern"),
});
export type AdmissionNoteValues = z.infer<typeof admissionNoteSchema>;

/** Vital signs recorded on an admission: the four core readings, then any others. */
export const recordVitalsSchema = z.object({
  vitals: vitalsFormSchema(),
  notes: z.string().trim(),
});
export type RecordVitalsValues = z.infer<typeof recordVitalsSchema>;
