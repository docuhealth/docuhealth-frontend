import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { request } from "@/lib/api";
import type { Period } from "@/lib/period";
import {
  type AppointmentCalendar,
  type AppointmentDay,
  type AppointmentDetail,
  type AppointmentList,
  appointmentPageSchema,
  appointmentsOverviewSchema,
  bookableStaffSchema,
  type CheckOutSummary,
  checkInPageSchema,
  countOnlySchema,
  guardianshipPageSchema,
  operationMetricsSchema,
  type PatientLookup,
  type PatientProfile,
  patientDetailsSchema,
  queueStatusOf,
  type ReceptionQueue,
  receptionistProfileSchema,
  toAppointment,
  toAppointmentDetail,
  toCalendarAppointment,
  toFoundPatient,
  toPatientProfile,
  visitMetricsSchema,
  visitTimelineSchema,
} from "@/features/receptionist/api/schemas";

// The front desk on the real API (docs/api/openapi.json). Where the API has no endpoint, filter or
// field yet, it's marked TODO(api); see docs/backend-gaps-v2-migration.md, section 7.

export const receptionistKeys = {
  all: ["receptionist"] as const,
  profile: () => [...receptionistKeys.all, "profile"] as const,
  overview: (period: Period) => [...receptionistKeys.all, "overview", period] as const,
  appointments: (day: AppointmentDay, search: string) =>
    [...receptionistKeys.all, "appointments", day, search] as const,
  appointment: (id: string) => [...receptionistKeys.all, "appointment", id] as const,
  calendar: (from: string, to: string) => [...receptionistKeys.all, "calendar", from, to] as const,
  /** Every queue list, whatever its search. */
  queues: () => [...receptionistKeys.all, "queue"] as const,
  queue: (search: string) => [...receptionistKeys.queues(), search] as const,
  patientLookup: (hin: string) => [...receptionistKeys.all, "patient-lookup", hin] as const,
  patient: (id: string) => [...receptionistKeys.all, "patient", id] as const,
  checkOut: (queueId: string) => [...receptionistKeys.all, "check-out", queueId] as const,
  staff: () => [...receptionistKeys.all, "staff"] as const,
};

const APPOINTMENTS_URL = "/api/hospital-ops/appointments";

/** The API's `timeframe`s: `upcoming` is after tomorrow, so they don't overlap. */
type Timeframe = "history" | "today" | "tomorrow" | "upcoming";
const timeframes: Timeframe[] = ["history", "today", "tomorrow", "upcoming"];

/** The app's period → the API's `period` (the current day, Monday-to-Sunday week or month, UTC). */
const apiPeriods = { today: "day", week: "week", month: "month" } as const satisfies Record<
  Period,
  string
>;

export const receptionistProfileQuery = () =>
  queryOptions({
    queryKey: receptionistKeys.profile(),
    queryFn: () => request(receptionistProfileSchema, { url: "/api/auth/staff/profile" }),
  });

/**
 * Who a patient can be booked with: the hospital's active clinical staff. TODO(api): reads the
 * first 100 members.
 */
export const bookableStaffQuery = () =>
  queryOptions({
    queryKey: receptionistKeys.staff(),
    queryFn: () => request(bookableStaffSchema, { url: "/api/auth/staff", params: { size: 100 } }),
    staleTime: 5 * 60_000,
  });

/** The dashboard's numbers for `period`. */
export const receptionOverviewQuery = (period: Period) =>
  queryOptions({
    queryKey: receptionistKeys.overview(period),
    queryFn: () =>
      request(operationMetricsSchema, {
        url: "/api/hospital-ops/operation-metrics",
        params: { period: apiPeriods[period] },
      }),
  });

/** Midnight `days` from today. */
function startOfDay(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** The API's filters for each tab: today's, tomorrow's, then everything after. */
function dayParams(day: AppointmentDay) {
  switch (day) {
    case "today":
      return { timeframe: "today" };
    case "tomorrow":
      return { timeframe: "tomorrow" };
    case "upcoming":
      // The API's `upcoming` already starts after tomorrow; the bound keeps it to that anyway.
      return { timeframe: "upcoming", scheduled_time_gte: startOfDay(2).toISOString() };
  }
}

const days: AppointmentDay[] = ["today", "tomorrow", "upcoming"];

// Searches keep showing the previous results until the new ones arrive.

/** One tab's appointments, soonest first, and every tab's count. */
export const appointmentListQuery = (day: AppointmentDay, search: string) =>
  queryOptions({
    queryKey: receptionistKeys.appointments(day, search),
    queryFn: async (): Promise<AppointmentList> => {
      const [page, ...counts] = await Promise.all([
        request(appointmentPageSchema, {
          url: APPOINTMENTS_URL,
          params: { ...dayParams(day), search: search || undefined, page: 1, size: 20 },
        }),
        ...days.map((tab) =>
          request(countOnlySchema, {
            url: APPOINTMENTS_URL,
            params: { ...dayParams(tab), page: 1, size: 1 },
          }),
        ),
      ]);
      return {
        counts: { today: counts[0] ?? 0, tomorrow: counts[1] ?? 0, upcoming: counts[2] ?? 0 },
        items: page.results.map(toAppointment).sort((a, b) => a.at.localeCompare(b.at)),
      };
    },
    placeholderData: keepPreviousData,
  });

/** Every appointment the API has between `from` and `to`, across the timeframes it spans. */
async function appointmentsBetween(from: string, to: string) {
  const pages = await Promise.all(
    timeframes.map((timeframe) =>
      request(appointmentPageSchema, {
        url: APPOINTMENTS_URL,
        // TODO(api): reads the first 100 of each; a busy span would need every page.
        params: { timeframe, scheduled_time_gte: from, scheduled_time_lte: to, page: 1, size: 100 },
      }),
    ),
  );
  const byId = new Map(pages.flatMap(({ results }) => results).map((entry) => [entry.sqid, entry]));
  return [...byId.values()].sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
}

/**
 * The API's `period` when `from`-`to` is the current day, week or month (the only spans
 * `appointments-overview` answers for), else `null`. The calendar's weeks start on Sunday and
 * its days are local, while the API's weeks start on Monday and its days are UTC, so the
 * numbers can differ slightly at the edges.
 */
function currentPeriodOf(from: Date, to: Date) {
  const now = Date.now();
  if (now < from.getTime() || now >= to.getTime()) return null;
  const days = Math.round((to.getTime() - from.getTime()) / 86_400_000);
  return days <= 1 ? "day" : days <= 7 ? "week" : "month";
}

/**
 * Appointments from `from` up to `to` (ISO date-times) and their numbers, for the calendar.
 * For the current day, week or month the numbers are the API's; for any other span they're
 * counted from the appointments, with no change against the span before. TODO(api): no slots.
 */
export const appointmentCalendarQuery = (from: string, to: string) =>
  queryOptions({
    queryKey: receptionistKeys.calendar(from, to),
    queryFn: async (): Promise<AppointmentCalendar> => {
      const period = currentPeriodOf(new Date(from), new Date(to));
      const [appointments, overview] = await Promise.all([
        appointmentsBetween(from, to),
        period
          ? request(appointmentsOverviewSchema, {
              url: "/api/hospital-ops/appointments-overview",
              params: { period },
            })
          : null,
      ]);
      return {
        summary: {
          booked: overview?.booked ?? appointments.length,
          bookedChange: overview?.bookedChange ?? null,
          // TODO(api): the API's count is of appointments booked from a consultation that's
          // still in progress; desk-booked ones never count. Other spans count completed ones.
          checkedIn:
            overview?.inProgress ??
            appointments.filter(({ status }) => status === "completed").length,
          cancelled:
            overview?.cancelled ??
            appointments.filter(({ status }) => status === "cancelled").length,
          cancelledChange: overview?.cancelledChange ?? null,
          openSlots: null,
          totalSlots: null,
        },
        items: appointments.map(toCalendarAppointment),
      };
    },
    placeholderData: keepPreviousData,
  });

/** An appointment the API doesn't have (or the front desk can't see). */
class AppointmentNotFoundError extends Error {
  constructor(id: string) {
    super(`Appointment ${id} not found`);
    this.name = "AppointmentNotFoundError";
  }
}

/**
 * One appointment. TODO(api): there's no endpoint for one, so this looks through the first 100 of
 * each timeframe for it.
 */
export const appointmentDetailQuery = (id: string) =>
  queryOptions({
    queryKey: receptionistKeys.appointment(id),
    queryFn: async (): Promise<AppointmentDetail> => {
      const pages = await Promise.all(
        timeframes.map((timeframe) =>
          request(appointmentPageSchema, {
            url: APPOINTMENTS_URL,
            params: { timeframe, page: 1, size: 100 },
          }),
        ),
      );
      const found = pages.flatMap(({ results }) => results).find(({ sqid }) => sqid === id);
      if (!found) throw new AppointmentNotFoundError(id);
      return toAppointmentDetail(found);
    },
  });

/**
 * Patients checked in and not yet checked out, longest wait first. Search matches a name, HIN or
 * phone number. TODO(api): check-ins carry no reason, and the wait isn't returned (it's now
 * minus check-in time).
 */
export const receptionQueueQuery = (search: string) =>
  queryOptions({
    queryKey: receptionistKeys.queue(search),
    queryFn: () => fetchQueue(search),
    placeholderData: keepPreviousData,
  });

async function fetchQueue(search: string): Promise<ReceptionQueue> {
  // TODO(api): the list has every check-in, closed ones too, with no status filter, so this
  // reads the newest 100 and drops the closed ones here; open check-ins are the newest anyway.
  const { items } = await request(checkInPageSchema, {
    url: "/api/hospital-ops/patients-check-ins",
    params: { search: search || undefined, page: 1, size: 100 },
  });
  const now = Date.now();
  return {
    items: items
      .filter((checkIn) => checkIn.status !== "closed")
      .map((checkIn) => ({
        // The check-in's sqid, which checking out closes.
        id: checkIn.sqid,
        patient: {
          // Profiles are addressed by HIN.
          id: checkIn.patient_info.hin,
          name:
            `${checkIn.patient_info.firstname} ${checkIn.patient_info.lastname}`.trim() ||
            checkIn.patient_info.hin,
          hin: checkIn.patient_info.hin,
          avatarUrl: null,
        },
        reason: "",
        status: queueStatusOf(checkIn.status),
        waitMinutes: Math.max(
          0,
          Math.round((now - new Date(checkIn.created_at).getTime()) / 60_000),
        ),
      }))
      .sort((a, b) => b.waitMinutes - a.waitMinutes),
  };
}

/** The patient with this HIN, or a 404 when there's none. */
function patientDetails(hin: string) {
  return request(patientDetailsSchema, { url: `/api/patients/${encodeURIComponent(hin)}/details` });
}

/** The patient with this HIN (digits only), to check in; none when the API has no such patient. */
export const patientLookupQuery = (hin: string) =>
  queryOptions({
    queryKey: receptionistKeys.patientLookup(hin),
    queryFn: async (): Promise<PatientLookup> => {
      try {
        return { items: [toFoundPatient(await patientDetails(hin))] };
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) return { items: [] };
        throw error;
      }
    },
  });

/**
 * A patient's profile; its `id` is their HIN. Their details, visit numbers, linked people and
 * visits at this hospital. TODO(api): reads the first 100 linked people and visits.
 */
export const patientProfileQuery = (id: string) =>
  queryOptions({
    queryKey: receptionistKeys.patient(id),
    queryFn: async (): Promise<PatientProfile> => {
      const path = `/api/patients/${encodeURIComponent(id)}`;
      const [patient, metrics, linked, visits] = await Promise.all([
        patientDetails(id),
        request(visitMetricsSchema, { url: `${path}/visit-metrics` }),
        request(guardianshipPageSchema, {
          url: `${path}/guardianship`,
          params: { page: 1, size: 100 },
        }),
        request(visitTimelineSchema, { url: `${path}/visits`, params: { page: 1, size: 100 } }),
      ]);
      return toPatientProfile(patient, metrics, linked.items, visits);
    },
  });

/**
 * The patient leaving the queue, and any appointment requests to settle first. TODO(api): there's
 * no source for a doctor's follow-up requests, so there are none.
 */
export const checkOutSummaryQuery = (queueId: string) =>
  queryOptions({
    queryKey: receptionistKeys.checkOut(queueId),
    queryFn: async (): Promise<CheckOutSummary> => {
      const entry = (await fetchQueue("")).items.find(({ id }) => id === queueId);
      if (!entry) throw new Error("This patient isn’t in the queue any more.");
      const patient = await patientDetails(entry.patient.hin);
      return {
        patient: {
          id: patient.id,
          name: patient.name,
          hin: patient.hin,
          phone: patient.phone,
          email: patient.email,
        },
        appointmentRequests: [],
      };
    },
  });
