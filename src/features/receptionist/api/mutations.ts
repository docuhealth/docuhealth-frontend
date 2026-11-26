import { useMutation, useQueryClient } from "@tanstack/react-query";
import { codeSentResponseSchema, request } from "@/lib/api";
import { NotAvailableYetError } from "@/lib/not-available";
import { genderOf } from "@/lib/patient-record";
import { receptionistKeys } from "@/features/receptionist/api/queries";
import {
  anyResponseSchema,
  type CancellationReason,
  cancellationReasonLabels,
  confirmedAppointmentSchema,
  createdDependantSchema,
  type DependentLinked,
  type GuardianVerification,
  guardianVerificationLabels,
  patientDetailsSchema,
  type Relationship,
  relationshipLabels,
  type Sex,
  signedUpPatientSchema,
  signupTokenSchema,
} from "@/features/receptionist/api/schemas";

// The front desk's actions on the real API. Those the design has but the API can't do yet fail
// with NotAvailableYetError (TODO(api); see docs/backend-gaps-v2-migration.md, section 7).

/**
 * Check a patient in the queue out (close their check-in). Refreshes every receptionist query,
 * since it shortens the queue and changes the overview's numbers. TODO(api): the endpoint is
 * documented for doctors; check the front desk may use it.
 */
export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      request(anyResponseSchema, {
        method: "POST",
        url: `/api/hospital-ops/check-ins/${encodeURIComponent(id)}/close`,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receptionistKeys.all }),
  });
}

/** Confirm or cancel a doctor's appointment request. TODO(api): no endpoint yet. */
export function useAnswerAppointmentRequest() {
  return useMutation({
    mutationFn: async (_answer: { id: string; answer: "confirm" | "cancel" }) => {
      throw new NotAvailableYetError("Answering appointment requests");
    },
  });
}

/** Step 1 of registering someone at the desk: who they are and how to reach them. */
type SignupDetails = {
  firstName: string;
  lastName: string;
  otherName: string;
  sex: Sex;
  /** ISO date (`YYYY-MM-DD`). */
  dateOfBirth: string;
  email: string;
  phone: string;
};

/**
 * Start a desk signup: the API takes every detail now and sends the code to the email (or, for
 * a guardian, the phone), and says where (masked) in `destination`. It answers the same whether
 * or not the contact already has an account; the code step tells (409 `account_exists`).
 */
function startSignup(details: SignupDetails, verifyBy: "email" | "phone") {
  return request(codeSentResponseSchema, {
    method: "POST",
    url: "/api/auth/signup/desk",
    data: {
      firstname: details.firstName,
      lastname: details.lastName,
      middlename: details.otherName || undefined,
      gender: genderOf(details.sex),
      dob: details.dateOfBirth,
      email: details.email || undefined,
      phone: details.phone || undefined,
      verify_by: verifyBy,
    },
  });
}

/** Email a verification code to a patient being registered (again, for "Resend Code"). */
export function useSendPatientCode() {
  return useMutation({
    mutationFn: (details: SignupDetails) => startSignup(details, "email"),
  });
}

/** Check the code the patient received; the token it returns goes with their registration. */
export function useVerifyPatientEmail() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      request(signupTokenSchema, {
        method: "POST",
        url: "/api/auth/signup/verify-code",
        data: { email, verify_by: "email", code },
      }),
  });
}

/** Step 3: the NIN and password. The details went in step 1. */
function completeSignup({
  nin,
  password,
  verificationToken,
}: {
  nin: string;
  password: string;
  verificationToken: string;
}) {
  return request(signedUpPatientSchema, {
    method: "POST",
    url: "/api/auth/signup/desk/complete",
    data: { signup_token: verificationToken, nin, password },
  });
}

/** Create a patient's account. Refreshes every receptionist query, since lookups can now find them. */
export function useRegisterPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      patient: SignupDetails & { nin: string; password: string; verificationToken: string },
    ) => completeSignup(patient),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receptionistKeys.all }),
  });
}

const appointmentUrl = (id: string, action: string) =>
  `/api/hospital-ops/appointments/${encodeURIComponent(id)}/${action}`;

/**
 * Book a patient (`patientId`, their HIN) in at `at` (ISO) with the staff member `staffId`. The
 * appointment starts `pending`. Refreshes every receptionist query.
 */
export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      staffId,
      at,
      note,
    }: {
      patientId: string;
      staffId: string;
      at: string;
      note: string;
    }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: "/api/hospital-ops/appointments/book",
        data: { patient: patientId, staff: staffId, scheduled_time: at, note: note || undefined },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receptionistKeys.all }),
  });
}

/**
 * Confirm a pending appointment (most are patients' bookings from the app), naming the staff
 * member who will see the patient. Refreshes every receptionist query.
 */
export function useConfirmAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, staffId }: { id: string; staffId: string }) =>
      request(confirmedAppointmentSchema, {
        method: "POST",
        url: appointmentUrl(id, "confirm"),
        data: { staff: staffId },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receptionistKeys.all }),
  });
}

/**
 * Move an appointment to `at` (ISO); its status stays as it is. The note is sent only when it
 * changed, since sending it replaces the patient's reason for the visit. Refreshes every
 * receptionist query.
 */
export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      at,
      note,
      previousNote,
    }: {
      id: string;
      at: string;
      note: string;
      previousNote: string | null;
    }) =>
      request(anyResponseSchema, {
        method: "PATCH",
        url: appointmentUrl(id, "reschedule"),
        data: { scheduled_time: at, ...(note !== (previousNote ?? "") && { note }) },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receptionistKeys.all }),
  });
}

/**
 * Cancel an appointment, saying why: the reason's label, or the details for "Other". Refreshes
 * every receptionist query.
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      reason,
      details,
    }: {
      id: string;
      reason: CancellationReason;
      details: string;
    }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: appointmentUrl(id, "cancel"),
        data: {
          cancellation_reason:
            reason === "other" && details ? details : cancellationReasonLabels[reason],
        },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receptionistKeys.all }),
  });
}

/** Text a verification code to a new guardian's phone (again, for "Resend Code"). */
export function useSendPhoneCode() {
  return useMutation({
    mutationFn: (details: SignupDetails) => startSignup(details, "phone"),
  });
}

/** Check the code texted to a guardian; the token it returns goes with their registration. */
export function useVerifyPhone() {
  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      request(signupTokenSchema, {
        method: "POST",
        url: "/api/auth/signup/verify-code",
        data: { phone, verify_by: "phone", code },
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
    mutationFn: (
      guardian: Omit<SignupDetails, "email"> & {
        email: string | null;
        nin: string;
        password: string;
        verificationToken: string;
      },
    ) => completeSignup(guardian),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receptionistKeys.all }),
  });
}

/**
 * Link a new child to a guardian (`guardianId` is their HIN). Refreshes every receptionist query,
 * since both profiles change. TODO(api): an existing patient can't be linked as a dependant yet.
 */
export function useLinkDependent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (link: {
      guardianId: string;
      child:
        { id: string } | { firstName: string; lastName: string; dateOfBirth: string; sex: Sex };
      relationship: Relationship;
      verification: GuardianVerification;
      primaryContact: boolean;
      canConsentToTreatment: boolean;
    }): Promise<DependentLinked> => {
      if ("id" in link.child) throw new NotAvailableYetError("Linking a child already on record");
      const child = await request(createdDependantSchema, {
        method: "POST",
        url: `/api/patients/${encodeURIComponent(link.guardianId)}/dependants`,
        data: {
          firstname: link.child.firstName,
          lastname: link.child.lastName,
          dob: link.child.dateOfBirth,
          gender: genderOf(link.child.sex),
          relationship: relationshipLabels[link.relationship],
          is_primary_contact: link.primaryContact,
          can_consent: link.canConsentToTreatment,
          // TODO(api): `confirmed_by` is free text; the design's verification status stands in.
          confirmed_by: guardianVerificationLabels[link.verification],
        },
      });
      // The reply is the child alone; the guardian's name comes from their record.
      const guardian = await request(patientDetailsSchema, {
        url: `/api/patients/${encodeURIComponent(link.guardianId)}/details`,
      });
      return {
        child: {
          id: child.hin,
          name: `${child.firstname} ${child.lastname}`.trim(),
          hin: child.hin,
        },
        guardian: { id: guardian.id, name: guardian.name },
      };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receptionistKeys.all }),
  });
}
