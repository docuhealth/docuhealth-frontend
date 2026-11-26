import { isRedirect } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { redirectIfSignedIn, requireDashboard, requireGate } from "@/lib/auth-guards";
import {
  type ActingAsEntry,
  getPostLoginDestination,
  type Session,
  useAuthStore,
} from "@/stores/auth-store";

function session(overrides: Partial<Session> = {}): Session {
  return {
    accountType: "patient",
    user: { id: "u", name: "U", email: "u@example.com", role: "patient" },
    ...overrides,
  };
}

const staff = (role: string, isAdmin = false, extra: Partial<Session> = {}) =>
  session({
    accountType: "staff",
    actingAs: [{ type: "facility_staff", role, is_admin: isAdmin } satisfies ActingAsEntry],
    ...extra,
  });

/** Where `guard` sends the user, or `undefined` when it lets them through. */
function redirectedTo(guard: () => void, signedIn: Session | null) {
  if (signedIn) useAuthStore.getState().setSession(signedIn);
  else useAuthStore.getState().clearSession();
  try {
    guard();
    return undefined;
  } catch (error) {
    if (isRedirect(error)) return error.options.to;
    throw error;
  }
}

describe("getPostLoginDestination", () => {
  it("sends each role to its dashboard", () => {
    expect(getPostLoginDestination(session())).toBe("/patient");
    expect(getPostLoginDestination(staff("receptionist"))).toBe("/hospital/receptionist");
    expect(getPostLoginDestination(staff("radiologist"))).toBe("/hospital/radiologist");
    expect(getPostLoginDestination(staff("lab_scientist"))).toBe("/hospital/lab-scientist");
    expect(getPostLoginDestination(staff("pharmacist"))).toBe("/hospital/pharmacy");
    expect(getPostLoginDestination(staff("doctor"))).toBe("/hospital/doctor");
    expect(getPostLoginDestination(staff("nurse"))).toBe("/hospital/nurse");
    expect(getPostLoginDestination(staff("doctor", true))).toBe("/hospital/admin");
    // A hospital admin gets the admin dashboard whatever their role.
    expect(getPostLoginDestination(staff("receptionist", true))).toBe("/hospital/admin");
    expect(getPostLoginDestination(staff("radiographer"))).toBe("/hospital/radiologist");
    expect(
      getPostLoginDestination(
        session({ accountType: undefined, user: { ...session().user, role: "dhadmin" } }),
      ),
    ).toBe("/admin");
  });

  it("never gives a staff role without a dashboard the admin's", () => {
    expect(getPostLoginDestination(staff("physiotherapist"))).toBe("/hospital/no-dashboard");
    expect(getPostLoginDestination(staff("physiotherapist", true))).toBe("/hospital/admin");
  });

  it("sends an old hospital account to the admin's, and staff with no facility left nowhere", () => {
    const user = (role: string) => ({ id: "u", name: "U", email: "u@example.com", role });
    expect(
      getPostLoginDestination(
        session({ accountType: "staff", actingAs: [], user: user("hospital") }),
      ),
    ).toBe("/hospital/admin");
    // `/me` reads the membership fresh: once it has ended, `acting_as` is empty.
    expect(
      getPostLoginDestination(
        session({ accountType: "staff", actingAs: [], user: user("hospital_staff") }),
      ),
    ).toBe("/hospital/no-dashboard");
  });

  it("sends an arm's admin to the arm's dashboard, as staging's lab admin logs in", () => {
    const labAdmin = session({
      accountType: "staff",
      actingAs: [
        {
          facility: { id: "FG3M84A", name: "Lord Is Good Laboratory", type: "laboratory" },
          staff_role: "lab_scientist",
          is_admin: true,
        },
      ],
    });
    expect(getPostLoginDestination(labAdmin)).toBe("/hospital/lab-scientist");
  });

  it("sends a pending gate step before any dashboard", () => {
    expect(getPostLoginDestination(session({ nextStep: "nin_not_verified" }))).toBe("/verify-nin");
    expect(
      getPostLoginDestination(staff("doctor", true, { nextStep: "admin_details_required" })),
    ).toBe("/hospital/first-login");
  });
});

describe("requireDashboard", () => {
  it("sends someone without a session to the right login", () => {
    expect(redirectedTo(() => requireDashboard("/patient"), null)).toBe("/login");
    expect(redirectedTo(() => requireDashboard("/hospital/radiologist"), null)).toBe(
      "/hospital/login",
    );
  });

  it("lets the right role in and moves everyone else to their own dashboard", () => {
    expect(
      redirectedTo(() => requireDashboard("/hospital/receptionist"), staff("receptionist")),
    ).toBeUndefined();
    expect(redirectedTo(() => requireDashboard("/hospital/admin"), staff("receptionist"))).toBe(
      "/hospital/receptionist",
    );
    expect(redirectedTo(() => requireDashboard("/patient"), staff("radiologist"))).toBe(
      "/hospital/radiologist",
    );
  });

  it("keeps DocuHealth's admins and hospital staff out of each other's sections", () => {
    const dhAdmin = session({
      accountType: undefined,
      user: { ...session().user, role: "dhadmin" },
    });
    expect(redirectedTo(() => requireDashboard("/admin"), null)).toBe("/admin/login");
    expect(redirectedTo(() => requireDashboard("/admin"), dhAdmin)).toBeUndefined();
    expect(redirectedTo(() => requireDashboard("/hospital/admin"), dhAdmin)).toBe("/admin");
    expect(redirectedTo(() => requireDashboard("/patient"), dhAdmin)).toBe("/admin");
    expect(redirectedTo(() => requireDashboard("/admin"), staff("doctor", true))).toBe(
      "/hospital/admin",
    );
    expect(redirectedTo(() => requireDashboard("/admin"), session())).toBe("/patient");
  });

  it("checks every dashboard against every role", () => {
    const roles = {
      "/hospital/receptionist": staff("receptionist"),
      "/hospital/radiologist": staff("radiologist"),
      "/hospital/lab-scientist": staff("lab_scientist"),
      "/hospital/pharmacy": staff("pharmacist"),
      "/hospital/doctor": staff("doctor"),
      "/hospital/nurse": staff("nurse"),
      "/hospital/admin": staff("doctor", true),
      "/patient": session(),
    } as const;
    for (const [own, user] of Object.entries(roles)) {
      for (const dashboard of Object.keys(roles)) {
        expect(redirectedTo(() => requireDashboard(dashboard as keyof typeof roles), user)).toBe(
          dashboard === own ? undefined : own,
        );
      }
    }
  });

  it("holds a dashboard back until its gate step is done", () => {
    expect(
      redirectedTo(
        () => requireDashboard("/hospital/admin"),
        staff("doctor", true, { nextStep: "admin_details_required" }),
      ),
    ).toBe("/hospital/first-login");
  });
});

describe("requireGate", () => {
  it("only opens for a session with that step to do", () => {
    expect(redirectedTo(() => requireGate("nin_not_verified"), null)).toBe("/login");
    expect(redirectedTo(() => requireGate("admin_details_required"), null)).toBe("/hospital/login");
    expect(
      redirectedTo(
        () => requireGate("nin_not_verified"),
        session({ nextStep: "nin_not_verified" }),
      ),
    ).toBeUndefined();
    expect(redirectedTo(() => requireGate("admin_details_required"), staff("doctor", true))).toBe(
      "/hospital/admin",
    );
  });
});

describe("redirectIfSignedIn", () => {
  it("lets visitors stay and sends signed-in users to their dashboard", () => {
    expect(redirectedTo(redirectIfSignedIn, null)).toBeUndefined();
    expect(redirectedTo(redirectIfSignedIn, staff("receptionist"))).toBe("/hospital/receptionist");
  });
});
