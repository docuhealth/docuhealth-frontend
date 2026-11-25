import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { env } from "@/env";
import { request } from "@/lib/api";
import { NotAvailableYetError } from "@/lib/not-available";

// TODO(api): the appointment pieces the patient screens are designed for but the API doesn't
// give patients yet. `GET /api/hospital-ops/appointments/mine` lists their appointments, but
// patients can't book, cancel, reschedule or confirm one (`POST /api/hospital-ops/appointments/
// book` is the front desk's), there are no free slots, departments, fees or reminders, and an
// appointment has no clinician role or photo, facility address, photo or clinic, or cancellation
// details. (`GET /api/auth/facilities/hospitals` lists hospitals, but without departments or
// slots, so the booking form's facilities come from here too until booking lands.)
// On the mock dev server (`npm run dev`) all of this comes from src/mocks/patient-appointments.ts
// and the actions work there; on staging and live the extras are empty and the actions fail
// with "… isn't available yet". When the endpoints land, point these at the real paths.

const PENDING = "/api/pending/patient/appointments";

const mocked = () => import.meta.env.DEV && env.VITE_ENABLE_MOCKS;

/** The mock server's demo data in dev; `empty` everywhere else. */
function pendingRequest<T extends z.ZodType>(schema: T, path: string, empty: z.output<T>) {
  if (!mocked()) return Promise.resolve(empty);
  return request(schema, { url: `${PENDING}${path}` });
}

/** An action on the mock server in dev; everywhere else it fails, saying `what` can't be done yet. */
function pendingAction<T extends z.ZodType>(schema: T, what: string, path: string, data: unknown) {
  if (!mocked()) return Promise.reject(new NotAvailableYetError(what));
  return request(schema, { method: "POST", url: `${PENDING}${path}`, data });
}

const appointmentKeys = {
  all: ["patient", "pending", "appointments"] as const,
  of: (what: string) => [...appointmentKeys.all, what] as const,
  slots: (facilityId: string, day: string) =>
    [...appointmentKeys.all, "slots", facilityId, day] as const,
};

const statusSchema = z.enum(["pending", "confirmed", "cancelled", "completed"]);

/** An appointment the patient booked here, in the shape `appointmentsQuery` gives. */
const bookedAppointmentSchema = z.object({
  id: z.string(),
  status: statusSchema.nullable(),
  at: z.string(),
  type: z.string().nullable(),
  clinician: z.object({ name: z.string(), specialty: z.string().nullable() }).nullable(),
  facility: z.string().nullable(),
});

const reminderSchema = z.object({
  /** "1 day before". */
  before: z.string(),
  /** "Push and SMS". */
  channels: z.string(),
});
export type Reminder = z.output<typeof reminderSchema>;

/** What an appointment's screens show beyond the API's appointment, keyed by its id. */
const appointmentDetailSchema = z.object({
  appointmentId: z.string(),
  /** The patient's own change (cancelled, confirmed), until the API reports it. */
  status: statusSchema.nullable(),
  /** A new time after rescheduling, until the API reports it. */
  at: z.string().nullable(),
  department: z.string().nullable(),
  /** What the visit is for, e.g. "Eye check". */
  reason: z.string().nullable(),
  /** "Consultant Physician". */
  clinicianRole: z.string().nullable(),
  clinicianPhoto: z.string().nullable(),
  /** The town, e.g. "Ikeja": "ABC Hospital, Ikeja". */
  facilityArea: z.string().nullable(),
  facilityAddress: z.string().nullable(),
  facilityPhoto: z.string().nullable(),
  /** "Clinic 3". */
  clinic: z.string().nullable(),
  minutes: z.number().nullable(),
  /** Naira. */
  fee: z.number().nullable(),
  reminders: z.array(reminderSchema),
  cancellation: z
    .object({
      at: z.string(),
      reason: z.string().nullable(),
      /** Naira charged for cancelling; 0 for none. */
      fee: z.number().nullable(),
      /** Where the confirmation went, e.g. "•••• 4821". */
      sentTo: z.string().nullable(),
    })
    .nullable(),
});
export type AppointmentDetail = z.output<typeof appointmentDetailSchema>;

const appointmentExtrasSchema = z.object({
  bookings: z.array(bookedAppointmentSchema),
  details: z.array(appointmentDetailSchema),
});
export type AppointmentExtras = z.output<typeof appointmentExtrasSchema>;

/** Appointments booked here and every appointment's extra details. */
export const appointmentExtrasQuery = () =>
  queryOptions({
    queryKey: appointmentKeys.of("extras"),
    queryFn: () => pendingRequest(appointmentExtrasSchema, "", { bookings: [], details: [] }),
  });

const bookingOptionsSchema = z.object({
  facilities: z.array(z.object({ id: z.string(), name: z.string(), area: z.string().nullable() })),
  departments: z.array(z.string()),
  reasons: z.array(z.string()),
});

/** Where, which department and what for: the booking form's choices. */
export const bookingOptionsQuery = () =>
  queryOptions({
    queryKey: appointmentKeys.of("options"),
    queryFn: () =>
      pendingRequest(bookingOptionsSchema, "/options", {
        facilities: [],
        departments: [],
        reasons: [],
      }),
    staleTime: 5 * 60_000,
  });

/** The free times ("HH:MM") at a facility on a day ("YYYY-MM-DD"). */
export const slotsQuery = (facilityId: string, day: string) =>
  queryOptions({
    queryKey: appointmentKeys.slots(facilityId, day),
    queryFn: () =>
      pendingRequest(
        z.array(z.string()),
        `/slots?facility=${encodeURIComponent(facilityId)}&day=${day}`,
        [],
      ),
    enabled: !!facilityId,
  });

const bookedSchema = z.object({
  appointment: bookedAppointmentSchema,
  detail: appointmentDetailSchema,
});
export type Booked = z.output<typeof bookedSchema>;

export type BookingRequest = {
  facilityId: string;
  department: string;
  reason: string;
  note: string;
  /** ISO. */
  at: string;
};

/** After any change: the API's list and the extras both move. */
function useRefresh() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["patient", "appointments"] }),
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all }),
    ]);
}

/** Book an appointment. A 409 `slot_taken` means someone took that time first. */
export function useBookAppointment() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (booking: BookingRequest) => pendingAction(bookedSchema, "Booking", "", booking),
    onSuccess: refresh,
  });
}

/** Move an appointment to a new time. A 409 `slot_taken` means someone took it first. */
export function useRescheduleAppointment() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, at }: { id: string; at: string }) =>
      pendingAction(bookedSchema, "Rescheduling", `/${encodeURIComponent(id)}/reschedule`, {
        at,
      }),
    onSuccess: refresh,
  });
}

/** Cancel an appointment, with the patient's reason if they gave one. */
export function useCancelAppointment() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string | null }) =>
      pendingAction(appointmentDetailSchema, "Cancelling", `/${encodeURIComponent(id)}/cancel`, {
        reason,
      }),
    onSuccess: refresh,
  });
}

/** Tell the facility the patient will come to a pending appointment. */
export function useConfirmAttendance() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: string) =>
      pendingAction(
        appointmentDetailSchema,
        "Confirming attendance",
        `/${encodeURIComponent(id)}/confirm`,
        {},
      ),
    onSuccess: refresh,
  });
}
