import { z } from "zod";

const count = z.number().int().nonnegative();

/** The signed-in receptionist and their hospital, for the dashboard's shell and greeting. */
export const receptionistProfileSchema = z.object({
  hospital: z.object({
    name: z.string(),
    /** e.g. "LUTH". */
    shortName: z.string(),
    /** The banner photo the hospital's admin chose; `null` shows the default one. */
    bannerUrl: z.url().nullable(),
  }),
  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    avatarUrl: z.url().nullable(),
  }),
  unreadNotifications: count,
  unreadMessages: count,
});
export type ReceptionistProfile = z.infer<typeof receptionistProfileSchema>;

/** Headline numbers; each `…Change` is a percentage against the period before. */
export const receptionOverviewSchema = z.object({
  /** In the period asked for, compared with the one before it. */
  totalCheckIns: count,
  totalCheckInsChange: z.number(),
  /** Right now, compared with an hour ago. */
  waitingInQueue: count,
  waitingInQueueChange: z.number(),
  /** Today, compared with yesterday. */
  checkedInToday: count,
  checkedInTodayChange: z.number(),
  appointmentsToday: count,
  appointmentsTodayChange: z.number(),
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
export type AppointmentStatus = keyof typeof appointmentStatusLabels;

/** One day's (or the later) appointments; `counts` covers every tab whatever the search. */
export const appointmentListSchema = z.object({
  counts: z.object({ today: count, tomorrow: count, upcoming: count }),
  items: z.array(
    z.object({
      id: z.string(),
      at: z.iso.datetime(),
      patient: z.object({ id: z.string(), name: z.string(), phone: z.string() }),
      /** e.g. "Follow-up". */
      reason: z.string(),
      status: z.enum(
        Object.keys(appointmentStatusLabels) as [AppointmentStatus, ...AppointmentStatus[]],
      ),
    }),
  ),
});
export type AppointmentList = z.infer<typeof appointmentListSchema>;

export const appointmentSchema = appointmentListSchema.shape.items.element;
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
export const appointmentDetailSchema = appointmentSchema.extend({
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
export const calendarAppointmentSchema = appointmentSchema.extend({
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
export const appointmentCalendarSchema = z.object({
  summary: z.object({
    /** Every appointment in the span, cancelled ones included. */
    booked: count,
    /** Percentage against the span of the same length before. */
    bookedChange: z.number(),
    checkedIn: count,
    cancelled: count,
    /** How many more (or, negative, fewer) were cancelled than in the span before. */
    cancelledChange: z.number().int(),
    openSlots: count,
    /** Every slot the front desk can book in the span. */
    totalSlots: count,
  }),
  items: z.array(calendarAppointmentSchema),
});
export type AppointmentCalendar = z.infer<typeof appointmentCalendarSchema>;

/** Patients checked in and waiting, longest wait first. */
export const receptionQueueSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      patient: z.object({ id: z.string(), name: z.string(), hin: z.string() }),
      /** Why they came in, e.g. "Lab Results". */
      reason: z.string(),
      waitMinutes: count,
    }),
  ),
});
export type ReceptionQueue = z.infer<typeof receptionQueueSchema>;
export type QueueEntry = ReceptionQueue["items"][number];

export const queueEntrySchema = receptionQueueSchema.shape.items.element;

/** Registered patients whose HIN matches the one looked up (one, or none). */
export const patientLookupSchema = z.object({
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
export const patientProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Digits only. */
  hin: z.string(),
  dateOfBirth: z.iso.date(),
  sex,
  avatarUrl: z.url().nullable(),
  coverage: z.enum(Object.keys(coverageLabels) as [Coverage, ...Coverage[]]),
  phone: z.string().nullable(),
  email: z.email().nullable(),
  address: z.string().nullable(),
  /** e.g. "Dr. Sarah Adeyemi"; `null` until one is assigned. */
  assignedDoctor: z.string().nullable(),
  /** e.g. "General Medicine"; `null` until they've visited. */
  lastVisit: z.object({ at: z.iso.datetime(), department: z.string() }).nullable(),
  lastCheckIn: z.object({ at: z.iso.datetime(), status: visitStatus }).nullable(),
  upcomingAppointment: z.object({ at: z.iso.datetime(), department: z.string() }).nullable(),
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
export const appointmentRequestSchema = z.object({
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
export const checkOutSummarySchema = z.object({
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

/** Where the verification code for a new guardian's phone went. */
export const phoneVerificationSentSchema = z.object({ phone: z.string() });

/** A child linked to a guardian: the child (new or existing) and who they're linked to. */
export const dependentLinkedSchema = z.object({
  child: z.object({
    id: z.string(),
    name: z.string(),
    /** Digits only. */
    hin: z.string(),
  }),
  guardian: z.object({ id: z.string(), name: z.string() }),
});
export type DependentLinked = z.infer<typeof dependentLinkedSchema>;

/** Where the verification code for a new patient's email went. */
export const verificationSentSchema = z.object({ email: z.email() });

/** Proof the new patient's email was verified, sent along when registering them. */
export const emailVerifiedSchema = z.object({ verificationToken: z.string() });

/** The patient just registered, and the HIN they'll use from now on. */
export const registeredPatientSchema = z.object({
  id: z.string(),
  /** Digits only. */
  hin: z.string(),
});
export type RegisteredPatient = z.infer<typeof registeredPatientSchema>;
