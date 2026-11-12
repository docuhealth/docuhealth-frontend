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

export const nextStepSchema = z
  .enum(["nin_not_verified", "admin_details_required"])
  .nullable()
  .optional()
  .transform((val) => val ?? null);

export const actingAsContextSchema = z.object({
  type: z.enum(["self", "facility_staff", "proxy"]).optional(),
  as: z.enum(["self", "dependant", "proxy"]).optional(),
  hin: z.string().optional(),
  facility: z
    .object({
      id: z.string(),
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

export const authUserPayloadSchema = z.object({
  id: z.string().optional(),
  sqid: z.string().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  name: z.string().optional(),
  email: z.string().nullable().optional(),
  phone_num: z.string().nullable().optional(),
  hin: z.union([z.string(), z.number()]).nullable().optional(),
  role: z.string().optional(),
});

const loginPayloadCoreSchema = z.object({
  access_token: z.string(),
  acting_as: z.array(actingAsContextSchema).default([]),
  next_step: nextStepSchema,
  hin: z.union([z.string(), z.number()]).optional(),
  user: authUserPayloadSchema.optional(),
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
export type VerifySignupCodeResponse = z.infer<typeof verifySignupCodeResponseSchema>;

export const forgotPasswordVerifyResponseSchema = unwrapEnvelope(
  z.object({
    access_token: z.string().optional(),
    reset_token: z.string().optional(),
    token: z.string().optional(),
  }),
).transform((inner) => ({
  resetToken: inner.access_token ?? inner.reset_token ?? inner.token ?? null,
}));

export const facilityTypeApiSchema = z.enum([
  "hospital",
  "laboratory",
  "radiology",
  "pharmacy",
  "observation",
]);
export type FacilityTypeApi = z.infer<typeof facilityTypeApiSchema>;

export const staffRoleApiSchema = z.enum([
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
export type ApplicationPartSaved = z.infer<typeof applicationPartSavedSchema>;

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
export type FacilityRegistered = z.infer<typeof facilityRegisteredSchema>;
