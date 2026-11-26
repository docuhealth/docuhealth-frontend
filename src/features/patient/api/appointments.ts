import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { appointmentExtrasQuery } from "@/features/patient/api/pending-appointments";
import { appointmentsQuery } from "@/features/patient/api/queries";
import { paginated, request } from "@/lib/api";
import { NotAvailableYetError } from "@/lib/not-available";
import { optionalText, text } from "@/lib/staff-profile";

// Booking, rescheduling and cancelling on the real API (`/api/hospital-ops/appointments/…`; see
// docs/backend-handoff-2026-11-26-appointments.md). Who the patient can be booked with, free
// times, departments and fees are still TODO(api), in `pending-appointments.ts`.

const APPOINTMENTS_URL = "/api/hospital-ops/appointments";

/** `GET /api/auth/facilities/hospitals`: every hospital on DocuHealth, to book at. */
export const bookingFacilitiesQuery = () =>
  queryOptions({
    queryKey: ["patient", "booking-facilities"] as const,
    queryFn: () =>
      request(paginated(z.object({ sqid: z.string(), name: text })), {
        // TODO(api): reads the first 100 hospitals; there's no search or location to narrow them.
        url: "/api/auth/facilities/hospitals",
        params: { page: 1, size: 100 },
      }),
    select: ({ items }) =>
      items
        .map(({ sqid, name }) => ({ id: sqid, name: name || sqid }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    staleTime: 5 * 60_000,
  });

/** `BookAppointmentRead`: what was booked. It has no sqid or status (a new one is `pending`). */
const bookingSchema = z.object({
  scheduled_time: z.string(),
  type: optionalText,
  note: optionalText,
  hospital: z.string().nullish(),
});

export type BookingRequest = {
  /** The hospital's sqid. */
  facilityId: string;
  /** The sqid of the staff member to see; "" when none could be chosen. */
  staffId: string;
  /** What the visit is for, e.g. "Follow-up" (the API's `type`, at most 20 characters). */
  reason: string;
  note: string;
  /** ISO. */
  at: string;
};

/** The booking, and its id once the patient's appointments have been read again. */
export type Booked = { at: string; facilityId: string; id: string | null };

/** After any change: the patient's appointments and their extras both move. */
function useRefresh() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: appointmentsQuery().queryKey }),
      queryClient.invalidateQueries({ queryKey: appointmentExtrasQuery().queryKey }),
    ]);
}

const sameTime = (a: string, b: string) => new Date(a).getTime() === new Date(b).getTime();

/**
 * Book an appointment (`POST /request`); it starts `pending` until the hospital confirms it. The
 * reply has no sqid, so the patient's appointments are read again to find it. TODO(api): with no
 * list of a hospital's staff for patients, there's no one to choose off the mock server, and
 * booking says it isn't available yet.
 */
export function useBookAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (booking: BookingRequest): Promise<Booked> => {
      if (!booking.staffId) throw new NotAvailableYetError("Choosing who to see");
      const booked = await request(bookingSchema, {
        method: "POST",
        url: `${APPOINTMENTS_URL}/request`,
        data: {
          hospital: booking.facilityId,
          staff: booking.staffId,
          scheduled_time: booking.at,
          type: booking.reason.slice(0, 20) || undefined,
          note: booking.note || undefined,
        },
      });
      const { items } = await queryClient.fetchQuery({ ...appointmentsQuery(), staleTime: 0 });
      const found = items.find(
        (each) =>
          sameTime(each.at, booked.scheduled_time) && each.facilityId === booking.facilityId,
      );
      return { at: booked.scheduled_time, facilityId: booking.facilityId, id: found?.id ?? null };
    },
    onSuccess: useRefresh(),
  });
}

const rescheduledSchema = z.object({
  sqid: z.string(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
  scheduled_time: z.string(),
});

/**
 * Move an appointment to `at` (ISO). A confirmed one goes back to `pending`, for the hospital to
 * confirm the new time. The booking's note is left as it is.
 */
export function useRescheduleAppointment() {
  return useMutation({
    mutationFn: ({ id, at, reason }: { id: string; at: string; reason?: string }) =>
      request(rescheduledSchema, {
        method: "PATCH",
        url: `${APPOINTMENTS_URL}/${encodeURIComponent(id)}/reschedule`,
        data: { scheduled_time: at, reschedule_reason: reason || undefined },
      }),
    onSuccess: useRefresh(),
  });
}

/** Cancel an appointment, with the patient's reason if they gave one. */
export function useCancelAppointment() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string | null }) =>
      request(z.object({ sqid: z.string(), status: z.string() }), {
        method: "POST",
        url: `${APPOINTMENTS_URL}/${encodeURIComponent(id)}/cancel`,
        data: reason ? { cancellation_reason: reason } : {},
      }),
    onSuccess: useRefresh(),
  });
}
