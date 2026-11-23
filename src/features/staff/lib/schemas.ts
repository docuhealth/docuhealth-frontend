import { z } from "zod";

const required = (message: string) => z.string().trim().min(1, message);

/** The Edit personal details dialog. */
export const editProfileSchema = z.object({
  firstName: required("Enter your first name").max(100, "Keep this to 100 characters"),
  lastName: required("Enter your last name").max(100, "Keep this to 100 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d[\d\s-]{6,}$/, "Enter a valid phone number"),
});
export type EditProfileValues = z.infer<typeof editProfileSchema>;

/** Step 1 of Change email: where the code goes. */
export const newEmailSchema = z.object({ email: z.email("Enter a valid email address") });
export type NewEmailValues = z.infer<typeof newEmailSchema>;

/** How many digits the emailed code has. */
export const EMAIL_CODE_LENGTH = 6;

/** Step 2 of Change email: the code from that email. */
export const emailCodeSchema = z.object({
  code: z
    .string()
    .regex(new RegExp(`^\\d{${EMAIL_CODE_LENGTH}}$`), `Enter the ${EMAIL_CODE_LENGTH}-digit code`),
});
export type EmailCodeValues = z.infer<typeof emailCodeSchema>;

/** The Change password dialog. */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine(({ newPassword, confirmPassword }) => newPassword === confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(({ currentPassword, newPassword }) => currentPassword !== newPassword, {
    message: "Choose a password different from your current one",
    path: ["newPassword"],
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

/** Giving an appointment to a doctor: who, and when (not in the past). */
export const assignAppointmentSchema = z
  .object({
    doctor: z.string().min(1, "Choose the doctor"),
    date: z.string().min(1, "Choose the date"),
    time: z.string().min(1, "Choose the time"),
    note: z.string().trim().max(1000, "Keep the note to 1,000 characters"),
  })
  .refine(({ date, time }) => !date || !time || new Date(`${date}T${time}`) > new Date(), {
    message: "Choose a time that hasn’t passed",
    path: ["time"],
  });
export type AssignAppointmentValues = z.infer<typeof assignAppointmentSchema>;
