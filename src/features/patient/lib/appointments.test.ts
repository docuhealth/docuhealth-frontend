import { describe, expect, it } from "vitest";
import type { AppointmentDetail } from "@/features/patient/api/pending-appointments";
import type { Appointment } from "@/features/patient/api/schemas";
import {
  appointmentLine,
  appointmentTitle,
  dateBlock,
  isOpen,
  matchesSearch,
  mergeAppointments,
  remindersSentence,
  splitAppointments,
  splitSlots,
  startOfWeek,
  visitLine,
  weekDays,
  weekMonth,
  whenLabel,
} from "@/features/patient/lib/appointments";

const now = new Date(2026, 9, 18, 8, 0);
const at = (day: number, hour = 10) => new Date(2026, 9, day, hour).toISOString();

const okafor: Appointment = {
  id: "a",
  status: "confirmed",
  at: at(18),
  type: "Follow-up",
  clinician: { name: "Dr. Adaeze Okafor", specialty: "Internal Medicine" },
  facility: "ABC Hospital",
};
const detail = (appointmentId: string, fields: Partial<AppointmentDetail>): AppointmentDetail => ({
  appointmentId,
  status: null,
  at: null,
  department: null,
  reason: null,
  clinicianRole: null,
  clinicianPhoto: null,
  facilityArea: null,
  facilityAddress: null,
  facilityPhoto: null,
  clinic: null,
  minutes: null,
  fee: null,
  reminders: [],
  cancellation: null,
  ...fields,
});

const [view] = mergeAppointments([okafor], {
  bookings: [],
  details: [detail("a", { facilityArea: "Ikeja", department: "Internal Medicine" })],
});
const eye = mergeAppointments([], {
  bookings: [
    {
      id: "b",
      status: "pending",
      at: at(22, 14),
      type: "Follow-up",
      clinician: null,
      facility: "Reddington Hospital",
    },
  ],
  details: [detail("b", { department: "Ophthalmology", reason: "Eye check" })],
})[0]!;

describe("mergeAppointments", () => {
  it("adds the extras and the patient's own changes, soonest first", () => {
    const list = mergeAppointments(
      [
        { ...okafor, at: at(25) },
        { ...okafor, id: "c", at: at(20) },
      ],
      {
        bookings: [
          { ...okafor, id: "c" },
          { ...okafor, id: "d", at: at(19) },
        ],
        details: [detail("a", { status: "cancelled", at: at(30) })],
      },
    );
    expect(list.map((each) => each.id)).toEqual(["d", "c", "a"]);
    expect(list[2]).toMatchObject({ status: "cancelled", at: at(30) });
  });

  it("takes an appointment with no status as pending", () => {
    expect(
      mergeAppointments([{ ...okafor, status: null }], { bookings: [], details: [] })[0]?.status,
    ).toBe("pending");
  });
});

describe("splitAppointments", () => {
  it("keeps today's as upcoming and puts cancelled and gone ones in past, latest first", () => {
    const list = mergeAppointments(
      [
        { ...okafor, id: "today", at: at(18, 7) },
        { ...okafor, id: "gone", at: at(10) },
        { ...okafor, id: "older", at: at(5) },
        { ...okafor, id: "cancelled", status: "cancelled", at: at(25) },
      ],
      { bookings: [], details: [] },
    );
    const { upcoming, past } = splitAppointments(list, now);
    expect(upcoming.map((each) => each.id)).toEqual(["today"]);
    expect(past.map((each) => each.id)).toEqual(["cancelled", "gone", "older"]);
    expect(isOpen(list[0]!, now)).toBe(false);
  });
});

describe("appointment lines", () => {
  it("names the clinician, or the clinic when no one is assigned", () => {
    expect(appointmentTitle(view!)).toBe("Dr. Adaeze Okafor");
    expect(appointmentLine(view!)).toBe("Internal Medicine · ABC Hospital, Ikeja");
    expect(visitLine(view!)).toBe("Follow-up · Internal Medicine");
    expect(appointmentTitle(eye)).toBe("Ophthalmology clinic");
    expect(appointmentLine(eye)).toBe("Eye check · Reddington Hospital");
    expect(visitLine(eye)).toBe("Follow-up · Ophthalmology clinic");
  });

  it("says when, near or far", () => {
    expect(whenLabel(at(18), now)).toBe("Today · 10:00 AM");
    expect(whenLabel(at(19), now)).toBe("Tomorrow · 10:00 AM");
    expect(whenLabel(at(22, 14), now)).toBe("Thu · 2:00 PM");
    expect(whenLabel(at(30), now)).toBe("30 Oct · 10:00 AM");
    expect(dateBlock(at(6))).toEqual({ month: "OCT", day: "6" });
  });

  it("puts the reminders in a sentence", () => {
    expect(remindersSentence([])).toBeNull();
    expect(
      remindersSentence([
        { before: "1 day before", channels: "Push and SMS" },
        { before: "2 hours before", channels: "Push" },
      ]),
    ).toBe("We’ll remind you 1 day before by push and SMS, and 2 hours before by push.");
  });

  it("finds by any of who, where and what", () => {
    expect(matchesSearch(eye, "eye reddington")).toBe(true);
    expect(matchesSearch(view!, "okafor")).toBe(true);
    expect(matchesSearch(view!, "luth")).toBe(false);
  });
});

describe("booking calendar", () => {
  it("lays out a week from Sunday and splits the times", () => {
    const start = startOfWeek(new Date(2026, 9, 6, 15));
    expect(start).toEqual(new Date(2026, 9, 4));
    expect(weekDays(start).map((day) => day.getDate())).toEqual([4, 5, 6, 7, 8, 9, 10]);
    expect(weekMonth(start)).toBe("October 2026");
    expect(splitSlots(["14:30", "09:00", "12:30", "11:30"])).toEqual({
      morning: ["09:00", "11:30"],
      afternoon: ["12:30", "14:30"],
    });
  });
});
