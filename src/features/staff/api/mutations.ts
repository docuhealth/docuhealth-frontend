import { useMutation, useQueryClient } from "@tanstack/react-query";
import { staffKeys } from "@/features/staff/api/queries";
import { anyResponseSchema } from "@/features/staff/api/schemas";
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

/** Mark an appointment done; it moves out of Today/Upcoming. */
export function useCloseAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      request(anyResponseSchema, {
        method: "POST",
        url: `/api/hospital-ops/appointments/${encodeURIComponent(id)}/close`,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  });
}

/** Give an appointment to a doctor, at a date and time (the nurse's, from their appointments). */
export function useAssignAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      doctorId,
      at,
      type,
      note,
    }: {
      id: string;
      doctorId: string;
      at: Date;
      type: string;
      note: string;
    }) =>
      request(anyResponseSchema, {
        method: "PATCH",
        url: `/api/hospital-ops/appointments/${encodeURIComponent(id)}/assign`,
        data: { doctor_id: doctorId, scheduled_time: at.toISOString(), type, note },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  });
}
