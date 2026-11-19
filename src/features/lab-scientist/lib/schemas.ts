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
