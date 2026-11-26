import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { staffKeys } from "@/features/staff/api/queries";
import { anyResponseSchema, closedAppointmentSchema } from "@/features/staff/api/schemas";
import type { ChangePasswordValues, EditProfileValues } from "@/features/staff/lib/schemas";
import { request } from "@/lib/api";

/**
 * Change the signed-in member's name or phone. Refreshes everything, since their name shows in
 * every dashboard's top bar (each under its own feature's key).
 */
export function useUpdateStaffProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ firstName, lastName, phone }: EditProfileValues) =>
      request(anyResponseSchema, {
        method: "PATCH",
        url: "/api/auth/staff/profile/update",
        data: { firstname: firstName, lastname: lastName, phone_num: phone },
      }),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

/** Email a code to `newEmail`, the first step of changing the account's email. */
export function useSendEmailChangeCode() {
  return useMutation({
    mutationFn: (newEmail: string) =>
      request(anyResponseSchema, {
        method: "POST",
        url: "/api/auth/email/send-otp",
        data: { new_email: newEmail },
      }),
  });
}

/** Confirm the emailed code, which switches the account to the new email. */
export function useVerifyEmailChangeCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) =>
      request(anyResponseSchema, {
        method: "PATCH",
        url: "/api/auth/email/verify-otp",
        data: { otp: code },
      }),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: ChangePasswordValues) =>
      request(anyResponseSchema, {
        method: "PATCH",
        url: "/api/auth/password",
        data: { old_password: currentPassword, new_password: newPassword },
      }),
  });
}

/**
 * The API answers a 500 when the appointment has no staff member (older appointments may not);
 * the front desk has to confirm it with someone first.
 */
const NO_STAFF_MESSAGE =
  "This appointment isn’t booked with anyone, so it can’t be marked as seen yet. Ask the front desk to confirm it with a staff member.";

/**
 * Mark an appointment as seen (`completed`); it moves out of Today/Upcoming. Only staff of the
 * booked member's role may, and the API's own message says so.
 */
export function useCloseAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        return await request(closedAppointmentSchema, {
          method: "POST",
          url: `/api/hospital-ops/appointments/${encodeURIComponent(id)}/close`,
        });
      } catch (error) {
        // TODO(api): a 500 with no usable body when the appointment has no staff member.
        if (isAxiosError(error) && error.response?.status === 500) {
          throw new Error(NO_STAFF_MESSAGE, { cause: error });
        }
        throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  });
}

/**
 * The nurse gives an appointment booked with them to a doctor, optionally at another time or
 * with another note (each sent only when it changed). It then leaves the nurse's lists.
 */
export function useAssignAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      doctorId,
      at,
      note,
    }: {
      id: string;
      doctorId: string;
      /** A new time, or undefined to keep it. */
      at?: Date;
      /** A new note, or undefined to keep it. */
      note?: string;
    }) =>
      request(anyResponseSchema, {
        method: "PATCH",
        url: `/api/hospital-ops/appointments/${encodeURIComponent(id)}/assign`,
        data: {
          doctor_id: doctorId,
          ...(at && { scheduled_time: at.toISOString() }),
          ...(note !== undefined && { note }),
        },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  });
}
