import { Country, State, City } from "country-state-city";
import type { ICountry, IState, ICity } from "country-state-city";
import nigeriaStatesData from "../data/nigeria_states.json";
import nigeriaLgasData from "../data/nigeria_lgas.json";

export interface LocationOption {
  name: string;
  isoCode?: string;
  [key: string]: any;
}

const nigeriaStates: string[] = nigeriaStatesData as string[];
const nigeriaLgas: Record<string, string[]> = nigeriaLgasData as Record<string, string[]>;

/**
 * Checks if the selected country is Nigeria by name or ISO code.
 */
export const isNigeria = (countryName?: string, countryCode?: string): boolean => {
  const name = (countryName || "").trim().toLowerCase();
  const code = (countryCode || "").trim().toUpperCase();
  return name === "nigeria" || code === "ng" || code === "nga";
};

/**
 * Returns all countries from country-state-city.
 */
export const getAllCountries = (): ICountry[] => {
  return Country.getAllCountries();
};

/**
 * Returns states for a country. If Nigeria, returns the 36 states + FCT.
 * Otherwise returns states from country-state-city.
 */
export const getStatesForCountry = (
  countryName?: string,
  countryIsoCode?: string
): LocationOption[] => {
  if (isNigeria(countryName, countryIsoCode)) {
    return nigeriaStates.map((state) => ({
      name: state,
      isoCode: state,
    }));
  }

  if (!countryIsoCode) {
    if (countryName) {
      const match = Country.getAllCountries().find(
        (c) => c.name.toLowerCase() === countryName.trim().toLowerCase()
      );
      if (match) {
        return State.getStatesOfCountry(match.isoCode);
      }
    }
    return [];
  }

  return State.getStatesOfCountry(countryIsoCode);
};

/**
 * Returns LGAs if country is Nigeria, or Cities if international.
 */
export const getLgasOrCities = (
  countryName?: string,
  stateName?: string,
  countryIsoCode?: string,
  stateIsoCode?: string
): LocationOption[] => {
  if (isNigeria(countryName, countryIsoCode)) {
    if (!stateName) return [];

    // Match state name (case-insensitive fallback)
    const exactMatch = nigeriaLgas[stateName];
    if (exactMatch) {
      return exactMatch.map((lga) => ({
        name: lga,
        isoCode: lga,
      }));
    }

    const trimmedState = stateName.trim().toLowerCase();
    if (trimmedState === "fct" || trimmedState === "abuja") {
      const fctLgas = nigeriaLgas["Federal Capital Territory"] || [];
      return fctLgas.map((lga) => ({
        name: lga,
        isoCode: lga,
      }));
    }

    const stateKey = Object.keys(nigeriaLgas).find(
      (k) => k.toLowerCase() === trimmedState
    );
    if (stateKey && nigeriaLgas[stateKey]) {
      return nigeriaLgas[stateKey].map((lga) => ({
        name: lga,
        isoCode: lga,
      }));
    }

    return [];
  }

  // International: retrieve cities
  let cCode = countryIsoCode;
  if (!cCode && countryName) {
    const cMatch = Country.getAllCountries().find(
      (c) => c.name.toLowerCase() === countryName.trim().toLowerCase()
    );
    if (cMatch) cCode = cMatch.isoCode;
  }

  let sCode = stateIsoCode;
  if (!sCode && stateName && cCode) {
    const sMatch = State.getStatesOfCountry(cCode).find(
      (s) => s.name.toLowerCase() === stateName.trim().toLowerCase()
    );
    if (sMatch) sCode = sMatch.isoCode;
  }

  if (!cCode || !sCode) return [];
  return City.getCitiesOfState(cCode, sCode);
};

