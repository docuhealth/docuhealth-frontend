import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { NotAvailableYetError } from "@/lib/not-available";
import { absoluteUrl } from "@/lib/sections";
import type { StaffRole } from "@/lib/staff-profile";
import { hospitalAdminKeys, WARDS_URL } from "@/features/hospital-admin/api/queries";
import {
  anyResponseSchema,
  type FacilityType,
  type StaffMemberChange,
  type SubscriptionPlan,
  subscribeResponseSchema,
  wardSchema,
} from "@/features/hospital-admin/api/schemas";

// The hospital admin's actions on the real API. Those the design has but the API can't do yet
// fail with NotAvailableYetError (TODO(api); see docs/backend-gaps-v2-migration.md, section 7).

/** Take staff off the team, or put them back, in one request. */
function setStatus(ids: string[], status: NonNullable<StaffMemberChange["status"]>) {
  return request(anyResponseSchema, {
    method: "POST",
    url: status === "removed" ? "/api/auth/staff/remove" : "/api/auth/staff/reactivate",
    data: { staff_ids: ids },
  });
}

/**
 * Change a staff member's status or admin access. Refreshes every hospital-admin query, since
 * the change can move the staff list, its counts and the overview. TODO(api): admin access can't
 * be granted or removed yet.
 */
export function useUpdateStaffMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, change }: { id: string; change: StaffMemberChange }) => {
      if (change.isAdmin !== undefined) {
        throw new NotAvailableYetError(
          change.isAdmin ? "Giving admin access" : "Removing admin access",
        );
      }
      if (change.status) await setStatus([id], change.status);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hospitalAdminKeys.all }),
  });
}

export const BANNER_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_BANNER_BYTES = 5 * 1024 * 1024;

/**
 * Upload a new banner photo (`file`), or remove the current one (`null`). The replies are the
 * facility, not the profile, so the profile is fetched again.
 */
export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File | null) => {
      if (!file) {
        return request(anyResponseSchema, {
          method: "POST",
          url: "/api/auth/facility/branding/remove",
          data: { fields: ["bg_image"] },
        });
      }
      const data = new FormData();
      data.append("bg_image", file);
      return request(anyResponseSchema, {
        method: "PATCH",
        url: "/api/auth/facility/branding",
        data,
        // The client defaults to JSON; let the browser set the multipart boundary.
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hospitalAdminKeys.all }),
  });
}

/** The role a new facility's admin gets: one the facility allows. */
const adminRoleOf: Record<FacilityType, StaffRole> = {
  laboratory: "lab_scientist",
  radiology: "radiologist",
  pharmacy: "pharmacist",
};

/**
 * Add a facility and invite the admin who will manage it. TODO(api): the API also requires the
 * facility's name and address, which the design's dialog doesn't ask for, so it refuses until
 * they're optional or the dialog asks.
 */
export function useAddFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      type,
      admin,
    }: {
      type: FacilityType;
      admin: { firstName: string; lastName: string; phone: string; email: string };
    }) =>
      request(anyResponseSchema, {
        method: "POST",
        url: "/api/auth/facility/arms",
        data: {
          facility_type: type,
          admin: {
            email: admin.email,
            profile: {
              firstname: admin.firstName,
              lastname: admin.lastName,
              phone_num: admin.phone,
              role: adminRoleOf[type],
            },
          },
          login_url: absoluteUrl("/login"),
        },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hospitalAdminKeys.all }),
  });
}

/**
 * Add a team member; the API emails them `message` (HTML) with a link to log in. TODO(api): it
 * takes no password and can't make them an admin, so asking for admin access fails before
 * anything is created, and the password typed is not sent.
 */
export function useAddStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (member: {
      firstName: string;
      lastName: string;
      phone: string;
      role: StaffRole;
      isAdmin: boolean;
      email: string;
      password: string;
      message: string;
    }) => {
      if (member.isAdmin) throw new NotAvailableYetError("Adding staff as admins");
      return request(anyResponseSchema, {
        method: "POST",
        url: "/api/auth/staff/create",
        data: {
          email: member.email,
          profile: {
            firstname: member.firstName,
            lastname: member.lastName,
            phone_num: member.phone,
            role: member.role,
          },
          invitation_message: member.message,
          login_url: absoluteUrl("/login"),
        },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hospitalAdminKeys.all }),
  });
}

/**
 * Move several staff on or off the team at once: the Staff Management page's "Remove selected",
 * and its Undo.
 */
export function useSetStaffStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: "on_team" | "removed" }) =>
      setStatus(ids, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hospitalAdminKeys.all }),
  });
}

const wardUrl = (id: string) => `${WARDS_URL}/${encodeURIComponent(id)}`;

/**
 * Create a ward (no `id`) or change one's name and size. The API adds or removes beds to match
 * `totalBeds`, and refuses fewer beds than are taken.
 */
export function useSaveWard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name, totalBeds }: { id?: string; name: string; totalBeds: number }) =>
      request(wardSchema, {
        method: id ? "PATCH" : "POST",
        url: id ? wardUrl(id) : WARDS_URL,
        data: { name, total_beds: totalBeds },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hospitalAdminKeys.all }),
  });
}

/** Delete a ward and its beds; the API refuses while any bed is taken or requested. */
export function useDeleteWard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => request(anyResponseSchema, { method: "DELETE", url: wardUrl(id) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hospitalAdminKeys.all }),
  });
}

/**
 * Start paying for `plan`. The API sends back Paystack's checkout link, where the admin pays;
 * the subscription goes live once Paystack tells the API. TODO(api): the link isn't in the API's
 * schema (v1 relied on it), so without one this just refreshes the plan.
 */
export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plan: SubscriptionPlan) =>
      request(subscribeResponseSchema, {
        method: "POST",
        url: "/api/payments/subscribe",
        data: { plan: plan.code },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hospitalAdminKeys.subscription() }),
  });
}
