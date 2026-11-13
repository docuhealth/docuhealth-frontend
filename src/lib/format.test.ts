import { describe, expect, it } from "vitest";
import {
  ageOn,
  formatClockTime,
  formatShortDay,
  formatShortDayTime,
  formatLongDateTime,
  formatDateDotTime,
  formatDateCommaTime,
  formatFileSize,
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
  formatShortTimeAgo,
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

describe("formatShortTimeAgo", () => {
  const now = new Date(2026, 9, 14, 12);
  const ago = (ms: number) => new Date(now.getTime() - ms);
  const minute = 60_000;
  const day = 24 * 60 * minute;

  it.each([
    [0, "just now"],
    [5 * minute, "5m ago"],
    [3 * 60 * minute, "3h ago"],
    [1 * day, "1d ago"],
    [6 * day, "6d ago"],
    [7 * day, "1w ago"],
    [15 * day, "2w ago"],
    [60 * day, "2mo ago"],
    [400 * day, "1y ago"],
  ])("%i ms ago reads %s", (ms, expected) => {
    expect(formatShortTimeAgo(ago(ms), now)).toBe(expected);
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

describe("formatShortDayTime", () => {
  it("gives the short day and the time", () => {
    expect(formatShortDayTime(new Date(2026, 9, 13, 14, 0))).toBe("Tue 13 Oct, 2:00 PM");
  });
});

describe("formatLongDateTime", () => {
  it("gives the long date and the clock time", () => {
    expect(formatLongDateTime(new Date(2026, 9, 9, 11, 0))).toBe(
      "Friday, 9 October 2026 · 11:00 AM",
    );
  });
});

describe("formatDateDotTime", () => {
  it("gives the date and the time, split by a dot", () => {
    expect(formatDateDotTime(new Date(2025, 11, 23, 15, 45))).toBe("23 Dec 2025 · 3:45 PM");
  });
});

describe("formatDateCommaTime", () => {
  it("gives the date and the time, split by a comma", () => {
    expect(formatDateCommaTime(new Date(2025, 6, 15, 12, 45))).toBe("15 Jul 2025, 12:45 PM");
  });
});

describe("formatFileSize", () => {
  it("gives megabytes from 100 KB up, and kilobytes below", () => {
    expect(formatFileSize(400_000)).toBe("0.4 MB");
    expect(formatFileSize(2_500_000)).toBe("2.5 MB");
    expect(formatFileSize(24_300_000)).toBe("24 MB");
    expect(formatFileSize(45_000)).toBe("45 KB");
  });
});
