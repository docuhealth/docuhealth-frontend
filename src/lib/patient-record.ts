import { z } from "zod";
import { fullName, optionalText, text } from "@/lib/staff-profile";

// A registered patient as the API returns them: `GET /api/patients/{hin}/details` (front desk),
// `patient_info` in `GET /api/patients/{hin}/info` (clinical staff and admins) and in patient lists.

export type PatientSex = "male" | "female" | "prefer_not_to_say";

/** The API's gender → the app's sex ("other" and "unknown" read as not saying). */
export const sexOf = (gender: string | null | undefined): PatientSex =>
  gender === "male" || gender === "female" ? gender : "prefer_not_to_say";

/** The app's sex → the API's gender. */
export const genderOf = (sex: PatientSex) => (sex === "prefer_not_to_say" ? "unknown" : sex);

export const patientRecordSchema = z
  .object({
    hin: z.string(),
    firstname: text,
    lastname: text,
    middlename: optionalText,
    dob: z.string(),
    gender: optionalText,
    phone_num: optionalText,
    email: optionalText,
    contact_email: optionalText,
    house_no: optionalText,
    street: optionalText,
    city: optionalText,
    state: optionalText,
    country: optionalText,
    payment_provider: z.object({ type: optionalText }).nullish(),
  })
  .transform((patient) => ({
    // Patients are addressed by HIN; the API has no other id for them.
    id: patient.hin,
    name: fullName(patient.firstname, patient.lastname) || patient.hin,
    hin: patient.hin,
    dateOfBirth: patient.dob,
    sex: sexOf(patient.gender),
    avatarUrl: null,
    phone: patient.phone_num,
    email: patient.email ?? patient.contact_email,
    address:
      [
        [patient.house_no, patient.street].filter(Boolean).join(" "),
        patient.city,
        patient.state,
        patient.country,
      ]
        .filter(Boolean)
        .join(", ") || null,
    /** TODO(api): the API's `company` has no match in the designs' coverage lists. */
    coverage:
      (["hmo", "private"] as const).find((type) => type === patient.payment_provider?.type) ?? null,
  }));
export type PatientRecord = z.infer<typeof patientRecordSchema>;
