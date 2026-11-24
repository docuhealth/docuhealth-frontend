import { useMutation, useQueryClient } from "@tanstack/react-query";
import { radiologistKeys, radiologistProfileQuery } from "@/features/radiologist/api/queries";
import {
  anyResponseSchema,
  reporterSpecialtyLabels,
  type ScanOrder,
  scanOrderItemSchema,
} from "@/features/radiologist/api/schemas";
import type {
  BookScanValues,
  ImagingTimeValues,
  RejectOrderValues,
  UploadResultValues,
} from "@/features/radiologist/lib/schemas";
import { request } from "@/lib/api";

const itemUrl = (id: string) => `/api/radiology/orders/items/${encodeURIComponent(id)}`;

/** Show the order as it now stands, and refresh the lists and counts it moved between. */
function useOrderUpdated(orderId: string) {
  const queryClient = useQueryClient();
  return (order: ScanOrder) => {
    queryClient.setQueryData(radiologistKeys.scanOrder(orderId), order);
    return queryClient.invalidateQueries({ queryKey: radiologistKeys.all });
  };
}

/**
 * Book a patient in for a scan with the signed-in radiologist. Refreshes every radiologist
 * query, since it adds to the schedule.
 */
export function useBookScanAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      patientId,
      values: { date, time, note },
    }: {
      /** The patient's HIN. */
      patientId: string;
      values: BookScanValues;
    }) => {
      const profile = await queryClient.ensureQueryData(radiologistProfileQuery());
      return request(anyResponseSchema, {
        method: "POST",
        url: "/api/hospital-ops/appointments/book",
        data: {
          patient: patientId,
          staff: profile.user.id,
          type: "imaging",
          // Hidden in the dialog for now: scan type and body part.
          note: note || null,
          scheduled_time: new Date(`${date}T${time}`).toISOString(),
        },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: radiologistKeys.all }),
  });
}

/** Accept a pending order: it moves to in progress, its imaging time still to be logged. */
export function useAcceptScanOrder(orderId: string) {
  return useMutation({
    mutationFn: () =>
      request(scanOrderItemSchema, { method: "PATCH", url: `${itemUrl(orderId)}/accept` }),
    onSuccess: useOrderUpdated(orderId),
  });
}

/** Turn a pending order down, telling the requesting doctor why. */
export function useRejectScanOrder(orderId: string) {
  return useMutation({
    mutationFn: ({ reason }: RejectOrderValues) =>
      request(scanOrderItemSchema, {
        method: "PATCH",
        url: `${itemUrl(orderId)}/reject`,
        data: { rejection_reason: reason },
      }),
    onSuccess: useOrderUpdated(orderId),
  });
}

/** Log (or change) when an accepted order's images are taken. */
export function useLogImagingTime(orderId: string) {
  return useMutation({
    mutationFn: ({ date, time }: ImagingTimeValues) =>
      request(scanOrderItemSchema, {
        method: "PATCH",
        url: `${itemUrl(orderId)}/collection-time`,
        data: { image_collected_at: new Date(`${date}T${time}`).toISOString() },
      }),
    onSuccess: useOrderUpdated(orderId),
  });
}

/** Lines of a text box, as the API's list fields take them. */
const lines = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

/**
 * Upload a scan's report and files (`POST /api/radiology/results`), completing the order. The
 * reply is the report alone, so the order and the lists it moved between are fetched again.
 */
export function useUploadScanResult(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: UploadResultValues) => {
      const data = new FormData();
      data.append("order_item", orderId);
      data.append("reporter_name", values.reporterName);
      data.append("reporter_specialty", reporterSpecialtyLabels[values.specialty]);
      data.append("reported_at", new Date(`${values.date}T${values.time}`).toISOString());
      data.append("clinical_indication", values.clinicalIndication);
      for (const line of lines(values.findings)) data.append("findings", line);
      for (const line of lines(values.impression)) data.append("impression", line);
      for (const line of lines(values.recommendations)) data.append("recommendation", line);
      if (values.comment) data.append("extra_comment", values.comment);
      for (const file of values.attachments) data.append("attachments", file);

      return request(anyResponseSchema, {
        method: "POST",
        url: "/api/radiology/results",
        data,
        // The client defaults to JSON; let the browser set the multipart boundary.
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: radiologistKeys.all }),
  });
}

/**
 * Record in the audit trail that a scan report was downloaded or printed (the API has one event
 * for both). Fire and forget: a failed entry is only reported to the console, never in the way
 * of the download.
 */
export function useLogReportDownload() {
  return useMutation({
    mutationFn: (resultId: string) =>
      request(anyResponseSchema, {
        method: "POST",
        url: `/api/radiology/audit-logs/${encodeURIComponent(resultId)}/downloads`,
      }),
    onError: (error) => console.warn("Couldn’t log the report download", error),
  });
}
