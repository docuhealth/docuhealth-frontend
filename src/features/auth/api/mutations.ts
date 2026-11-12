import { useMutation } from "@tanstack/react-query";
import {
  applicationPartSavedSchema,
  facilityApplicationSubmittedSchema,
  facilityRegisteredSchema,
  type FacilityTypeApi,
  forgotPasswordVerifyResponseSchema,
  type LoginResponse,
  loginResponseSchema,
  messageResponseSchema,
  type StaffRoleApi,
  verifySignupCodeResponseSchema,
} from "@/features/auth/api/schemas";
import { request } from "@/lib/api";
import { type AccountType, type Session } from "@/stores/auth-store";

export function buildSessionFromLoginResponse(
  payload: LoginResponse,
  options: {
    accountType?: AccountType | null;
    identifier?: string;
    fallbackName?: string;
  } = {},
): Session {
  const firstStaffContext = payload.acting_as.find(
    (ctx) => ctx.type === "facility_staff" || Boolean(ctx.facility),
  );
  const inferredAccountType: AccountType =
    options.accountType ?? (firstStaffContext ? "staff" : "patient");

  const fullName =
    payload.user?.name ??
    ([payload.user?.firstname, payload.user?.lastname].filter(Boolean).join(" ") ||
      options.fallbackName ||
      options.identifier ||
      "DocuHealth User");

  const hinValue = payload.hin ?? payload.user?.hin;

  return {
    accessToken: payload.access_token,
    accountType: inferredAccountType,
    nextStep: payload.next_step,
    actingAs: payload.acting_as,
    user: {
      id: payload.user?.sqid ?? payload.user?.id ?? "me",
      name: fullName,
      email: payload.user?.email ?? options.identifier ?? "",
      role:
        firstStaffContext?.staff_role ??
        firstStaffContext?.role ??
        payload.user?.role ??
        inferredAccountType,
      hin: hinValue !== undefined && hinValue !== null ? String(hinValue) : null,
      phone: payload.user?.phone_num ?? null,
    },
  };
}

export interface LoginInput {
  identifier: string;
  password: string;
  account_type?: AccountType | null;
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginInput) =>
      request(loginResponseSchema, {
        method: "POST",
        url: "/api/auth/login",
        data,
      }),
  });
}

export function useLogoutApi() {
  return useMutation({
    mutationFn: () =>
      request(messageResponseSchema, {
        method: "POST",
        url: "/api/auth/logout",
      }),
  });
}

export function useVerifyOwnNin() {
  return useMutation({
    mutationFn: (data: { nin: string }) =>
      request(messageResponseSchema, {
        method: "POST",
        url: "/api/auth/nin/verify",
        data,
      }),
  });
}

export interface CompleteFirstLoginInput {
  firstname: string;
  lastname: string;
  phone_num: string;
  gender: "male" | "female";
  role: "doctor" | "nurse" | "receptionist";
}

export function useCompleteFirstLogin() {
  return useMutation({
    mutationFn: (data: CompleteFirstLoginInput) =>
      request(messageResponseSchema, {
        method: "POST",
        url: "/api/auth/first-login",
        data,
      }),
  });
}

export interface StartPatientSignupInput {
  firstname: string;
  lastname: string;
  middlename?: string;
  gender: "male" | "female";
  dob: string;
  email?: string;
  phone?: string;
  verify_by?: "email" | "phone";
  login_url: string;
}

export function useStartPatientSignup() {
  return useMutation({
    mutationFn: (data: StartPatientSignupInput) =>
      request(messageResponseSchema, {
        method: "POST",
        url: "/api/auth/signup",
        data,
      }),
  });
}

export interface VerifyPatientSignupCodeInput {
  email?: string;
  phone?: string;
  verify_by?: "email" | "phone";
  code: string;
}

export function useVerifyPatientSignupCode() {
  return useMutation({
    mutationFn: (data: VerifyPatientSignupCodeInput) =>
      request(verifySignupCodeResponseSchema, {
        method: "POST",
        url: "/api/auth/signup/verify-code",
        data,
      }),
  });
}

export interface CompletePatientSignupInput {
  signup_token: string;
  nin: string;
  password: string;
}

export function useCompletePatientSignup() {
  return useMutation({
    mutationFn: (data: CompletePatientSignupInput) =>
      request(loginResponseSchema, {
        method: "POST",
        url: "/api/auth/signup/complete",
        data,
      }),
  });
}

export interface ForgotPasswordInput {
  email: string;
  account_type?: AccountType | null;
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordInput) =>
      request(messageResponseSchema, {
        method: "POST",
        url: "/api/auth/forgot-password",
        data,
      }),
  });
}

export interface VerifyForgotPasswordOtpInput {
  email: string;
  otp: string;
  account_type?: AccountType | null;
}

export function useVerifyForgotPasswordOtp() {
  return useMutation({
    mutationFn: (data: VerifyForgotPasswordOtpInput) =>
      request(forgotPasswordVerifyResponseSchema, {
        method: "POST",
        url: "/api/auth/forgot-password/verify-otp",
        data,
      }),
  });
}

export interface ResetPasswordInput {
  new_password: string;
  resetToken?: string | null;
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ new_password, resetToken }: ResetPasswordInput) =>
      request(messageResponseSchema, {
        method: "PATCH",
        url: "/api/auth/reset-password",
        data: { new_password },
        headers: resetToken ? { Authorization: `Bearer ${resetToken}` } : undefined,
      }),
  });
}

export interface CreateFacilityApplicationInput {
  facility_type: FacilityTypeApi;
  name: string;
  official_email: string;
  phone?: string;
  message?: string;
  redirect_url: string;
}

export function useCreateFacilityApplication() {
  return useMutation({
    mutationFn: (data: CreateFacilityApplicationInput) =>
      request(facilityApplicationSubmittedSchema, {
        method: "POST",
        url: "/api/auth/facility-applications",
        data,
      }),
  });
}

export function useVerifyFacilityApplicationEmail() {
  return useMutation({
    mutationFn: (data: { application: string; token: string }) =>
      request(facilityApplicationSubmittedSchema, {
        method: "POST",
        url: "/api/auth/facility-applications/verify-email",
        data,
      }),
  });
}

export interface SetFacilityApplicationAdminInput {
  application: string;
  token: string;
  email: string;
  profile: {
    firstname: string;
    lastname: string;
    phone_num?: string;
    role: StaffRoleApi;
    specialization?: string;
    gender?: "male" | "female";
  };
  facility_type?: FacilityTypeApi;
  part?: FacilityTypeApi;
}

export function useSetFacilityApplicationAdmin() {
  return useMutation({
    mutationFn: (data: SetFacilityApplicationAdminInput) =>
      request(applicationPartSavedSchema, {
        method: "POST",
        url: "/api/auth/facility-applications/admin",
        data,
      }),
  });
}

export interface VerifyFacilityApplicationAdminCodeInput {
  application: string;
  token: string;
  code: string;
  facility_type?: FacilityTypeApi;
}

export function useVerifyFacilityApplicationAdminCode() {
  return useMutation({
    mutationFn: (data: VerifyFacilityApplicationAdminCodeInput) =>
      request(applicationPartSavedSchema, {
        method: "POST",
        url: "/api/auth/facility-applications/admin/verify",
        data,
      }),
  });
}

export interface SubmitFacilityApplicationDocumentsInput {
  application: string;
  token: string;
  street: string;
  city: string;
  state: string;
  country: string;
  documents: File[];
}

export function useSubmitFacilityApplicationDocuments() {
  return useMutation({
    mutationFn: (input: SubmitFacilityApplicationDocumentsInput) => {
      const formData = new FormData();
      formData.append("application", input.application);
      formData.append("token", input.token);
      formData.append("street", input.street);
      formData.append("city", input.city);
      formData.append("state", input.state);
      formData.append("country", input.country);
      for (const file of input.documents) {
        formData.append("documents", file);
      }
      return request(facilityApplicationSubmittedSchema, {
        method: "POST",
        url: "/api/auth/facility-applications/documents",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  });
}

export interface RegisterFacilityByAgentInput {
  facility_type: FacilityTypeApi;
  name: string;
  official_email: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  login_url: string;
  admins: Array<{
    part?: FacilityTypeApi;
    email: string;
    profile: {
      firstname: string;
      lastname: string;
      phone_num?: string;
      role: StaffRoleApi;
      specialization?: string;
      gender?: "male" | "female";
    };
  }>;
}

export function useRegisterFacilityByAgent() {
  return useMutation({
    mutationFn: (data: RegisterFacilityByAgentInput) =>
      request(facilityRegisteredSchema, {
        method: "POST",
        url: "/api/auth/facility-registrations",
        data,
      }),
  });
}
