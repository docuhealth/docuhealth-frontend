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
  type CheckOutSummary,
  countOnlySchema,
  outpatientPageSchema,
  type PatientLookup,
  type PatientProfile,
  patientDetailsSchema,
  queueStatusOf,
  type ReceptionOverview,
  type ReceptionQueue,
  receptionistProfileSchema,
  toAppointment,
  toAppointmentDetail,
  toCalendarAppointment,
  toFoundPatient,
  toPatientProfile,
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
};

const APPOINTMENTS_URL = "/api/hospital-ops/appointments";
const OUTPATIENTS_URL = "/api/hospital-ops/patients";

type Timeframe = "today" | "upcoming" | "history";

export const receptionistProfileQuery = () =>
  queryOptions({
    queryKey: receptionistKeys.profile(),
    queryFn: () => request(receptionistProfileSchema, { url: "/api/auth/staff/profile" }),
  });

/**
 * The dashboard's numbers. TODO(api): the receptionist dashboard endpoint has none, so the queue
 * (open check-ins) and today's appointments are counted from their lists, and the rest is null.
 */
export const receptionOverviewQuery = (period: Period) =>
  queryOptions({
    queryKey: receptionistKeys.overview(period),
    queryFn: async (): Promise<ReceptionOverview> => {
      const [waitingInQueue, appointmentsToday] = await Promise.all([
        request(countOnlySchema, {
          url: OUTPATIENTS_URL,
          params: { status: "outpatient", page: 1, size: 1 },
        }),
        request(countOnlySchema, {
          url: APPOINTMENTS_URL,
          params: { timeframe: "today", page: 1, size: 1 },
        }),
      ]);
      return {
        totalCheckIns: null,
        totalCheckInsChange: null,
        waitingInQueue,
        waitingInQueueChange: null,
        checkedInToday: null,
        checkedInTodayChange: null,
        appointmentsToday,
        appointmentsTodayChange: null,
      };
    },
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
      return {
        timeframe: "upcoming",
        scheduled_time_gte: startOfDay(1).toISOString(),
        scheduled_time_lte: new Date(startOfDay(2).getTime() - 1).toISOString(),
      };
    case "upcoming":
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
  const timeframes: Timeframe[] = ["history", "today", "upcoming"];
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
 * Appointments from `from` up to `to` (ISO date-times) and their numbers, for the calendar.
 * TODO(api): no changes against the span before, and no slots.
 */
export const appointmentCalendarQuery = (from: string, to: string) =>
  queryOptions({
    queryKey: receptionistKeys.calendar(from, to),
    queryFn: async (): Promise<AppointmentCalendar> => {
      const appointments = await appointmentsBetween(from, to);
      return {
        summary: {
          booked: appointments.length,
          bookedChange: null,
          checkedIn: appointments.filter(({ status }) => status === "completed").length,
          cancelled: appointments.filter(({ status }) => status === "cancelled").length,
          cancelledChange: null,
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
 * One appointment. TODO(api): there's no endpoint for one, so this looks through the latest of
 * each timeframe for it.
 */
export const appointmentDetailQuery = (id: string) =>
  queryOptions({
    queryKey: receptionistKeys.appointment(id),
    queryFn: async (): Promise<AppointmentDetail> => {
      const pages = await Promise.all(
        (["today", "upcoming", "history"] as const).map((timeframe) =>
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
 * Patients checked in and not yet checked out, longest wait first. TODO(api): check-ins carry no
 * reason, and "outpatient" includes patients already with the nurse or doctor.
 */
export const receptionQueueQuery = (search: string) =>
  queryOptions({
    queryKey: receptionistKeys.queue(search),
    queryFn: () => fetchQueue(search),
    placeholderData: keepPreviousData,
  });

async function fetchQueue(search: string): Promise<ReceptionQueue> {
  const { results } = await request(outpatientPageSchema, {
    url: OUTPATIENTS_URL,
    params: { status: "outpatient", search: search || undefined, page: 1, size: 50 },
  });
  const now = Date.now();
  return {
    items: results
      .map((checkIn) => ({
        id: checkIn.sqid,
        patient: {
          id: checkIn.patient_info.hin,
          name: `${checkIn.patient_info.firstname} ${checkIn.patient_info.lastname}`.trim(),
          hin: checkIn.patient_info.hin,
          avatarUrl: null,
        },
        reason: "",
        status: queueStatusOf(checkIn.status),
        waitMinutes: checkIn.created_at
          ? Math.max(0, Math.round((now - new Date(checkIn.created_at).getTime()) / 60_000))
          : 0,
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

/** A patient's profile; its `id` is their HIN. */
export const patientProfileQuery = (id: string) =>
  queryOptions({
    queryKey: receptionistKeys.patient(id),
    queryFn: async (): Promise<PatientProfile> => toPatientProfile(await patientDetails(id)),
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
