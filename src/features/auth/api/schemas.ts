import { z } from "zod";

/**
 * Unwraps the standard DocuHealth API envelope (`{ status, message, data }`) when present,
 * or parses the payload directly when unwrapped.
 */
function unwrapEnvelope<TSchema extends z.ZodType>(schema: TSchema) {
  return z
    .union([
      z.object({
        status: z.string().optional(),
        message: z.string().optional(),
        data: schema,
      }),
      schema,
    ])
    .transform((val): z.output<TSchema> => {
      if (typeof val === "object" && val !== null && "data" in val && val.data !== undefined) {
        return val.data as z.output<TSchema>;
      }
      return val as z.output<TSchema>;
    });
}

const nextStepSchema = z
  .enum(["nin_not_verified", "admin_details_required"])
  .nullable()
  .optional()
  .transform((val) => val ?? null);

/** An id or HIN the API may send as a string or a number; always a string here. */
const idText = z.union([z.string(), z.number()]).transform(String);

const actingAsContextSchema = z.object({
  type: z.enum(["self", "facility_staff", "proxy"]).optional(),
  as: z.enum(["self", "dependant", "proxy"]).optional(),
  hin: idText.optional(),
  facility: z
    .object({
      id: idText,
      name: z.string().optional(),
      type: z.string(),
    })
    .optional(),
  facility_sqid: z.string().optional(),
  facility_type: z.string().optional(),
  staff_role: z.string().optional(),
  role: z.string().optional(),
  is_admin: z.boolean().optional(),
  patient_sqid: z.string().optional(),
});

const authUserPayloadSchema = z.object({
  id: idText.optional(),
  sqid: z.string().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  name: z.string().optional(),
  email: z.string().nullable().optional(),
  phone_num: z.string().nullable().optional(),
  hin: z.union([z.string(), z.number()]).nullable().optional(),
  role: z.string().optional(),
});

// The session is the httpOnly cookies the reply sets; the body carries no token any more.
const loginPayloadCoreSchema = z.object({
  acting_as: z.array(actingAsContextSchema).default([]),
  next_step: nextStepSchema,
  hin: z.union([z.string(), z.number()]).optional(),
  user: authUserPayloadSchema.optional(),
  /** Only on a DocuHealth admin's login (`dhadmin`), which has no `acting_as` or `user`. */
  role: z.string().optional(),
});

export const loginResponseSchema = unwrapEnvelope(loginPayloadCoreSchema);
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const messageResponseSchema = z
  .object({
    status: z.string().optional(),
    message: z.string().optional(),
    data: z.unknown().optional(),
  })
  .passthrough();

export const verifySignupCodeResponseSchema = unwrapEnvelope(
  z.object({
    signup_token: z.string(),
  }),
);

/** A right reset code: the reply sets a 5-minute access cookie and says nothing we need. */
export const forgotPasswordVerifyResponseSchema = z.unknown();

const facilityTypeApiSchema = z.enum([
  "hospital",
  "laboratory",
  "radiology",
  "pharmacy",
  "observation",
]);
export type FacilityTypeApi = z.infer<typeof facilityTypeApiSchema>;

const staffRoleApiSchema = z.enum([
  "doctor",
  "nurse",
  "receptionist",
  "lab_scientist",
  "radiologist",
  "pharmacist",
]);
export type StaffRoleApi = z.infer<typeof staffRoleApiSchema>;

export const facilityApplicationSubmittedSchema = unwrapEnvelope(
  z.object({
    sqid: z.string(),
    facility_type: facilityTypeApiSchema,
    name: z.string(),
    official_email: z.string(),
    status: z.string(),
    created_at: z.string().optional(),
  }),
);
export type FacilityApplicationSubmitted = z.infer<typeof facilityApplicationSubmittedSchema>;

export const applicationPartSavedSchema = unwrapEnvelope(
  z.object({
    application: z.string(),
    part: z.string(),
    facility_type: facilityTypeApiSchema,
    saved: z.boolean(),
    email_verified: z.boolean().optional(),
  }),
);

export const facilityRegisteredSchema = unwrapEnvelope(
  z.object({
    sqid: z.string(),
    facility_type: facilityTypeApiSchema,
    name: z.string(),
    official_email: z.string(),
    code: z.string().optional(),
    is_verified: z.boolean().optional(),
    created_at: z.string().optional(),
  }),
);
