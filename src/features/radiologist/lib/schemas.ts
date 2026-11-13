import { z } from "zod";
import {
  type ReporterSpecialty,
  reporterSpecialtyLabels,
} from "@/features/radiologist/api/schemas";
import { toIsoDate } from "@/lib/date-input";

const required = (message: string) => z.string().trim().min(1, message);
const longText = (message: string) => required(message).max(4000, "Keep this to 4,000 characters");

/** The largest file a result can carry. */
export const MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024;

/** The Upload Test Result dialog, all three steps. */
export const uploadResultSchema = z
  .object({
    reporterName: required("Enter the reporter’s name"),
    // Empty until one is picked, so the select can start blank.
    specialty: z
      .string()
      .pipe(
        z.enum(
          Object.keys(reporterSpecialtyLabels) as [ReporterSpecialty, ...ReporterSpecialty[]],
          "Select a specialty",
        ),
      ),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a date as DD/MM/YYYY"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Enter a time as HH:MM"),
    clinicalIndication: longText("Give the reason for the scan"),
    findings: longText("Describe what the scan shows"),
    impression: longText("Summarise the key conclusions"),
    recommendations: longText("Suggest the next steps"),
    attachments: z
      .array(z.instanceof(File).refine((file) => file.size <= MAX_ATTACHMENT_BYTES, "Over 50 MB"))
      .max(20, "Attach up to 20 files"),
    comment: z.string().trim().max(1000, "Keep the comment to 1,000 characters"),
  })
  .superRefine(({ date, time }, context) => {
    const now = new Date();
    if (date > toIsoDate(now)) {
      context.addIssue({
        code: "custom",
        path: ["date"],
        message: "The date can’t be later than today",
      });
    } else if (time && new Date(`${date}T${time}`) > now) {
      context.addIssue({ code: "custom", path: ["time"], message: "That time hasn’t come yet" });
    }
  });
export type UploadResultInput = z.input<typeof uploadResultSchema>;
export type UploadResultValues = z.output<typeof uploadResultSchema>;

/** Which fields each step of the dialog checks before moving on. */
export const uploadResultSteps = [
  ["reporterName", "specialty", "date", "time"],
  ["clinicalIndication", "findings", "impression", "recommendations"],
  ["attachments", "comment"],
] as const satisfies (keyof UploadResultInput)[][];

/**
 * The Imaging Info dialog: when the scan is (or was) taken. It can be booked ahead or logged
 * afterwards, but not before the doctor asked for it.
 */
export function imagingTimeSchema(requestedAt: Date) {
  return z
    .object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a date as DD/MM/YYYY"),
      time: z.string().regex(/^\d{2}:\d{2}$/, "Enter a time as HH:MM"),
    })
    .superRefine(({ date, time }, context) => {
      if (date < toIsoDate(requestedAt)) {
        context.addIssue({
          code: "custom",
          path: ["date"],
          message: "Pick a date from the day it was requested on",
        });
      } else if (time && new Date(`${date}T${time}`) < requestedAt) {
        context.addIssue({
          code: "custom",
          path: ["time"],
          message: "Pick a time after it was requested",
        });
      }
    });
}
export type ImagingTimeValues = z.infer<ReturnType<typeof imagingTimeSchema>>;

/** The Reject Scan Order dialog: why, for the requesting doctor. */
export const rejectOrderSchema = z.object({
  reason: required("Say why you’re rejecting this request").max(
    1000,
    "Keep the note to 1,000 characters",
  ),
});
export type RejectOrderValues = z.infer<typeof rejectOrderSchema>;
