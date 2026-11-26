import { create } from "zustand";

const accountKinds = ["patient", "staff"] as const;
type AccountKind = (typeof accountKinds)[number];
export type AccountType = AccountKind;

const nextSteps = ["nin_not_verified", "admin_details_required"] as const;
export type NextStep = (typeof nextSteps)[number] | null;

type PatientActingAs = {
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

type StaffActingAs = {
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

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  hin?: string | null;
  phone?: string | null;
};

/**
 * Who is signed in, from the login reply or `GET /api/auth/me`. Not a credential: the session is
 * the API's httpOnly cookies, which the app never sees. Held in memory only; on start-up the app
 * asks `/me` again (features/auth/api/session.ts).
 */
export type Session = {
  accountType?: AccountKind;
  nextStep?: NextStep;
  actingAs?: ActingAsEntry[];
  user: User;
};

type AuthState = {
  session: Session | null;
  setSession: (session: Session) => void;
  setNextStep: (nextStep: NextStep) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  setNextStep: (nextStep) =>
    set((state) => (state.session ? { session: { ...state.session, nextStep } } : state)),
  clearSession: () => set({ session: null }),
}));

/** Type guard for staff `acting_as` entries (supports both nested `facility` and flat `facility_staff` shapes). */
function isStaffActingAs(entry: ActingAsEntry): entry is StaffActingAs {
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

/** The role a DocuHealth admin's login carries; they run the `admin.` section. */
export const DOCUHEALTH_ADMIN_ROLE = "dhadmin";

/** Whether the session is a DocuHealth admin's. */
export const isDocuHealthAdmin = (session: Session | null) =>
  session?.user.role === DOCUHEALTH_ADMIN_ROLE;

/** The dashboards a signed-in user can land on. */
export type Dashboard =
  | "/admin"
  | "/patient"
  | "/hospital/admin"
  | "/hospital/receptionist"
  | "/hospital/radiologist"
  | "/hospital/lab-scientist"
  | "/hospital/pharmacy"
  | "/hospital/doctor"
  | "/hospital/nurse"
  /** A staff role with no dashboard of its own yet. */
  | "/hospital/no-dashboard";

/**
 * Staff roles with a dashboard of their own. A hospital's admins get the admin dashboard whatever
 * their role, but an admin of one of its arms (lab, radiology, pharmacy) runs that arm: the lab's
 * admin is `{staff_role: "lab_scientist", is_admin: true, facility: {type: "laboratory"}}` and
 * uses the lab dashboard.
 */
const roleDashboards: Partial<Record<string, Dashboard>> = {
  receptionist: "/hospital/receptionist",
  radiologist: "/hospital/radiologist",
  // Radiographers take the scans, so they share the radiology dashboard.
  radiographer: "/hospital/radiologist",
  lab_scientist: "/hospital/lab-scientist",
  pharmacist: "/hospital/pharmacy",
  doctor: "/hospital/doctor",
  nurse: "/hospital/nurse",
};

/**
 * Picks where a user should go right after logging in or finishing a `next_step` gate.
 */
export function getPostLoginDestination(
  session: Session | null,
): Dashboard | "/verify-nin" | "/hospital/first-login" | "/login" {
  if (!session) return "/login";
  if (isDocuHealthAdmin(session)) return "/admin";

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
    // An old hospital account (role "hospital", no staff entry) and the hospital's admins run it.
    if (hospitalAdmin || (!staffEntry && session.user.role === "hospital")) {
      return "/hospital/admin";
    }
    // No facility at all: the membership has ended (`/me` reads it fresh).
    if (!staffEntry) return "/hospital/no-dashboard";
    // Anyone else gets their role's dashboard, never the admin's.
    return roleDashboards[role] ?? "/hospital/no-dashboard";
  }

  return "/patient";
}
