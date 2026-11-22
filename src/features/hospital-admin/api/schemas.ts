import { z } from "zod";
import {
  type PatientRecord,
  patientRecordSchema,
  type PatientSex,
  sexOf,
} from "@/lib/patient-record";
import {
  fullName,
  optionalText,
  staffMemberSchema as staffMemberRead,
  staffProfileSchema,
  type StaffRole,
  text,
} from "@/lib/staff-profile";

// The admin dashboard's screen models, then the real API's shapes (docs/api/openapi.json) and how
// they become them. A `null` is a figure or field the API doesn't send yet; TODO(api) marks each,
// and docs/backend-gaps-v2-migration.md (section 7) lists what's been asked for.

/** Staff roles the API knows, with the singular and plural names screens show for them. */
export const staffRoles = {
  doctor: { one: "Doctor", many: "Doctors" },
  nurse: { one: "Nurse", many: "Nurses" },
  receptionist: { one: "Receptionist", many: "Receptionists" },
  lab_scientist: { one: "Lab scientist", many: "Lab scientists" },
  pharmacist: { one: "Pharmacist", many: "Pharmacists" },
  radiologist: { one: "Radiologist", many: "Radiologists" },
  radiographer: { one: "Radiographer", many: "Radiographers" },
} as const satisfies Record<StaffRole, { one: string; many: string }>;

/** A member's role for screens; a hospital's own admin may have none. */
export const roleName = (role: StaffRole | null) => (role ? staffRoles[role].one : "—");

/** Departments a hospital can add as facilities of its own. */
export const facilityTypeLabels = {
  laboratory: "Laboratory",
  radiology: "Radiology",
  pharmacy: "Pharmacy",
} as const;
export type FacilityType = keyof typeof facilityTypeLabels;

const count = z.number().int().nonnegative();
const dateTime = z.iso.datetime({ offset: true });

/**
 * The signed-in member and their hospital, for the dashboard's shell and greeting, from
 * `GET /api/auth/staff/profile`. TODO(api): there's no endpoint for unread notification and
 * message counts yet, so they're 0; the API has no title (e.g. "Dr.") either.
 */
export const hospitalProfileSchema = staffProfileSchema.transform(({ user, hospital }) => ({
  name: hospital.name,
  bannerUrl: hospital.bannerUrl,
  admin: {
    firstName: user.firstName,
    lastName: user.lastName,
    title: null as string | null,
    email: user.email,
    avatarUrl: null as string | null,
  },
  unreadNotifications: 0,
  unreadMessages: 0,
}));
export type HospitalProfile = z.infer<typeof hospitalProfileSchema>;

export type DashboardOverview = {
  stats: {
    totalStaff: number;
    addedThisMonth: number | null;
    addedLastMonth: number | null;
    administrators: number | null;
    facilities: number | null;
  };
  staffByRole: { role: StaffRole; count: number }[];
};

export const queueStatusLabels = {
  pending: "Pending",
  in_progress: "In-progress",
  completed: "Completed",
} as const;
type QueueStatus = keyof typeof queueStatusLabels;

export type PatientQueue = {
  items: {
    id: string;
    patient: { name: string; hin: string; avatarUrl: string | null };
    status: QueueStatus;
    waitMinutes: number;
  }[];
};

export const staffStatusLabels = { on_team: "On team", removed: "Removed" } as const;
type StaffStatus = keyof typeof staffStatusLabels;

export const sexLabels = {
  male: "Male",
  female: "Female",
  prefer_not_to_say: "Prefer not to say",
} satisfies Record<PatientSex, string>;
type Sex = PatientSex;

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole | null;
  avatarUrl: string | null;
  /** TODO(api): the staff list has no joining date. */
  addedAt: string | null;
  status: StaffStatus;
  /** `null` until it's recorded. */
  sex: Sex | null;
  /** Has admin access to this dashboard; TODO(api): `null` while the API doesn't say. */
  isAdmin: boolean | null;
};

/** What an admin can change about a staff member from the staff table. */
export type StaffMemberChange = { status?: StaffStatus; isAdmin?: boolean };

/** The Staff Management page's "All Staff" filter. */
export const staffFilterLabels = {
  all: "All Staff",
  on_team: "On team",
  removed: "Removed",
  admins: "Admins",
} as const;
export type StaffFilter = keyof typeof staffFilterLabels;

/**
 * One page of the hospital's staff; `total` counts every match, not just this page, and
 * `summary` counts the whole team whatever the search or filter.
 */
export type StaffList = {
  total: number;
  summary: { staff: number; admins: number | null };
  page: number;
  pageSize: number;
  items: StaffMember[];
};

/** What a staff member's role lets them do in DocuHealth. */
export const permissionLabels = {
  patient_records: {
    label: "Patient records",
    description: "View patient history, visits and results",
  },
  clinical_notes: {
    label: "Clinical notes",
    description: "Write diagnoses, notes and discharge summaries",
  },
  prescriptions: { label: "Prescriptions", description: "Prescribe or dispense medication" },
  lab_tests: { label: "Lab tests", description: "Request tests or upload results" },
  appointments: {
    label: "Appointments and queue",
    description: "Book, reschedule and check patients out",
  },
  patient_registration: {
    label: "Patient registration",
    description: "Register new and walk-in patients",
  },
} as const;
type Permission = keyof typeof permissionLabels;

/**
 * One staff member's profile page: their record plus details, activity and access.
 * TODO(api): there's no endpoint for one member, so only the staff list's fields are filled.
 */
export type StaffDetail = StaffMember & {
  /** e.g. "STF-00218" */
  staffCode: string | null;
  dateOfBirth: string | null;
  /** Who added them, e.g. "Dr. Sarah Adeyemi"; `null` if unknown. */
  addedBy: string | null;
  /** Activity in the period asked for. */
  stats: {
    patientsSeen: number;
    appointmentsCompleted: number;
    appointments: number;
    nextAppointmentAt: string | null;
    followUpsRequested: number;
    followUpsPending: number;
  } | null;
  permissions: { permission: Permission; granted: boolean }[] | null;
};

/** The Patient Management page's tabs, one per stage of a visit. */
export const patientTabLabels = {
  admitted: "Admitted Patients",
  checked_in: "Checked-in Patients",
  checked_out: "Checked-out Patients",
  discharged: "Discharged Patients",
} as const;
export type PatientTab = keyof typeof patientTabLabels;
export const patientTabSchema = z.enum(
  Object.keys(patientTabLabels) as [PatientTab, ...PatientTab[]],
);

export const visitTypeLabels = {
  appointment: "Appointment",
  emergency: "Emergency",
  walk_in: "Walk-In",
  follow_up: "Follow-Up",
} as const;
type VisitType = keyof typeof visitTypeLabels;

/** Check-ins in the period asked for; each `change` is against the one before it. */
export type PatientStats = {
  totalCheckIns: number | null;
  newCheckIns: number | null;
  newCheckInsChange: number | null;
  checkInsThisMonth: number | null;
  checkInsThisMonthChange: number | null;
  returningPatients: number | null;
};

type Patient = {
  /** Their HIN. */
  id: string;
  name: string;
  /** Health identification number. */
  hin: string;
  dateOfBirth: string | null;
  sex: Sex;
  avatarUrl: string | null;
};

type Visit = { id: string; patient: Patient };

/** A patient's visit, with what its tab shows; `by` fields are names, e.g. "Dr. Tola Bello". */
export type PatientVisit =
  | (Visit & {
      status: "admitted";
      ward: string | null;
      bed: string | null;
      admittedBy: string | null;
      admittedAt: string;
    })
  | (Visit & {
      status: "checked_in";
      /** TODO(api): check-ins don't record a visit type or who checked them in. */
      visitType: VisitType | null;
      /** Where they're waiting, if they've been given a bed. */
      ward: string | null;
      bed: string | null;
      checkedInBy: string | null;
      checkedInAt: string | null;
      waitMinutes: number | null;
    })
  | (Visit & {
      status: "checked_out";
      visitType: VisitType | null;
      checkedOutBy: string | null;
      /** TODO(api): checked-out rows don't say when the check-in was. */
      checkedInAt: string | null;
      checkedOutAt: string | null;
    })
  | (Visit & {
      status: "discharged";
      ward: string | null;
      bed: string | null;
      dischargedBy: string | null;
      admittedAt: string | null;
      dischargedAt: string | null;
    });

/**
 * One page of a tab's visits; `total` counts every match, and `counts` every visit in each tab
 * whatever the search or filters.
 */
export type PatientList = {
  total: number;
  counts: Record<PatientTab, number>;
  page: number;
  pageSize: number;
  items: PatientVisit[];
};

/** The hospital's wards and doctors, to filter patients by. */
export type PatientFilterOptions = {
  wards: { id: string; name: string }[];
  doctors: { id: string; name: string }[];
};

/** When a visit's check-in, check-out or discharge happened. */
export const visitDateLabels = {
  anytime: "Anytime",
  today: "Today",
  week: "This Week",
  month: "This Month",
} as const;
type VisitDate = keyof typeof visitDateLabels;

export const patientSortLabels = {
  latest: "Latest",
  oldest: "Oldest",
  name: "Name (A–Z)",
} as const;
type PatientSort = keyof typeof patientSortLabels;

/** What a tab's list is narrowed to; "all" (or "anytime") for no filter. */
export type PatientListParams = {
  tab: PatientTab;
  search: string;
  page: number;
  ward: string;
  doctor: string;
  visitType: VisitType | "all";
  date: VisitDate;
  sort: PatientSort;
};

/** How a patient pays for their care. */
export const coverageLabels = {
  hmo: "HMO Patient",
  nhis: "NHIS Patient",
  private: "Private Patient",
} as const;
type Coverage = keyof typeof coverageLabels;

export const visitKindLabels = { appointment: "Appointment", check_in: "Check-In" } as const;
export type VisitKind = keyof typeof visitKindLabels;

/**
 * One patient's profile: who they are, their visits so far and what's coming up. TODO(api):
 * the admin's patient endpoint has no doctor, visits or appointments, so those are `null`.
 */
export type PatientDetail = Patient & {
  coverage: Coverage | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  /** e.g. "Dr. Sarah Adeyemi"; `null` until one is assigned. */
  assignedDoctor: string | null;
  lastVisitAt: string | null;
  lastCheckInAt: string | null;
  upcomingAppointmentAt: string | null;
  /** Past appointments and check-ins, latest first. */
  visits:
    | {
        id: string;
        kind: VisitKind;
        visitType: VisitType;
        at: string;
        /** Who saw them, e.g. "Dr. Tola Bello"; `null` if no one is recorded. */
        seenBy: string | null;
      }[]
    | null;
};

// ---------------------------------------------------------------------------------------------
// The real API's shapes.

/** Only a list's total, e.g. `?size=1` to count a tab. */
export const countOnlySchema = z.object({ count: count }).transform(({ count }) => count);

/** Any reply; for actions whose reply the screen doesn't need. */
export const anyResponseSchema = z.unknown();

/** `GET /api/auth/staff`: a page of the facility's staff, and whether there's another. */
export const staffPageSchema = z.object({
  count: count,
  next: z.string().nullish(),
  results: z.array(staffMemberRead),
});

export const toStaffMember = (member: z.infer<typeof staffMemberRead>): StaffMember => ({
  id: member.id,
  name: member.name,
  email: member.email,
  phone: member.phone ?? "",
  role: member.role,
  avatarUrl: null,
  addedAt: null,
  // TODO(api): `is_active` is all there is; a removed member reads as not active.
  status: member.active ? "on_team" : "removed",
  sex: member.gender ? sexOf(member.gender) : null,
  isAdmin: null,
});

/** The member detail the staff list can't give. */
export const toStaffDetail = (member: StaffMember): StaffDetail => ({
  ...member,
  staffCode: null,
  dateOfBirth: null,
  addedBy: null,
  stats: null,
  permissions: null,
});

/** Someone named on a record (`*_by_info`). */
const person = z
  .object({ firstname: text, lastname: text, role: optionalText })
  .nullish()
  .transform((info) => {
    if (!info) return null;
    const name = fullName(info.firstname, info.lastname);
    if (!name) return null;
    return info.role === "doctor" ? `Dr. ${name}` : name;
  });

const place = z
  .object({ name: text })
  .nullish()
  .transform((ward) => ward?.name || null);

const bed = z
  .object({ bed_number: z.union([z.number(), z.string()]) })
  .nullish()
  .transform((info) => (info ? String(info.bed_number) : null));

/** `GET /api/hospital-ops/patients?status=…`: a row of any of its four lists. */
const patientRow = z.object({
  sqid: z.string(),
  status: optionalText,
  patient_info: z.object({
    hin: text,
    firstname: text,
    lastname: text,
    dob: z.string().nullish(),
    gender: optionalText,
  }),
  requested_by_info: person,
  discharged_by_info: person,
  closed_by_info: person,
  ward_info: place,
  bed_info: bed,
  created_at: dateTime.nullish(),
  closed_at: dateTime.nullish(),
  discharge_date: dateTime.nullish(),
});
type PatientRow = z.infer<typeof patientRow>;

export const patientPageSchema = z.object({ count: count, results: z.array(patientRow) });

/** Each tab's list on the API. */
export const patientStatusOfTab = {
  admitted: "inpatient",
  checked_in: "outpatient",
  checked_out: "outpatient_discharge",
  discharged: "inpatient_discharge",
} as const satisfies Record<PatientTab, string>;

const minutesSince = (at: string, now: number) =>
  Math.max(0, Math.round((now - new Date(at).getTime()) / 60_000));

export function toPatientVisit(tab: PatientTab, row: PatientRow, now: number): PatientVisit {
  const info = row.patient_info;
  const visit = {
    id: row.sqid,
    patient: {
      id: info.hin,
      name: fullName(info.firstname, info.lastname) || info.hin,
      hin: info.hin,
      dateOfBirth: info.dob ?? null,
      sex: sexOf(info.gender),
      avatarUrl: null,
    },
  };
  switch (tab) {
    case "admitted":
      return {
        ...visit,
        status: "admitted",
        ward: row.ward_info,
        bed: row.bed_info,
        // The doctor who asked for the admission.
        admittedBy: row.requested_by_info,
        admittedAt: row.created_at ?? new Date(now).toISOString(),
      };
    case "checked_in":
      return {
        ...visit,
        status: "checked_in",
        visitType: null,
        ward: row.ward_info,
        bed: row.bed_info,
        checkedInBy: null,
        checkedInAt: row.created_at ?? null,
        waitMinutes: row.created_at ? minutesSince(row.created_at, now) : null,
      };
    case "checked_out":
      return {
        ...visit,
        status: "checked_out",
        visitType: null,
        checkedOutBy: row.closed_by_info,
        checkedInAt: null,
        checkedOutAt: row.closed_at ?? null,
      };
    case "discharged":
      return {
        ...visit,
        status: "discharged",
        ward: row.ward_info,
        bed: row.bed_info,
        dischargedBy: row.discharged_by_info,
        admittedAt: row.created_at ?? null,
        dischargedAt: row.discharge_date ?? null,
      };
  }
}

/** `GET /api/hospital-ops/patients?status=outpatient`: open check-ins, for the queue card. */
function queueStatusOf(status: string | null): QueueStatus {
  if (!status || status === "pending") return "pending";
  if (status === "doctor_seen" || status === "closed") return "completed";
  return "in_progress";
}

export const toQueueEntry = (row: PatientRow, now: number): PatientQueue["items"][number] => ({
  id: row.sqid,
  patient: {
    name: fullName(row.patient_info.firstname, row.patient_info.lastname) || row.patient_info.hin,
    hin: row.patient_info.hin,
    avatarUrl: null,
  },
  status: queueStatusOf(row.status),
  waitMinutes: row.created_at ? minutesSince(row.created_at, now) : 0,
});

/** `GET /api/hospital-ops/wards`: the hospital's wards. */
export const wardPageSchema = z.object({
  results: z.array(z.object({ sqid: z.string(), name: text })),
});

/** `GET /api/patients/{hin}/info`: the patient's record, with vitals and drugs (unused here). */
export const patientInfoSchema = z
  .object({ patient_info: patientRecordSchema })
  .transform(({ patient_info }) => patient_info);

export const toPatientDetail = (patient: PatientRecord): PatientDetail => ({
  id: patient.id,
  name: patient.name,
  hin: patient.hin,
  dateOfBirth: patient.dateOfBirth,
  sex: patient.sex,
  avatarUrl: patient.avatarUrl,
  coverage: patient.coverage,
  phone: patient.phone,
  email: patient.email,
  address: patient.address,
  assignedDoctor: null,
  lastVisitAt: null,
  lastCheckInAt: null,
  upcomingAppointmentAt: null,
  visits: null,
});
