import type { LabResult, VisitDetail } from "@/features/patient/api/pending";
import type { Appointment, DrugRecord, VisitSummary } from "@/features/patient/api/schemas";
import { formatDateCommaTime, formatDay } from "@/lib/format";

// Working out the Visits screens from the patient's visit summaries, appointments and the
// pending visit details (type, nights, next steps). TODO(api): visit type, admission length and
// next steps aren't served yet, so without them a visit shows only under "All visits".

export type VisitFilter = "all" | "outpatient" | "admission" | "emergency";

export const visitFilters: { value: VisitFilter; label: string }[] = [
  { value: "all", label: "All visits" },
  { value: "outpatient", label: "Outpatient" },
  { value: "admission", label: "Admissions" },
  { value: "emergency", label: "Emergency" },
];

export type VisitStatus = "booked" | "summary" | "no-summary" | "admitted" | "discharged";

/** One row of the Visits list: a booked appointment or a past visit. */
export type VisitRow = {
  id: string;
  when: "upcoming" | "past";
  /** `null` when the API doesn't say: the row shows only under "All visits". */
  type: VisitDetail["type"] | null;
  title: string;
  line: string;
  status: VisitStatus;
  facility: string | null;
  /** The visit summary's id; upcoming appointments have none. */
  visitId: string | null;
};

/** Whether the facility shared anything about the visit: a complaint, diagnosis or note. */
export function hasSummary(visit: VisitSummary) {
  return !!(visit.complaint || visit.diagnosis || visit.note);
}

/** "Dr. Adaeze Okafor" → "Dr. Okafor"; other names stay whole. */
export function shortClinician(name: string | null | undefined) {
  if (!name) return null;
  const parts = name.split(" ");
  return parts[0] === "Dr." && parts.length > 2 ? `Dr. ${parts.at(-1)}` : name;
}

/** "10–14 Aug 2026", "28 Jul – 1 Aug 2026" or "30 Dec 2025 – 3 Jan 2026". */
export function formatStay(from: Date, to: Date) {
  if (from.getFullYear() !== to.getFullYear()) return `${formatDay(from)} – ${formatDay(to)}`;
  const end = formatDay(to);
  if (from.getMonth() === to.getMonth()) return `${from.getDate()}–${end}`;
  return `${formatDay(from).replace(/ \d{4}$/, "")} – ${end}`;
}

/** A visit's title: "Lab visit" for a lab-only visit, else what they came for. */
export function visitTitle(visit: VisitSummary, detail: VisitDetail | null) {
  if (detail?.type === "lab") return "Lab visit";
  if (visit.complaint) return visit.complaint;
  if (detail?.type === "admission") return "Admission";
  if (detail?.type === "emergency") return "Emergency";
  return "Visit";
}

/** "25 Sep 2026 · ABC Hospital · Dr. Okafor", or for a stay "10–14 Aug 2026 · LUTH · 4 nights". */
function visitLine(visit: VisitSummary, detail: VisitDetail | null) {
  const start = new Date(visit.at);
  if (detail?.type === "admission" && detail.nights) {
    const end = new Date(start);
    end.setDate(end.getDate() + detail.nights);
    return [
      formatStay(start, end),
      visit.facility,
      `${detail.nights} ${detail.nights === 1 ? "night" : "nights"}`,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  return [formatDay(start), visit.facility, shortClinician(visit.clinician?.name)]
    .filter(Boolean)
    .join(" · ");
}

function visitStatus(visit: VisitSummary, detail: VisitDetail | null): VisitStatus {
  if (detail?.type === "admission") return detail.discharged ? "discharged" : "admitted";
  return hasSummary(visit) ? "summary" : "no-summary";
}

/** Appointments still to come (not cancelled or done), soonest first. */
function upcomingAppointments(appointments: Appointment[], now = new Date()) {
  return appointments
    .filter((a) => new Date(a.at) >= now && a.status !== "cancelled" && a.status !== "completed")
    .toSorted((a, b) => a.at.localeCompare(b.at));
}

/** The Visits list's rows: booked appointments (outpatient), then past visits newest first. */
export function visitRows(
  visits: VisitSummary[],
  appointments: Appointment[],
  details: VisitDetail[],
  now = new Date(),
): VisitRow[] {
  const upcoming = upcomingAppointments(appointments, now).map((appointment): VisitRow => ({
    id: `appointment-${appointment.id}`,
    when: "upcoming",
    // A booked appointment is a clinic visit.
    type: "outpatient",
    title:
      [appointment.type, appointment.clinician?.specialty].filter(Boolean).join(" · ") ||
      "Appointment",
    line: [formatDateCommaTime(new Date(appointment.at)), appointment.facility]
      .filter(Boolean)
      .join(" · "),
    status: "booked",
    facility: appointment.facility,
    visitId: null,
  }));
  const past = visits.map((visit): VisitRow => {
    const detail = detailFor(details, visit.id);
    return {
      id: `visit-${visit.id}`,
      when: "past",
      type: detail?.type ?? null,
      title: visitTitle(visit, detail),
      line: visitLine(visit, detail),
      status: visitStatus(visit, detail),
      facility: visit.facility,
      visitId: visit.id,
    };
  });
  return [...upcoming, ...past];
}

/** The rows a chip shows: all of them, or one type (a lab visit counts only under "All"). */
export function filterVisits(rows: VisitRow[], filter: VisitFilter, facility: string | null) {
  return rows.filter(
    (row) =>
      (filter === "all" || row.type === filter) && (facility === null || row.facility === facility),
  );
}

export function detailFor(details: VisitDetail[], visitId: string) {
  return details.find((detail) => detail.visitId === visitId) ?? null;
}

/** A lab test's headline value: the first one outside range, else the first. */
export function labHeadline(result: LabResult | null) {
  const value = result?.values.find((entry) => entry.flag !== "normal") ?? result?.values[0];
  if (!value) return null;
  return {
    line: [value.name, value.value, value.unit].filter(Boolean).join(" "),
    flag: value.flag,
  };
}

export function labResultFor(results: LabResult[], visitId: string, test: string) {
  return results.find((result) => result.visitId === visitId && result.test === test) ?? null;
}

/** The drug record for a medicine named on a visit ("Amlodipine 10 mg"), if there is one. */
export function drugNamed(drugs: DrugRecord[], name: string) {
  const wanted = name.trim().toLowerCase();
  return drugs.find((drug) => drug.name.toLowerCase() === wanted) ?? null;
}

/** How often a medicine is taken, from its "Tablet · Oral · Once daily" line, in lower case. */
export function frequencyOfDrug(drug: DrugRecord | null) {
  const parts = drug?.how.split(" · ") ?? [];
  // The line is form · route · frequency; with fewer parts the frequency may be missing.
  return parts.length === 3 ? (parts[2]?.toLowerCase() ?? null) : null;
}
