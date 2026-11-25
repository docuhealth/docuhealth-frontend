import { describe, expect, it } from "vitest";
import type { Vaccine, VaccineDose } from "@/features/patient/api/pending-immunizations";
import {
  doseLine,
  doseTitle,
  dueIn,
  dueLine,
  lastDoseLine,
  protectionLine,
  sourcesLine,
  splitVaccines,
  vaccineLine,
  vaccineStatus,
} from "@/features/patient/lib/immunizations";

const now = new Date("2026-11-25T10:00:00");

const dose = (fields: Partial<VaccineDose>): VaccineDose => ({
  kind: "dose",
  number: null,
  count: 1,
  at: null,
  brand: null,
  facility: null,
  givenBy: null,
  batch: null,
  childhood: false,
  fromCard: false,
  ...fields,
});

const vaccine = (fields: Partial<Vaccine>): Vaccine => ({
  id: "v",
  name: "Vaccine",
  facility: null,
  updatedAt: "2024-06-14T10:00:00",
  dosesTotal: null,
  lifelong: false,
  due: null,
  protectsAgainst: null,
  doses: [],
  ...fields,
});

const hepatitisB = vaccine({
  id: "hepatitis-b",
  name: "Hepatitis B",
  dosesTotal: 3,
  doses: [3, 2, 1].map((number) =>
    dose({
      number,
      at: `2024-0${number * 2}-14T10:00:00`,
      brand: "Engerix-B 20 mcg",
      facility: "ABC Hospital",
    }),
  ),
});
const covid = vaccine({
  id: "covid",
  doses: [
    dose({ kind: "booster", at: "2022-11-03T10:00:00", facility: "LUTH" }),
    dose({ number: 2, at: "2021-10-01T10:00:00", facility: "LUTH" }),
    dose({ number: 1, at: "2021-07-20T10:00:00", facility: "LUTH" }),
  ],
});
const yellowFever = vaccine({
  lifelong: true,
  doses: [dose({ at: "2019-05-20T10:00:00", facility: "Garki Hospital" })],
});
const mmr = vaccine({
  doses: [dose({ kind: "series", count: 2, childhood: true, fromCard: true })],
});
const td = vaccine({
  id: "td",
  due: { at: "2027-02-03T10:00:00", kind: "booster", reminder: "2 weeks before" },
  doses: [
    dose({ kind: "booster", at: "2017-01-12T10:00:00", facility: "LUTH" }),
    dose({ kind: "series", count: 3, childhood: true, fromCard: true }),
  ],
});
const typhoid = vaccine({
  doses: [dose({ at: "2025-03-02T10:00:00", facility: "Reddington Hospital" })],
});

describe("immunizations", () => {
  it("splits what's due from what's completed", () => {
    const { due, completed } = splitVaccines([hepatitisB, td, mmr]);
    expect(due.map((entry) => entry.id)).toEqual(["td"]);
    expect(completed).toHaveLength(2);
  });

  it("sums up each completed vaccine in a line", () => {
    expect(vaccineLine(hepatitisB)).toBe("3 of 3 doses · Last 14 Jun 2024 · ABC Hospital");
    expect(vaccineLine(covid)).toBe("2 doses + booster · Last 3 Nov 2022 · LUTH");
    expect(vaccineLine(yellowFever)).toBe("1 dose · Lifelong · Garki Hospital");
    expect(vaccineLine(mmr)).toBe("2 doses · Childhood · From your vaccine card");
  });

  it("names the facilities the doses came from", () => {
    expect(sourcesLine([hepatitisB, covid, yellowFever, typhoid, mmr])).toBe(
      "From ABC Hospital, LUTH and 2 others",
    );
    expect(sourcesLine([covid])).toBe("From LUTH");
    expect(sourcesLine([mmr])).toBeNull();
  });

  it("says when a dose is due", () => {
    expect(dueIn("2027-02-03T10:00:00", now)).toBe("In 10 weeks");
    expect(dueIn("2026-11-30T10:00:00", now)).toBe("In 5 days");
    expect(dueIn("2027-06-01T10:00:00", now)).toBe("In 6 months");
    expect(dueIn("2026-11-01T10:00:00", now)).toBe("Overdue");
    expect(dueLine(td.due!)).toBe("Booster · due by 3 Feb 2027");
    expect(lastDoseLine(td)).toBe("Last booster 12 Jan 2017 · LUTH");
    expect(vaccineStatus(td, now)).toEqual({ tone: "warning", label: "Due soon" });
    expect(vaccineStatus(hepatitisB, now)).toEqual({ tone: "success", label: "Completed" });
  });

  it("describes protection and each dose", () => {
    expect(protectionLine(hepatitisB)).toBe("3 of 3 doses given");
    expect(protectionLine(yellowFever)).toBe("1 dose given · Lifelong");
    expect(doseTitle(hepatitisB.doses[0]!)).toBe("Dose 3 · 14 Jun 2024");
    expect(doseLine(hepatitisB.doses[0]!)).toBe("Engerix-B 20 mcg · ABC Hospital");
    expect(doseTitle(td.doses[1]!)).toBe("Primary series");
    expect(doseLine(td.doses[1]!)).toBe("3 doses · Childhood · From your vaccine card");
  });
});
