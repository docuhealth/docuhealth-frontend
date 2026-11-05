import { z } from "zod";

const email = z.email("Enter a valid email address");
const phone = z
  .string()
  .trim()
  .regex(/^\+?\d[\d\s-]{6,}$/, "Enter a valid phone number");
const newPassword = z.string().min(8, "Use at least 8 characters");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const accountTypes = ["individual", "provider"] as const;
export type AccountType = (typeof accountTypes)[number];

export const accountTypeSchema = z.object({
  accountType: z.enum(accountTypes, "Choose an account type"),
});
export type AccountTypeValues = z.infer<typeof accountTypeSchema>;

const genders = ["male", "female", "prefer_not_to_say"] as const;

/** Step 1 of the individual sign-up. */
export const individualInfoSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name"),
  lastName: z.string().trim().min(1, "Enter your last name"),
  otherName: z.string().trim(),
  gender: z.enum(genders, "Select a gender"),
  email,
  phone,
  acceptTerms: z.literal(true, "Accept the Terms and Privacy Policy to continue"),
});
export type IndividualInfoValues = z.infer<typeof individualInfoSchema>;

export const OTP_LENGTH = 6;

export const verifyCodeSchema = z.object({
  code: z.string().regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Enter the ${OTP_LENGTH}-digit code`),
});
export type VerifyCodeValues = z.infer<typeof verifyCodeSchema>;

/** Last step of the individual sign-up: NIN and the account password. */
export const accountDetailsSchema = z
  .object({
    nin: z
      .string()
      .transform((value) => value.replace(/\D/g, ""))
      .pipe(z.string().length(11, "Enter your 11-digit NIN")),
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type AccountDetailsInput = z.input<typeof accountDetailsSchema>;
export type AccountDetailsValues = z.output<typeof accountDetailsSchema>;

export const organisationTypeLabels = {
  hospital: "Hospital/Clinic",
  laboratory: "Laboratory only",
  radiology: "Radiology only",
  pharmacy: "Pharmacy/Chemist",
} as const;
type OrganisationType = keyof typeof organisationTypeLabels;

/** First step of the provider sign-up: the facility and how to reach it. */
export const providerInfoSchema = z.object({
  organisationTypes: z
    .array(z.enum(Object.keys(organisationTypeLabels) as [OrganisationType, ...OrganisationType[]]))
    .min(1, "Select at least one organisation type"),
  organisationName: z.string().trim().min(1, "Enter your organisation's name"),
  email,
  phone,
  message: z.string().trim(),
});
export type ProviderInfoValues = z.infer<typeof providerInfoSchema>;

const DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
export const MAX_DOCUMENTS = 4;

/** Licensing documents a facility uploads from the verification email's link. */
export const facilityDocumentsSchema = z.object({
  files: z
    .array(
      z
        .instanceof(File)
        .refine((file) => DOCUMENT_TYPES.includes(file.type), "Use PDF, JPG or PNG files")
        .refine((file) => file.size <= MAX_DOCUMENT_BYTES, "Each file must be 5 MB or less"),
    )
    .min(1, "Upload at least one document")
    .max(MAX_DOCUMENTS, `Upload up to ${MAX_DOCUMENTS} files`),
});
export type FacilityDocumentsValues = z.infer<typeof facilityDocumentsSchema>;

/** Second step of facility verification: who gets the setup invite. */
export const adminDetailsSchema = z.object({
  firstName: z.string().trim().min(1, "Enter the admin's first name"),
  lastName: z.string().trim().min(1, "Enter the admin's last name"),
  email,
  phone,
});
export type AdminDetailsValues = z.infer<typeof adminDetailsSchema>;

export const ownershipLabels = { private: "Private", public: "Public", both: "Both" } as const;
type Ownership = keyof typeof ownershipLabels;

/** Field agent registering a hospital, step 1: what the facility is. */
export const hospitalDetailsSchema = z.object({
  hospitalName: z.string().trim().min(1, "Enter the hospital's name"),
  facilityTypes: z
    .array(z.enum(Object.keys(organisationTypeLabels) as [OrganisationType, ...OrganisationType[]]))
    .min(1, "Select at least one facility type"),
  ownership: z.enum(
    Object.keys(ownershipLabels) as [Ownership, ...Ownership[]],
    "Select ownership",
  ),
  rcNumber: z
    .string()
    .trim()
    .regex(/^(RC)?\s*\d{4,8}$/i, "Enter a valid CAC RC number, e.g. RC 123456"),
});
export type HospitalDetailsValues = z.infer<typeof hospitalDetailsSchema>;

/** Field agent registering a hospital, step 2: where it is and how to reach it. */
export const hospitalLocationSchema = z.object({
  state: z.string().trim().min(1, "Enter the state"),
  lga: z.string().trim().min(1, "Enter the LGA"),
  streetAddress: z.string().trim().min(1, "Enter the street address"),
  phone,
  email,
});
export type HospitalLocationValues = z.infer<typeof hospitalLocationSchema>;
