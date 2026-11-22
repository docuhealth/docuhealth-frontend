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
