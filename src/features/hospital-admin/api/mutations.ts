import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { hospitalAdminKeys } from "@/features/hospital-admin/api/queries";
import {
  type FacilityType,
  facilitySchema,
  hospitalProfileSchema,
  type StaffMember,
  type StaffMemberChange,
  staffMemberSchema,
} from "@/features/hospital-admin/api/schemas";

/**
 * Change a staff member's status or admin access. Refreshes every hospital-admin query, since
 * the change can move the staff list, its counts and the overview's administrator total.
 */
export function useUpdateStaffMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, change }: { id: string; change: StaffMemberChange }) =>
      request(staffMemberSchema, { method: "PATCH", url: `/hospital/staff/${id}`, data: change }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hospitalAdminKeys.all }),
  });
}

export const BANNER_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_BANNER_BYTES = 5 * 1024 * 1024;

/** Upload a new banner photo (`file`), or remove the current one (`null`). */
export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File | null) => {
      if (!file) {
        return request(hospitalProfileSchema, { method: "DELETE", url: "/hospital/banner" });
      }
      const data = new FormData();
      data.append("file", file);
      return request(hospitalProfileSchema, {
        method: "PUT",
        url: "/hospital/banner",
        data,
        // The client defaults to JSON; let the browser set the multipart boundary.
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hospitalAdminKeys.all }),
  });
}

/** Add a facility and invite the admin who will manage it. */
export function useAddFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (facility: {
      type: FacilityType;
      admin: { firstName: string; lastName: string; phone: string; email: string };
    }) => request(facilitySchema, { method: "POST", url: "/hospital/facilities", data: facility }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hospitalAdminKeys.all }),
  });
}

/** Add a team member; they're emailed `message` (HTML) with their login details. */
export function useAddStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (member: {
      firstName: string;
      lastName: string;
      phone: string;
      role: StaffMember["role"];
      isAdmin: boolean;
      email: string;
      password: string;
      message: string;
    }) => request(staffMemberSchema, { method: "POST", url: "/hospital/staff", data: member }),
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
    // TODO(api): one bulk request once the v2 hospital API has one.
    mutationFn: ({ ids, status }: { ids: string[]; status: StaffMember["status"] }) =>
      Promise.all(
        ids.map((id) =>
          request(staffMemberSchema, {
            method: "PATCH",
            url: `/hospital/staff/${id}`,
            data: { status } satisfies StaffMemberChange,
          }),
        ),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hospitalAdminKeys.all }),
  });
}
