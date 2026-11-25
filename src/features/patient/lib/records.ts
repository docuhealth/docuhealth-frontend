import type { Appointment, Vitals, VisitSummary } from "@/features/patient/api/schemas";

// Working out the screens' views from the patient's visits, appointments and vitals.

/** A diagnosis from a visit. TODO(api): no condition status; the latest visit's count as active. */
export type Condition = {
  id: string;
  name: string;
  at: string;
  facility: string | null;
  clinician: string | null;
  active: boolean;
};

export function conditionsOf(visits: VisitSummary[]): Condition[] {
  const latest = visits[0]?.id;
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

/** Where a blood pressure reading sits, for the snapshot's note. */
export function bloodPressureNote(reading: string | null) {
  const [systolic, diastolic] = (reading ?? "").split("/").map(Number);
  if (!systolic || !diastolic) return null;
  if (systolic < 120 && diastolic < 80)
    return { label: "Healthy blood pressure", tone: "good" } as const;
  if (systolic < 130 && diastolic < 80) return { label: "Slightly raised", tone: "watch" } as const;
  return { label: "Higher than healthy", tone: "watch" } as const;
}

/** Where a BMI sits, for the snapshot's note. */
export function bmiNote(bmi: number | null) {
  if (bmi == null) return null;
  if (bmi < 18.5) return { label: "Below healthy", tone: "watch" } as const;
  if (bmi < 25) return { label: "Healthy", tone: "good" } as const;
  if (bmi < 30) return { label: "Just above healthy", tone: "watch" } as const;
  return { label: "Above healthy", tone: "watch" } as const;
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
