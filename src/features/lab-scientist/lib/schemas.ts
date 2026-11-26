import { z } from "zod";
import { toIsoDate } from "@/lib/date-input";

const required = (message: string) => z.string().trim().min(1, message);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a date as DD/MM/YYYY");
const time = z.string().regex(/^\d{2}:\d{2}$/, "Enter a time as HH:MM");

/**
 * The Book Appointment dialog's details step: a date and time from now on and an optional note.
 * `date` is "YYYY-MM-DD" and `time` "HH:MM", or "" until whole.
 */
export const bookTestSchema = z
  .object({
    date,
    time,
    note: z.string().trim().max(500, "Keep the note to 500 characters"),
  })
  .superRefine(({ date, time }, context) => {
    const now = new Date();
    if (date < toIsoDate(now)) {
      context.addIssue({ code: "custom", path: ["date"], message: "Pick a date from today on" });
    } else if (time && new Date(`${date}T${time}`) <= now) {
      context.addIssue({ code: "custom", path: ["time"], message: "That time has passed" });
    }
  });
export type BookTestValues = z.infer<typeof bookTestSchema>;

/** "HH:MM" on the 24-hour clock, as TimeInput takes it. */
export function clockOf(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** A sample is taken after the doctor asks for it, and not in the future. */
function collectedBetween(requestedAt: Date) {
  return ({ date, time }: { date: string; time: string }, context: z.RefinementCtx) => {
    const now = new Date();
    if (date < toIsoDate(requestedAt)) {
      context.addIssue({
        code: "custom",
        path: ["date"],
        message: "Pick a date from the day it was requested on",
      });
    } else if (date > toIsoDate(now)) {
      context.addIssue({ code: "custom", path: ["date"], message: "That date hasn’t come yet" });
    } else if (time) {
      const at = new Date(`${date}T${time}`);
      if (at < requestedAt) {
        context.addIssue({
          code: "custom",
          path: ["time"],
          message: "Pick a time after it was requested",
        });
      } else if (at > now) {
        context.addIssue({ code: "custom", path: ["time"], message: "That time hasn’t come yet" });
      }
    }
  };
}

/** The Sample collection info dialog: when the sample was taken. */
export function sampleCollectionSchema(requestedAt: Date) {
  return z.object({ date, time }).superRefine(collectedBetween(requestedAt));
}
export type SampleCollectionValues = z.infer<ReturnType<typeof sampleCollectionSchema>>;

/** The Upload test result dialog: a value per test, what it means, and when it was collected. */
export function uploadResultSchema(requestedAt: Date) {
  return z
    .object({
      values: z.array(
        z
          .string()
          .trim()
          .regex(/^-?\d+(\.\d+)?$/, "Enter a number"),
      ),
      interpretation: required("Add the interpretation").max(4000, "Keep this to 4,000 characters"),
      clinicalCorrelation: required("Add the clinical correlation").max(
        4000,
        "Keep this to 4,000 characters",
      ),
      date,
      time,
    })
    .superRefine(collectedBetween(requestedAt));
}
export type UploadResultValues = z.infer<ReturnType<typeof uploadResultSchema>>;

/** The Reject test order dialog: why, for the requesting doctor. */
export const rejectOrderSchema = z.object({
  reason: required("Say why you’re rejecting this request").max(
    1000,
    "Keep the note to 1,000 characters",
  ),
});
export type RejectOrderValues = z.infer<typeof rejectOrderSchema>;

/** The lab admin's Return Results dialog: why, for the lab scientist who'll redo them. */
export const returnResultsSchema = z.object({
  reason: required("Say why the results need redoing").max(
    1000,
    "Keep the note to 1,000 characters",
  ),
});

const decimal = z
  .string()
  .trim()
  .regex(/^-?\d+(\.\d+)?$/, "Enter a number");

export const turnaroundUnitLabels = {
  minutes: "Minute(s)",
  hours: "Hour(s)",
  days: "Day(s)",
} as const;
type TurnaroundUnit = keyof typeof turnaroundUnitLabels;

const referenceRangeSchema = z
  .object({
    age: z.enum(["adults", "teens", "children"]),
    gender: z.enum(["all", "male", "female"]),
    pregnancy: z.enum(["not_pregnant", "first_trimester", "second_trimester", "third_trimester"]),
    min: decimal,
    max: decimal,
  })
  .refine(({ min, max }) => Number(min) <= Number(max), {
    path: ["max"],
    message: "Make this at least the minimum",
  });

/**
 * The Add test and Edit test dialogs: which test (when adding), how its result is given, how
 * long it takes, its panic limits and its reference ranges (at least one).
 */
export const testDetailsSchema = z
  .object({
    category: z.string(),
    testId: z.string().min(1, "Pick a test"),
    resultFormat: z.enum(["numeric", "positive_or_negative", "present_or_absent", "test"]),
    unit: z.enum([
      "milligrams_per_deciliter",
      "millimoles_per_liter",
      "grams_per_deciliter",
      "grams_per_liter",
      "micromoles_per_liter",
      "milli_international_units_per_liter",
      "micro_international_units_per_milliliter",
    ]),
    turnaround: z
      .string()
      .trim()
      .regex(/^[1-9]\d{0,3}$/, "Enter a whole number from 1"),
    turnaroundUnit: z.enum(["minutes", "hours", "days"]),
    criticalLow: decimal,
    criticalHigh: decimal,
    references: z.array(referenceRangeSchema).min(1, "Add a reference range"),
  })
  .refine(({ criticalLow, criticalHigh }) => Number(criticalLow) < Number(criticalHigh), {
    path: ["criticalHigh"],
    message: "Make this higher than the critical low",
  });
export type TestDetailsValues = z.infer<typeof testDetailsSchema>;
export type ReferenceRangeValues = TestDetailsValues["references"][number];

export const newReferenceRange = (): ReferenceRangeValues => ({
  age: "adults",
  gender: "all",
  pregnancy: "not_pregnant",
  min: "",
  max: "",
});

/** "2 days", as the API keeps it, from the dialog's number and unit. */
export function turnaroundText(value: string, unit: TurnaroundUnit) {
  const count = Number(value);
  const word = { minutes: "minute", hours: "hour", days: "day" }[unit];
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

/** The dialog's number and unit from what the API keeps ("1 day", "24 hours", "30 min"). */
export function parseTurnaround(text: string): { value: string; unit: TurnaroundUnit } {
  const [value = "", word = ""] = text.trim().split(/\s+/);
  const unit = /^min/i.test(word) ? "minutes" : /^h/i.test(word) ? "hours" : "days";
  return { value: /^\d+$/.test(value) ? value : "1", unit };
}

/** The Lab details dialog: the lab's name, address and phone, as its admin corrects them. */
export const labDetailsSchema = z.object({
  name: required("Enter the lab’s name").max(255, "Keep the name to 255 characters"),
  street: required("Enter the street address").max(120, "Keep this to 120 characters"),
  city: required("Enter the city").max(20, "Keep this to 20 characters"),
  state: required("Enter the state").max(20, "Keep this to 20 characters"),
  country: required("Enter the country").max(20, "Keep this to 20 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?\d[\d\s-]{6,18}\d)?$/, "Enter a phone number, e.g. 08012345678"),
});
export type LabDetailsValues = z.infer<typeof labDetailsSchema>;
