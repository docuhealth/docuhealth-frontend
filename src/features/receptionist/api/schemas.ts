import { z } from "zod";
import { paginated } from "@/lib/api";
import { type PatientRecord, patientRecordSchema, sexOf } from "@/lib/patient-record";
import { fullName, optionalText, staffProfileSchema, text } from "@/lib/staff-profile";

const count = z.number().int().nonnegative();

/**
 * The signed-in member and their hospital, for the dashboard's shell and greeting, from
 * `GET /api/auth/staff/profile`. TODO(api): there's no endpoint for unread notification and
 * message counts yet, so they're 0; the API has no title (e.g. "Dr.") either.
 */
export const receptionistProfileSchema = staffProfileSchema.transform(({ user, hospital }) => ({
  hospital: { name: hospital.name, bannerUrl: hospital.bannerUrl },
  user: { firstName: user.firstName, lastName: user.lastName, email: user.email, avatarUrl: null },
  unreadNotifications: 0,
  unreadMessages: 0,
}));
export type ReceptionistProfile = z.infer<typeof receptionistProfileSchema>;

/** A count and its change as a percentage; `change` is `null` when there's nothing to compare. */
const countWithPercent = z.object({ count, change: z.number().nullable() });

/** The dashboard's headline numbers. */
const receptionOverviewSchema = z.object({
  /** Every check-in ever at the hospital, whatever the period. */
  totalCheckIns: count,
  /** Check-ins in the current clock hour, against the hour before. */
  checkInsThisHour: countWithPercent,
  /** Check-ins in the period still waiting for a nurse. */
  pendingCheckIns: count,
  /** Appointments scheduled in the period, against the period before. */
  appointments: countWithPercent,
});
export type ReceptionOverview = z.infer<typeof receptionOverviewSchema>;

export const appointmentDayLabels = {
  today: "Today",
  tomorrow: "Tomorrow",
  upcoming: "Upcoming",
} as const;
export type AppointmentDay = keyof typeof appointmentDayLabels;

export const appointmentStatusLabels = {
  upcoming: "Upcoming",
  arrived: "Arrived",
  checked_in: "Checked In",
  in_progress: "In-Progress",
  cancelled: "Cancelled",
} as const;
type AppointmentStatus = keyof typeof appointmentStatusLabels;

/** One day's (or the later) appointments; `counts` covers every tab whatever the search. */
const appointmentListSchema = z.object({
  counts: z.object({ today: count, tomorrow: count, upcoming: count }),
  items: z.array(
    z.object({
      id: z.string(),
      at: z.iso.datetime(),
      patient: z.object({
        id: z.string(),
        name: z.string(),
        phone: z.string(),
        avatarUrl: z.url().nullable(),
      }),
      /** e.g. "Follow-up". */
      reason: z.string(),
      status: z.enum(
        Object.keys(appointmentStatusLabels) as [AppointmentStatus, ...AppointmentStatus[]],
      ),
    }),
  ),
});
export type AppointmentList = z.infer<typeof appointmentListSchema>;

const appointmentSchema = appointmentListSchema.shape.items.element;
export type Appointment = z.infer<typeof appointmentSchema>;

/** Why an appointment is being cancelled, in the order the cancel dialog offers them. */
export const cancellationReasonLabels = {
  schedule_conflict: "Schedule conflict",
  feeling_better: "Feeling better",
  transport_issues: "Transport issues",
  cost_concerns: "Cost concerns",
  will_rebook_later: "Will rebook later",
  other: "Other",
} as const;
export type CancellationReason = keyof typeof cancellationReasonLabels;

/** One appointment opened from the calendar, with what the front desk needs to manage it. */
const appointmentDetailSchema = appointmentSchema.extend({
  patient: z.object({
    id: z.string(),
    name: z.string(),
    /** Digits only. */
    hin: z.string(),
    phone: z.string().nullable(),
    email: z.email().nullable(),
  }),
  /** Who booked it in, e.g. "Front desk" or "Dr. Adebayo". */
  bookedWith: z.string(),
  note: z.string().nullable(),
});
export type AppointmentDetail = z.infer<typeof appointmentDetailSchema>;

/** In the order the gender select lists them. */
export const sexLabels = {
  male: "Male",
  female: "Female",
  prefer_not_to_say: "Prefer not to say",
} as const;
export type Sex = keyof typeof sexLabels;

const sex = z.enum(Object.keys(sexLabels) as [Sex, ...Sex[]]);

/** An appointment on the Appointments page, with enough of the patient to tell them apart. */
const calendarAppointmentSchema = appointmentSchema.extend({
  patient: appointmentSchema.shape.patient.extend({
    /** Digits only. */
    hin: z.string(),
    dateOfBirth: z.iso.date(),
    sex,
  }),
});
export type CalendarAppointment = z.infer<typeof calendarAppointmentSchema>;

/**
 * The Appointments page: every appointment from `from` up to `to` (cancelled ones too, earliest
 * first), and that span's numbers.
 */
const appointmentCalendarSchema = z.object({
  summary: z.object({
    /** Every appointment in the span, cancelled ones included. */
    booked: count,
    // `null` where the API has no figure yet (TODO(api)).
    /** Percentage against the span of the same length before. */
    bookedChange: z.number().nullable(),
    checkedIn: count,
    cancelled: count,
    /** How many more (or, negative, fewer) were cancelled than in the span before. */
    cancelledChange: z.number().int().nullable(),
    openSlots: count.nullable(),
    /** Every slot the front desk can book in the span. */
    totalSlots: count.nullable(),
  }),
  items: z.array(calendarAppointmentSchema),
});
export type AppointmentCalendar = z.infer<typeof appointmentCalendarSchema>;

/** Where a checked-in patient is in their visit; the same states the admin's queue shows. */
export const queueStatusLabels = {
  pending: "Pending",
  in_progress: "In-progress",
  completed: "Completed",
} as const;
export type QueueStatus = keyof typeof queueStatusLabels;

/** Patients checked in and waiting, longest wait first. */
const receptionQueueSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      patient: z.object({
        id: z.string(),
        name: z.string(),
        hin: z.string(),
        avatarUrl: z.url().nullable(),
      }),
      /** Why they came in, e.g. "Lab Results". */
      reason: z.string(),
      status: z.enum(Object.keys(queueStatusLabels) as [QueueStatus, ...QueueStatus[]]),
      waitMinutes: count,
    }),
  ),
});
export type ReceptionQueue = z.infer<typeof receptionQueueSchema>;
export type QueueEntry = ReceptionQueue["items"][number];

/** Registered patients whose HIN matches the one looked up (one, or none). */
const patientLookupSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      /** Digits only, e.g. "12334567890". */
      hin: z.string(),
      dateOfBirth: z.iso.date(),
      sex,
      avatarUrl: z.url().nullable(),
      phone: z.string().nullable(),
      email: z.email().nullable(),
    }),
  ),
});
export type PatientLookup = z.infer<typeof patientLookupSchema>;
export type FoundPatient = PatientLookup["items"][number];

/** How a patient pays for their care. */
export const coverageLabels = {
  hmo: "HMO Patient",
  nhis: "NHIS Patient",
  private: "Private Patient",
} as const;
type Coverage = keyof typeof coverageLabels;

export const visitKindLabels = { appointment: "Appointment", check_in: "Check-In" } as const;
export type VisitKind = keyof typeof visitKindLabels;

export const visitStatusLabels = { checked_in: "Checked in", checked_out: "Checked out" } as const;
type VisitStatus = keyof typeof visitStatusLabels;

const visitStatus = z.enum(Object.keys(visitStatusLabels) as [VisitStatus, ...VisitStatus[]]);

/** Someone linked to a patient's account: a dependent they manage, or a proxy managing theirs. */
const linkedPersonSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.url().nullable(),
  dateOfBirth: z.iso.date(),
  sex,
  /** To the patient, e.g. "Mother"; proxies only. */
  relationship: z.string().nullable(),
  lastVisitAt: z.iso.datetime().nullable(),
});
export type LinkedPerson = z.infer<typeof linkedPersonSchema>;

/**
 * One patient's profile for the front desk. A patient with `proxies` is a dependent, whose
 * account someone else manages; anyone else may manage `dependents` of their own.
 */
const patientProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Digits only. */
  hin: z.string(),
  dateOfBirth: z.iso.date(),
  sex,
  avatarUrl: z.url().nullable(),
  /** `null` when the API's value has no match here. */
  coverage: z.enum(Object.keys(coverageLabels) as [Coverage, ...Coverage[]]).nullable(),
  phone: z.string().nullable(),
  email: z.email().nullable(),
  address: z.string().nullable(),
  /** e.g. "Dr. Sarah Adeyemi"; `null` until one is assigned. */
  assignedDoctor: z.string().nullable(),
  /** Check-ins and attended appointments at this hospital, all time. */
  totalVisits: count,
  // Each `department` (e.g. "General Medicine") is `null` when it isn't known.
  /** `null` until they've visited. */
  lastVisit: z.object({ at: z.iso.datetime(), department: z.string().nullable() }).nullable(),
  /** `status` is `null` when the check-in isn't among the visits loaded. */
  lastCheckIn: z.object({ at: z.iso.datetime(), status: visitStatus.nullable() }).nullable(),
  upcomingAppointment: z
    .object({ at: z.iso.datetime(), department: z.string().nullable() })
    .nullable(),
  /** Past appointments and check-ins, latest first. */
  visits: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(Object.keys(visitKindLabels) as [VisitKind, ...VisitKind[]]),
      checkedInAt: z.iso.datetime(),
      checkedOutAt: z.iso.datetime().nullable(),
      status: visitStatus,
    }),
  ),
  dependents: z.array(linkedPersonSchema),
  proxies: z.array(linkedPersonSchema),
});
export type PatientProfile = z.infer<typeof patientProfileSchema>;

export const requestStatusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
} as const;
type RequestStatus = keyof typeof requestStatusLabels;

/** A follow-up a doctor asked the front desk to book, waiting for the patient to agree a time. */
const appointmentRequestSchema = z.object({
  id: z.string(),
  /** e.g. "Follow-up visit". */
  reason: z.string(),
  /** e.g. "Dr. Adebayo". */
  requestedBy: z.string(),
  requestedAt: z.iso.datetime(),
  /** When the doctor would like to see them. */
  proposedAt: z.iso.datetime(),
  note: z.string().nullable(),
  status: z.enum(Object.keys(requestStatusLabels) as [RequestStatus, ...RequestStatus[]]),
});
export type AppointmentRequest = z.infer<typeof appointmentRequestSchema>;

/** What the front desk reviews before a patient in the queue leaves. */
const checkOutSummarySchema = z.object({
  patient: z.object({
    id: z.string(),
    name: z.string(),
    hin: z.string(),
    phone: z.string().nullable(),
    email: z.email().nullable(),
  }),
  appointmentRequests: z.array(appointmentRequestSchema),
});
export type CheckOutSummary = z.infer<typeof checkOutSummarySchema>;

/** How a guardian is related to the child they're linked to. */
export const relationshipLabels = {
  mother: "Mother",
  father: "Father",
  grandparent: "Grandparent",
  sibling: "Sibling",
  aunt_uncle: "Aunt / Uncle",
  legal_guardian: "Legal guardian",
  other: "Other",
} as const;
export type Relationship = keyof typeof relationshipLabels;

/** Whether the front desk has confirmed the guardian really is responsible for the child. */
export const guardianVerificationLabels = {
  pending: "Pending",
  verified: "Verified",
  not_verified: "Not verified",
} as const;
export type GuardianVerification = keyof typeof guardianVerificationLabels;

/** A child linked to a guardian: the child (new or existing) and who they're linked to. */
const dependentLinkedSchema = z.object({
  child: z.object({
    id: z.string(),
    name: z.string(),
    /** Digits only. */
    hin: z.string(),
  }),
  guardian: z.object({ id: z.string(), name: z.string() }),
});
export type DependentLinked = z.infer<typeof dependentLinkedSchema>;

/** The patient just registered, and the HIN they'll use from now on. */
const registeredPatientSchema = z.object({
  id: z.string(),
  /** Digits only. */
  hin: z.string(),
});
export type RegisteredPatient = z.infer<typeof registeredPatientSchema>;

// ---------------------------------------------------------------------------------------------
// The real API's shapes (docs/api/openapi.json, and docs/backend-handoff-2026-11-25-dashboards.md
// for the dashboard endpoints) and how they become the models above. TODO(api) marks what the API
// doesn't send yet; see docs/backend-gaps-v2-migration.md, section 7.

const dateTime = z.iso.datetime({ offset: true });

const sentence = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replaceAll("_", " ");

/** `GET /api/patients/{hin}/details`: a registered patient. */
export const patientDetailsSchema = patientRecordSchema;
export type PatientDetails = PatientRecord;

/** The patient lookup's match. */
export const toFoundPatient = (patient: PatientDetails): FoundPatient => ({
  id: patient.id,
  name: patient.name,
  hin: patient.hin,
  dateOfBirth: patient.dateOfBirth,
  sex: patient.sex,
  avatarUrl: patient.avatarUrl,
  phone: patient.phone,
  email: patient.email,
});

/** `GET /api/patients/{hin}/visit-metrics`: their visits at this hospital, at a glance. */
export const visitMetricsSchema = z.object({
  total_visits: count,
  last_visit: dateTime.nullish(),
  last_check_in: dateTime.nullish(),
  upcoming_appointment: z.object({ scheduled_time: dateTime }).nullish(),
  patient_info: z.object({
    /** `null` for a dependant, who has no login of their own. */
    email: optionalText,
    /** How they pay here: `private`, `hmo` or `company`. */
    acct_type: optionalText,
  }),
});
type VisitMetrics = z.infer<typeof visitMetricsSchema>;

/**
 * `GET /api/patients/{hin}/guardianship`: the patient's guardians if they're a dependant, else
 * their dependants. TODO(api): the relationship ("Mother") isn't returned.
 */
export const guardianshipPageSchema = paginated(
  z
    .object({
      hin: z.string(),
      firstname: text,
      lastname: text,
      dob: z.string(),
      gender: optionalText,
      last_visit: dateTime.nullish(),
    })
    .transform((person): LinkedPerson => ({
      // Profiles are addressed by HIN.
      id: person.hin,
      name: fullName(person.firstname, person.lastname) || person.hin,
      avatarUrl: null,
      dateOfBirth: person.dob,
      sex: sexOf(person.gender),
      relationship: null,
      lastVisitAt: person.last_visit ?? null,
    })),
);

/** `GET /api/patients/{hin}/visits` (no `type`): check-ins and appointments, newest first. */
export const visitTimelineSchema = paginated(
  z.object({
    appointment: z
      .object({
        sqid: z.string(),
        status: optionalText,
        scheduled_time: dateTime,
        closed_at: dateTime.nullish(),
      })
      .nullish(),
    check_in: z
      .object({ sqid: z.string(), created_at: dateTime, closed_at: dateTime.nullish() })
      .nullish(),
  }),
);
type VisitTimeline = z.infer<typeof visitTimelineSchema>;

/** The appointment statuses the API counts as a visit. */
const attendedStatuses = new Set(["confirmed", "completed"]);

/**
 * The timeline → the visit history: every check-in, and the attended appointments up to `now`
 * (pending, cancelled and future ones aren't visits). Closed means checked out.
 */
function toVisits({ items }: VisitTimeline, now: number): PatientProfile["visits"] {
  return items.flatMap(({ appointment, check_in }): PatientProfile["visits"] => {
    if (check_in) {
      return [
        {
          id: check_in.sqid,
          kind: "check_in",
          checkedInAt: check_in.created_at,
          checkedOutAt: check_in.closed_at ?? null,
          status: check_in.closed_at ? "checked_out" : "checked_in",
        },
      ];
    }
    if (
      appointment &&
      attendedStatuses.has(appointment.status ?? "") &&
      new Date(appointment.scheduled_time).getTime() <= now
    ) {
      return [
        {
          id: appointment.sqid,
          kind: "appointment",
          checkedInAt: appointment.scheduled_time,
          checkedOutAt: appointment.closed_at ?? null,
          status: appointment.closed_at ? "checked_out" : "checked_in",
        },
      ];
    }
    return [];
  });
}

/**
 * The profile page, from the patient's details, visit metrics, linked people and visits.
 * TODO(api): no assigned doctor, and no department for a visit or appointment.
 */
export function toPatientProfile(
  patient: PatientDetails,
  metrics: VisitMetrics,
  linked: LinkedPerson[],
  timeline: VisitTimeline,
  now = Date.now(),
): PatientProfile {
  const visits = toVisits(timeline, now);
  const lastCheckIn = metrics.last_check_in;
  // The visit-metrics' check-in has no status; the timeline's copy of it says if it's closed.
  const lastCheckInVisit = visits.find(
    (visit) =>
      visit.kind === "check_in" &&
      lastCheckIn &&
      new Date(visit.checkedInAt).getTime() === new Date(lastCheckIn).getTime(),
  );
  // TODO(api): `company` has no match in the design's coverage labels, so it shows none.
  const coverage =
    (["hmo", "private"] as const).find((type) => type === metrics.patient_info.acct_type) ?? null;
  // A dependant has no login, so no email; their linked people are guardians.
  const isDependant = metrics.patient_info.email === null;
  return {
    ...toFoundPatient(patient),
    coverage,
    address: patient.address,
    assignedDoctor: null,
    totalVisits: metrics.total_visits,
    lastVisit: metrics.last_visit ? { at: metrics.last_visit, department: null } : null,
    lastCheckIn: lastCheckIn ? { at: lastCheckIn, status: lastCheckInVisit?.status ?? null } : null,
    upcomingAppointment: metrics.upcoming_appointment
      ? { at: metrics.upcoming_appointment.scheduled_time, department: null }
      : null,
    visits,
    dependents: isDependant ? [] : linked,
    proxies: isDependant ? linked : [],
  };
}

/** `HospitalAppointment`, as the API returns it. */
const appointmentRead = z.object({
  sqid: z.string(),
  status: z.string(),
  scheduled_time: dateTime,
  type: optionalText,
  note: optionalText,
  staff: z.object({ firstname: text, lastname: text }).nullish(),
  patient: z.object({
    hin: text,
    firstname: text,
    lastname: text,
    phone_num: optionalText,
    email: optionalText,
    dob: z.string().nullish(),
    gender: optionalText,
  }),
});
type AppointmentRead = z.infer<typeof appointmentRead>;

export const appointmentPageSchema = z.object({
  count: count,
  results: z.array(appointmentRead),
});

/** Only a list's total, e.g. `?size=1` to count a tab. */
export const countOnlySchema = z.object({ count: count }).transform(({ count }) => count);

/**
 * The API's appointment status → the design's. TODO(api): appointments don't record arrival or
 * check-in, so "Arrived" and "In-Progress" never show; a completed one shows as "Checked In".
 */
const statusOfAppointment: Record<string, AppointmentStatus> = {
  pending: "upcoming",
  confirmed: "upcoming",
  completed: "checked_in",
  cancelled: "cancelled",
};

export const toAppointment = (appointment: AppointmentRead): Appointment => ({
  id: appointment.sqid,
  at: appointment.scheduled_time,
  patient: {
    id: appointment.patient.hin,
    name: fullName(appointment.patient.firstname, appointment.patient.lastname),
    phone: appointment.patient.phone_num ?? "",
    avatarUrl: null,
  },
  // TODO(api): no reason field; the type ("consultation") stands in.
  reason: appointment.type ? sentence(appointment.type) : "Appointment",
  status: statusOfAppointment[appointment.status] ?? "upcoming",
});

export const toCalendarAppointment = (appointment: AppointmentRead): CalendarAppointment => {
  const base = toAppointment(appointment);
  return {
    ...base,
    patient: {
      ...base.patient,
      hin: appointment.patient.hin,
      dateOfBirth: appointment.patient.dob ?? "1900-01-01",
      sex: sexOf(appointment.patient.gender),
    },
  };
};

export const toAppointmentDetail = (appointment: AppointmentRead): AppointmentDetail => ({
  ...toAppointment(appointment),
  patient: {
    id: appointment.patient.hin,
    name: fullName(appointment.patient.firstname, appointment.patient.lastname),
    hin: appointment.patient.hin,
    phone: appointment.patient.phone_num,
    email: appointment.patient.email,
  },
  // The API says who the appointment is with, not who booked it.
  bookedWith: appointment.staff
    ? fullName(appointment.staff.firstname, appointment.staff.lastname)
    : "Front desk",
  note: appointment.note,
});

/** `GET /api/hospital-ops/operation-metrics`: the receptionist dashboard's numbers. */
export const operationMetricsSchema = z
  .object({
    total_checkins: count,
    pending_checkins: count,
    // Despite its name, this `change` is a percentage against the previous hour.
    check_ins_this_hour: z.object({ count, change: z.number().nullish() }),
    this_period_appointments: z.object({ count, percent_change: z.number().nullish() }),
  })
  .transform((metrics): ReceptionOverview => ({
    totalCheckIns: metrics.total_checkins,
    checkInsThisHour: {
      count: metrics.check_ins_this_hour.count,
      change: metrics.check_ins_this_hour.change ?? null,
    },
    pendingCheckIns: metrics.pending_checkins,
    appointments: {
      count: metrics.this_period_appointments.count,
      change: metrics.this_period_appointments.percent_change ?? null,
    },
  }));

/** `GET /api/hospital-ops/appointments-overview`: the Appointments page's numbers. */
export const appointmentsOverviewSchema = z
  .object({
    appointments_booked: z.object({ count, percent_change: z.number().nullish() }),
    in_progress_appointments: count,
    // Counted by when they were booked: the API stores no cancellation time.
    cancelled_appointments: z.object({ count, change: z.number().int().nullish() }),
  })
  .transform((overview) => ({
    booked: overview.appointments_booked.count,
    bookedChange: overview.appointments_booked.percent_change ?? null,
    inProgress: overview.in_progress_appointments,
    cancelled: overview.cancelled_appointments.count,
    cancelledChange: overview.cancelled_appointments.change ?? null,
  }));

/**
 * `GET /api/hospital-ops/patients-check-ins`: every check-in at the hospital, newest first,
 * closed ones included. `status` is `pending`, `nursing_active`, `nursing_idle`, `doctor_idle`,
 * `doctor_active`, `doctor_seen` or `closed`.
 */
export const checkInPageSchema = paginated(
  z.object({
    /** The check-in's (the queue entry's) id. */
    sqid: z.string(),
    patient_info: z.object({ hin: text, firstname: text, lastname: text }),
    status: optionalText,
    created_at: dateTime,
  }),
);

/** A check-in's status → the queue's. */
export function queueStatusOf(status: string | null): QueueStatus {
  if (!status || status === "pending") return "pending";
  if (status === "doctor_seen" || status === "closed") return "completed";
  return "in_progress";
}

/** `POST /api/auth/signup/verify-code` → the token step 3 needs. */
export const signupTokenSchema = z
  .object({ signup_token: z.string() })
  .transform(({ signup_token }) => ({ verificationToken: signup_token }));

/** `POST /api/auth/signup/desk/complete`: the new patient (no id, so the HIN stands in). */
export const signedUpPatientSchema = z
  .object({ hin: z.string() })
  .transform(({ hin }): RegisteredPatient => ({ id: hin, hin }));

/** `POST /api/patients/{hin}/dependants`: the new child. */
export const createdDependantSchema = z.object({
  hin: z.string(),
  firstname: text,
  lastname: text,
});

/** Replies to writes whose body the app doesn't use. */
export const anyResponseSchema = z.unknown();
