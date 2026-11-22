import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { absoluteUrl } from "@/lib/sections";
import { receptionistKeys } from "@/features/receptionist/api/queries";
import {
  anyResponseSchema,
  type CancellationReason,
  createdDependantSchema,
  type DependentLinked,
  genderOf,
  type GuardianVerification,
  guardianVerificationLabels,
  NotAvailableYetError,
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
  email: string;
  phone: string;
};

/**
 * Start a desk signup: the API takes every detail now and sends the code to the email (or, for
 * a guardian, the phone). TODO(api): it also requires a date of birth, which the design's form
 * doesn't ask for, so the API refuses until it's optional or the form asks.
 */
function startSignup(details: SignupDetails, verifyBy: "email" | "phone") {
  return request(anyResponseSchema, {
    method: "POST",
    url: "/api/auth/signup/desk",
    data: {
      firstname: details.firstName,
      lastname: details.lastName,
      middlename: details.otherName || undefined,
      gender: genderOf(details.sex),
      email: details.email || undefined,
      phone: details.phone || undefined,
      verify_by: verifyBy,
      login_url: absoluteUrl("/login"),
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

/**
 * Book a patient in at `at` (ISO). Refreshes every receptionist query. TODO(api): the API requires
 * the staff member the appointment is with, which the design doesn't ask for, so it refuses until
 * that's optional or the dialog asks.
 */
export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, at, note }: { patientId: string; at: string; note: string }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: "/api/hospital-ops/appointments/book",
        data: { patient: patientId, scheduled_time: at, note: note || null },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: receptionistKeys.all }),
  });
}

/** Move an appointment, telling the patient. TODO(api): no endpoint for the front desk yet. */
export function useRescheduleAppointment() {
  return useMutation({
    mutationFn: async (_change: { id: string; at: string; note: string }) => {
      throw new NotAvailableYetError("Rescheduling appointments");
    },
  });
}

/** Cancel an appointment, saying why. TODO(api): no endpoint yet. */
export function useCancelAppointment() {
  return useMutation({
    mutationFn: async (_cancellation: {
      id: string;
      reason: CancellationReason;
      details: string;
    }) => {
      throw new NotAvailableYetError("Cancelling appointments");
    },
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
