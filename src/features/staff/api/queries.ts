import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import {
  type AppointmentTimeframe,
  appointmentListSchema,
  staffDirectorySchema,
} from "@/features/staff/api/schemas";
import { request } from "@/lib/api";
import { type StaffRole, staffProfileSchema } from "@/lib/staff-profile";

// Pages every staff dashboard shares (settings, health personnel, appointments), on the real API.

export const staffKeys = {
  all: ["staff"] as const,
  profile: () => [...staffKeys.all, "profile"] as const,
  directory: (params: StaffDirectoryParams) => [...staffKeys.all, "directory", params] as const,
  appointments: (params: AppointmentParams) => [...staffKeys.all, "appointments", params] as const,
};

export const staffProfileQuery = () =>
  queryOptions({
    queryKey: staffKeys.profile(),
    queryFn: () => request(staffProfileSchema, { url: "/api/auth/staff/profile" }),
  });

export const STAFF_DIRECTORY_PAGE_SIZE = 10;

export type StaffDirectoryParams = { page: number; search: string; role: StaffRole | "all" };

/** The signed-in member's facility's staff. `search` and `role` aren't in the schema yet but work. */
export const staffDirectoryQuery = ({ page, search, role }: StaffDirectoryParams) =>
  queryOptions({
    queryKey: staffKeys.directory({ page, search, role }),
    queryFn: () =>
      request(staffDirectorySchema, {
        url: "/api/auth/staff",
        params: {
          page,
          size: STAFF_DIRECTORY_PAGE_SIZE,
          search: search || undefined,
          role: role === "all" ? undefined : role,
        },
      }),
    placeholderData: keepPreviousData,
  });

export const APPOINTMENTS_PAGE_SIZE = 8;

export type AppointmentParams = {
  /** "mine": the signed-in member's own; "hospital": every appointment (the hospital admin). */
  scope: "mine" | "hospital";
  timeframe: AppointmentTimeframe;
  page: number;
  search: string;
  /** Inclusive "YYYY-MM-DD" bounds on the scheduled day, or "" for none. */
  from: string;
  to: string;
};

export const appointmentListQuery = (params: AppointmentParams) =>
  queryOptions({
    queryKey: staffKeys.appointments(params),
    queryFn: () =>
      request(appointmentListSchema, {
        url:
          params.scope === "mine"
            ? "/api/hospital-ops/appointments/staff"
            : "/api/hospital-ops/appointments",
        params: {
          timeframe: params.timeframe,
          page: params.page,
          size: APPOINTMENTS_PAGE_SIZE,
          search: params.search || undefined,
          scheduled_time_gte: params.from
            ? new Date(`${params.from}T00:00`).toISOString()
            : undefined,
          scheduled_time_lte: params.to
            ? new Date(`${params.to}T23:59:59`).toISOString()
            : undefined,
        },
      }),
    placeholderData: keepPreviousData,
  });
