import { describe, expect, it } from "vitest";
import type { Allergy } from "@/features/patient/api/pending";
import { allergyKindLine, allergyLine, splitAllergies } from "@/features/patient/lib/allergies";

const allergy = (id: string, severity: Allergy["severity"], active = true) =>
  ({
    id,
    name: id,
    kind: "food",
    reaction: "Swelling, trouble breathing",
    severity,
    active,
  }) as Allergy;

describe("allergies", () => {
  it("describes an allergy in a row and on its title card", () => {
    expect(allergyLine(allergy("Peanuts", "severe"))).toBe("Food · swelling, trouble breathing");
    expect(allergyKindLine({ ...allergy("Penicillin", "moderate"), kind: "medicine" })).toBe(
      "Medicine allergy",
    );
  });

  it("splits active from past, the most severe first", () => {
    const { active, past } = splitAllergies([
      allergy("Latex", "mild"),
      allergy("Old", "severe", false),
      allergy("Peanuts", "severe"),
      allergy("Penicillin", "moderate"),
    ]);
    expect(active.map((a) => a.id)).toEqual(["Peanuts", "Penicillin", "Latex"]);
    expect(past.map((a) => a.id)).toEqual(["Old"]);
  });
});
