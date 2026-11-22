import { z } from "zod";
import { fullName, optionalText, staffRoleLabels, text } from "@/lib/staff-profile";

// `GET /api/audits/audit-logs?type=laboratory|radiology`: who downloaded which lab result or scan
// report, and when. The record's state is untyped in the API, so only fields it's known to carry
// are read, and anything else is left out.

export const auditTypeLabels = { laboratory: "Laboratory", radiology: "Radiology" } as const;
export type AuditType = keyof typeof auditTypeLabels;

export type AuditLog = {
  id: string;
  at: string;
  /** e.g. "Test Result Downloaded". */
  action: string;
  staff: { name: string; role: string | null } | null;
  patient: { name: string; hin: string } | null;
  /** What was downloaded: the tests' names, or the scan's clinical indication. */
  record: string;
  /** The record's details, as label and value, in the order they're best read. */
  details: { label: string; value: string }[];
  /** Each result value, for a lab result. */
  values: { name: string; value: string; unit: string | null }[];
};

export type AuditLogList = { total: number; items: AuditLog[] };

const count = z.number().int().nonnegative();

const sentence = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replaceAll("_", " ");

/** The bits of a lab result or scan report the log's `after_state` is known to carry. */
const recordState = z
  .object({
    status: optionalText,
    interpretation: optionalText,
    clinical_correlation: optionalText,
    comments: optionalText,
    clinical_indication: optionalText,
    findings: optionalText,
    impression: optionalText,
    recommendation: optionalText,
    parameters_info: z
      .array(
        z.object({
          value: z.union([z.string(), z.number()]).nullish(),
          parameter_info: z.object({ name: text, unit: optionalText }).nullish(),
        }),
      )
      .catch([]),
  })
  .partial()
  .catch({});

const detailLabels = [
  ["status", "Status"],
  ["interpretation", "Interpretation"],
  ["clinical_correlation", "Clinical correlation"],
  ["comments", "Comments"],
  ["clinical_indication", "Clinical indication"],
  ["findings", "Findings"],
  ["impression", "Impression"],
  ["recommendation", "Recommendation"],
] as const;

const auditLogRead = z
  .object({
    sqid: z.string(),
    created_at: z.iso.datetime({ offset: true }),
    action: optionalText,
    action_display: optionalText,
    type: optionalText,
    staff_info: z.object({ firstname: text, lastname: text, role: optionalText }).nullish(),
    patient_info: z.object({ hin: text, firstname: text, lastname: text }).nullish(),
    after_state: z.unknown(),
  })
  .transform((log): AuditLog => {
    const state = recordState.parse(log.after_state ?? {});
    const values = (state.parameters_info ?? []).flatMap(({ value, parameter_info }) =>
      parameter_info?.name
        ? [
            {
              name: parameter_info.name,
              value: value == null ? "—" : String(value),
              unit: parameter_info.unit,
            },
          ]
        : [],
    );
    const role = log.staff_info?.role;
    return {
      id: log.sqid,
      at: log.created_at,
      action: log.action_display ?? (log.action ? sentence(log.action) : "Download"),
      staff: log.staff_info
        ? {
            name: fullName(log.staff_info.firstname, log.staff_info.lastname) || "Unknown staff",
            role: role
              ? (staffRoleLabels[role as keyof typeof staffRoleLabels] ?? sentence(role))
              : null,
          }
        : null,
      patient: log.patient_info
        ? {
            name:
              fullName(log.patient_info.firstname, log.patient_info.lastname) ||
              log.patient_info.hin,
            hin: log.patient_info.hin,
          }
        : null,
      record:
        log.type === "radiology"
          ? (state.clinical_indication ?? "Scan report")
          : values.map(({ name }) => name).join(", ") || "Lab test result",
      details: detailLabels.flatMap(([key, label]) => {
        const value = state[key];
        return value ? [{ label, value: key === "status" ? sentence(value) : value }] : [];
      }),
      values,
    };
  });

export const auditLogPageSchema = z.object({
  count: count,
  results: z.array(auditLogRead),
});
