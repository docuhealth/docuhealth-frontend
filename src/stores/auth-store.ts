import { create } from "zustand";
import { persist } from "zustand/middleware";

export const accountKinds = ["patient", "staff"] as const;
export type AccountKind = (typeof accountKinds)[number];
export type AccountType = AccountKind;

export const nextSteps = ["nin_not_verified", "admin_details_required"] as const;
export type NextStep = (typeof nextSteps)[number] | null;

export const facilityTypes = [
  "hospital",
  "laboratory",
  "radiology",
  "pharmacy",
  "observation",
] as const;
export type AuthFacilityType = (typeof facilityTypes)[number];

export const staffRoles = [
  "doctor",
  "nurse",
  "receptionist",
  "lab_scientist",
  "pharmacist",
  "radiologist",
  "radiographer",
] as const;
export type AuthStaffRole = (typeof staffRoles)[number];

export type PatientActingAs = {
  as?: "self" | "dependant" | "proxy";
  type?: "self" | "proxy";
  hin?: string;
  patient_sqid?: string;
  firstname?: string;
  lastname?: string;
  relationship?: string;
  powers?: string[];
  ends_at?: string | null;
};

export type StaffActingAs = {
  type?: "facility_staff";
  facility?: {
    id: string;
    name?: string;
    type: string;
  };
  facility_sqid?: string;
  facility_type?: string;
  staff_role?: string;
  role?: string;
  is_admin?: boolean;
};

export type ActingAsEntry = PatientActingAs | StaffActingAs;

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  hin?: string | null;
  phone?: string | null;
};

export type Session = {
  accessToken: string;
  refreshToken?: string;
  accountType?: AccountKind;
  nextStep?: NextStep;
  actingAs?: ActingAsEntry[];
  user: User;
};

type AuthState = {
  session: Session | null;
  setSession: (session: Session) => void;
  setTokens: (tokens: { accessToken: string; refreshToken?: string }) => void;
  setNextStep: (nextStep: NextStep) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      setTokens: (tokens) =>
        set((state) => (state.session ? { session: { ...state.session, ...tokens } } : state)),
      setNextStep: (nextStep) =>
        set((state) => (state.session ? { session: { ...state.session, nextStep } } : state)),
      clearSession: () => set({ session: null }),
    }),
    { name: "auth" },
  ),
);

/** Type guard for staff `acting_as` entries (supports both nested `facility` and flat `facility_staff` shapes). */
export function isStaffActingAs(entry: ActingAsEntry): entry is StaffActingAs {
  return (
    "facility" in entry ||
    ("type" in entry && entry.type === "facility_staff") ||
    "facility_sqid" in entry ||
    "staff_role" in entry
  );
}

/**
 * Whether the signed-in staff member is an admin of their facility, e.g. the lab's admin, who
 * approves the lab scientists' results.
 */
function isFacilityAdmin(session: Session | null) {
  return !!session?.actingAs?.find(isStaffActingAs)?.is_admin;
}

/** Whether the signed-in staff member is their facility's admin (see `isFacilityAdmin`). */
export const useIsFacilityAdmin = () => useAuthStore((state) => isFacilityAdmin(state.session));

/** The dashboards a signed-in user can land on. */
export type Dashboard =
  | "/patient"
  | "/hospital/admin"
  | "/hospital/receptionist"
  | "/hospital/radiologist"
  | "/hospital/lab-scientist"
  | "/hospital/pharmacy";

/**
 * Staff roles with a dashboard of their own. A hospital's admins get the admin dashboard whatever
 * their role, but an admin of one of its arms (lab, radiology, pharmacy) runs that arm: the lab's
 * admin is `{staff_role: "lab_scientist", is_admin: true, facility: {type: "laboratory"}}` and
 * uses the lab dashboard.
 */
const roleDashboards: Partial<Record<string, Dashboard>> = {
  receptionist: "/hospital/receptionist",
  radiologist: "/hospital/radiologist",
  lab_scientist: "/hospital/lab-scientist",
  pharmacist: "/hospital/pharmacy",
};

/**
 * Picks where a user should go right after logging in or finishing a `next_step` gate.
 */
export function getPostLoginDestination(
  session: Session | null,
): Dashboard | "/verify-nin" | "/hospital/first-login" | "/login" {
  if (!session) return "/login";

  if (session.nextStep === "nin_not_verified") {
    return "/verify-nin";
  }
  if (session.nextStep === "admin_details_required") {
    return "/hospital/first-login";
  }

  const staffEntry = session.actingAs?.find(isStaffActingAs);
  if (session.accountType === "staff" || staffEntry) {
    const role = staffEntry?.staff_role ?? staffEntry?.role ?? session.user.role;
    const facilityType = staffEntry?.facility?.type ?? staffEntry?.facility_type ?? "hospital";
    const hospitalAdmin = staffEntry?.is_admin && facilityType === "hospital";
    const roleDashboard = staffEntry && !hospitalAdmin ? roleDashboards[role] : undefined;
    // TODO: doctors and nurses get their own dashboards in the v2 migration (phase 4); until then
    // they land on the admin one.
    return roleDashboard ?? "/hospital/admin";
  }

  return "/patient";
}
