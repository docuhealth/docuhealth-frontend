/**
 * Nigerian mobile numbers, as people type them: 0 and ten digits, spaces and dashes allowed
 * (`0803 123 4567`). The API saves any common form as `+234…`, but only texts codes to Nigerian
 * numbers, so a number that will receive a code is checked here first.
 */
export function isNigerianMobile(value: string) {
  return /^0\d{10}$/.test(value.replace(/[\s-]/g, ""));
}

export const NIGERIAN_MOBILE_MESSAGE = "Enter a Nigerian phone number, e.g. 0803 123 4567";

/** Placeholder for a Nigerian number field. */
export const NIGERIAN_MOBILE_PLACEHOLDER = "0803 123 4567";
