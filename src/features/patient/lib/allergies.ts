import type { Allergy } from "@/features/patient/api/pending";

const kinds: Record<Allergy["kind"], string> = {
  food: "Food",
  medicine: "Medicine",
  material: "Material",
  other: "Other",
};

const severities: Record<Allergy["severity"], string> = {
  severe: "Severe",
  moderate: "Moderate",
  mild: "Mild",
};

const order: Allergy["severity"][] = ["severe", "moderate", "mild"];

/** "Food", "Medicine" … */
const allergyKind = (allergy: Allergy) => kinds[allergy.kind];

/** "Severe", "Moderate", "Mild". */
export const severityLabel = (severity: Allergy["severity"]) => severities[severity];

/** The title card's line: "Medicine allergy". */
export const allergyKindLine = (allergy: Allergy) => `${allergyKind(allergy)} allergy`;

/** A row's line: "Food · swelling, trouble breathing". */
export function allergyLine(allergy: Allergy) {
  const reaction = allergy.reaction.charAt(0).toLowerCase() + allergy.reaction.slice(1);
  return reaction ? `${allergyKind(allergy)} · ${reaction}` : allergyKind(allergy);
}

/** Active and past allergies, the most severe first. */
export function splitAllergies(allergies: Allergy[]) {
  const sorted = allergies.toSorted(
    (a, b) => order.indexOf(a.severity) - order.indexOf(b.severity),
  );
  return {
    active: sorted.filter((allergy) => allergy.active),
    past: sorted.filter((allergy) => !allergy.active),
  };
}
