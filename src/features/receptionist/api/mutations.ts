import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { receptionistKeys } from "@/features/receptionist/api/queries";
import {
  appointmentRequestSchema,
  appointmentSchema,
  emailVerifiedSchema,
  queueEntrySchema,
  registeredPatientSchema,
  type Sex,
  verificationSentSchema,
} from "@/features/receptionist/api/schemas";

/**
 * Check a patient in the queue out. Refreshes every receptionist query, since it shortens the
 * queue and changes the overview's numbers.
 */
export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      request(queueEntrySchema, {
        method: "POST",
        url: `/hospital/reception/queue/${id}/check-out`,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receptionistKeys.all }),
  });
}

/** Confirm or cancel an appointment request, e.g. while checking the patient out. */
export function useAnswerAppointmentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, answer }: { id: string; answer: "confirm" | "cancel" }) =>
      request(appointmentRequestSchema, {
        method: "POST",
        url: `/hospital/reception/appointment-requests/${id}/${answer}`,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receptionistKeys.all }),
  });
}

/** Email a verification code to a patient being registered (again, for "Resend Code"). */
export function useSendPatientCode() {
  return useMutation({
    mutationFn: (email: string) =>
      request(verificationSentSchema, {
        method: "POST",
        url: "/hospital/reception/patient-verifications",
        data: { email },
      }),
  });
}

/** Check the code the patient received; the token it returns goes with their registration. */
export function useVerifyPatientEmail() {
  return useMutation({
    mutationFn: (verification: { email: string; code: string }) =>
      request(emailVerifiedSchema, {
        method: "POST",
        url: "/hospital/reception/patient-verifications/check",
        data: verification,
      }),
  });
}

/** Create a patient's account. Refreshes every receptionist query, since lookups can now find them. */
export function useRegisterPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patient: {
      firstName: string;
      lastName: string;
      otherName: string;
      sex: Sex;
      email: string;
      phone: string;
      nin: string;
      password: string;
      verificationToken: string;
    }) =>
      request(registeredPatientSchema, {
        method: "POST",
        url: "/hospital/reception/patients",
        data: patient,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receptionistKeys.all }),
  });
}

/**
 * Book a patient in at `at` (ISO). Refreshes every receptionist query: the appointment lists,
 * the overview's count and the patient's upcoming appointment all change.
 */
export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointment: { patientId: string; at: string; note: string }) =>
      request(appointmentSchema, {
        method: "POST",
        url: "/hospital/reception/appointments",
        data: appointment,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receptionistKeys.all }),
  });
}
