import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { receptionistKeys } from "@/features/receptionist/api/queries";
import {
  appointmentDetailSchema,
  appointmentRequestSchema,
  type CancellationReason,
  dependentLinkedSchema,
  type GuardianVerification,
  phoneVerificationSentSchema,
  type Relationship,
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

/**
 * Move an appointment to `at` (ISO), with its note; the patient is told. Refreshes every
 * receptionist query, since it moves between days on the calendar and lists.
 */
export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...change }: { id: string; at: string; note: string }) =>
      request(appointmentDetailSchema, {
        method: "POST",
        url: `/hospital/reception/appointments/${id}/reschedule`,
        data: change,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receptionistKeys.all }),
  });
}

/**
 * Cancel an appointment, saying why (`details` spells out an "other" reason); the patient is
 * told. Refreshes every receptionist query: the counts and lists change.
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...cancellation
    }: {
      id: string;
      reason: CancellationReason;
      details: string;
    }) =>
      request(appointmentDetailSchema, {
        method: "POST",
        url: `/hospital/reception/appointments/${id}/cancel`,
        data: cancellation,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receptionistKeys.all }),
  });
}

/** Text a verification code to a new guardian's phone (again, for "Resend Code"). */
export function useSendPhoneCode() {
  return useMutation({
    mutationFn: (phone: string) =>
      request(phoneVerificationSentSchema, {
        method: "POST",
        url: "/hospital/reception/phone-verifications",
        data: { phone },
      }),
  });
}

/** Check the code texted to a guardian; the token it returns goes with their registration. */
export function useVerifyPhone() {
  return useMutation({
    mutationFn: (verification: { phone: string; code: string }) =>
      request(emailVerifiedSchema, {
        method: "POST",
        url: "/hospital/reception/phone-verifications/check",
        data: verification,
      }),
  });
}

/**
 * Create an account for a guardian bringing a child in. Their email is optional, since the phone
 * is what's verified. Refreshes every receptionist query, since lookups can now find them.
 */
export function useRegisterGuardian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guardian: {
      firstName: string;
      lastName: string;
      otherName: string;
      sex: Sex;
      email: string | null;
      phone: string;
      nin: string;
      password: string;
      verificationToken: string;
    }) =>
      request(registeredPatientSchema, {
        method: "POST",
        url: "/hospital/reception/guardians",
        data: guardian,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receptionistKeys.all }),
  });
}

/**
 * Link a child to a guardian: a child already on record (`child.id`) or a new one, created here.
 * Refreshes every receptionist query, since both profiles change.
 */
export function useLinkDependent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (link: {
      guardianId: string;
      child:
        { id: string } | { firstName: string; lastName: string; dateOfBirth: string; sex: Sex };
      relationship: Relationship;
      verification: GuardianVerification;
      primaryContact: boolean;
      canConsentToTreatment: boolean;
    }) =>
      request(dependentLinkedSchema, {
        method: "POST",
        url: "/hospital/reception/dependents",
        data: link,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receptionistKeys.all }),
  });
}
