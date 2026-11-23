import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { request } from "@/lib/api";
import { personSchema } from "@/lib/clinical";
import { fullName, optionalText, text } from "@/lib/staff-profile";
import { doctorKeys } from "@/features/doctor/api/queries";
import { anyResponseSchema, labResultSchema } from "@/features/doctor/api/schemas";

// Results the doctor reviews before they count: lab results the lab admin has approved, and
// scan reports the radiologist has written. TODO(api) marks what's missing.

export type LabReview = {
  /** The test order item's sqid, which approve and reject take. */
  id: string;
  test: string;
  collectedAt: string | null;
  values: { name: string; value: string }[];
  interpretation: string | null;
};

export type ScanReview = {
  /** The pending result's sqid, which accept and reject take. */
  id: string;
  scan: string;
  patient: { name: string; hin: string };
  orderedBy: string | null;
  orderedAt: string | null;
  reportedAt: string | null;
  reporter: string | null;
  sections: { label: string; text: string }[];
};

export type ReviewPage<T> = { total: number; items: T[] };

const count = z.number().int().nonnegative();
const dateTime = z.iso.datetime({ offset: true });
const lines = z
  .union([z.string(), z.array(z.unknown())])
  .nullish()
  .transform((value) =>
    Array.isArray(value)
      ? value.filter((line): line is string => typeof line === "string" && !!line.trim()).join("\n")
      : (value ?? "").trim(),
  );

/** `LabTestOrderItemRead`, approved by the lab admin. TODO(api): rows don't say the patient. */
const labReviewPageSchema = z.object({
  count,
  results: z.array(
    z
      .object({
        sqid: z.string(),
        test_info: z.object({ name: text }),
        specimen_collected_at: dateTime.nullish().catch(null),
        result_info: labResultSchema,
      })
      .transform((item): LabReview => ({
        id: item.sqid,
        test: item.test_info.name,
        collectedAt: item.specimen_collected_at ?? null,
        ...item.result_info,
      })),
  ),
});

/** `ScanOrderItemWithPendingResult`. */
const scanReviewPageSchema = z.object({
  count,
  results: z.array(
    z
      .object({
        scan_info: z.object({ name: text }),
        order_info: z.object({
          patient_info: z.object({ hin: z.string(), firstname: text, lastname: text }),
          ordered_by_info: personSchema,
          created_at: dateTime.nullish().catch(null),
        }),
        pending_result: z.object({
          sqid: z.string(),
          clinical_indication: optionalText,
          findings: lines,
          impression: lines,
          recommendation: lines,
          extra_comment: optionalText,
          reporter_name: optionalText,
          reporter_specialty: optionalText,
          reported_at: dateTime.nullish().catch(null),
        }),
      })
      .transform(({ scan_info, order_info, pending_result: result }): ScanReview => ({
        id: result.sqid,
        scan: scan_info.name,
        patient: {
          name: fullName(order_info.patient_info.firstname, order_info.patient_info.lastname),
          hin: order_info.patient_info.hin,
        },
        orderedBy: order_info.ordered_by_info,
        orderedAt: order_info.created_at ?? null,
        reportedAt: result.reported_at ?? null,
        reporter:
          [result.reporter_name, result.reporter_specialty].filter(Boolean).join(", ") || null,
        sections: (
          [
            ["Clinical indication", result.clinical_indication],
            ["Findings", result.findings],
            ["Impression", result.impression],
            ["Recommendation", result.recommendation],
            ["Comment", result.extra_comment],
          ] as const
        ).flatMap(([label, value]) => (value ? [{ label, text: value }] : [])),
      })),
  ),
});

export const REVIEW_PAGE_SIZE = 10;

const reviewKeys = {
  all: [...doctorKeys.all, "review"] as const,
  lab: (page: number) => [...reviewKeys.all, "lab", page] as const,
  scans: (page: number) => [...reviewKeys.all, "scans", page] as const,
};

/** Lab results the lab admin has approved, waiting for the doctor. */
export const labReviewQuery = (page: number) =>
  queryOptions({
    queryKey: reviewKeys.lab(page),
    queryFn: async (): Promise<ReviewPage<LabReview>> => {
      const { count: total, results } = await request(labReviewPageSchema, {
        url: "/api/lab/doctor-test-order-items",
        params: { status: "result_accepted_by_lab_admin", page, size: REVIEW_PAGE_SIZE },
      });
      return { total, items: results };
    },
    placeholderData: keepPreviousData,
  });

/** Scan reports waiting for the doctor. */
export const scanReviewQuery = (page: number) =>
  queryOptions({
    queryKey: reviewKeys.scans(page),
    queryFn: async (): Promise<ReviewPage<ScanReview>> => {
      const { count: total, results } = await request(scanReviewPageSchema, {
        url: "/api/radiology/results/pending",
        params: { page, size: REVIEW_PAGE_SIZE },
      });
      return { total, items: results };
    },
    placeholderData: keepPreviousData,
  });

export type ReviewDecision = { approve: true } | { approve: false; reason: string };

/** Approve or reject a result: a lab test (`kind` "lab", by its item) or a scan report. */
export function useReviewResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      kind,
      id,
      decision,
    }: {
      kind: "lab" | "scan";
      id: string;
      decision: ReviewDecision;
    }) => {
      const sqid = encodeURIComponent(id);
      const url =
        kind === "lab"
          ? `/api/lab/test-orders/items/${sqid}/result/${decision.approve ? "approve" : "reject"}-by-doctor`
          : `/api/radiology/results/${sqid}/${decision.approve ? "accept" : "reject"}`;
      return request(anyResponseSchema, {
        method: "PATCH",
        url,
        data: decision.approve ? {} : { rejection_reason: decision.reason },
      });
    },
    // The review lists and the patient's lab results both change.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: doctorKeys.all }),
  });
}
