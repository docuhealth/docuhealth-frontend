import type { Appointment, Vitals, VisitSummary } from "@/features/patient/api/schemas";

// Working out the screens' views from the patient's visits, appointments and vitals.

/** A diagnosis from a visit. TODO(api): no condition status; the latest diagnosed visit's counts as active. */
export type Condition = {
  id: string;
  name: string;
  at: string;
  facility: string | null;
  clinician: string | null;
  active: boolean;
};

export function conditionsOf(visits: VisitSummary[]): Condition[] {
  // The newest visit that recorded a diagnosis (a visit for a scan or a lab test may not).
  const latest = visits.find((visit) => visit.diagnosis)?.id;
  return visits.flatMap((visit) =>
    visit.diagnosis
      ? [
          {
            id: visit.id,
            name: visit.diagnosis,
            at: visit.at,
            facility: visit.facility,
            clinician: visit.clinician?.name ?? null,
            active: visit.id === latest,
          },
        ]
      : [],
  );
}

/** Every scan ordered at a visit, newest first. */
export function scansOf(visits: VisitSummary[]) {
  return visits.flatMap((visit) =>
    visit.scans.map((scan, index) => ({
      id: `${visit.id}-${index}`,
      visitId: visit.id,
      name: scan.name,
      status: scan.status,
      at: visit.at,
      facility: visit.facility,
      orderedBy: visit.clinician?.name ?? null,
    })),
  );
}

/** The newest vital signs that have a reading for `pick`, and the one before it. */
export function latestVitals(visits: VisitSummary[], pick: (vitals: Vitals) => unknown) {
  const readings = visits
    .map((visit) => visit.vitals)
    .filter((vitals): vitals is Vitals => !!vitals && pick(vitals) != null);
  return { latest: readings[0] ?? null, previous: readings[1] ?? null };
}

/**
 * How a reading sits, for a vitals note: the whole `label`, the words of it to color (`lead`, the
 * rest stays grey: "**Just above** healthy"), and a tone (good, near the line, or worth watching).
 */
export type ReadingNote = { label: string; lead: string; tone: "good" | "near" | "watch" };

/** Where a blood pressure reading sits, for the snapshot's note. */
export function bloodPressureNote(reading: string | null): ReadingNote | null {
  const [systolic, diastolic] = (reading ?? "").split("/").map(Number);
  if (!systolic || !diastolic) return null;
  if (systolic < 120 && diastolic < 80)
    return { label: "Healthy blood pressure", lead: "Healthy blood", tone: "good" };
  if (systolic < 130 && diastolic < 80)
    return { label: "Slightly raised", lead: "Slightly raised", tone: "near" };
  return { label: "Higher than healthy", lead: "Higher", tone: "watch" };
}

/** Where a BMI sits, for the snapshot's note. */
export function bmiNote(bmi: number | null): ReadingNote | null {
  if (bmi == null) return null;
  if (bmi < 18.5) return { label: "Below healthy", lead: "Below", tone: "near" };
  if (bmi < 25) return { label: "Healthy", lead: "Healthy", tone: "good" };
  if (bmi < 30) return { label: "Just above healthy", lead: "Just above", tone: "near" };
  return { label: "Above healthy", lead: "Above", tone: "watch" };
}

/**
 * Where a blood glucose reading (mmol/L) sits against the usual target for when it was taken:
 * 4–7 before a meal, under 8.5 after one.
 */
export function glucoseNote(
  reading: { value: number; context: string } | null,
): ReadingNote | null {
  if (!reading) return null;
  const top = reading.context.includes("after") ? 8.5 : 7;
  const suffix = ` · ${reading.context}`;
  if (reading.value < 4)
    return { label: `Below target${suffix}`, lead: "Below target", tone: "watch" };
  if (reading.value <= top)
    return { label: `Within target${suffix}`, lead: "Within target", tone: "good" };
  return { label: `Above target${suffix}`, lead: "Above target", tone: "watch" };
}

/** The next appointment still to come (not cancelled or done), if any. */
export function nextAppointment(appointments: Appointment[], now = new Date()) {
  return (
    appointments.find(
      (appointment) =>
        new Date(appointment.at) >= now &&
        appointment.status !== "cancelled" &&
        appointment.status !== "completed",
    ) ?? null
  );
}

/** Facilities the patient has been seen at or booked with. */
export function facilitiesOf(visits: VisitSummary[], appointments: Appointment[]) {
  return [
    ...new Set(
      [...visits.map((visit) => visit.facility), ...appointments.map((a) => a.facility)].filter(
        (name): name is string => !!name,
      ),
    ),
  ];
}

const orderStatusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In progress",
  sample_collected: "Sample taken",
  image_collected: "Images taken",
  result_ready: "Ready",
  result_accepted_by_lab_admin: "Ready",
  result_accepted_by_doctor: "Reviewed",
  completed: "Final",
  rejected: "Cancelled",
};

/** A lab test's or scan's API status in plain words ("result_ready" → "Ready"). */
export function orderStatusLabel(status: string | null) {
  if (!status) return null;
  return (
    orderStatusLabels[status] ??
    status.charAt(0).toUpperCase() + status.slice(1).replaceAll("_", " ")
  );
}
