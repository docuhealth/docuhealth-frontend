import nigeriaLgasData from "@/lib/nigeria-lgas.json";
import nigeriaStatesData from "@/lib/nigeria-states.json";

export const DEFAULT_COUNTRY = "Nigeria";

export const NIGERIA_STATES: readonly string[] = nigeriaStatesData;

const lgasByState: Record<string, readonly string[]> = nigeriaLgasData;

/**
 * Returns the LGAs/cities for a given Nigerian state name (case-insensitive).
 */
export function getLgasForState(stateName: string): readonly string[] {
  const trimmed = stateName.trim();
  if (!trimmed) return [];

  if (lgasByState[trimmed]) {
    return lgasByState[trimmed];
  }

  const lower = trimmed.toLowerCase();
  if (lower === "fct" || lower === "abuja") {
    return lgasByState["Federal Capital Territory"] ?? [];
  }

  const matchedKey = Object.keys(lgasByState).find((key) => key.toLowerCase() === lower);
  return matchedKey ? (lgasByState[matchedKey] ?? []) : [];
}
