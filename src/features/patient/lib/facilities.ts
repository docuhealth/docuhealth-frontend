import type { FacilityProfile } from "@/features/patient/api/pending-health";
import type { Appointment, CheckIn, VisitSummary } from "@/features/patient/api/schemas";
import { facilitiesOf } from "@/features/patient/lib/records";
import { initials } from "@/lib/format";

// The Healthcare facilities screen: every facility the patient has been seen at, checked in at or
// booked with, with their last visit and how many records it holds. TODO(api): where a facility
// is and its photo come from the pending facility profiles (api/pending-health.ts).

export type FacilityView = {
  name: string;
  location: string | null;
  photoUrl: string | null;
  /** The latest visit or check-in there, if any has happened yet. */
  lastVisit: string | null;
  /** Visit summaries there, and the lab tests, scans and prescriptions on them. */
  records: number;
};

/** Each facility with its last visit and record count, the most recently visited first. */
export function facilityViews(
  visits: VisitSummary[],
  appointments: Appointment[],
  checkIns: CheckIn[],
  profiles: FacilityProfile[],
  now = new Date(),
): FacilityView[] {
  const names = [
    ...new Set([
      ...facilitiesOf(visits, appointments),
      ...checkIns.map((checkIn) => checkIn.facility).filter((name) => name != null),
    ]),
  ];
  return names
    .map((name): FacilityView => {
      const seen = visits.filter((visit) => visit.facility === name);
      const visited = [
        ...seen.map((visit) => visit.at),
        ...checkIns.filter((checkIn) => checkIn.facility === name).map((checkIn) => checkIn.at),
      ]
        .filter((at) => new Date(at) <= now)
        .sort((a, b) => b.localeCompare(a));
      const profile = profiles.find((entry) => entry.name === name);
      return {
        name,
        location: profile?.location ?? null,
        photoUrl: profile?.photoUrl ?? null,
        lastVisit: visited[0] ?? null,
        records: seen.reduce(
          (total, visit) =>
            total + 1 + visit.labTests.length + visit.scans.length + visit.drugs.length,
          0,
        ),
      };
    })
    .sort((a, b) => (b.lastVisit ?? "").localeCompare(a.lastVisit ?? ""));
}

/** A facility's tile when it has no photo: "LUTH" → "LU", "ABC Hospital" → "AH". */
export function facilityInitials(name: string) {
  const word = name.trim();
  return /\s/.test(word) ? initials(word) : word.slice(0, 2).toUpperCase();
}
