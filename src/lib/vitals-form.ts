import { z } from "zod";

// The vital signs form every clinical screen shares (a nurse's assessment, a doctor's vitals
// request processed, an inpatient's vitals, an admission note): what's typed, how it's checked,
// and the `VitalSignsWrite` it becomes.

/** A number typed in a box, between `min` and `max`; "" when left out (if `required` is false). */
const reading = (label: string, min: number, max: number, required: boolean, integer = false) =>
  z
    .string()
    .trim()
    .refine((value) => !required || value !== "", `Enter the ${label}`)
    .refine(
      (value) => value === "" || Number.isFinite(Number(value)),
      `Enter the ${label} as a number`,
    )
    .refine(
      (value) => value === "" || !integer || Number.isInteger(Number(value)),
      `Enter the ${label} as a whole number`,
    )
    .refine(
      (value) => value === "" || (Number(value) >= min && Number(value) <= max),
      `The ${label} should be between ${min} and ${max}`,
    );

/**
 * The form's vitals. Blood pressure, temperature, heart rate and respiratory rate are needed for a
 * full set (`core`); the rest are taken when there's a reason to.
 */
export const vitalsFormSchema = (core = true) =>
  z.object({
    blood_pressure: z
      .string()
      .trim()
      .refine((value) => !core || value !== "", "Enter the blood pressure")
      .refine(
        (value) => value === "" || /^\d{2,3}\/\d{2,3}$/.test(value),
        "Enter the blood pressure as systolic/diastolic, e.g. 120/80",
      ),
    temp: reading("temperature", 30, 45, core),
    heart_rate: reading("heart rate", 20, 250, core, true),
    resp_rate: reading("respiratory rate", 4, 80, core, true),
    spo2: reading("SpO₂", 0, 100, false, true),
    height: reading("height", 30, 250, false),
    weight: reading("weight", 1, 400, false),
    pain_score: reading("pain score", 0, 10, false, true),
  });
export type VitalsFormValues = z.infer<ReturnType<typeof vitalsFormSchema>>;

export const emptyVitals: VitalsFormValues = {
  blood_pressure: "",
  temp: "",
  heart_rate: "",
  resp_rate: "",
  spo2: "",
  height: "",
  weight: "",
  pain_score: "",
};

/** The form's vitals as `VitalSignsWrite`: numbers as numbers, and nothing for what's left out. */
export function toVitalSignsWrite(vitals: VitalsFormValues, notes?: string) {
  const number = (value: string) => (value === "" ? undefined : Number(value));
  return {
    blood_pressure: vitals.blood_pressure || undefined,
    temp: number(vitals.temp),
    heart_rate: number(vitals.heart_rate),
    resp_rate: number(vitals.resp_rate),
    spo2: number(vitals.spo2),
    height: number(vitals.height),
    weight: number(vitals.weight),
    pain_score: number(vitals.pain_score),
    notes: notes?.trim() || undefined,
  };
}

/** Body mass index from height (cm) and weight (kg), to one decimal; null without both. */
export function bmiOf(height: string, weight: string) {
  const metres = Number(height) / 100;
  const kg = Number(weight);
  if (!height || !weight || !(metres > 0) || !(kg > 0)) return null;
  return Math.round((kg / (metres * metres)) * 10) / 10;
}
