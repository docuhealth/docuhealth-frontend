import { HttpResponse, http } from "msw";
import { env } from "@/env";

const api = (path: string) => `${env.VITE_API_URL}${path}`;

/**
 * Login scenarios, picked by the email's first part (`wrong@…`, `nin@…`). Any other email logs in
 * as a patient on the patient site, or a doctor with admin access on the hospital site.
 */
const staffScenarios: Record<string, { role: string; isAdmin: boolean; firstLogin?: boolean }> = {
  reception: { role: "receptionist", isAdmin: false },
  radiology: { role: "radiologist", isAdmin: false },
  lab: { role: "lab_scientist", isAdmin: false },
  pharmacy: { role: "pharmacist", isAdmin: false },
  doctor: { role: "doctor", isAdmin: false },
  nurse: { role: "nurse", isAdmin: false },
  firstlogin: { role: "doctor", isAdmin: true, firstLogin: true },
};

/** Codes (OTP) the mock always rejects, to try the error path. */
const WRONG_CODE = "000000";

const invalidCode = () =>
  HttpResponse.json({ detail: "Invalid OTP", status: "error" }, { status: 400 });

export const authHandlers = [
  http.post(api("/api/auth/login"), async ({ request }) => {
    const body = (await request.json()) as {
      identifier?: string;
      account_type?: "patient" | "staff" | null;
    };
    const scenario = (body.identifier ?? "").split("@")[0]?.toLowerCase() ?? "";
    if (scenario === "wrong") {
      return HttpResponse.json(
        { detail: "Invalid login credentials.", status: "error" },
        { status: 401 },
      );
    }

    const isStaff = body.account_type === "staff";
    const staff = staffScenarios[scenario] ?? { role: "doctor", isAdmin: true };
    const nextStep = isStaff
      ? staff.firstLogin
        ? "admin_details_required"
        : null
      : scenario === "nin"
        ? "nin_not_verified"
        : null;

    return HttpResponse.json({
      status: "success",
      message: "Logged in successfully",
      data: {
        access_token: "mock-access-token",
        next_step: nextStep,
        acting_as: isStaff
          ? [
              {
                type: "facility_staff",
                facility_sqid: "hosp_mock_1",
                facility_type: "hospital",
                role: staff.role,
                is_admin: staff.isAdmin,
              },
            ]
          : [{ type: "self" }],
        user: {
          sqid: "usr_mock_1",
          firstname: isStaff ? "Folake" : "Chinonso",
          lastname: isStaff ? "Adeyemi" : "Okafor",
          email: body.identifier ?? "user@docuhealth.example.com",
          hin: isStaff ? null : "1234567890123",
          role: isStaff ? staff.role : "patient",
        },
      },
    });
  }),

  http.post(api("/api/auth/refresh"), () =>
    HttpResponse.json({
      status: "success",
      data: { access_token: "mock-refreshed-access-token" },
    }),
  ),

  http.post(api("/api/auth/logout"), () =>
    HttpResponse.json({ status: "success", message: "Logged out" }),
  ),

  http.post(api("/api/auth/nin/verify"), () =>
    HttpResponse.json({ status: "success", message: "NIN verified successfully" }),
  ),

  http.post(api("/api/auth/first-login"), () =>
    HttpResponse.json({ status: "success", message: "Admin profile completed" }),
  ),

  http.post(api("/api/auth/signup"), () =>
    HttpResponse.json({ status: "success", message: "Verification code sent" }),
  ),

  http.post(api("/api/auth/signup/verify-code"), async ({ request }) => {
    const { code } = (await request.json()) as { code?: string };
    if (code === WRONG_CODE) return invalidCode();
    return HttpResponse.json({
      status: "success",
      data: { signup_token: "mock-signup-token" },
    });
  }),

  http.post(api("/api/auth/signup/complete"), () =>
    HttpResponse.json({
      status: "success",
      message: "Account created",
      data: {
        access_token: "mock-access-token",
        hin: "1234567890123",
        next_step: null,
        acting_as: [{ type: "self" }],
      },
    }),
  ),

  http.post(api("/api/auth/forgot-password"), () =>
    HttpResponse.json({ status: "success", message: "OTP sent" }),
  ),

  http.post(api("/api/auth/forgot-password/verify-otp"), async ({ request }) => {
    const { otp } = (await request.json()) as { otp?: string };
    if (otp === WRONG_CODE) return invalidCode();
    return HttpResponse.json({
      status: "success",
      data: { access_token: "mock-reset-token" },
    });
  }),

  http.patch(api("/api/auth/reset-password"), () =>
    HttpResponse.json({ status: "success", message: "Password updated" }),
  ),

  http.post(api("/api/auth/facility-applications"), async ({ request }) => {
    const body = (await request.json()) as {
      facility_type?: string;
      name?: string;
      official_email?: string;
    };
    return HttpResponse.json(
      {
        status: "success",
        data: {
          sqid: "fapp_mock_1",
          facility_type: body.facility_type ?? "hospital",
          name: body.name ?? "St. Nicholas Hospital",
          official_email: body.official_email ?? "info@stnicholas.example.com",
          status: "pending",
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  }),

  http.post(api("/api/auth/facility-applications/verify-email"), async ({ request }) => {
    const body = (await request.json()) as { application?: string };
    return HttpResponse.json({
      status: "success",
      data: {
        sqid: body.application ?? "fapp_mock_1",
        facility_type: "hospital",
        name: "St. Nicholas Hospital",
        official_email: "info@stnicholas.example.com",
        status: "email_verified",
        created_at: new Date().toISOString(),
      },
    });
  }),

  http.post(api("/api/auth/facility-applications/admin"), async ({ request }) => {
    const body = (await request.json()) as {
      application?: string;
      email?: string;
      facility_type?: string;
    };
    const isSameEmail = body.email === "info@stnicholas.example.com";
    return HttpResponse.json({
      status: "success",
      data: {
        application: body.application ?? "fapp_mock_1",
        part: body.facility_type ?? "hospital",
        facility_type: body.facility_type ?? "hospital",
        saved: true,
        email_verified: isSameEmail,
      },
    });
  }),

  http.post(api("/api/auth/facility-applications/admin/verify"), async ({ request }) => {
    const body = (await request.json()) as {
      application?: string;
      facility_type?: string;
      code?: string;
    };
    if (body.code === WRONG_CODE) return invalidCode();
    return HttpResponse.json({
      status: "success",
      data: {
        application: body.application ?? "fapp_mock_1",
        part: body.facility_type ?? "hospital",
        facility_type: body.facility_type ?? "hospital",
        saved: true,
        email_verified: true,
      },
    });
  }),

  http.post(api("/api/auth/facility-applications/documents"), () =>
    HttpResponse.json({
      status: "success",
      data: {
        sqid: "fapp_mock_1",
        facility_type: "hospital",
        name: "St. Nicholas Hospital",
        official_email: "info@stnicholas.example.com",
        status: "submitted",
        created_at: new Date().toISOString(),
      },
    }),
  ),

  http.post(api("/api/auth/facility-registrations"), async ({ request }) => {
    const body = (await request.json()) as {
      facility_type?: string;
      name?: string;
      official_email?: string;
    };
    return HttpResponse.json(
      {
        status: "success",
        data: {
          sqid: "fac_mock_1",
          facility_type: body.facility_type ?? "hospital",
          name: body.name ?? "Lagoon Hospital",
          official_email: body.official_email ?? "contact@lagoon.example.com",
          code: "DH-FAC-001",
          is_verified: true,
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  }),
];
