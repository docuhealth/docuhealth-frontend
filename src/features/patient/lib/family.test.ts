import { describe, expect, it } from "vitest";
import type { ProxyGrant } from "@/features/patient/api/family";
import {
  NO_END_DAYS,
  accessLine,
  ageShort,
  ageWords,
  durationHint,
  familySubtitle,
  grantLine,
  liveGrants,
  percentileLabel,
  powerSummary,
  pronoun,
  requestExpiry,
} from "@/features/patient/lib/family";

const now = new Date("2026-11-26T10:00:00Z");
const person = {
  hin: "1",
  firstName: "Folake",
  name: "Folake Adeyemi",
  gender: "female" as const,
  dob: "1990-01-01",
};
const grant = (over: Partial<ProxyGrant>): ProxyGrant => ({
  id: "g",
  patient: person,
  proxy: person,
  grantedBy: person,
  relationship: "Spouse",
  powers: ["pay", "view", "book"],
  durationDays: 60,
  status: "pending",
  createdAt: "2026-11-25T10:00:00Z",
  acceptedAt: null,
  endsAt: null,
  ...over,
});

describe("family", () => {
  it("summarises powers in the API's order", () => {
    expect(powerSummary(["pay", "view", "book"])).toBe("View, Book, Pay");
    expect(grantLine(grant({}))).toBe("Spouse · View, Book, Pay");
  });

  it("keeps pending requests under 3 days old and accepted grants that haven't ended", () => {
    const grants = [
      grant({ id: "fresh" }),
      grant({ id: "stale", createdAt: "2026-11-20T10:00:00Z" }),
      grant({ id: "on", status: "accepted", endsAt: "2027-01-01T00:00:00Z" }),
      grant({ id: "over", status: "accepted", endsAt: "2026-11-01T00:00:00Z" }),
      grant({ id: "declined", status: "declined" }),
      grant({ id: "ended", status: "ended" }),
    ];
    expect(liveGrants(grants, now).map((each) => each.id)).toEqual(["fresh", "on"]);
  });

  it("says when a request expires and access ends", () => {
    expect(requestExpiry(grant({}), now)).toBe("Request expires in 2 days");
    expect(requestExpiry(grant({ createdAt: "2026-11-23T11:00:00Z" }), now)).toBe(
      "Request expires in 1 day",
    );
    expect(accessLine(grant({ durationDays: 30 }), now)).toBe("Access until 26 Dec 2026");
    expect(accessLine(grant({ endsAt: "2027-05-01T10:00:00Z" }), now)).toBe(
      "Access until 1 May 2027",
    );
    expect(accessLine(grant({ durationDays: NO_END_DAYS }), now)).toBe("No end date");
    expect(durationHint(30, now)).toBe("Access ends 26 Dec 2026. We’ll remind you before then.");
    expect(durationHint(NO_END_DAYS, now)).toBe("Access lasts until you end it.");
  });

  it("words ages for children and babies", () => {
    expect(ageWords("2020-06-01", now)).toBe("6 years");
    expect(ageShort("2020-06-01", now)).toBe("Age 6");
    expect(ageShort("2026-03-10", now)).toBe("8 months");
  });

  it("counts dependents and proxies for the subtitle", () => {
    expect(familySubtitle(0, [])).toBe("No one added yet");
    expect(familySubtitle(1, [])).toBe("1 dependent");
    expect(familySubtitle(1, [grant({})])).toBe("1 dependent · 1 proxy pending");
    expect(familySubtitle(2, [grant({ status: "accepted" })])).toBe("2 dependents · 1 proxy");
  });

  it("picks pronouns and percentile suffixes", () => {
    expect(pronoun("female")).toBe("her");
    expect(pronoun("male")).toBe("him");
    expect(pronoun("unknown")).toBe("them");
    expect(percentileLabel(50)).toBe("50th percentile");
    expect(percentileLabel(91)).toBe("91st percentile");
    expect(percentileLabel(12)).toBe("12th percentile");
  });
});
