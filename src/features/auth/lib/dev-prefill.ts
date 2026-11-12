import { env } from "@/env";
import type {
  AccountDetailsInput,
  AdminDetailsValues,
  FacilityDocumentsValues,
  FirstLoginValues,
  ForgotPasswordValues,
  HospitalDetailsValues,
  HospitalLocationValues,
  IndividualInfoValues,
  LoginValues,
  ProviderInfoValues,
  ResetPasswordValues,
  VerifyCodeValues,
  VerifyNinInput,
} from "@/features/auth/lib/schemas";
import { DEFAULT_COUNTRY } from "@/lib/locations";

/**
 * Sample answers so the auth forms can be clicked through on the dev server. Never applies to
 * production builds, whatever VITE_PREFILL_FORMS says.
 */
const enabled = import.meta.env.DEV && env.VITE_PREFILL_FORMS;

const email = "ada.okonkwo@example.com";
const password = "Password123!";

export const devPrefill = enabled
  ? {
      login: { identifier: email, password } satisfies LoginValues,
      providerInfo: {
        facilityType: "hospital",
        organisationName: "Lagos University Teaching Hospital",
        email: "admin@luth.example.com",
        phone: "+234-802-345-6789",
        message: "We'd like to manage our patients' records on DocuHealth.",
      } satisfies ProviderInfoValues,
      individualInfo: {
        firstName: "Ada",
        lastName: "Okonkwo",
        otherName: "Chiamaka",
        gender: "female",
        dob: "1995-04-18",
        email,
        phone: "+234-801-234-5678",
        acceptTerms: true,
      } satisfies IndividualInfoValues,
      verifyCode: { code: "123456" } satisfies VerifyCodeValues,
      verifyNin: { nin: "12345678901" } satisfies VerifyNinInput,
      firstLogin: {
        firstName: "Folake",
        lastName: "Adeyemi",
        phone: "+234-803-456-7890",
        gender: "female",
        role: "doctor",
      } satisfies FirstLoginValues,
      accountDetails: {
        nin: "12345678901",
        password,
        confirmPassword: password,
      } satisfies AccountDetailsInput,
      forgotPassword: { email } satisfies ForgotPasswordValues,
      resetPassword: { password, confirmPassword: password } satisfies ResetPasswordValues,
      facilityDocuments: {
        country: DEFAULT_COUNTRY,
        state: "Lagos",
        city: "Ikeja",
        street: "12 Idi-Araba Road, Surulere",
        files: [
          new File(["%PDF-1.4 sample"], "cac-certificate.pdf", { type: "application/pdf" }),
          new File(["%PDF-1.4 sample"], "facility-licence.pdf", { type: "application/pdf" }),
        ],
      } satisfies FacilityDocumentsValues,
      adminDetails: {
        firstName: "Tunde",
        lastName: "Adeyemi",
        email: "tunde.adeyemi@luth.example.com",
        phone: "+234-803-456-7890",
        gender: "male",
        role: "doctor",
        specialization: "Internal Medicine",
      } satisfies AdminDetailsValues,
      hospitalDetails: {
        hospitalName: "Havannah Hospital",
        facilityType: "hospital",
        ownership: "private",
        rcNumber: "RC 1234567",
      } satisfies HospitalDetailsValues,
      hospitalLocation: {
        country: DEFAULT_COUNTRY,
        state: "Lagos",
        lga: "Ikeja",
        streetAddress: "12 Allen Avenue",
        phone: "+234-805-678-9012",
        email: "hello@havannahhospital.example.com",
      } satisfies HospitalLocationValues,
    }
  : undefined;
