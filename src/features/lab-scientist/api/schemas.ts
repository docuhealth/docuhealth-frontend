import { z } from "zod";
import { fullName, optionalText, staffProfileSchema, text } from "@/lib/staff-profile";
import type { Period } from "@/lib/period";

// The lab dashboard's models (what the screens use), then the real API's shapes and how they
// become those models. TODO(api) marks what the API doesn't send yet; see
// docs/backend-gaps-v2-migration.md, section 7 (Lab scientist).

/**
 * The signed-in member and their hospital, for the dashboard's shell and greeting, from
 * `GET /api/auth/staff/profile`. TODO(api): there's no endpoint for unread notification and
 * message counts yet, so they're 0; the API has no title (e.g. "Dr.") either.
 */
export const labProfileSchema = staffProfileSchema.transform(({ user, hospital }) => ({
  hospital: { name: hospital.name, bannerUrl: hospital.bannerUrl },
  user: {
    /** Their staff sqid, e.g. to book appointments with themselves. */
    id: user.id,
    title: null as string | null,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatarUrl: null as string | null,
  },
  unreadNotifications: 0,
  unreadMessages: 0,
}));
export type LabProfile = z.infer<typeof labProfileSchema>;

/** Headline numbers; `null` where the API has no figure yet. */
export type LabOverview = {
  /** Every test requested, whatever became of it. */
  totalTests: number;
  /** Requested and not processed yet. */
  pendingTests: number;
  /** TODO(api): no source yet. */
  approvedResults: number | null;
  /** TODO(api): no source yet. */
  returningPatients: number | null;
};

const sexLabels = {
  male: "Male",
  female: "Female",
  prefer_not_to_say: "Prefer not to say",
} as const;
type Sex = keyof typeof sexLabels;
export function sexLabel(sex: Sex) {
  return sex === "prefer_not_to_say" ? null : sexLabels[sex];
}

type Patient = { id: string; name: string; avatarUrl: string | null; hin: string };

/** Tests booked in the period, soonest first. */
export type TestAppointments = {
  items: { id: string; at: string; patient: Patient; testType: string }[];
};

/** Results entered and waiting for approval, newest first. */
export type PendingApprovals = {
  items: {
    /** The order's sqid, for its page. */
    id: string;
    testType: string;
    patient: { id: string; name: string };
    enteredAt: string;
  }[];
};

/** The Test Records tabs: where each order is in its life. */
export const testStageLabels = {
  pending: "Pending Test",
  in_progress: "In-Progress Test",
  completed: "Completed Test",
  rejected: "Rejected Test Order",
} as const;
export type TestStage = keyof typeof testStageLabels;

/**
 * The Test orders tabs: each stage, plus (for the lab's admin, as in v1) the orders with a
 * result waiting for their approval.
 */
export const testTabLabels = { ...testStageLabels, result_approval: "Result Approval" } as const;
export type TestTab = keyof typeof testTabLabels;

/** Why a test in progress is under way: booked as an appointment, or a doctor asked for it. */
export const testProgressLabels = {
  appointment: "Appt",
  doctor_request: "Doctor req",
} as const;

export const testSortLabels = { latest: "Latest", oldest: "Oldest" } as const;
export type TestSort = keyof typeof testSortLabels;

export type TestRecordParams = {
  stage: TestTab;
  search: string;
  sort: TestSort;
  page: number;
  pageSize: number;
  /** Only orders requested in this span; every order when left out. */
  period?: Period;
};

export type TestRecord = {
  id: string;
  patient: Patient & { dateOfBirth: string; sex: Sex };
  /** e.g. "Fasting Blood Glucose, Lipid Profile". */
  testType: string;
  /** The doctor who ordered it. */
  requestedBy: string;
  requestedAt: string;
  stage: TestStage;
  /** The lab has opened it; unopened orders show as "New". */
  seen: boolean;
  /** Set on in-progress orders only. */
  progress: keyof typeof testProgressLabels | null;
};

/** One page of a tab's test orders; `counts` covers every tab whatever the search. */
export type TestRecordList = {
  counts: Record<TestTab, number>;
  total: number;
  items: TestRecord[];
};

/** How a result compares with its reference range. */
export const resultFlagLabels = {
  normal: "Normal",
  low: "Low",
  high: "High",
  critical_low: "Critical low",
  critical_high: "Critical high",
} as const;
export type ResultFlag = keyof typeof resultFlagLabels;

/** One measured value on an order (a test's parameter), and its healthy range. */
export type LabTest = {
  /** The parameter's sqid, which results are sent against. */
  id: string;
  /** The order item (test) it belongs to. */
  itemId: string;
  /** e.g. "Haemoglobin". */
  name: string;
  /** e.g. "718-7". */
  loinc: string;
  /** e.g. "g/dL"; "" for a ratio with no unit. */
  unit: string;
  /** `null` when the test gives its range as text instead (`referenceText`). */
  referenceLow: number | null;
  referenceHigh: number | null;
  referenceText: string | null;
};

/** One test order, with everything its page shows. */
export type TestOrder = {
  id: string;
  stage: TestStage;
  patient: Patient & { dateOfBirth: string; sex: Sex; hmo: boolean };
  /** Every value the order asks for, across its tests. */
  tests: LabTest[];
  /** The order's tests (API items), which each action is sent for. */
  items: { id: string; status: string; name: string }[];
  /** TODO(api): not on the order. */
  pregnancyStatus: string | null;
  requestedBy: string;
  requestedAt: string;
  provider: { name: string; email: string };
  note: string | null;
  /** TODO(api): `accepted_at`. */
  acceptedAt: string | null;
  /** When the sample was taken; `null` until it's logged. */
  sampleCollectedAt: string | null;
  /** `at` is null while the API doesn't say when (TODO(api): `rejected_at`). */
  rejection: { at: string | null; reason: string } | null;
  /** Set once every test has a result. */
  result: {
    /** The results' sqids (one per test), e.g. to log a download of them. */
    ids: string[];
    uploadedAt: string;
    /** Numbers where the value is one, else the text (e.g. "Positive"). */
    values: { loinc: string; value: number | string }[];
    interpretation: string;
    clinicalCorrelation: string;
  } | null;
};

export type FoundPatient = Patient & {
  dateOfBirth: string;
  phone: string | null;
  email: string | null;
};

// ---------------------------------------------------------------------------------------------
// The real API: `GET /api/lab/test-orders`, `GET /api/lab/test-orders/{sqid}`, `GET /api/lab/dashboard`.

const dateTime = z.iso.datetime({ offset: true });

const sexOf = (gender: string | null): Sex =>
  gender === "male" || gender === "female" ? gender : "prefer_not_to_say";

const patientInfo = z.object({
  hin: z.string(),
  firstname: text,
  lastname: text,
  gender: optionalText,
  dob: z.string(),
});

const toPatient = (patient: z.infer<typeof patientInfo>) => ({
  id: patient.hin,
  name: fullName(patient.firstname, patient.lastname) || patient.hin,
  avatarUrl: null,
  hin: patient.hin,
  dateOfBirth: patient.dob,
  sex: sexOf(patient.gender),
});

const parameter = z.object({
  sqid: z.string(),
  name: text,
  unit: text,
  loinc_code: text,
  ref_low: z.number().nullish(),
  ref_high: z.number().nullish(),
  ref_text: optionalText,
});

const item = z.object({
  sqid: z.string(),
  test_info: z.object({
    name: text,
    parameters: z
      .array(parameter)
      .nullish()
      .transform((parameters) => parameters ?? []),
  }),
  status: z.string(),
  specimen_collected_at: dateTime.nullish(),
  rejection_reason: optionalText,
  result_info: z
    .object({
      // TODO(api): `result_info` is untyped in the schema; v1 reads its `sqid` too.
      sqid: z.string().nullish(),
      created_at: dateTime,
      parameters_info: z
        .array(z.object({ parameter_info: parameter.partial(), value: z.unknown() }))
        .nullish(),
      interpretation: optionalText,
      clinical_correlation: optionalText,
      status: optionalText,
    })
    .nullish(),
});
type Item = z.infer<typeof item>;

/** Item statuses that mean the test has a result (awaiting approval or approved). */
const resultedStatuses = new Set([
  "result_ready",
  "result_accepted_by_lab_admin",
  "result_accepted_by_doctor",
]);

/**
 * Where an order stands, from its tests: rejected tests don't count unless all are; it's pending
 * until any test is accepted, completed once every test has a result, else in progress.
 */
function stageOf(items: Item[]): TestStage {
  const live = items.filter((entry) => entry.status !== "rejected");
  if (live.length === 0) return "rejected";
  if (live.every((entry) => entry.status === "pending")) return "pending";
  if (live.every((entry) => resultedStatuses.has(entry.status))) return "completed";
  return "in_progress";
}

/** A result value as a number when it is one, else its text. */
function valueOf(value: unknown): number | string {
  const textValue =
    typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
  const number = Number(textValue);
  return textValue !== "" && Number.isFinite(number) ? number : textValue;
}

/** `LabTestOrder`: one order and its tests, as the order page's model. */
export const labOrderSchema = z
  .object({
    sqid: z.string(),
    ordered_by_info: z.object({ firstname: text, lastname: text }).nullish(),
    hospital_info: z.object({ name: text, email: optionalText }).nullish(),
    patient_info: patientInfo,
    created_at: dateTime,
    note: optionalText,
    items_info: z.array(item),
  })
  .transform((order): TestOrder => {
    const stage = stageOf(order.items_info);
    const live = order.items_info.filter((entry) => entry.status !== "rejected");
    const results = live.flatMap((entry) => (entry.result_info ? [entry.result_info] : []));
    const collected = live
      .map((entry) => entry.specimen_collected_at)
      .filter((at): at is string => !!at)
      .sort()[0];
    const rejected = order.items_info.find((entry) => entry.rejection_reason);
    return {
      id: order.sqid,
      stage,
      patient: { ...toPatient(order.patient_info), hmo: false }, // TODO(api): HMO flag
      tests: live.flatMap((entry) =>
        entry.test_info.parameters.map((parameter) => ({
          id: parameter.sqid,
          itemId: entry.sqid,
          name: parameter.name,
          loinc: parameter.loinc_code,
          unit: parameter.unit,
          referenceLow: parameter.ref_low ?? null,
          referenceHigh: parameter.ref_high ?? null,
          referenceText: parameter.ref_text,
        })),
      ),
      items: order.items_info.map((entry) => ({
        id: entry.sqid,
        status: entry.status,
        name: entry.test_info.name,
      })),
      pregnancyStatus: null,
      requestedBy: order.ordered_by_info
        ? fullName(order.ordered_by_info.firstname, order.ordered_by_info.lastname)
        : "",
      requestedAt: order.created_at,
      provider: {
        name: order.hospital_info?.name ?? "",
        email: order.hospital_info?.email ?? "",
      },
      note: order.note,
      acceptedAt: null,
      sampleCollectedAt: collected ?? null,
      rejection:
        stage === "rejected" && rejected?.rejection_reason
          ? { at: null, reason: rejected.rejection_reason }
          : null,
      result:
        stage === "completed" && results.length > 0
          ? {
              ids: results.flatMap((result) => (result.sqid ? [result.sqid] : [])),
              uploadedAt: results
                .map((result) => result.created_at)
                .sort()
                .at(-1)!,
              values: results.flatMap((result) =>
                (result.parameters_info ?? []).map((entry) => ({
                  loinc: entry.parameter_info.loinc_code ?? "",
                  value: valueOf(entry.value),
                })),
              ),
              interpretation: results
                .map((result) => result.interpretation)
                .filter(Boolean)
                .join("\n"),
              clinicalCorrelation: results
                .map((result) => result.clinical_correlation)
                .filter(Boolean)
                .join("\n"),
            }
          : null,
    };
  });

/** The list row for an order. */
export function toTestRecord(order: TestOrder): TestRecord {
  return {
    id: order.id,
    patient: {
      id: order.patient.id,
      name: order.patient.name,
      avatarUrl: order.patient.avatarUrl,
      hin: order.patient.hin,
      dateOfBirth: order.patient.dateOfBirth,
      sex: order.patient.sex,
    },
    testType: [...new Set(order.items.map((entry) => entry.name))].join(", "),
    requestedBy: order.requestedBy,
    requestedAt: order.requestedAt,
    stage: order.stage,
    seen: true, // TODO(api): no "seen" flag, so nothing shows as "New"
    progress: null, // TODO(api): no source (appointment or doctor request)
  };
}

/** A page of `GET /api/lab/test-orders`, with each order's raw items kept for approvals. */
export const labOrderPageSchema = z.object({
  count: z.number().int().nonnegative(),
  results: z.array(
    z.unknown().transform((raw, context) => {
      const parsed = labOrderSchema.safeParse(raw);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) context.addIssue({ ...issue, code: "custom" });
        return z.NEVER;
      }
      const items = z
        .array(item)
        .catch([])
        .parse((raw as { items_info?: unknown }).items_info);
      return {
        order: parsed.data,
        /** Tests whose result waits for the lab admin's approval. */
        awaitingApproval: items.flatMap((entry) =>
          entry.status === "result_ready" && entry.result_info
            ? [{ name: entry.test_info.name, enteredAt: entry.result_info.created_at }]
            : [],
        ),
      };
    }),
  ),
});

/** `GET /api/lab/dashboard`: item counts. */
export const labDashboardSchema = z
  .object({
    summary: z.object({
      total_items: z.number().int().nonnegative(),
      pending: z.number().int().nonnegative(),
    }),
  })
  .transform(({ summary }): LabOverview => ({
    totalTests: summary.total_items,
    pendingTests: summary.pending,
    approvedResults: null,
    returningPatients: null,
  }));

const sentence = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");

/** `HospitalAppointment`s, as the appointments card shows them. */
export const appointmentPageSchema = z
  .object({
    results: z.array(
      z.object({
        sqid: z.string(),
        scheduled_time: dateTime,
        type: optionalText,
        note: optionalText,
        patient: z.object({ hin: text, firstname: text, lastname: text }),
      }),
    ),
  })
  .transform(({ results }): TestAppointments => ({
    items: results.map((appointment) => ({
      id: appointment.sqid,
      at: appointment.scheduled_time,
      patient: {
        id: appointment.patient.hin,
        name: fullName(appointment.patient.firstname, appointment.patient.lastname),
        avatarUrl: null,
        hin: appointment.patient.hin,
      },
      // TODO(api): appointments carry no test; the note or the type stands in.
      testType: appointment.note ?? (appointment.type ? sentence(appointment.type) : "Lab test"),
    })),
  }));

/** Replies to writes whose body the app doesn't use. */
export const anyResponseSchema = z.unknown();
