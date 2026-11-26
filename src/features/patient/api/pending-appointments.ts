import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { env } from "@/env";
import { request } from "@/lib/api";
import { NotAvailableYetError } from "@/lib/not-available";

// TODO(api): the appointment pieces the patient screens are designed for but the API doesn't
// give patients yet. Booking, rescheduling and cancelling are real (`appointments.ts`), but there
// is no list of a hospital's staff a patient can read (so no one to book with), no free slots,
// departments, visit reasons, fees or reminders, no way for a patient to confirm they'll come
// (confirming is the front desk's), and an appointment has no clinician role or photo, facility
// address, photo or clinic, or cancellation time, fee or receipt.
// On the mock dev server (`npm run dev`) all of this comes from src/mocks/patient-appointments.ts
// and the actions work there; on staging and live the extras are empty, free times are office
// hours, and confirming fails with "… isn't available yet". When the endpoints land, point these
// at the real paths.

const PENDING = "/api/pending/patient/appointments";

const mocked = () => import.meta.env.DEV && env.VITE_ENABLE_MOCKS;

/** The mock server's demo data in dev; `empty` everywhere else. */
function pendingRequest<T extends z.ZodType>(schema: T, path: string, empty: z.output<T>) {
  if (!mocked()) return Promise.resolve(empty);
  return request(schema, { url: `${PENDING}${path}` });
}

const appointmentKeys = {
  all: ["patient", "pending", "appointments"] as const,
  of: (what: string) => [...appointmentKeys.all, what] as const,
  staff: (facilityId: string) => [...appointmentKeys.all, "staff", facilityId] as const,
  slots: (facilityId: string, day: string) =>
    [...appointmentKeys.all, "slots", facilityId, day] as const,
};

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
  /** The API has the reason (`cancellation_reason`); not when, the fee or the receipt. */
  cancellation: z
    .object({
      at: z.string(),
      /** Naira charged for cancelling; 0 for none. */
      fee: z.number().nullable(),
      /** Where the confirmation went, e.g. "•••• 4821". */
      sentTo: z.string().nullable(),
    })
    .nullable(),
});
export type AppointmentDetail = z.output<typeof appointmentDetailSchema>;

const appointmentExtrasSchema = z.object({ details: z.array(appointmentDetailSchema) });
export type AppointmentExtras = z.output<typeof appointmentExtrasSchema>;

/** Every appointment's extra details. */
export const appointmentExtrasQuery = () =>
  queryOptions({
    queryKey: appointmentKeys.of("extras"),
    queryFn: () => pendingRequest(appointmentExtrasSchema, "", { details: [] }),
  });

const bookingOptionsSchema = z.object({
  departments: z.array(z.string()),
  reasons: z.array(z.string()),
});

/** Which department and what for: the booking form's choices besides the facility. */
export const bookingOptionsQuery = () =>
  queryOptions({
    queryKey: appointmentKeys.of("options"),
    queryFn: () =>
      pendingRequest(bookingOptionsSchema, "/options", { departments: [], reasons: [] }),
    staleTime: 5 * 60_000,
  });

const bookableStaffSchema = z.array(
  z.object({ id: z.string(), name: z.string(), specialty: z.string().nullable() }),
);

/** Who the patient can book with at a facility (by its sqid): none off the mock server. */
export const bookableStaffQuery = (facilityId: string) =>
  queryOptions({
    queryKey: appointmentKeys.staff(facilityId),
    queryFn: () =>
      pendingRequest(bookableStaffSchema, `/staff?facility=${encodeURIComponent(facilityId)}`, []),
    enabled: !!facilityId,
    staleTime: 5 * 60_000,
  });

/**
 * Off the mock server, with no free slots to read: every half hour from 8 AM to 4:30 PM, from
 * half an hour from now. The hospital confirms (or moves) the time anyway.
 */
function officeHours(day: string) {
  const soonest = Date.now() + 30 * 60_000;
  return Array.from({ length: 18 }, (_, index) => {
    const minutes = 8 * 60 + index * 30;
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${minutes % 60 ? "30" : "00"}`;
  }).filter((time) => new Date(`${day}T${time}`).getTime() > soonest);
}

/** The free times ("HH:MM") at a facility (by its sqid) on a day ("YYYY-MM-DD"). */
export const slotsQuery = (facilityId: string, day: string) =>
  queryOptions({
    queryKey: appointmentKeys.slots(facilityId, day),
    queryFn: () =>
      pendingRequest(
        z.array(z.string()),
        `/slots?facility=${encodeURIComponent(facilityId)}&day=${day}`,
        officeHours(day),
      ),
    enabled: !!facilityId,
  });

/**
 * Tell the facility the patient will come to a pending appointment. TODO(api): confirming is the
 * front desk's (`POST …/confirm`); there's no patient endpoint, so off the mock server it fails.
 */
export function useConfirmAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!mocked()) return Promise.reject(new NotAvailableYetError("Confirming attendance"));
      return request(z.unknown(), {
        method: "POST",
        url: `${PENDING}/${encodeURIComponent(id)}/confirm`,
        data: {},
      });
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["patient", "appointments"] }),
        queryClient.invalidateQueries({ queryKey: appointmentKeys.all }),
      ]),
  });
}
