import { z } from "zod";

const email = z.email("Enter a valid email address");
const phone = z
  .string()
  .trim()
  .regex(/^\+?\d[\d\s-]{6,}$/, "Enter a valid phone number");
const hin = z
  .string()
  .trim()
  .regex(/^\d{9,16}$/, "Enter a valid Health Identification Number (HIN)");
const newPassword = z.string().min(8, "Use at least 8 characters");

const staffIdentifier = z
  .string()
  .trim()
  .min(1, "Enter your email address or phone number")
  .refine(
    (val) => email.safeParse(val).success || phone.safeParse(val).success,
    "Enter a valid email address or phone number",
  );

const patientIdentifier = z
  .string()
  .trim()
  .min(1, "Enter your email, phone number, or HIN")
  .refine(
    (val) =>
      email.safeParse(val).success || phone.safeParse(val).success || hin.safeParse(val).success,
    "Enter a valid email address, phone number, or HIN",
  );

export const patientLoginSchema = z.object({
  identifier: patientIdentifier,
  password: z.string().min(1, "Enter your password"),
});

export const staffLoginSchema = z.object({
  identifier: staffIdentifier,
  password: z.string().min(1, "Enter your password"),
});

export const loginSchema = staffLoginSchema;
export type LoginValues = z.infer<typeof patientLoginSchema>;

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

export const genderLabels = {
  male: "Male",
  female: "Female",
} as const;
export type Gender = keyof typeof genderLabels;
const genders = ["male", "female"] as const;

/** Step 1 of the individual sign-up. */
export const individualInfoSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name"),
  lastName: z.string().trim().min(1, "Enter your last name"),
  otherName: z.string().trim(),
  gender: z.enum(genders, "Select a gender"),
  dob: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter your date of birth")
    .refine((value) => {
      const parsed = new Date(`${value}T00:00:00`);
      return !Number.isNaN(parsed.getTime()) && parsed <= new Date();
    }, "Date of birth cannot be in the future"),
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

export const ninFieldSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ""))
  .pipe(z.string().length(11, "Enter your 11-digit NIN"));

/** Gate screen for migrated patients who have not yet verified their NIN. */
export const verifyNinSchema = z.object({
  nin: ninFieldSchema,
});
export type VerifyNinInput = z.input<typeof verifyNinSchema>;
export type VerifyNinValues = z.output<typeof verifyNinSchema>;

export const firstLoginRoleLabels = {
  doctor: "Doctor",
  nurse: "Nurse",
  receptionist: "Receptionist",
} as const;
export type FirstLoginRole = keyof typeof firstLoginRoleLabels;

/** Gate screen for migrated hospital accounts completing their personal admin profile on first login. */
export const firstLoginSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name"),
  lastName: z.string().trim().min(1, "Enter your last name"),
  phone,
  gender: z.enum(genders, "Select a gender"),
  role: z.enum(
    Object.keys(firstLoginRoleLabels) as [FirstLoginRole, ...FirstLoginRole[]],
    "Select your role",
  ),
});
export type FirstLoginValues = z.infer<typeof firstLoginSchema>;

/** Last step of the individual sign-up: NIN and the account password. */
export const accountDetailsSchema = z
  .object({
    nin: ninFieldSchema,
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
  hospital: "Hospital / Clinic",
  laboratory: "Laboratory only",
  radiology: "Radiology only",
  pharmacy: "Pharmacy / Chemist",
  observation: "Observation / Health Post",
} as const;
export type OrganisationType = keyof typeof organisationTypeLabels;
const organisationTypes = Object.keys(organisationTypeLabels) as [
  OrganisationType,
  ...OrganisationType[],
];

/** First step of the provider sign-up: the facility and how to reach it. */
export const providerInfoSchema = z.object({
  facilityType: z.enum(organisationTypes, "Select an organisation type"),
  organisationName: z.string().trim().min(1, "Enter your organisation's name"),
  email,
  phone,
  message: z.string().trim(),
});
export type ProviderInfoValues = z.infer<typeof providerInfoSchema>;

const DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
export const MAX_DOCUMENTS = 4;

/** Address + licensing documents a facility submits to complete verification. */
export const facilityDocumentsSchema = z.object({
  country: z.string().trim().min(1, "Select a country"),
  state: z.string().trim().min(1, "Select a state"),
  city: z.string().trim().min(1, "Select a city / LGA"),
  street: z.string().trim().min(1, "Enter the street address"),
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

export const adminRoleLabels = {
  doctor: "Doctor",
  nurse: "Nurse",
  receptionist: "Receptionist",
  lab_scientist: "Lab Scientist",
  radiologist: "Radiologist",
  pharmacist: "Pharmacist",
} as const;
export type AdminRole = keyof typeof adminRoleLabels;
const adminRoles = Object.keys(adminRoleLabels) as [AdminRole, ...AdminRole[]];

export const allowedRolesByFacilityType: Record<OrganisationType, AdminRole[]> = {
  hospital: ["doctor", "nurse", "receptionist"],
  observation: ["doctor", "nurse", "receptionist"],
  laboratory: ["lab_scientist"],
  radiology: ["radiologist"],
  pharmacy: ["pharmacist"],
};

/** Admin details step of facility verification or agent hospital registration. */
export const adminDetailsSchema = z.object({
  firstName: z.string().trim().min(1, "Enter the admin's first name"),
  lastName: z.string().trim().min(1, "Enter the admin's last name"),
  email,
  phone,
  gender: z.enum(genders, "Select a gender"),
  role: z.enum(adminRoles, "Select a role"),
  specialization: z.string().trim().optional(),
});
export type AdminDetailsValues = z.infer<typeof adminDetailsSchema>;

export const ownershipLabels = { private: "Private", public: "Public", both: "Both" } as const;
type Ownership = keyof typeof ownershipLabels;

/** Field agent registering a hospital, step 1: what the facility is. */
export const hospitalDetailsSchema = z.object({
  hospitalName: z.string().trim().min(1, "Enter the hospital's name"),
  facilityType: z.enum(organisationTypes, "Select a facility type"),
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
  country: z.string().trim().min(1, "Select a country"),
  state: z.string().trim().min(1, "Select a state"),
  lga: z.string().trim().min(1, "Select an LGA"),
  streetAddress: z.string().trim().min(1, "Enter the street address"),
  phone,
  email,
});
export type HospitalLocationValues = z.infer<typeof hospitalLocationSchema>;
