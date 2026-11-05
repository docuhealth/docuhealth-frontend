import { z } from "zod";

/** Staff roles, with the singular and plural names screens show for them. */
export const staffRoles = {
  doctor: { one: "Doctor", many: "Doctors" },
  nurse: { one: "Nurse", many: "Nurses" },
  pharmacist: { one: "Pharmacist", many: "Pharmacists" },
  lab_scientist: { one: "Lab scientist", many: "Lab scientists" },
  receptionist: { one: "Receptionist", many: "Receptionists" },
  records_officer: { one: "Records officer", many: "Records officers" },
} as const;
type StaffRole = keyof typeof staffRoles;
const staffRole = z.enum(Object.keys(staffRoles) as [StaffRole, ...StaffRole[]]);

/** Departments a hospital can add as facilities of its own. */
export const facilityTypeLabels = {
  laboratory: "Laboratory",
  radiology: "Radiology",
  pharmacy: "Pharmacy",
} as const;
export type FacilityType = keyof typeof facilityTypeLabels;

export const facilitySchema = z.object({
  id: z.string(),
  type: z.enum(Object.keys(facilityTypeLabels) as [FacilityType, ...FacilityType[]]),
});

const count = z.number().int().nonnegative();

/** The signed-in admin's hospital, shown in the dashboard's sidebar and top bar. */
export const hospitalProfileSchema = z.object({
  name: z.string(),
  /** The photo the admin uploaded for the dashboard banner; `null` shows the default one. */
  bannerUrl: z.url().nullable(),
  admin: z.object({
    firstName: z.string(),
    lastName: z.string(),
    /** e.g. "Dr." */
    title: z.string().nullable(),
    email: z.email(),
    avatarUrl: z.url().nullable(),
  }),
  unreadNotifications: count,
  unreadMessages: count,
});
export type HospitalProfile = z.infer<typeof hospitalProfileSchema>;

export const dashboardOverviewSchema = z.object({
  stats: z.object({
    totalStaff: count,
    addedThisMonth: count,
    addedLastMonth: count,
    administrators: count,
    facilities: count,
  }),
  staffByRole: z.array(z.object({ role: staffRole, count })),
});
export type DashboardOverview = z.infer<typeof dashboardOverviewSchema>;

export const queueStatusLabels = {
  pending: "Pending",
  in_progress: "In-progress",
  completed: "Completed",
} as const;
type QueueStatus = keyof typeof queueStatusLabels;

export const patientQueueSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      patient: z.object({ name: z.string(), hin: z.string(), avatarUrl: z.url().nullable() }),
      status: z.enum(Object.keys(queueStatusLabels) as [QueueStatus, ...QueueStatus[]]),
      waitMinutes: count,
    }),
  ),
});
export type PatientQueue = z.infer<typeof patientQueueSchema>;

export const staffStatusLabels = { on_team: "On team", removed: "Removed" } as const;
type StaffStatus = keyof typeof staffStatusLabels;

export const sexLabels = {
  male: "Male",
  female: "Female",
  prefer_not_to_say: "Prefer not to say",
} as const;
type Sex = keyof typeof sexLabels;

export const staffMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  phone: z.string(),
  role: staffRole,
  avatarUrl: z.url().nullable(),
  addedAt: z.iso.datetime(),
  status: z.enum(Object.keys(staffStatusLabels) as [StaffStatus, ...StaffStatus[]]),
  /** `null` until it's recorded (Add Staff doesn't ask). */
  sex: z.enum(Object.keys(sexLabels) as [Sex, ...Sex[]]).nullable(),
  /** Has admin access to this dashboard. */
  isAdmin: z.boolean(),
});
export type StaffMember = z.infer<typeof staffMemberSchema>;

/** What an admin can change about a staff member from the staff table. */
export type StaffMemberChange = Partial<Pick<StaffMember, "status" | "isAdmin">>;

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
export const staffListSchema = z.object({
  total: count,
  summary: z.object({ staff: count, admins: count }),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  items: z.array(staffMemberSchema),
});
export type StaffList = z.infer<typeof staffListSchema>;

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

/** One staff member's profile page: their record plus details, activity and access. */
export const staffDetailSchema = staffMemberSchema.extend({
  /** e.g. "STF-00218" */
  staffCode: z.string(),
  dateOfBirth: z.iso.date().nullable(),
  /** Who added them, e.g. "Dr. Sarah Adeyemi"; `null` if unknown. */
  addedBy: z.string().nullable(),
  /** Activity in the period asked for. */
  stats: z.object({
    patientsSeen: count,
    appointmentsCompleted: count,
    appointments: count,
    nextAppointmentAt: z.iso.datetime().nullable(),
    followUpsRequested: count,
    followUpsPending: count,
  }),
  permissions: z.array(
    z.object({
      permission: z.enum(Object.keys(permissionLabels) as [Permission, ...Permission[]]),
      granted: z.boolean(),
    }),
  ),
});
export type StaffDetail = z.infer<typeof staffDetailSchema>;

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
const visitType = z.enum(Object.keys(visitTypeLabels) as [VisitType, ...VisitType[]]);

/** Check-ins in the period asked for; each `change` is against the one before it. */
export const patientStatsSchema = z.object({
  totalCheckIns: count,
  newCheckIns: count,
  newCheckInsChange: z.number().int(),
  checkInsThisMonth: count,
  checkInsThisMonthChange: z.number().int(),
  returningPatients: count,
});
export type PatientStats = z.infer<typeof patientStatsSchema>;

const patientSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Health identification number. */
  hin: z.string(),
  dateOfBirth: z.iso.date(),
  sex: z.enum(Object.keys(sexLabels) as [Sex, ...Sex[]]),
  avatarUrl: z.url().nullable(),
});

const visit = { id: z.string(), patient: patientSchema };

/** A patient's visit, with what its tab shows; `by` fields are names, e.g. "Dr. Tola Bello". */
const patientVisitSchema = z.discriminatedUnion("status", [
  z.object({
    ...visit,
    status: z.literal("admitted"),
    ward: z.string(),
    bed: z.string(),
    admittedBy: z.string(),
    admittedAt: z.iso.datetime(),
  }),
  z.object({
    ...visit,
    status: z.literal("checked_in"),
    visitType,
    /** Where they're waiting, if they've been given a bed. */
    ward: z.string().nullable(),
    bed: z.string().nullable(),
    checkedInBy: z.string(),
    checkedInAt: z.iso.datetime(),
    waitMinutes: count,
  }),
  z.object({
    ...visit,
    status: z.literal("checked_out"),
    visitType,
    checkedOutBy: z.string(),
    checkedInAt: z.iso.datetime(),
    checkedOutAt: z.iso.datetime(),
  }),
  z.object({
    ...visit,
    status: z.literal("discharged"),
    ward: z.string(),
    bed: z.string(),
    dischargedBy: z.string(),
    admittedAt: z.iso.datetime(),
    dischargedAt: z.iso.datetime(),
  }),
]);
export type PatientVisit = z.infer<typeof patientVisitSchema>;

/**
 * One page of a tab's visits; `total` counts every match, and `counts` every visit in each tab
 * whatever the search or filters.
 */
export const patientListSchema = z.object({
  total: count,
  counts: z.object({ admitted: count, checked_in: count, checked_out: count, discharged: count }),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  items: z.array(patientVisitSchema),
});
export type PatientList = z.infer<typeof patientListSchema>;

/** The hospital's wards and doctors, to filter patients by. */
export const patientFilterOptionsSchema = z.object({
  wards: z.array(z.object({ id: z.string(), name: z.string() })),
  doctors: z.array(z.object({ id: z.string(), name: z.string() })),
});
export type PatientFilterOptions = z.infer<typeof patientFilterOptionsSchema>;

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

/** One patient's profile: who they are, their visits so far and what's coming up. */
export const patientDetailSchema = patientSchema.extend({
  coverage: z.enum(Object.keys(coverageLabels) as [Coverage, ...Coverage[]]),
  phone: z.string().nullable(),
  email: z.email().nullable(),
  address: z.string().nullable(),
  /** e.g. "Dr. Sarah Adeyemi"; `null` until one is assigned. */
  assignedDoctor: z.string().nullable(),
  lastVisitAt: z.iso.datetime().nullable(),
  lastCheckInAt: z.iso.datetime().nullable(),
  upcomingAppointmentAt: z.iso.datetime().nullable(),
  /** Past appointments and check-ins, latest first. */
  visits: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(Object.keys(visitKindLabels) as [VisitKind, ...VisitKind[]]),
      visitType,
      at: z.iso.datetime(),
      /** Who saw them, e.g. "Dr. Tola Bello"; `null` if no one is recorded. */
      seenBy: z.string().nullable(),
    }),
  ),
});
export type PatientDetail = z.infer<typeof patientDetailSchema>;
