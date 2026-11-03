import { describe, expect, it } from "vitest";
import {
  dateText,
  fromIsoDate,
  maskDate,
  maskTime,
  parseDate,
  parseTime,
  toIsoDate,
} from "@/lib/date-input";

describe("date text", () => {
  it("groups typed digits as DD/MM/YYYY, dropping anything else", () => {
    expect(maskDate("14")).toBe("14");
    expect(maskDate("141")).toBe("14/1");
    expect(maskDate("14112026")).toBe("14/11/2026");
    expect(maskDate("14/11/2026999")).toBe("14/11/2026");
    expect(maskDate("ab14-11")).toBe("14/11");
  });

  it("parses whole, real dates only", () => {
    expect(parseDate("14/11/2026")).toBe("2026-11-14");
    expect(parseDate("29/02/2028")).toBe("2028-02-29");
    expect(parseDate("29/02/2026")).toBe("");
    expect(parseDate("31/04/2026")).toBe("");
    expect(parseDate("00/11/2026")).toBe("");
    expect(parseDate("14/11/202")).toBe("");
  });

  it("round-trips between the form value and the text", () => {
    expect(dateText("2026-11-04")).toBe("04/11/2026");
    expect(dateText("")).toBe("");
    expect(toIsoDate(fromIsoDate("2026-01-09"))).toBe("2026-01-09");
    expect(toIsoDate(new Date(2026, 10, 4, 23, 59))).toBe("2026-11-04");
  });
});

describe("time text", () => {
  it("groups typed digits as HH:MM", () => {
    expect(maskTime("1")).toBe("1");
    expect(maskTime("103")).toBe("10:3");
    expect(maskTime("10305")).toBe("10:30");
  });

  it("parses real 24-hour times only", () => {
    expect(parseTime("10:30")).toBe("10:30");
    expect(parseTime("23:59")).toBe("23:59");
    expect(parseTime("24:00")).toBe("");
    expect(parseTime("10:60")).toBe("");
    expect(parseTime("10:3")).toBe("");
  });
});
