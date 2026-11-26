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

/** The code that finishes an `old@…` email's unfinished old (v1) sign-up. */
const OLD_SIGNUP_CODE = "123456";

/** As the API does: a wrong, expired or used code is a field error on `code`. */
const invalidCode = () => HttpResponse.json({ code: ["Invalid OTP"] }, { status: 400 });

/**
 * Sign-up scenarios, by the contact's first part, as for login: `exists@…` already has an
 * account (the right code answers 409 `account_exists`), `old@…` too, but from an old (v1)
 * sign-up it never finished (`/verify-account` finishes it with code 123456), and `wait@…` is
 * refused a second code (429 with `Retry-After`) until the page reloads.
 */
const selfSignups = new Set<string>();
const codesSent = new Set<string>();

function tooSoon(contact: string) {
  if (!contact.toLowerCase().startsWith("wait@")) return null;
  if (!codesSent.has(contact)) {
    codesSent.add(contact);
    return null;
  }
  return HttpResponse.json(
    { detail: "Request was throttled." },
    { status: 429, headers: { "Retry-After": "75" } },
  );
}

/** Where a code went, masked as the API reports it: `a***@example.com`, `+234••••••1234`. */
export function maskContact(contact: string) {
  if (contact.includes("@")) {
    const [name = "", domain] = contact.split("@");
    return `${name.slice(0, 1)}***@${domain}`;
  }
  const digits = contact.replace(/\D/g, "");
  return `+234••••••${digits.slice(-4)}`;
}

const accountExists = () =>
  HttpResponse.json(
    {
      code: "account_exists",
      detail: "An account already uses this contact. Log in or reset your password.",
    },
    { status: 409 },
  );

const identifierRequired = () =>
  HttpResponse.json({ identifier: ["This field is required."] }, { status: 400 });

/**
 * The mock server's "cookie": what the last login returned, so `GET /api/auth/me` can answer
 * after a reload, as the real API does from its session cookie. Kept in sessionStorage: the mock
 * runs in the page, so its memory is gone after a reload. Mock only.
 */
const MOCK_SESSION = "docuhealth-mock-session";

function mockSession(): Record<string, unknown> | null {
  try {
    const saved = sessionStorage.getItem(MOCK_SESSION);
    return saved ? (JSON.parse(saved) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function saveMockSession(data: Record<string, unknown> | null) {
  try {
    if (data) sessionStorage.setItem(MOCK_SESSION, JSON.stringify(data));
    else sessionStorage.removeItem(MOCK_SESSION);
  } catch {
    // Storage blocked: `/me` answers 401 and the app asks to log in.
  }
}

/** Marks the mock session's gate step done (NIN verified, first login completed). */
function clearMockNextStep() {
  const session = mockSession();
  if (session) saveMockSession({ ...session, next_step: null });
}

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

    // A DocuHealth admin logs in without an account type, as on staging; like the API, they have
    // no name, only the email.
    if (!body.account_type && scenario === "dhadmin") {
      const data = {
        role: "dhadmin",
        next_step: null,
        email: body.identifier ?? "",
        firstname: "",
        lastname: "",
      };
      saveMockSession(data);
      return HttpResponse.json(data);
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

    const data = {
      email: body.identifier ?? "user@docuhealth.example.com",
      // A hospital admin who hasn't finished first login has no name yet.
      firstname: staff.firstLogin ? "" : isStaff ? "Folake" : "Chinonso",
      lastname: staff.firstLogin ? "" : isStaff ? "Adeyemi" : "Okafor",
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
    };
    saveMockSession(data);
    return HttpResponse.json({ status: "success", message: "Logged in successfully", data });
  }),

  // Who is signed in: the last login's reply, or 401 when there's no session.
  http.get(api("/api/auth/me"), () => {
    const data = mockSession();
    return data
      ? HttpResponse.json({ status: "success", data })
      : HttpResponse.json(
          { detail: "Authentication credentials were not provided." },
          { status: 401 },
        );
  }),

  http.post(api("/api/auth/refresh"), () =>
    HttpResponse.json({
      status: "success",
      data: {},
    }),
  ),

  http.post(api("/api/auth/logout"), () => {
    saveMockSession(null);
    return HttpResponse.json({ status: "success", detail: "Logged out" });
  }),

  http.post(api("/api/auth/nin/verify"), () => {
    clearMockNextStep();
    return HttpResponse.json({ status: "success", message: "NIN verified successfully" });
  }),

  http.post(api("/api/auth/first-login"), () => {
    clearMockNextStep();
    return HttpResponse.json({ status: "success", message: "Admin profile completed" });
  }),

  http.post(api("/api/auth/signup"), async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      phone?: string;
      verify_by?: "email" | "phone";
    };
    const contact = (body.verify_by === "phone" ? body.phone : body.email) ?? "";
    const refused = tooSoon(contact);
    if (refused) return refused;
    selfSignups.add(contact);
    return HttpResponse.json({ message: "We sent you a code.", destination: maskContact(contact) });
  }),

  // Desk sign-ups fall through to the receptionist mock, which keeps their details.
  http.post(api("/api/auth/signup/verify-code"), async ({ request }) => {
    const body = (await request.clone().json()) as {
      email?: string;
      phone?: string;
      verify_by?: "email" | "phone";
      code?: string;
    };
    const contact = (body.verify_by === "phone" ? body.phone : body.email) ?? "";
    if (!selfSignups.has(contact)) return undefined;
    if (body.code === WRONG_CODE) return invalidCode();
    if (/^(exists|old)@/i.test(contact)) return accountExists();
    return HttpResponse.json({
      status: "success",
      data: { signup_token: "mock-signup-token" },
    });
  }),

  // Finishing an old (v1) sign-up: the same 200 for any email, as the API does.
  http.post(api("/api/auth/resend-otp"), async ({ request }) => {
    const { email } = (await request.json()) as { email?: string };
    if (!email) return HttpResponse.json({ email: ["This field is required."] }, { status: 400 });
    const refused = tooSoon(email);
    if (refused) return refused;
    return HttpResponse.json({ email });
  }),

  // Only an `old@…` email has an unfinished old sign-up, and only its code 123456 finishes it.
  http.post(api("/api/auth/signup/verify-otp"), async ({ request }) => {
    const { email, otp } = (await request.json()) as { email?: string; otp?: string };
    if (!email?.toLowerCase().startsWith("old@") || otp !== OLD_SIGNUP_CODE) return invalidCode();
    return HttpResponse.json({ email });
  }),

  http.post(api("/api/auth/signup/complete"), () =>
    HttpResponse.json({
      status: "success",
      message: "Account created",
      data: {
        hin: "1234567890123",
        next_step: null,
        acting_as: [{ type: "self" }],
      },
    }),
  ),

  // The same answer whether or not the account exists, as the API does.
  http.post(api("/api/auth/forgot-password"), async ({ request }) => {
    const { identifier } = (await request.json()) as { identifier?: string };
    if (!identifier) return identifierRequired();
    const refused = tooSoon(identifier);
    if (refused) return refused;
    return HttpResponse.json({ message: "If an account exists for this contact, we sent a code." });
  }),

  http.post(api("/api/auth/forgot-password/verify-otp"), async ({ request }) => {
    const { identifier, otp } = (await request.json()) as { identifier?: string; otp?: string };
    if (!identifier) return identifierRequired();
    if (otp === WRONG_CODE) return invalidCode();
    return HttpResponse.json({
      status: "success",
      data: {},
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
      email?: string;
      facility_type?: string;
      profile?: { firstname?: string; lastname?: string; role?: string };
    };
    const isSameEmail = body.email === "info@stnicholas.example.com";
    return HttpResponse.json({
      status: "success",
      data: {
        facility_type: body.facility_type ?? "hospital",
        email: body.email ?? "admin@stnicholas.example.com",
        email_verified: isSameEmail,
        firstname: body.profile?.firstname ?? "Tunde",
        lastname: body.profile?.lastname ?? "Adeyemi",
        role: body.profile?.role ?? "doctor",
      },
    });
  }),

  http.post(api("/api/auth/facility-applications/admin/verify"), async ({ request }) => {
    const body = (await request.json()) as {
      facility_type?: string;
      code?: string;
    };
    if (body.code === WRONG_CODE) return invalidCode();
    return HttpResponse.json({
      status: "success",
      data: {
        facility_type: body.facility_type ?? "hospital",
        email: "admin@stnicholas.example.com",
        email_verified: true,
        firstname: "Tunde",
        lastname: "Adeyemi",
        role: "doctor",
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
