import { z } from "zod";
import { durationOf, durationSchema, frequencyOf } from "@/lib/clinical";
import { fullName, optionalText, text } from "@/lib/staff-profile";

// The patient's own records on the real API (docs/api/openapi.json): their visit summaries
// (`GET /api/records/summaries/{hin}`), appointments (`GET /api/hospital-ops/appointments/mine`)
// and drug records (`GET /api/pharmacy/patients/drug-records`). TODO(api): much of the design
// has no source yet (allergies, blood group, genotype, immunizations, documents, bills, scan
// images and status); see docs/patient-dashboard-plan.md. These parsers are from the schema
// only: no patient test account has shown a real reply yet.

const facility = z
  .object({ name: text, sqid: optionalText })
  .nullish()
  .transform((info) => (info?.name ? info.name : null));

const clinician = z
  .object({ firstname: text, lastname: text, role: optionalText, specialization: optionalText })
  .nullish()
  .transform((info) => {
    const name = info && fullName(info.firstname, info.lastname);
    if (!name) return null;
    return { name: info.role === "doctor" ? `Dr. ${name}` : name, specialty: info.specialization };
  });

const number = z
  .number()
  .nullish()
  .transform((value) => value ?? null);

/** One set of vital signs: the latest feeds the home page's snapshot. */
const vitalsSchema = z
  .object({
    created_at: z.string(),
    blood_pressure: optionalText,
    weight: number,
    height: number,
    bmi: number,
    heart_rate: number,
    temp: number,
  })
  .nullish()
  .transform((vitals) =>
    vitals
      ? {
          at: vitals.created_at,
          bloodPressure: vitals.blood_pressure,
          weight: vitals.weight,
          bmi: vitals.bmi,
          heartRate: vitals.heart_rate,
          temperature: vitals.temp,
        }
      : null,
  );
export type Vitals = NonNullable<z.output<typeof vitalsSchema>>;

/**
 * A visit's orders (`lab_tests_info`, `scans_info`, `drug_orders_info`): typed as strings in the
 * schema but lists of objects in practice. TODO(api): type them. Each becomes a name and a status.
 */
const orderList = z.unknown().transform((value): { name: string; status: string | null }[] => {
  const items = Array.isArray(value) ? value : [];
  return items.flatMap((entry) => {
    if (typeof entry === "string") return [{ name: entry, status: null }];
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    const nested = [record.test_info, record.scan_info, record.drug_info].find(
      (info): info is Record<string, unknown> => !!info && typeof info === "object",
    );
    const name = [record.name, record.test_name, record.scan_name, nested?.name].find(
      (value): value is string => typeof value === "string" && value.trim() !== "",
    );
    const status = typeof record.status === "string" ? record.status : null;
    return name ? [{ name, status }] : [];
  });
});

/** One set of vital signs from the patient's history (`GET /api/records/vital-signs/mine`). */
export const vitalReadingSchema = z
  .object({
    sqid: z.string(),
    created_at: z.string(),
    blood_pressure: optionalText,
    temp: number,
    resp_rate: number,
    heart_rate: number,
    height: number,
    weight: number,
    spo2: number,
    bmi: number,
    staff_info: clinician,
    hospital_info: facility,
  })
  .transform((reading) => ({
    id: reading.sqid,
    at: reading.created_at,
    bloodPressure: reading.blood_pressure,
    temperature: reading.temp,
    breathingRate: reading.resp_rate,
    heartRate: reading.heart_rate,
    height: reading.height,
    weight: reading.weight,
    spo2: reading.spo2,
    bmi: reading.bmi,
    recordedBy: reading.staff_info?.name ?? null,
    facility: reading.hospital_info,
  }));
export type VitalReading = z.output<typeof vitalReadingSchema>;

/** Free text the schema leaves untyped (`treatment_plan`, `care_instructions`): a string or null. */
const looseText = z
  .unknown()
  .transform((value) => (typeof value === "string" && value.trim() ? value.trim() : null));

const additionalNote = z
  .object({ note: optionalText, created_at: optionalText })
  .transform((entry) => ({ note: entry.note, at: entry.created_at }));

/** One visit summary: who saw the patient where, what they found, and what they ordered. */
export const visitSummarySchema = z
  .object({
    id: z.union([z.number(), z.string()]).transform(String),
    created_at: z.string(),
    chief_complaint: optionalText,
    primary_diagnosis: optionalText,
    hospital_info: facility,
    staff_info: clinician,
    vital_signs_info: vitalsSchema,
    lab_tests_info: orderList,
    scans_info: orderList,
    drug_orders_info: orderList,
    treatment_plan: looseText,
    care_instructions: looseText,
    additional_notes: z.array(additionalNote).nullish(),
  })
  .transform((visit) => ({
    id: visit.id,
    at: visit.created_at,
    complaint: visit.chief_complaint,
    diagnosis: visit.primary_diagnosis,
    facility: visit.hospital_info,
    clinician: visit.staff_info,
    vitals: visit.vital_signs_info,
    labTests: visit.lab_tests_info,
    scans: visit.scans_info,
    drugs: visit.drug_orders_info,
    /** The clinician's note for the patient: the treatment plan, care instructions, then notes. */
    note:
      [
        visit.treatment_plan,
        visit.care_instructions,
        ...(visit.additional_notes ?? []).map((entry) => entry.note),
      ]
        .filter(Boolean)
        .join("\n\n") || null,
  }));
export type VisitSummary = z.output<typeof visitSummarySchema>;

const appointmentStatuses = ["pending", "confirmed", "cancelled", "completed"] as const;

/**
 * `HospitalAppointment`, from `GET /api/hospital-ops/appointments/mine` and the visit timeline.
 * `note` is the reason for the visit; `last_visited` the time of the patient's latest completed
 * appointment before this one.
 */
export const appointmentSchema = z
  .object({
    sqid: z.string(),
    status: z.enum(appointmentStatuses).nullish(),
    scheduled_time: z.string(),
    type: optionalText,
    note: optionalText,
    cancellation_reason: optionalText,
    reschedule_reason: optionalText,
    last_visited: optionalText,
    staff: clinician,
    hospital_info: z.object({ name: text, sqid: optionalText }).nullish(),
  })
  .transform((appointment) => ({
    id: appointment.sqid,
    status: appointment.status ?? null,
    at: appointment.scheduled_time,
    type: appointment.type,
    note: appointment.note,
    cancellationReason: appointment.cancellation_reason,
    rescheduleReason: appointment.reschedule_reason,
    lastVisited: appointment.last_visited,
    clinician: appointment.staff,
    facility: appointment.hospital_info?.name || null,
    /** The hospital's sqid, which booking and free times go by. */
    facilityId: appointment.hospital_info?.sqid ?? null,
  }));
export type Appointment = z.output<typeof appointmentSchema>;

const drugStatuses = ["ongoing", "completed", "stopped"] as const;

export const drugRecordSchema = z
  .object({
    sqid: z.string(),
    name: text,
    strength: optionalText,
    dose_form: optionalText,
    route: optionalText,
    frequency: optionalText,
    duration: durationSchema,
    quantity: z.number().nullish(),
    unit: optionalText,
    status: z.enum(drugStatuses).nullish(),
    created_at: z.string(),
    fulfillment_status: optionalText,
    dispensed_at: optionalText,
  })
  .transform((drug) => ({
    id: drug.sqid,
    name: [drug.name, drug.strength].filter(Boolean).join(" "),
    /** "Tablet · Oral · Once daily". */
    how: [drug.dose_form, drug.route, drug.frequency && frequencyOf(drug.frequency)]
      .filter(Boolean)
      .map((part) => String(part).charAt(0).toUpperCase() + String(part).slice(1))
      .join(" · "),
    quantity: drug.quantity != null ? `${drug.quantity} ${drug.unit ?? ""}`.trim() : null,
    duration: durationOf(drug.duration),
    status: drug.status ?? null,
    at: drug.created_at,
    dispensing: drug.fulfillment_status,
    dispensedAt: drug.dispensed_at,
  }));
export type DrugRecord = z.output<typeof drugRecordSchema>;

/** A check-in at a facility, from the patient's visit timeline (`GET /api/patients/visits`). */
const checkInSchema = z
  .object({
    sqid: z.string(),
    status: optionalText,
    hospital_info: facility,
    created_at: z.string(),
    closed_at: optionalText,
  })
  .transform((checkIn) => ({
    id: checkIn.sqid,
    at: checkIn.created_at,
    facility: checkIn.hospital_info,
    /** Still at the facility: not checked out yet. */
    open: !checkIn.closed_at && checkIn.status !== "closed",
    closedAt: checkIn.closed_at,
  }));
export type CheckIn = z.output<typeof checkInSchema>;

/**
 * One row of the patient's visit timeline: a check-in or an appointment, at its time (a booking
 * at its scheduled time, so future ones come first).
 */
export const timelineEntrySchema = z.object({
  type: z.enum(["appointment", "check-in"]),
  time: z.string(),
  appointment: appointmentSchema.nullish(),
  check_in: checkInSchema.nullish(),
});

/** The patient's own visit numbers (`GET /api/patients/visit-metrics`). */
export const visitMetricsSchema = z
  .object({
    total_visits: z.number(),
    last_visit: optionalText,
    last_check_in: optionalText,
    upcoming_appointment: z
      .object({ sqid: z.string(), status: optionalText, scheduled_time: z.string() })
      .nullish(),
  })
  .transform((metrics) => ({
    totalVisits: metrics.total_visits,
    lastVisit: metrics.last_visit,
    lastCheckIn: metrics.last_check_in,
    upcomingAt: metrics.upcoming_appointment?.scheduled_time ?? null,
  }));
