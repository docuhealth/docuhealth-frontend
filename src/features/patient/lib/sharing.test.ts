import { describe, expect, it } from "vitest";
import type { Share, SharingPerson } from "@/features/patient/api/pending-sharing";
import {
  accessEventTitle,
  facilityLabel,
  formatAccessCode,
  formatExpiry,
  peopleAt,
  sharedItems,
  shareStatus,
  sharingFacilities,
  sortShares,
} from "@/features/patient/lib/sharing";

const now = new Date("2026-11-26T12:00:00Z");

const share = (id: string, fields: Partial<Share>): Share => ({
  id,
  recipient: { name: "Dr. Adaeze Okafor", role: null },
  facility: { name: "ABC Hospital", area: "Ikeja" },
  items: ["health_summary", "medications"],
  createdAt: "2026-11-01T10:00:00Z",
  expiresAt: "2026-12-02T10:00:00Z",
  stoppedAt: null,
  ...fields,
});

const person = (id: string, name: string, facility: string, role: string | null = null) =>
  ({ id, name, role, facility, facilityArea: null }) satisfies SharingPerson;

describe("shareStatus", () => {
  it("is active, ending soon within 3 days, and ended once stopped or past expiry", () => {
    expect(shareStatus(share("a", {}), now)).toBe("active");
    expect(shareStatus(share("b", { expiresAt: "2026-11-28T10:00:00Z" }), now)).toBe("expiring");
    expect(shareStatus(share("c", { expiresAt: "2026-11-20T10:00:00Z" }), now)).toBe("ended");
    expect(shareStatus(share("d", { stoppedAt: "2026-11-25T10:00:00Z" }), now)).toBe("ended");
  });
});

describe("sortShares", () => {
  it("puts running shares ending soonest first, and keeps ended ones apart", () => {
    const { running, ended } = sortShares(
      [
        share("later", {}),
        share("stopped", { stoppedAt: "2026-11-25T10:00:00Z" }),
        share("soon", { expiresAt: "2026-11-27T10:00:00Z" }),
      ],
      now,
    );
    expect(running.map((each) => each.id)).toEqual(["soon", "later"]);
    expect(ended.map((each) => each.id)).toEqual(["stopped"]);
  });
});

describe("labels", () => {
  it("names what a share holds, shortly", () => {
    expect(sharedItems(["health_summary", "medications"])).toBe("Health summary, Medications");
    expect(sharedItems(["lab_results", "allergies"])).toBe("Lab results, Allergies");
  });

  it("names the facility with its area when known", () => {
    expect(facilityLabel({ name: "ABC Hospital", area: "Ikeja" })).toBe("ABC Hospital, Ikeja");
    expect(facilityLabel({ name: "Reddington Hospital", area: null })).toBe("Reddington Hospital");
  });

  it("splits the access code and writes the expiry in full", () => {
    expect(formatAccessCode("7K492Q")).toBe("7K4 - 92Q");
    expect(formatExpiry("2026-10-29T10:00:00Z")).toBe("29 October 2026");
  });

  it("says who viewed what", () => {
    expect(
      accessEventTitle({
        id: "1",
        viewer: { name: "Dr. Kemi Bello", role: null },
        facility: "Reddington Hospital",
        item: "lab_results",
        at: "2026-11-26T10:00:00Z",
      }),
    ).toBe("Dr. Kemi Bello viewed Lab results");
  });
});

describe("choosing who to share with", () => {
  const people = [
    person("1", "Dr. Adaeze Okafor", "ABC Hospital", "Consultant Physician"),
    person("2", "Dr. John Doe", "ABC Hospital", "Cardiologist"),
    person("3", "Dr. Kemi Bello", "Reddington Hospital"),
  ];

  it("offers the patient's facilities first, then any others with people", () => {
    expect(sharingFacilities(["LUTH", "ABC Hospital"], people)).toEqual([
      "LUTH",
      "ABC Hospital",
      "Reddington Hospital",
    ]);
  });

  it("finds people at the facility by name or role", () => {
    expect(peopleAt(people, "ABC Hospital", "").map((each) => each.id)).toEqual(["1", "2"]);
    expect(peopleAt(people, "ABC Hospital", "cardio").map((each) => each.id)).toEqual(["2"]);
    expect(peopleAt(people, "ABC Hospital", "bello")).toEqual([]);
  });
});
