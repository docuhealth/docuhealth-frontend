import { z } from "zod";
import { fullName, optionalText, text } from "@/lib/staff-profile";

// Clinical shapes several dashboards read the same way (pharmacy, doctor, nurse): vital signs,
// how a drug is taken, and who did something.

/** Someone named on a record (`*_by_info`, `staff_info`): "Dr. Tola Bello" for a doctor. */
export const personSchema = z
  .object({ firstname: text, lastname: text, role: optionalText })
  .nullish()
  .transform((info) => {
    const name = info && fullName(info.firstname, info.lastname);
    if (!name) return null;
    return info.role === "doctor" ? `Dr. ${name}` : name;
  });

const frequencyLabels: Record<string, string> = {
  stat: "Immediately (stat)",
  once: "Once",
  od: "Once daily",
  bd: "Twice daily",
  tds: "Three times daily",
  qid: "Four times daily",
  prn: "As needed",
  mane: "Every morning",
  nocte: "Every night",
  alt_days: "Every other day",
  weekly: "Weekly",
  monthly: "Monthly",
};

/** A drug's frequency code in words: "tds" → "Three times daily", "q6h" → "Every 6 hours". */
export function frequencyOf(code: string | null | undefined) {
  if (!code) return null;
  const hourly = /^q(\d+)h$/.exec(code);
  if (hourly) return hourly[1] === "1" ? "Every hour" : `Every ${hourly[1]} hours`;
  return frequencyLabels[code] ?? code;
}

/** `{value: 3, rate: "days"}` or `{value: 1, rate: "Month"}` → "3 days", "1 month". */
export function durationOf(duration: { value: number; rate: string } | null | undefined) {
  if (!duration) return null;
  const unit = duration.rate.toLowerCase().replace(/s$/, "");
  return `${duration.value} ${duration.value === 1 ? unit : `${unit}s`}`;
}

/** `ValueRate`, as drug records send it. */
export const durationSchema = z.object({ value: z.coerce.number(), rate: text }).nullish();

const reading = z.union([z.string(), z.number()]).nullish();

const vitalLabels = [
  ["blood_pressure", "Blood pressure", ""],
  ["temp", "Temperature", " °C"],
  ["heart_rate", "Heart rate", " bpm"],
  ["resp_rate", "Respiratory rate", " /min"],
  ["spo2", "SpO₂", "%"],
  ["height", "Height", " cm"],
  ["weight", "Weight", " kg"],
  ["bmi", "BMI", ""],
  ["pain_score", "Pain score", " /10"],
] as const;

export type VitalSigns = { at: string; readings: { label: string; value: string }[] };

/** `VitalSignsRead`: one set of vital signs, as label and value, leaving out what wasn't taken. */
export const vitalSignsSchema = z
  .object({
    created_at: z.iso.datetime({ offset: true }),
    blood_pressure: reading,
    temp: reading,
    heart_rate: reading,
    resp_rate: reading,
    spo2: reading,
    height: reading,
    weight: reading,
    bmi: reading,
    pain_score: reading,
  })
  .transform((vitals): VitalSigns => ({
    at: vitals.created_at,
    readings: vitalLabels.flatMap(([key, label, unit]) => {
      const value = vitals[key];
      return value == null || value === "" ? [] : [{ label, value: `${value}${unit}` }];
    }),
  }));

/** A note field as text: lists one item per line; blank when there's nothing. */
export const noteText = z
  .union([z.string(), z.array(z.unknown())])
  .nullish()
  .transform((value) => {
    if (!value) return "";
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .join("\n");
    }
    return value.trim();
  });

/** A SOAP (encounter) note's sections after the complaint and diagnosis, in order. */
export const soapSectionLabels = [
  ["history_of_complain", "History of the complaint"],
  ["past_med_history", "Past medical history"],
  ["drug_history_allergies", "Drug history and allergies"],
  ["family_history", "Family history"],
  ["social_history", "Social history"],
  ["other_history", "Other history"],
  ["review", "Review of systems"],
  ["general_exam", "General examination"],
  ["systemic_exam", "Systemic examination"],
  ["bedside_tests", "Bedside tests"],
  ["investigations", "Investigations"],
  ["differential_diagnosis", "Differential diagnosis"],
  ["problems_list", "Problems"],
  ["treatment_plan", "Treatment plan"],
  ["care_instructions", "Care instructions"],
  ["patient_education", "Patient education"],
  ["referred_hosp", "Referred to"],
] as const;
