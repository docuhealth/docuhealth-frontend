import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { pharmacyKeys } from "@/features/pharmacy/api/queries";
import { anyResponseSchema } from "@/features/pharmacy/api/schemas";

/**
 * Mark drugs of a prescription dispensed, or unavailable (with an optional reason for the
 * prescriber), in one request. Refreshes every pharmacy query, since the prescription may move
 * from Pending to Settled and the overview's numbers change.
 */
export function useDispenseDrugs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      drugIds,
      outcome,
      reason = "",
    }: {
      drugIds: string[];
      outcome: "dispensed" | "unavailable";
      reason?: string;
    }) =>
      request(anyResponseSchema, {
        method: "PATCH",
        url: "/api/pharmacy/orders/dispense",
        data: {
          order_items: drugIds.map((id) => ({
            order_item: id,
            status: outcome,
            reason: outcome === "unavailable" ? reason || "Unavailable" : "",
          })),
        },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pharmacyKeys.all }),
  });
}
