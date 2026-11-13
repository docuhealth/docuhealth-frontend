import { useMutation, useQueryClient } from "@tanstack/react-query";
import { radiologistKeys } from "@/features/radiologist/api/queries";
import { type ScanOrder, scanOrderSchema } from "@/features/radiologist/api/schemas";
import type {
  ImagingTimeValues,
  RejectOrderValues,
  UploadResultValues,
} from "@/features/radiologist/lib/schemas";
import { request } from "@/lib/api";

/** Show the order as it now stands, and refresh the lists and counts it moved between. */
function useOrderUpdated(orderId: string) {
  const queryClient = useQueryClient();
  return (order: ScanOrder) => {
    queryClient.setQueryData(radiologistKeys.scanOrder(orderId), order);
    return queryClient.invalidateQueries({ queryKey: radiologistKeys.all });
  };
}

/** Accept a pending order: it moves to in progress, its imaging time still to be logged. */
export function useAcceptScanOrder(orderId: string) {
  return useMutation({
    mutationFn: () =>
      request(scanOrderSchema, {
        method: "POST",
        url: `/hospital/radiology/scan-orders/${encodeURIComponent(orderId)}/accept`,
      }),
    onSuccess: useOrderUpdated(orderId),
  });
}

/** Turn a pending order down, telling the requesting doctor why. */
export function useRejectScanOrder(orderId: string) {
  return useMutation({
    mutationFn: (values: RejectOrderValues) =>
      request(scanOrderSchema, {
        method: "POST",
        url: `/hospital/radiology/scan-orders/${encodeURIComponent(orderId)}/reject`,
        data: values,
      }),
    onSuccess: useOrderUpdated(orderId),
  });
}

/** Log (or change) when an accepted order's imaging takes place. */
export function useLogImagingTime(orderId: string) {
  return useMutation({
    mutationFn: ({ date, time }: ImagingTimeValues) =>
      request(scanOrderSchema, {
        method: "PUT",
        url: `/hospital/radiology/scan-orders/${encodeURIComponent(orderId)}/imaging-time`,
        data: { scheduledAt: new Date(`${date}T${time}`).toISOString() },
      }),
    onSuccess: useOrderUpdated(orderId),
  });
}

/**
 * Upload a scan's report and files, completing the order. Shows the completed order straight
 * away and refreshes the lists and counts it moved between.
 */
export function useUploadScanResult(orderId: string) {
  return useMutation({
    mutationFn: ({ attachments, date, time, ...report }: UploadResultValues) => {
      const data = new FormData();
      for (const [key, value] of Object.entries(report)) data.append(key, value);
      data.append("reportedAt", new Date(`${date}T${time}`).toISOString());
      for (const file of attachments) data.append("attachments", file);

      return request(scanOrderSchema, {
        method: "POST",
        url: `/hospital/radiology/scan-orders/${encodeURIComponent(orderId)}/result`,
        data,
        // The client defaults to JSON; let the browser set the multipart boundary.
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: useOrderUpdated(orderId),
  });
}
