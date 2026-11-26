import { describe, expect, it } from "vitest";
import type { Appointment, CheckIn, VisitSummary } from "@/features/patient/api/schemas";
import { facilityInitials, facilityViews } from "@/features/patient/lib/facilities";

const now = new Date("2026-10-25T12:00:00");

const visit = (id: string, at: string, facility: string, orders = 0): VisitSummary => ({
  id,
  at,
  complaint: null,
  diagnosis: null,
  facility,
  clinician: null,
  vitals: null,
  labTests: Array.from({ length: orders }, (_, index) => ({ name: `Test ${index}`, status: null })),
  scans: [],
  drugs: [],
  note: null,
});

const checkIn = (at: string, facility: string): CheckIn => ({
  id: at,
  at,
  facility,
  open: false,
  closedAt: null,
});

const booking: Appointment = {
  id: "a1",
  status: "confirmed",
  at: "2026-11-02T10:00:00",
  type: null,
  note: null,
  cancellationReason: null,
  rescheduleReason: null,
  lastVisited: null,
  clinician: null,
  facility: "Reddington Hospital",
  facilityId: "hosp-red",
};

describe("facilityViews", () => {
  it("lists each facility with its last visit and records, most recent first", () => {
    const views = facilityViews(
      [
        visit("2", "2026-10-12T10:00:00", "ABC Hospital", 2),
        visit("1", "2025-01-10T10:00:00", "ABC Hospital"),
        visit("3", "2026-08-20T10:00:00", "LUTH"),
      ],
      [booking],
      [checkIn("2026-10-20T09:00:00", "LUTH")],
      [{ name: "LUTH", location: "Idi-Araba, Lagos", photoUrl: null }],
      now,
    );
    expect(views).toEqual([
      {
        name: "LUTH",
        location: "Idi-Araba, Lagos",
        photoUrl: null,
        lastVisit: "2026-10-20T09:00:00",
        records: 1,
      },
      {
        name: "ABC Hospital",
        location: null,
        photoUrl: null,
        lastVisit: "2026-10-12T10:00:00",
        records: 4,
      },
      // Only booked: no visit yet.
      { name: "Reddington Hospital", location: null, photoUrl: null, lastVisit: null, records: 0 },
    ]);
  });

  it("is empty with nowhere on record", () => {
    expect(facilityViews([], [], [], [], now)).toEqual([]);
  });
});

describe("facilityInitials", () => {
  it("takes the first and last words' letters, or a one-word name's first two", () => {
    expect(facilityInitials("ABC Hospital")).toBe("AH");
    expect(facilityInitials("LUTH")).toBe("LU");
  });
});
