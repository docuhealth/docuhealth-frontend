import { env } from "@/env";
import type {
  BookAppointmentValues,
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
    }
  : undefined;
