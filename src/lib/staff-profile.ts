import { z } from "zod";

// `GET /api/auth/staff/profile`, the signed-in staff member and their facility. Every staff
// dashboard reads it (each through its own feature's query); this parses the API's format once.

export const staffRoleLabels = {
  doctor: "Doctor",
  nurse: "Nurse",
  receptionist: "Receptionist",
  lab_scientist: "Lab Scientist",
  pharmacist: "Pharmacist",
  radiologist: "Radiologist",
  radiographer: "Radiographer",
} as const;
export type StaffRole = keyof typeof staffRoleLabels;

/** "" or null when missing → null. */
export const optionalText = z
  .string()
  .nullish()
  .transform((value) => value?.trim() || null);
/** Missing → "". */
export const text = z
  .string()
  .nullish()
  .transform((value) => value?.trim() ?? "");

export const fullName = (first: string, last: string) => [first, last].filter(Boolean).join(" ");

/** A known role, or null (a hospital's own admin may have none; unknown values are dropped too). */
const staffRole = z
  .string()
  .nullish()
  .transform((value) => (value && value in staffRoleLabels ? (value as StaffRole) : null));

/** `StaffMembershipInfo`: one member of a facility's staff. */
export const staffMemberSchema = z
  .object({
    sqid: z.string(),
    firstname: text,
    lastname: text,
    phone_num: optionalText,
    role: staffRole,
    email: text,
    gender: optionalText,
    is_active: z.boolean(),
  })
  .transform((member) => ({
    id: member.sqid,
    firstName: member.firstname,
    lastName: member.lastname,
    name: fullName(member.firstname, member.lastname) || member.email,
    phone: member.phone_num,
    role: member.role,
    email: member.email,
    gender: member.gender,
    active: member.is_active,
  }));
export type StaffMember = z.infer<typeof staffMemberSchema>;

export const staffProfileSchema = z
  .object({
    staff_info: staffMemberSchema,
    hospital_info: z.object({ name: text }).nullish(),
    hospital_theme: z
      .object({ profile_image: optionalText, bg_image: optionalText, name: optionalText })
      .nullish(),
  })
  .transform(({ staff_info, hospital_info, hospital_theme }) => ({
    user: staff_info,
    hospital: {
      name: hospital_info?.name || hospital_theme?.name || "",
      logoUrl: hospital_theme?.profile_image ?? null,
      bannerUrl: hospital_theme?.bg_image ?? null,
    },
  }));
