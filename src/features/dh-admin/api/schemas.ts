import { z } from "zod";
import { paginated } from "@/lib/api";
import { optionalText, text } from "@/lib/staff-profile";

// DocuHealth's own admin (`dhadmin`), on the real API (docs/api/openapi.json) and staging where
// the schema is silent. TODO(api) marks what's missing; see docs/backend-gaps-v2-migration.md.

export const anyResponseSchema = z.unknown();

const count = z.number().int().nonnegative();
const amount = z.union([z.number(), z.string()]).transform((value) => Number(value) || 0);

// ---------------------------------------------------------------------------------------------
// Overview.

/** A bucket of a trend: "2026-06" (month), "2026" (year) or "2026-06-01" (day). */
export type TrendPoint = { key: string; value: number };

/** `TrendData`; staging names the bucket `month` whatever the period. */
const trendSchema = z
  .array(
    z
      .object({ month: z.string().optional(), date: z.string().optional(), value: amount })
      .transform((point): TrendPoint => ({
        key: point.month ?? point.date ?? "",
        value: point.value,
      }))
      .refine((point) => point.key !== ""),
  )
  .catch([]);
export const trendResponseSchema = trendSchema;

export type AdminOverview = {
  users: number;
  hospitals: number;
  individuals: number;
  subscribed: number;
  /** In naira. */
  revenue: number;
  states: { state: string; value: number }[];
  subAccounts: { label: string; value: number }[];
};

/** "aïndefla", "crossriver" → "Aïndefla", "Crossriver" (TODO(api): states aren't normalized). */
const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const adminOverviewSchema = z
  .object({
    summary: z.object({
      total_users: count.catch(0),
      total_revenue: amount.catch(0),
      total_hospitals: count.catch(0),
      total_individuals: count.catch(0),
      total_subscribed_users: count.catch(0),
    }),
    charts: z
      .object({
        states: z.array(z.object({ state: text, value: amount })).catch([]),
        sub_account_stats: z.array(z.object({ label: text, value: amount })).catch([]),
      })
      .loose(),
  })
  .transform(({ summary, charts }): AdminOverview => ({
    users: summary.total_users,
    hospitals: summary.total_hospitals,
    individuals: summary.total_individuals,
    subscribed: summary.total_subscribed_users,
    revenue: summary.total_revenue,
    states: charts.states.map(({ state, value }) => ({ state: titleCase(state), value })),
    subAccounts: charts.sub_account_stats,
  }));

export const trendPeriodLabels = { daily: "Daily", monthly: "Monthly", yearly: "Yearly" } as const;
export type TrendPeriod = keyof typeof trendPeriodLabels;

// ---------------------------------------------------------------------------------------------
// Users.

export const userKindLabels = { patient: "Individuals", hospital: "Hospitals" } as const;
export type UserKind = keyof typeof userKindLabels;

export type PatientUser = {
  hin: string;
  name: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  active: boolean;
};

export type HospitalUser = {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
  imageUrl: string | null;
  doctors: number;
  otherStaff: number;
  active: boolean;
};

/** "None, None, None, None" and the like (TODO(api): empty address parts come back as "None"). */
const addressOf = (value: string | null) => {
  const parts = (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && part !== "None");
  return parts.length ? parts.join(", ") : null;
};

/** `GET /api/admin/users/patient` (TODO(api): no response schema). */
export const patientUserPageSchema = paginated(
  z
    .object({
      hin: z.string(),
      full_name: text,
      email: optionalText,
      phone_num: optionalText,
      dob: optionalText,
      gender: optionalText,
      is_active: z.boolean().catch(true),
    })
    .transform((user): PatientUser => ({
      hin: user.hin,
      name: user.full_name || user.email || user.hin,
      email: user.email,
      phone: user.phone_num,
      dateOfBirth: user.dob,
      gender: user.gender,
      active: user.is_active,
    })),
);

/** `GET /api/admin/users/hospital` (TODO(api): no response schema). */
export const hospitalUserPageSchema = paginated(
  z
    .object({
      sqid: z.string(),
      name: text,
      email: optionalText,
      address: optionalText,
      // TODO(api): untyped; staging sends `{id, url, path}` or null.
      profile_image: z
        .union([z.string(), z.object({ url: z.string() }).loose()])
        .nullish()
        .catch(null)
        .transform((image) => (typeof image === "string" ? image || null : (image?.url ?? null))),
      doctors: count.catch(0),
      other_personnel: count.catch(0),
      is_active: z.boolean().catch(true),
    })
    .transform((hospital): HospitalUser => ({
      id: hospital.sqid,
      name: hospital.name || hospital.email || "Unnamed hospital",
      email: hospital.email,
      address: addressOf(hospital.address),
      imageUrl: hospital.profile_image,
      doctors: hospital.doctors,
      otherStaff: hospital.other_personnel,
      active: hospital.is_active,
    })),
);

// ---------------------------------------------------------------------------------------------
// Facility applications.

export const applicationStatusLabels = {
  in_review: "In review",
  email_verified: "Email verified",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
} as const;
export type ApplicationStatus = keyof typeof applicationStatusLabels;

export type FacilityApplication = {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  address: string | null;
  documents: { url: string; name: string }[];
  status: ApplicationStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  submittedAt: string;
};

/** `FacilityApplication` (TODO(api): `documents` is untyped; staging sends `{url, filename}`). */
export const applicationPageSchema = paginated(
  z
    .object({
      sqid: z.string(),
      facility_type: text,
      name: text,
      official_email: text,
      phone: optionalText,
      message: optionalText,
      street: optionalText,
      city: optionalText,
      state: optionalText,
      country: optionalText,
      documents: z.array(z.object({ url: z.string(), filename: optionalText }).loose()).catch([]),
      status: z
        .enum(Object.keys(applicationStatusLabels) as [ApplicationStatus, ...ApplicationStatus[]])
        .catch("submitted"),
      reviewed_by: optionalText,
      reviewed_at: optionalText,
      rejection_reason: optionalText,
      created_at: z.iso.datetime({ offset: true }),
    })
    .transform((application): FacilityApplication => ({
      id: application.sqid,
      type: application.facility_type,
      name: application.name,
      email: application.official_email,
      phone: application.phone,
      message: application.message,
      address:
        [application.street, application.city, application.state, application.country]
          .filter(Boolean)
          .join(", ") || null,
      documents: application.documents.map((document, index) => ({
        url: document.url,
        name: document.filename ?? `Document ${index + 1}`,
      })),
      status: application.status,
      reviewedBy: application.reviewed_by,
      reviewedAt: application.reviewed_at,
      rejectionReason: application.rejection_reason,
      submittedAt: application.created_at,
    })),
);

// ---------------------------------------------------------------------------------------------
// Subscription plans.

export const planIntervalLabels = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  biannually: "Every six months",
  annually: "Yearly",
} as const;
export type PlanInterval = keyof typeof planIntervalLabels;

export const planRoleLabels = {
  hospital: "Hospitals",
  patient: "Individuals",
  test: "Test",
} as const;
export type PlanRole = keyof typeof planRoleLabels;

export type Plan = {
  id: string;
  name: string;
  /** In naira. */
  price: number;
  interval: PlanInterval;
  role: PlanRole;
  description: string;
  features: string[];
  /** Paystack's code: set once Paystack has the plan. */
  code: string | null;
};

/** `GET /api/payments/plans/all`: every plan, newest first. */
export const planListSchema = z.array(
  z
    .object({
      sqid: z.string(),
      name: text,
      price: amount,
      interval: z
        .enum(Object.keys(planIntervalLabels) as [PlanInterval, ...PlanInterval[]])
        .catch("monthly"),
      role: z.enum(Object.keys(planRoleLabels) as [PlanRole, ...PlanRole[]]).catch("hospital"),
      description: text,
      features: z.array(z.string()).catch([]),
      paystack_plan_code: optionalText,
    })
    .transform((plan): Plan => ({
      id: plan.sqid,
      name: plan.name,
      price: plan.price,
      interval: plan.interval,
      role: plan.role,
      description: plan.description,
      features: plan.features.filter((feature) => feature.trim()),
      code: plan.paystack_plan_code,
    })),
);
