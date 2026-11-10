import { describe, expect, it } from "vitest";
import {
  addMonths,
  formatWeekRange,
  monthGrid,
  parseCalendarDate,
  rangeFor,
  slotsFor,
  slotTime,
  step,
} from "@/features/receptionist/lib/calendar";

// Friday 9 October 2026.
const friday = new Date(2026, 9, 9, 14, 20);

describe("rangeFor", () => {
  it("covers the day, the Sunday-to-Saturday week, or the month", () => {
    expect(rangeFor("day", friday)).toEqual({
      from: new Date(2026, 9, 9),
      to: new Date(2026, 9, 10),
    });
    expect(rangeFor("week", friday)).toEqual({
      from: new Date(2026, 9, 4),
      to: new Date(2026, 9, 11),
    });
    expect(rangeFor("month", friday)).toEqual({
      from: new Date(2026, 9, 1),
      to: new Date(2026, 10, 1),
    });
    expect(rangeFor("list", friday)).toEqual(rangeFor("month", friday));
  });
});

describe("step", () => {
  it("moves by the view's span", () => {
    expect(step("day", friday, -1)).toEqual(new Date(2026, 9, 8));
    expect(step("week", friday, 1)).toEqual(new Date(2026, 9, 16));
    expect(step("month", friday, 1)).toEqual(new Date(2026, 10, 9));
  });
});

describe("addMonths", () => {
  it("stays inside shorter months", () => {
    expect(addMonths(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 28));
    expect(addMonths(new Date(2026, 2, 31), -1)).toEqual(new Date(2026, 1, 28));
  });
});

describe("monthGrid", () => {
  it("fills whole weeks from the Sunday before the 1st", () => {
    const days = monthGrid(friday);
    expect(days).toHaveLength(35);
    expect(days[0]).toEqual(new Date(2026, 8, 27));
    expect(days.at(-1)).toEqual(new Date(2026, 9, 31));
  });
});

describe("slotsFor", () => {
  it("runs from 08:00 to 17:30 every half hour", () => {
    const slots = slotsFor([]);
    expect(slots[0]).toBe(8 * 60);
    expect(slots.at(-1)).toBe(17 * 60 + 30);
    expect(slots).toHaveLength(20);
  });

  it("stretches to take in earlier or later appointments", () => {
    const slots = slotsFor([new Date(2026, 9, 9, 7, 10), new Date(2026, 9, 9, 19, 45)]);
    expect(slots[0]).toBe(7 * 60);
    expect(slots.at(-1)).toBe(19 * 60 + 30);
  });
});

describe("slotTime", () => {
  it("formats minutes since midnight as HH:MM", () => {
    expect(slotTime(8 * 60 + 30)).toBe("08:30");
    expect(slotTime(14 * 60)).toBe("14:00");
  });
});

describe("parseCalendarDate", () => {
  it("reads real days and falls back to today", () => {
    expect(parseCalendarDate("2026-10-09", friday)).toEqual(new Date(2026, 9, 9));
    expect(parseCalendarDate("2026-02-31", friday)).toEqual(new Date(2026, 9, 9));
    expect(parseCalendarDate(undefined, friday)).toEqual(new Date(2026, 9, 9));
  });
});

describe("formatWeekRange", () => {
  it("names the month once when it can", () => {
    expect(formatWeekRange(new Date(2026, 9, 4))).toBe("4 – 10 October 2026");
    expect(formatWeekRange(new Date(2026, 8, 27))).toBe("27 September – 3 October 2026");
    expect(formatWeekRange(new Date(2026, 11, 27))).toBe("27 December 2026 – 2 January 2027");
  });
});
