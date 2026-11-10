import { z } from "zod";
import { toIsoDate } from "@/lib/date-input";
import {
  type CancellationReason,
  cancellationReasonLabels,
  type GuardianVerification,
  guardianVerificationLabels,
  type Relationship,
  relationshipLabels,
  type Sex,
  sexLabels,
} from "@/features/receptionist/api/schemas";

const required = (message: string) => z.string().trim().min(1, message);

/** How many digits the emailed verification code has. */
export const CODE_LENGTH = 6;

/**
 * The Register Patient dialog, all three steps: who the patient is, the code sent to their
 * email, then their NIN and the password for their account.
 */
const patientFields = {
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
    .pipe(z.string().length(11, "Enter the 11-digit NIN")),
  password: z.string().min(8, "Use at least 8 characters"),
  confirmPassword: z.string(),
};

const passwordsMatch = {
  check: (values: { password: string; confirmPassword: string }) =>
    values.password === values.confirmPassword,
  issue: { message: "Passwords do not match", path: ["confirmPassword"] },
};

export const registerPatientSchema = z
  .object(patientFields)
  .refine(passwordsMatch.check, passwordsMatch.issue);
export type RegisterPatientInput = z.input<typeof registerPatientSchema>;
export type RegisterPatientValues = z.output<typeof registerPatientSchema>;

/**
 * A guardian registered while bringing a child in: the same steps, but the code goes to their
 * phone, so an email is optional.
 */
export const registerGuardianSchema = z
  .object({
    ...patientFields,
    firstName: required("Enter the guardian's first name"),
    lastName: required("Enter the guardian's last name"),
    email: z.union([z.literal(""), z.email("Enter a valid email address")]),
  })
  .refine(passwordsMatch.check, passwordsMatch.issue);

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

/** The Cancel Appointment dialog: a reason, spelled out in `details` when it's "Other". */
export const cancelAppointmentSchema = z
  .object({
    // Empty until one is picked.
    reason: z
      .string()
      .pipe(
        z.enum(
          Object.keys(cancellationReasonLabels) as [CancellationReason, ...CancellationReason[]],
          "Pick a reason",
        ),
      ),
    details: z.string().trim().max(500, "Keep the reason to 500 characters"),
  })
  .refine(({ reason, details }) => reason !== "other" || details.length > 0, {
    message: "Say why the appointment is being cancelled",
    path: ["details"],
  });
export type CancelAppointmentInput = z.input<typeof cancelAppointmentSchema>;
export type CancelAppointmentValues = z.output<typeof cancelAppointmentSchema>;

/** From this age a patient is an adult and registers on their own. */
export const ADULT_AGE = 18;

/** A new child for "Who is the child?": who they are and when they were born. */
export const childDetailsSchema = z
  .object({
    firstName: required("Enter the child's first name"),
    lastName: required("Enter the child's last name"),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a date as DD/MM/YYYY"),
    gender: z.string().pipe(z.enum(Object.keys(sexLabels) as [Sex, ...Sex[]], "Select a gender")),
  })
  .superRefine(({ dateOfBirth }, context) => {
    const now = new Date();
    const adultsBornBy = new Date(now.getFullYear() - ADULT_AGE, now.getMonth(), now.getDate());
    if (dateOfBirth > toIsoDate(now)) {
      context.addIssue({
        code: "custom",
        path: ["dateOfBirth"],
        message: "That date hasn’t come yet",
      });
    } else if (dateOfBirth <= toIsoDate(adultsBornBy)) {
      context.addIssue({
        code: "custom",
        path: ["dateOfBirth"],
        message: `A child is under ${ADULT_AGE}; register adults on their own`,
      });
    }
  });
export type ChildDetailsInput = z.input<typeof childDetailsSchema>;
export type ChildDetailsValues = z.output<typeof childDetailsSchema>;

/** "Link guardian and child": how they're related and whether that's been confirmed. */
export const linkGuardianSchema = z.object({
  relationship: z
    .string()
    .pipe(
      z.enum(
        Object.keys(relationshipLabels) as [Relationship, ...Relationship[]],
        "Select how they're related",
      ),
    ),
  verification: z
    .string()
    .pipe(
      z.enum(
        Object.keys(guardianVerificationLabels) as [
          GuardianVerification,
          ...GuardianVerification[],
        ],
        "Choose a verification status",
      ),
    ),
  primaryContact: z.boolean(),
  canConsentToTreatment: z.boolean(),
});
export type LinkGuardianInput = z.input<typeof linkGuardianSchema>;
export type LinkGuardianValues = z.output<typeof linkGuardianSchema>;
