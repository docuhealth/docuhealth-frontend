import { z } from "zod";
import { toIsoDate } from "@/lib/date-input";
import { type Sex, sexLabels } from "@/features/receptionist/api/schemas";

const required = (message: string) => z.string().trim().min(1, message);

/** How many digits the emailed verification code has. */
export const CODE_LENGTH = 6;

/**
 * The Register Patient dialog, all three steps: who the patient is, the code sent to their
 * email, then their NIN and the password for their account.
 */
export const registerPatientSchema = z
  .object({
    firstName: required("Enter the patient's first name"),
    lastName: required("Enter the patient's last name"),
    otherName: z.string().trim(),
    // Empty until one is picked, so the select can start blank.
    gender: z.string().pipe(z.enum(Object.keys(sexLabels) as [Sex, ...Sex[]], "Select a gender")),
    email: z.email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .regex(/^\+?\d[\d\s-]{6,}$/, "Enter a valid phone number"),
    code: z
      .string()
      .regex(new RegExp(`^\\d{${CODE_LENGTH}}$`), `Enter the ${CODE_LENGTH}-digit code`),
    nin: z
      .string()
      .transform((value) => value.replace(/\D/g, ""))
      .pipe(z.string().length(11, "Enter the patient's 11-digit NIN")),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterPatientInput = z.input<typeof registerPatientSchema>;
export type RegisterPatientValues = z.output<typeof registerPatientSchema>;

/** The fields on each step, checked before it moves on. */
export const registerPatientSteps = {
  1: ["firstName", "lastName", "otherName", "gender", "email", "phone"],
  2: ["code"],
} as const;

/** The Book Appointment dialog. `date` is "YYYY-MM-DD" and `time` "HH:MM", or "" until whole. */
export const bookAppointmentSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a date as DD/MM/YYYY"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Enter a time as HH:MM"),
    note: z.string().trim().max(500, "Keep the note to 500 characters"),
  })
  .superRefine(({ date, time }, context) => {
    const now = new Date();
    if (date < toIsoDate(now)) {
      context.addIssue({ code: "custom", path: ["date"], message: "Pick a date from today on" });
    } else if (new Date(`${date}T${time}`) <= now) {
      context.addIssue({ code: "custom", path: ["time"], message: "That time has passed" });
    }
  });
export type BookAppointmentValues = z.infer<typeof bookAppointmentSchema>;
