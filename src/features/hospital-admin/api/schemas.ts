import { z } from "zod";
import { paginated } from "@/lib/api";
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
    /** Staff added in the period asked for. */
    added: number;
    /** `added` minus the period before's; `null` when there's nothing to compare with. */
    addedChange: number | null;
    administrators: number;
    facilities: number;
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
 * TODO(api): the API doesn't store a staff ID, date of birth or access roles.
 */
export type StaffDetail = StaffMember & {
  /** e.g. "STF-00218" */
  staffCode: string | null;
  dateOfBirth: string | null;
  /** Who added them, e.g. "Sarah Adeyemi" (or their email); `null` if unknown. */
  addedBy: string | null;
  /** Activity in the period asked for. */
  stats: {
    patientsSeen: number;
    appointmentsCompleted: number;
    /** TODO(api): appointments in the period, the next one and pending follow-ups aren't sent. */
    appointments: number | null;
    nextAppointmentAt: string | null;
    followUpsRequested: number;
    followUpsPending: number | null;
  };
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

/**
 * Check-ins in the period asked for; each `change` is against the one before it (`null` when
 * there's nothing to compare with).
 */
export type PatientStats = {
  /** Every check-in ever, whatever the period. */
  totalCheckIns: number;
  /** Check-ins that were the patient's first here. */
  newCheckIns: number;
  newCheckInsChange: number | null;
  checkInsThisPeriod: number;
  checkInsThisPeriodChange: number | null;
  /** Patients (not check-ins) back after an earlier check-in. */
  returningPatients: number;
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

/** Where an appointment in a patient's history stands, when it isn't simply attended. */
export const appointmentStateLabels = { upcoming: "Upcoming", cancelled: "Cancelled" } as const;
type AppointmentState = keyof typeof appointmentStateLabels;

/** A patient's guardian or dependant. */
export type LinkedPatient = Omit<Patient, "avatarUrl"> & { lastVisitAt: string | null };

/**
 * One patient's profile: who they are, their visits at this hospital and what's coming up.
 * TODO(api): no endpoint says who their doctor is.
 */
export type PatientDetail = Patient & {
  coverage: Coverage | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  /** e.g. "Dr. Sarah Adeyemi"; `null` until one is assigned. */
  assignedDoctor: string | null;
  /** Check-ins plus confirmed or completed appointments. */
  totalVisits: number;
  lastVisitAt: string | null;
  lastCheckInAt: string | null;
  upcomingAppointmentAt: string | null;
  /** Appointments (whatever their status, booked ones first) and check-ins, latest first. */
  visits: {
    id: string;
    kind: VisitKind;
    /** TODO(api): check-ins don't record a visit type; an appointment's is free text. */
    visitType: VisitType | null;
    at: string;
    /** Who saw them, e.g. "Dr. Tola Bello"; `null` if no one is recorded. */
    seenBy: string | null;
    /** An appointment not yet held, or cancelled; `null` otherwise. */
    state: AppointmentState | null;
  }[];
  /**
   * The patient's guardians if they're a dependant, otherwise their dependants. TODO(api): the
   * API doesn't say which; a patient with no email is read as a dependant (no login of their own).
   */
  linked: { relation: "guardians" | "dependants"; patients: LinkedPatient[] };
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

/** A role the app knows, or `null`. */
const role = z
  .string()
  .nullish()
  .transform((value) => (value && value in staffRoles ? (value as StaffRole) : null));

/** `GET /api/hospital-ops/staff/{sqid}?period=…`: one member's activity in the period, and profile. */
export const staffDetailSchema = z.object({
  total_patients_seen: count,
  appointments_completed: count,
  follow_ups_requested: count,
  staff_info: z.object({
    sqid: z.string(),
    firstname: text,
    lastname: text,
    role,
    gender: optionalText,
    joined_at: dateTime.nullish(),
    email: text,
    // `null` for staff added before this was recorded; a DH admin has an email but no name.
    added_by_info: z.object({ firstname: text, lastname: text, email: text }).nullish(),
  }),
});

/**
 * One member's profile page. The member's own endpoint has no phone number or team status, so
 * those come from their row in the staff list (`listed`), if it's there.
 */
export function toStaffDetail(
  { staff_info: info, ...stats }: z.infer<typeof staffDetailSchema>,
  listed: StaffMember | undefined,
): StaffDetail {
  const addedBy = info.added_by_info;
  return {
    id: info.sqid,
    name: fullName(info.firstname, info.lastname) || info.email,
    email: info.email,
    phone: listed?.phone ?? "",
    role: info.role,
    avatarUrl: null,
    addedAt: info.joined_at ?? null,
    status: listed?.status ?? "on_team",
    sex: info.gender ? sexOf(info.gender) : (listed?.sex ?? null),
    isAdmin: null,
    // TODO(api): not stored.
    staffCode: null,
    dateOfBirth: null,
    addedBy: addedBy
      ? fullName(addedBy.firstname, addedBy.lastname) || addedBy.email || null
      : null,
    stats: {
      patientsSeen: stats.total_patients_seen,
      appointmentsCompleted: stats.appointments_completed,
      appointments: null,
      nextAppointmentAt: null,
      followUpsRequested: stats.follow_ups_requested,
      followUpsPending: null,
    },
    permissions: null,
  };
}

/** `GET /api/hospital-ops/administration-metrics?timeframe=…`: the overview's headline numbers. */
export const administrationMetricsSchema = z
  .object({
    total_staff: count,
    added_this_duration: z.object({ count: count, change: z.number().int().nullish() }),
    administrators: count,
    total_facilities: count,
  })
  .transform((metrics): DashboardOverview["stats"] => ({
    totalStaff: metrics.total_staff,
    added: metrics.added_this_duration.count,
    addedChange: metrics.added_this_duration.change ?? null,
    administrators: metrics.administrators,
    facilities: metrics.total_facilities,
  }));

/**
 * `GET /api/hospital-ops/staff-role-counts`: every role the app knows, with how many hold it. The
 * API leaves out roles no one holds, so those are 0.
 */
export const staffRoleCountsSchema = z.array(z.object({ role, count: count })).transform((rows) =>
  (Object.keys(staffRoles) as StaffRole[]).map((name) => ({
    role: name,
    count: rows.find((row) => row.role === name)?.count ?? 0,
  })),
);

/** A count and its change against the period before (`null` without a period). */
const countWithChange = z.object({ count: count, change: z.number().int().nullish() });

/** `GET /api/hospital-ops/patient-management/metrics?period=…`: the check-in numbers. */
export const patientManagementMetricsSchema = z
  .object({
    total_checkins: count,
    new_checkins: countWithChange,
    checkins_this_period: countWithChange,
    returning_patients: count,
  })
  .transform((metrics): PatientStats => ({
    totalCheckIns: metrics.total_checkins,
    newCheckIns: metrics.new_checkins.count,
    newCheckInsChange: metrics.new_checkins.change ?? null,
    checkInsThisPeriod: metrics.checkins_this_period.count,
    checkInsThisPeriodChange: metrics.checkins_this_period.change ?? null,
    returningPatients: metrics.returning_patients,
  }));

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

/**
 * `GET /api/hospital-ops/patients?status=…`: a row of any of its four lists, read for the columns
 * the tabs have. Each list sends its own fields: admissions (`inpatient`) their ward, bed, the
 * doctor who asked for the bed, latest vitals, ongoing medications and admission note; open
 * check-ins (`outpatient`) their nurse/doctor stage, latest vitals and any bed request;
 * closed check-ins who closed them and when; discharges the ward, bed, who signed the discharge
 * and the discharge forms. The vitals, medications, notes and forms have no column, so they
 * aren't read. A dependant's `patient_info` has no `email` key.
 */
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

/**
 * `GET /api/hospital-ops/patients-check-ins`: every check-in at the hospital, newest first,
 * closed ones included.
 */
const checkInRow = z.object({
  sqid: z.string(),
  patient_info: z.object({ hin: text, firstname: text, lastname: text }),
  /** pending, nursing_active, nursing_idle, doctor_idle, doctor_active, doctor_seen or closed. */
  status: optionalText,
  created_at: dateTime,
});
type CheckInRow = z.infer<typeof checkInRow>;

export const checkInPageSchema = paginated(checkInRow);

/** A check-in is closed once the patient has checked out. */
export const isOpenCheckIn = (row: CheckInRow) => row.status !== "closed";

function queueStatusOf(status: string | null): QueueStatus {
  if (!status || status === "pending") return "pending";
  if (status === "doctor_seen" || status === "closed") return "completed";
  return "in_progress";
}

/** An open check-in in the queue; the API has no wait time, so it's how long since check-in. */
export const toQueueEntry = (row: CheckInRow, now: number): PatientQueue["items"][number] => ({
  id: row.sqid,
  patient: {
    name: fullName(row.patient_info.firstname, row.patient_info.lastname) || row.patient_info.hin,
    hin: row.patient_info.hin,
    avatarUrl: null,
  },
  status: queueStatusOf(row.status),
  waitMinutes: minutesSince(row.created_at, now),
});

/** `GET /api/hospital-ops/wards`: the hospital's wards. */
export const wardPageSchema = z.object({
  results: z.array(z.object({ sqid: z.string(), name: text })),
});

/** `GET /api/patients/{hin}/info`: the patient's record, with vitals and drugs (unused here). */
export const patientInfoSchema = z
  .object({ patient_info: patientRecordSchema })
  .transform(({ patient_info }) => patient_info);

/** `GET /api/patients/{hin}/visit-metrics`: the patient's visits at this hospital. */
export const visitMetricsSchema = z.object({
  total_visits: count,
  last_visit: dateTime.nullish(),
  last_check_in: dateTime.nullish(),
  upcoming_appointment: z.object({ scheduled_time: dateTime }).nullish(),
  // `email` is null for a dependant; `acct_type` repeats the record's payment type.
  patient_info: z.object({ email: optionalText }),
});

/** `GET /api/patients/{hin}/guardianship`: the patient's guardians or dependants. */
export const guardianshipPageSchema = paginated(
  z
    .object({
      hin: text,
      firstname: text,
      lastname: text,
      dob: z.string().nullish(),
      gender: optionalText,
      last_visit: dateTime.nullish(),
    })
    .transform((linked): LinkedPatient => ({
      id: linked.hin,
      name: fullName(linked.firstname, linked.lastname) || linked.hin,
      hin: linked.hin,
      dateOfBirth: linked.dob ?? null,
      sex: sexOf(linked.gender),
      lastVisitAt: linked.last_visit ?? null,
    })),
);

/** An appointment's free-text type ("follow-up", "Emergency") as a visit type, if it is one. */
function visitTypeOf(type: string | null): VisitType | null {
  const key = type?.toLowerCase().replace(/[\s-]+/g, "_");
  return key && key in visitTypeLabels ? (key as VisitType) : null;
}

/**
 * `GET /api/patients/{hin}/visits` (no `type`): the patient's appointments and check-ins here,
 * latest first; an appointment sits at its scheduled time, so booked ones come first.
 */
export const visitTimelinePageSchema = paginated(
  z
    .object({
      appointment: z
        .object({
          sqid: z.string(),
          status: optionalText,
          scheduled_time: dateTime,
          staff: person,
          type: optionalText,
        })
        .nullish(),
      check_in: z.object({ sqid: z.string(), created_at: dateTime }).nullish(),
    })
    .transform(({ appointment, check_in }): PatientDetail["visits"][number] | null => {
      if (appointment) {
        return {
          id: appointment.sqid,
          kind: "appointment",
          visitType: visitTypeOf(appointment.type),
          at: appointment.scheduled_time,
          seenBy: appointment.staff,
          state:
            appointment.status === "pending"
              ? "upcoming"
              : appointment.status === "cancelled"
                ? "cancelled"
                : null,
        };
      }
      if (check_in) {
        return {
          id: check_in.sqid,
          kind: "check_in",
          visitType: null,
          at: check_in.created_at,
          // TODO(api): check-ins don't say who saw the patient.
          seenBy: null,
          state: null,
        };
      }
      return null;
    }),
);

export const toPatientDetail = (
  patient: PatientRecord,
  metrics: z.infer<typeof visitMetricsSchema>,
  linked: LinkedPatient[],
  visits: (PatientDetail["visits"][number] | null)[],
): PatientDetail => ({
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
  totalVisits: metrics.total_visits,
  lastVisitAt: metrics.last_visit ?? null,
  lastCheckInAt: metrics.last_check_in ?? null,
  upcomingAppointmentAt: metrics.upcoming_appointment?.scheduled_time ?? null,
  visits: visits.filter((visit) => visit !== null),
  linked: {
    relation: metrics.patient_info.email === null ? "guardians" : "dependants",
    patients: linked,
  },
});

// ---------------------------------------------------------------------------------------------
// Ward management (`/api/hospital-ops/wards/manage`).

export const bedStatusLabels = {
  available: "Available",
  occupied: "Occupied",
  requested: "Requested",
} as const;
export type BedStatus = keyof typeof bedStatusLabels;

export type Ward = {
  id: string;
  name: string;
  totalBeds: number;
  availableBeds: number;
  /** Beds taken or asked for by a doctor's admission request. */
  occupiedBeds: number;
  beds: { id: string; number: number; status: BedStatus }[];
};

export type WardList = { total: number; items: Ward[] };

const bedStatusOf = (status: string): BedStatus =>
  status === "available" || status === "requested" ? status : "occupied";

const wardBed = z
  .object({ sqid: z.string(), bed_number: z.coerce.number(), status: z.string() })
  .transform((bed) => ({ id: bed.sqid, number: bed.bed_number, status: bedStatusOf(bed.status) }));

/** `Ward`, as the API returns it. */
export const wardSchema = z
  .object({
    sqid: z.string(),
    name: text,
    total_beds: count,
    available_beds: count,
    beds: z.array(wardBed).catch([]),
  })
  .transform((ward): Ward => ({
    id: ward.sqid,
    name: ward.name,
    totalBeds: ward.total_beds,
    availableBeds: ward.available_beds,
    occupiedBeds: Math.max(0, ward.total_beds - ward.available_beds),
    beds: [...ward.beds].sort((a, b) => a.number - b.number),
  }));

export const wardManagePageSchema = z.object({ count: count, results: z.array(wardSchema) });

/** `GET /api/hospital-ops/wards/{ward}/beds`: the ward's beds, as they are now. */
export const wardBedsSchema = z
  .array(wardBed)
  .transform((beds) => [...beds].sort((a, b) => a.number - b.number));

// ---------------------------------------------------------------------------------------------
// Wallet and subscription (`/api/payments/*`, `GET /api/auth/facility`). TODO(api): there's no
// wallet (balance or transactions) in the API yet.

const planIntervalLabels: Record<string, string> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  quarterly: "quarter",
  biannually: "6 months",
  annually: "year",
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  /** In naira. */
  price: number;
  /** "month", "year"… */
  per: string;
  description: string | null;
  features: string[];
  /** What subscribing sends; `null` for a plan that can't be bought online. */
  code: string | null;
};

export const subscriptionPlansSchema = z.array(
  z
    .object({
      sqid: z.string(),
      name: text,
      price: z.coerce.number(),
      interval: text,
      description: optionalText,
      features: z.array(z.string()).catch([]),
      paystack_plan_code: optionalText,
    })
    .transform((plan): SubscriptionPlan => ({
      id: plan.sqid,
      name: plan.name,
      price: plan.price,
      per: planIntervalLabels[plan.interval] ?? plan.interval,
      description: plan.description,
      features: plan.features,
      code: plan.paystack_plan_code,
    })),
);

export type CurrentSubscription = { planName: string | null; status: string | null } | null;

/**
 * The hospital's subscription, from `GET /api/auth/facility`. TODO(api): typed as a string but
 * read as `{status, plan_name}` by v1; `null` while there's none (the free plan).
 */
export const facilitySubscriptionSchema = z
  .object({
    hospital_profile: z
      .object({
        subscription: z
          .union([z.object({ plan_name: optionalText, status: optionalText }).loose(), z.string()])
          .nullish(),
      })
      .loose()
      .nullish(),
  })
  .loose()
  .transform(({ hospital_profile }): CurrentSubscription => {
    const subscription = hospital_profile?.subscription;
    if (!subscription) return null;
    if (typeof subscription === "string") return { planName: subscription, status: null };
    return { planName: subscription.plan_name, status: subscription.status };
  });

/** `POST /api/payments/subscribe`; the Paystack checkout link, if the API sends one. */
export const subscribeResponseSchema = z
  .object({ authorization_url: z.url().nullish(), status: optionalText })
  .loose();
