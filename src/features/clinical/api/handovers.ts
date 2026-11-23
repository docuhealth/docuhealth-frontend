import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { request } from "@/lib/api";
import { keepPreviousPage } from "@/lib/keep-previous-page";
import { personSchema } from "@/lib/clinical";
import { fullName, optionalText, staffMemberSchema, text } from "@/lib/staff-profile";
import { clinicalKeys } from "@/features/clinical/api/queries";

// Handing a patient over to a colleague at the end of a shift: doctor to doctor, nurse to nurse.

export type HandoverRole = "doctor" | "nurse";

/** A handover's fields, in the order the form asks them. */
export const handoverFields = {
  doctor: [
    ["working_diagnosis", "Working diagnosis", true],
    ["current_clinical_status", "Current clinical status", true],
    ["critical_events", "Critical events", false],
    ["outstanding_investigations", "Outstanding investigations", false],
    ["pending_procedures", "Pending procedures", false],
    ["pending_consult_reviews", "Pending consult reviews", false],
    ["clinical_concerns", "Clinical concerns", false],
    ["management_plan", "Management plan", false],
  ],
  nurse: [
    ["general_patient_condition", "General condition", true],
    ["significant_events", "Significant events", true],
    ["medications_due", "Medications due", true],
    ["outstanding_nursing_tasks", "Outstanding nursing tasks", true],
    ["pending_investigations", "Pending investigations", true],
    ["escalations", "Escalations", true],
    ["recommendations", "Recommendations", true],
  ],
} as const satisfies Record<HandoverRole, readonly (readonly [string, string, boolean])[]>;

export type Handover = {
  id: string;
  patientName: string;
  hin: string;
  from: string | null;
  fromId: string | null;
  to: string | null;
  /** TODO(api): nurse handovers don't say when they were written. */
  at: string | null;
  sections: { label: string; text: string }[];
};

export type HandoverPage = { total: number; items: Handover[] };

const staffInfo = z.object({ sqid: z.string() }).loose().nullish().catch(null);
const patientInfo = z.object({ hin: z.string(), firstname: text, lastname: text });

const handoverRow = (role: HandoverRole) =>
  z
    .object({
      sqid: z.string(),
      created_at: z.iso.datetime({ offset: true }).nullish(),
      patient_info: patientInfo,
      from_doctor_info: staffInfo,
      from_nurse_info: staffInfo,
      to_doctor_info: staffInfo,
      to_nurse_info: staffInfo,
      ...Object.fromEntries(handoverFields[role].map(([key]) => [key, optionalText])),
    })
    .transform((row): Handover => {
      const fields = row as unknown as Record<string, string | null>;
      const from = row.from_doctor_info ?? row.from_nurse_info;
      const to = row.to_doctor_info ?? row.to_nurse_info;
      return {
        id: row.sqid,
        patientName: fullName(row.patient_info.firstname, row.patient_info.lastname),
        hin: row.patient_info.hin,
        from: personSchema.catch(null).parse(from),
        fromId: from?.sqid ?? null,
        to: personSchema.catch(null).parse(to),
        at: row.created_at ?? null,
        sections: handoverFields[role].flatMap(([key, label]) =>
          fields[key] ? [{ label, text: fields[key] }] : [],
        ),
      };
    });

const handoverPage = (role: HandoverRole) =>
  z.object({ count: z.number().int().nonnegative(), results: z.array(handoverRow(role)) });

export const HANDOVERS_PAGE_SIZE = 10;

/**
 * A page of handovers. A nurse's come as received or sent; a doctor's come together (TODO(api):
 * they can't be filtered), so "received" and "sent" are told apart on the page.
 */
export const handoversQuery = (
  role: HandoverRole,
  direction: "received" | "sent",
  page: number,
) => {
  const queryKey = [
    ...clinicalKeys.all,
    "handovers",
    role,
    role === "nurse" ? direction : "all",
    page,
  ] as const;
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<HandoverPage> => {
      const { count, results } = await request(handoverPage(role), {
        url:
          role === "nurse"
            ? `/api/hospital-ops/handovers/nurse/${direction}`
            : "/api/hospital-ops/handovers/doctor",
        params: { page, size: HANDOVERS_PAGE_SIZE },
      });
      return { total: count, items: results };
    },
    placeholderData: keepPreviousPage(queryKey),
  });
};

const colleaguesSchema = z.object({ results: z.array(staffMemberSchema) });

/** The hospital's active doctors or nurses, to hand over to. */
export const colleaguesQuery = (role: HandoverRole) =>
  queryOptions({
    queryKey: [...clinicalKeys.all, "colleagues", role] as const,
    queryFn: async () => {
      const { results } = await request(colleaguesSchema, {
        url: "/api/auth/staff",
        params: { role, size: 100 },
      });
      return results
        .filter(({ active }) => active)
        .map(({ id, name }) => ({ id, name: role === "doctor" ? `Dr. ${name}` : name }));
    },
  });

export function useHandOver(role: HandoverRole) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      to,
      hin,
      fields,
    }: {
      to: string;
      hin: string;
      fields: Record<string, string>;
    }) =>
      request(z.unknown(), {
        method: "POST",
        url: `/api/hospital-ops/handovers/${role}`,
        data: {
          [role === "doctor" ? "to_doctor_id" : "to_nurse_id"]: to,
          patient_hin: hin,
          ...Object.fromEntries(
            handoverFields[role].map(([key, , required]) => {
              const value = fields[key]?.trim() ?? "";
              return [key, value || (required ? "" : null)];
            }),
          ),
        },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...clinicalKeys.all, "handovers", role] }),
  });
}
