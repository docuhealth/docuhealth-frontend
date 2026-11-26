import { z } from "zod";
import { paginated } from "@/lib/api";
import { fullName, optionalText, staffMemberSchema, text } from "@/lib/staff-profile";

// Shapes from the staging OpenAPI schema (docs/api/openapi.json) and live responses. The backend
// sends snake_case and sometimes null or "" for missing text; these turn that into the app's model.

const sentenceCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

export const staffDirectorySchema = paginated(staffMemberSchema);

export const appointmentStatusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;
export type AppointmentStatus = keyof typeof appointmentStatusLabels;

/**
 * The Appointments tabs, as the API's `timeframe`. The hospital's list (`GET /`) has `tomorrow`
 * too, and its `upcoming` starts after tomorrow; a member's own (`GET /staff`) has no `tomorrow`,
 * and its `upcoming` starts after today.
 */
export const appointmentTimeframeLabels = {
  today: "Today",
  tomorrow: "Tomorrow",
  upcoming: "Upcoming",
  history: "Past",
} as const;
export type AppointmentTimeframe = keyof typeof appointmentTimeframeLabels;

const personRef = z
  .object({ sqid: z.string().nullish(), firstname: text, lastname: text, role: optionalText })
  .nullish()
  .transform((person) =>
    person ? { name: fullName(person.firstname, person.lastname), role: person.role } : null,
  );

/** `HospitalAppointment`: one booked visit. */
const appointmentSchema = z
  .object({
    sqid: z.string(),
    status: z.enum(Object.keys(appointmentStatusLabels) as [AppointmentStatus]).catch("pending"),
    scheduled_time: z.iso.datetime({ offset: true }),
    type: optionalText,
    note: optionalText,
    patient: z.object({
      firstname: text,
      lastname: text,
      hin: text,
      phone_num: optionalText,
    }),
    staff: personRef,
    closed_at: z.iso.datetime({ offset: true }).nullish(),
    closed_by_info: personRef,
  })
  .transform((appointment) => ({
    id: appointment.sqid,
    at: appointment.scheduled_time,
    status: appointment.status,
    // e.g. "follow_up" → "Follow up".
    type: appointment.type && sentenceCase(appointment.type.replaceAll("_", " ")),
    note: appointment.note,
    patient: {
      name: fullName(appointment.patient.firstname, appointment.patient.lastname),
      hin: appointment.patient.hin,
      phone: appointment.patient.phone_num,
    },
    staff: appointment.staff,
    closedAt: appointment.closed_at ?? null,
    closedBy: appointment.closed_by_info,
  }));
export type Appointment = z.infer<typeof appointmentSchema>;

export const appointmentListSchema = paginated(appointmentSchema);

/** `POST …/close`: `{detail: "Appointment closed successfully."}` (Swagger shows no body). */
export const closedAppointmentSchema = z.object({ detail: z.string().nullish() });

/** Replies to writes whose body the app doesn't use. */
export const anyResponseSchema = z.unknown();
