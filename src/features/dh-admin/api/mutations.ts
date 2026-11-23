import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { absoluteUrl } from "@/lib/sections";
import { dhAdminKeys } from "@/features/dh-admin/api/queries";
import {
  anyResponseSchema,
  type PlanInterval,
  type PlanRole,
} from "@/features/dh-admin/api/schemas";

function useAdminChanged() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: dhAdminKeys.all });
}

/**
 * Switch an individual (by HIN, with their dependants) or a hospital (by sqid, with its staff)
 * on or off.
 */
export function useSetUserActive() {
  return useMutation({
    mutationFn: ({
      kind,
      id,
      active,
    }: {
      kind: "patient" | "hospital";
      id: string;
      active: boolean;
    }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: `/api/admin/${kind === "patient" ? "patients" : "hospitals"}/${active ? "activate" : "deactivate"}`,
        data: kind === "patient" ? { hins: [id] } : { facilities: [id] },
      }),
    onSuccess: useAdminChanged(),
  });
}

/** Approve a facility's application; its admin is emailed a link to the hospital login. */
export function useApproveApplication() {
  return useMutation({
    mutationFn: (id: string) =>
      request(anyResponseSchema, {
        method: "POST",
        url: `/api/admin/facility-applications/${encodeURIComponent(id)}/approve`,
        data: { login_url: absoluteUrl("/hospital/login") },
      }),
    onSuccess: useAdminChanged(),
  });
}

export function useRejectApplication() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: `/api/admin/facility-applications/${encodeURIComponent(id)}/reject`,
        data: { rejection_reason: reason },
      }),
    onSuccess: useAdminChanged(),
  });
}

export type PlanWrite = {
  name: string;
  price: number;
  interval: PlanInterval;
  role: PlanRole;
  description: string;
  features: string[];
};

/** Add a subscription plan, or change one (`id`). */
export function useSavePlan() {
  return useMutation({
    mutationFn: ({ id, plan }: { id: string | null; plan: PlanWrite }) =>
      request(anyResponseSchema, {
        method: id ? "PATCH" : "POST",
        url: id ? `/api/payments/plans/${encodeURIComponent(id)}` : "/api/payments/plans",
        data: plan,
      }),
    onSuccess: useAdminChanged(),
  });
}
