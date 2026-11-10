import { env } from "@/env";
import type {
  BookAppointmentValues,
  CancelAppointmentInput,
  ChildDetailsInput,
  LinkGuardianInput,
  RegisterPatientInput,
} from "@/features/receptionist/lib/schemas";
import { toIsoDate } from "@/lib/date-input";

/**
 * Sample answers so the receptionist's forms can be clicked through on the dev server. Never
 * applies to production builds, whatever VITE_PREFILL_FORMS says.
 */
const enabled = import.meta.env.DEV && env.VITE_PREFILL_FORMS;

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

export const devPrefill = enabled
  ? {
      // Adeola Williams in the mock data.
      checkIn: { hin: "123-345-678-90" },
      // Register patient → Kid: Adeola brings her son Samuel (6), who's already on record.
      registerKind: "kid" as const,
      guardianHin: "123-345-678-90",
      childHin: "123-345-678-91",
      // 123456 is the code the mock API accepts.
      registerPatient: {
        firstName: "Bola",
        lastName: "Adekunle",
        otherName: "Funmilayo",
        gender: "female",
        email: "bola.adekunle@email.com",
        phone: "+234-803-111-2233",
        code: "123456",
        nin: "12345678901",
        password: "Welcome123!",
        confirmPassword: "Welcome123!",
      } satisfies RegisterPatientInput,
      bookAppointment: {
        date: toIsoDate(tomorrow),
        time: "10:30",
        note: "Review blood test results.",
      } satisfies BookAppointmentValues,
      // A new guardian (look up 999-999-999-99 to reach "No guardian found"); 123456 verifies.
      registerGuardian: {
        firstName: "Adaeze",
        lastName: "Okafor",
        otherName: "",
        gender: "female",
        email: "",
        phone: "0803 412 7781",
        code: "123456",
        nin: "12345678901",
        password: "Welcome123!",
        confirmPassword: "Welcome123!",
      } satisfies RegisterPatientInput,
      childDetails: {
        firstName: "Chidi",
        lastName: "Okafor",
        dateOfBirth: "2019-03-14",
        gender: "male",
      } satisfies ChildDetailsInput,
      linkGuardian: {
        relationship: "mother",
        verification: "verified",
        primaryContact: true,
        canConsentToTreatment: true,
      } satisfies LinkGuardianInput,
      cancelAppointment: {
        reason: "schedule_conflict",
        details: "",
      } satisfies CancelAppointmentInput,
    }
  : undefined;
