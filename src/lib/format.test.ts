import { describe, expect, it } from "vitest";
import {
  ageOn,
  formatClockTime,
  formatShortDay,
  firstName,
  formatAppointment,
  formatDate,
  formatDateWithComma,
  formatDayMonthTime,
  formatDayAndTime,
  formatDayOfStay,
  formatDuration,
  formatHin,
  formatLongDate,
  formatTimeAgo,
  greetingFor,
  initials,
  maskHin,
} from "@/lib/format";

describe("greetingFor", () => {
  it.each([
    [0, "Good morning"],
    [11, "Good morning"],
    [12, "Good afternoon"],
    [16, "Good afternoon"],
    [17, "Good evening"],
    [23, "Good evening"],
  ])("at %i:00 says %s", (hour, greeting) => {
    expect(greetingFor(new Date(2026, 9, 14, hour))).toBe(greeting);
  });
});

describe("formatLongDate", () => {
  it("names the weekday, then the day, month and year", () => {
    expect(formatLongDate(new Date(2026, 9, 14))).toBe("Wednesday, 14 October 2026");
  });
});

describe("initials", () => {
  it.each([
    ["Tunde Adeyemi", "TA"],
    ["Chioma Ada Nwosu", "CN"],
    ["emeka", "E"],
    ["  ", ""],
  ])("%s → %s", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});

describe("formatTimeAgo", () => {
  const now = new Date(2026, 9, 14, 12);
  const ago = (ms: number) => new Date(now.getTime() - ms);
  const minute = 60_000;
  const day = 24 * 60 * minute;

  it.each([
    [0, "just now"],
    [5 * minute, "5 minutes ago"],
    [3 * 60 * minute, "3 hours ago"],
    [1 * day, "1 day ago"],
    [18 * day, "18 days ago"],
    [60 * day, "2 months ago"],
    [335 * day, "11 months ago"],
    [400 * day, "1 year ago"],
  ])("%i ms ago → %s", (ms, expected) => {
    expect(formatTimeAgo(ago(ms), now)).toBe(expected);
  });

  it("treats a future date as just now", () => {
    expect(formatTimeAgo(new Date(now.getTime() + day), now)).toBe("just now");
  });
});

describe("formatDate", () => {
  it("uses a two-digit day and a short month", () => {
    expect(formatDate(new Date(2026, 9, 2))).toBe("02 Oct 2026");
  });
});

describe("ageOn", () => {
  const birth = new Date(1984, 2, 14);

  it("counts the birthday once it has come", () => {
    expect(ageOn(birth, new Date(2026, 2, 14))).toBe(42);
    expect(ageOn(birth, new Date(2026, 9, 1))).toBe(42);
  });

  it("doesn't count it the day before", () => {
    expect(ageOn(birth, new Date(2026, 2, 13))).toBe(41);
  });
});

describe("formatAppointment", () => {
  it("gives the day, then the time", () => {
    expect(formatAppointment(new Date(2026, 9, 22, 14, 30))).toBe("22 Oct, 2026; 2:30 PM");
  });
});

describe("firstName", () => {
  it.each([
    ["Emeka Uche", "Emeka"],
    ["Dr. Hauwa Garba", "Hauwa"],
    ["dr hauwa garba", "hauwa"],
    ["Prof. Ada", "Ada"],
  ])("%s → %s", (name, expected) => {
    expect(firstName(name)).toBe(expected);
  });
});

describe("formatDayAndTime", () => {
  const now = new Date(2026, 9, 18, 20, 0);

  it.each([
    [new Date(2026, 9, 18, 18, 30), "Today", "6:30 PM"],
    [new Date(2026, 9, 17, 16, 15), "Yesterday", "4:15 PM"],
    [new Date(2026, 9, 16, 7, 0), "16 Oct 2026", "7:00 AM"],
  ])("shows %s as %s, %s", (date, day, time) => {
    expect(formatDayAndTime(date, now)).toEqual({ day, time });
  });
});

describe("formatDayOfStay", () => {
  const now = new Date(2026, 9, 18, 20, 0);

  it.each([
    [new Date(2026, 9, 18, 18, 30), "Day 1"],
    [new Date(2026, 9, 17, 16, 15), "Day 2"],
    [new Date(2026, 9, 16, 21, 0), "Day 2"],
    [new Date(2026, 9, 15, 21, 0), "Day 3"],
  ])("counts a stay since %s as %s", (since, label) => {
    expect(formatDayOfStay(since, now)).toBe(label);
  });
});

describe("formatDuration", () => {
  it.each([
    [10, "10 min"],
    [59.4, "59 min"],
    [60, "1 hour"],
    [150, "3 hours"],
    [23.6 * 60, "1 Day"],
    [4.47 * 24 * 60, "4 Days"],
  ])("shows %f minutes as %s", (minutes, label) => {
    expect(formatDuration(minutes)).toBe(label);
  });
});

describe("maskHin", () => {
  it("keeps the first five characters", () => {
    expect(maskHin("546921837")).toBe("54692 ••••");
  });
});

describe("formatClockTime", () => {
  it("pads the hour to two digits", () => {
    expect(formatClockTime(new Date(2026, 10, 3, 9, 5))).toBe("09:05 AM");
    expect(formatClockTime(new Date(2026, 10, 3, 14, 30))).toBe("02:30 PM");
  });
});

describe("formatShortDay", () => {
  it("names the weekday, day and month", () => {
    expect(formatShortDay(new Date(2026, 10, 12))).toBe("Thu 12 Nov");
  });
});

describe("formatHin", () => {
  it.each([
    ["", ""],
    ["123", "123"],
    ["1234", "123-4"],
    ["12334567890", "123-345-678-90"],
    ["123-345-678-90", "123-345-678-90"],
    ["12a3 3456789012345", "123-345-678-90"],
  ])("%j → %j", (input, expected) => {
    expect(formatHin(input)).toBe(expected);
  });
});

describe("formatDateWithComma", () => {
  it("pads the day and puts a comma before the year", () => {
    expect(formatDateWithComma(new Date(2026, 9, 8, 9, 42))).toBe("08 Oct, 2026");
  });
});

describe("formatDayMonthTime", () => {
  it("gives the day, month and time", () => {
    expect(formatDayMonthTime(new Date(2026, 9, 8, 9, 42))).toBe("08 Oct, 9:42 AM");
  });
});
