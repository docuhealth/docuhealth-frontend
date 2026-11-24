import { z } from "zod";
import {
  type FacilityType,
  facilityTypeLabels,
  staffRoles,
  type StaffMember,
} from "@/features/hospital-admin/api/schemas";
import { MESSAGE_LIMIT, messageText } from "@/features/hospital-admin/lib/welcome-message";

const required = (message: string) => z.string().trim().min(1, message);
const phone = z
  .string()
  .trim()
  .regex(/^\+?\d[\d\s-]{6,}$/, "Enter a valid phone number");
const email = z.email("Enter a valid email address");

/**
 * The Add Facility dialog: which facility, its own name and address (the API needs them), and
 * the admin we invite to run it.
 */
export const addFacilitySchema = z.object({
  // Empty until one is picked, so the select can start blank.
  type: z
    .string()
    .pipe(
      z.enum(
        Object.keys(facilityTypeLabels) as [FacilityType, ...FacilityType[]],
        "Select a facility",
      ),
    ),
  name: required("Enter the facility's name"),
  state: required("Select a state"),
  city: required("Select a city / LGA"),
  street: required("Enter the street address"),
  firstName: required("Enter the admin's first name"),
  lastName: required("Enter the admin's last name"),
  phone,
  email,
});
export type AddFacilityInput = z.input<typeof addFacilitySchema>;
export type AddFacilityValues = z.output<typeof addFacilitySchema>;

type StaffRole = NonNullable<StaffMember["role"]>;

/** The Add Staff dialog, both steps: who they are, then their login and welcome message. */
export const addStaffSchema = z.object({
  firstName: required("Enter their first name"),
  lastName: required("Enter their last name"),
  phone,
  role: z
    .string()
    .pipe(z.enum(Object.keys(staffRoles) as [StaffRole, ...StaffRole[]], "Select a role")),
  isAdmin: z.boolean(),
  email,
  /** HTML from the message editor. */
  message: z
    .string()
    .refine((html) => messageText(html).trim() !== "", "Write a welcome message")
    .refine(
      (html) => messageText(html).length <= MESSAGE_LIMIT,
      `Keep the message to ${MESSAGE_LIMIT} characters`,
    ),
});
export type AddStaffInput = z.input<typeof addStaffSchema>;
export type AddStaffValues = z.output<typeof addStaffSchema>;

/** The fields on Add Staff's first step, checked before it moves on to the second. */
export const addStaffStepOne = ["firstName", "lastName", "phone", "role"] as const;

/**
 * The Create / Manage Ward dialog. `occupied` is how many beds are taken (0 for a new ward):
 * a ward can't shrink below them.
 */
export const wardFormSchema = (occupied: number) =>
  z.object({
    name: required("Enter the ward’s name").max(100, "Keep the name to 100 characters"),
    totalBeds: z.coerce
      .number<string>("Enter how many beds it has")
      .int("Use a whole number")
      .min(1, "A ward needs at least one bed")
      .min(occupied, `${occupied} beds are taken, so it needs at least ${occupied}`)
      .max(500, "Use 500 beds or fewer"),
  });
export type WardFormInput = z.input<ReturnType<typeof wardFormSchema>>;
export type WardFormValues = z.output<ReturnType<typeof wardFormSchema>>;
