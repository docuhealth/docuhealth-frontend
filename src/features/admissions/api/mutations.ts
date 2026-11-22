import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { admissionKeys } from "@/features/admissions/api/queries";
import { detailSchema } from "@/features/admissions/api/schemas";

const requestUrl = (id: string, action: "accept" | "reject") =>
  `/api/hospital-ops/admissions/requests/${encodeURIComponent(id)}/${action}`;

/**
 * Admit the patient to the bed the doctor asked for. Refreshes every admission list, since the
 * request moves from Pending to Admitted.
 */
export function useAcceptAdmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      request(detailSchema, { method: "PATCH", url: requestUrl(id, "accept") }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: admissionKeys.all }),
  });
}

/** Turn the request down, saying why; the doctor sees the reason. */
export function useRejectAdmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      request(detailSchema, {
        method: "PATCH",
        url: requestUrl(id, "reject"),
        data: { rejection_reason: reason },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: admissionKeys.all }),
  });
}
