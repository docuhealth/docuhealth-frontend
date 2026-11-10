import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { request } from "@/lib/api";
import type { Period } from "@/lib/period";
import {
  appointmentCalendarSchema,
  appointmentDetailSchema,
  type AppointmentDay,
  appointmentListSchema,
  checkOutSummarySchema,
  patientLookupSchema,
  patientProfileSchema,
  receptionistProfileSchema,
  receptionOverviewSchema,
  receptionQueueSchema,
} from "@/features/receptionist/api/schemas";

// TODO(api): endpoint paths and shapes are provisional until the v2 hospital API is defined;
// src/mocks/receptionist.ts fakes them.

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

export const receptionistProfileQuery = () =>
  queryOptions({
    queryKey: receptionistKeys.profile(),
    queryFn: () => request(receptionistProfileSchema, { url: "/hospital/reception/profile" }),
  });

export const receptionOverviewQuery = (period: Period) =>
  queryOptions({
    queryKey: receptionistKeys.overview(period),
    queryFn: () =>
      request(receptionOverviewSchema, {
        url: "/hospital/reception/overview",
        params: { period },
      }),
  });

// Searches keep showing the previous results until the new ones arrive.

export const appointmentListQuery = (day: AppointmentDay, search: string) =>
  queryOptions({
    queryKey: receptionistKeys.appointments(day, search),
    queryFn: () =>
      request(appointmentListSchema, {
        url: "/hospital/reception/appointments",
        params: { day, search },
      }),
    placeholderData: keepPreviousData,
  });

/** Appointments from `from` up to `to` (ISO date-times) and their numbers, for the calendar. */
export const appointmentCalendarQuery = (from: string, to: string) =>
  queryOptions({
    queryKey: receptionistKeys.calendar(from, to),
    queryFn: () =>
      request(appointmentCalendarSchema, {
        url: "/hospital/reception/appointments/calendar",
        params: { from, to },
      }),
    placeholderData: keepPreviousData,
  });

export const appointmentDetailQuery = (id: string) =>
  queryOptions({
    queryKey: receptionistKeys.appointment(id),
    queryFn: () =>
      request(appointmentDetailSchema, { url: `/hospital/reception/appointments/${id}` }),
  });

export const receptionQueueQuery = (search: string) =>
  queryOptions({
    queryKey: receptionistKeys.queue(search),
    queryFn: () =>
      request(receptionQueueSchema, { url: "/hospital/reception/queue", params: { search } }),
    placeholderData: keepPreviousData,
  });

/** The patient with this HIN (digits only), to check in. */
export const patientLookupQuery = (hin: string) =>
  queryOptions({
    queryKey: receptionistKeys.patientLookup(hin),
    queryFn: () =>
      request(patientLookupSchema, { url: "/hospital/reception/patients", params: { hin } }),
  });

export const patientProfileQuery = (id: string) =>
  queryOptions({
    queryKey: receptionistKeys.patient(id),
    queryFn: () => request(patientProfileSchema, { url: `/hospital/reception/patients/${id}` }),
  });

/** The patient leaving the queue, and any appointment requests to settle first. */
export const checkOutSummaryQuery = (queueId: string) =>
  queryOptions({
    queryKey: receptionistKeys.checkOut(queueId),
    queryFn: () =>
      request(checkOutSummarySchema, {
        url: `/hospital/reception/queue/${queueId}/check-out-summary`,
      }),
  });
