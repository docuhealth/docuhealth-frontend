/**
 * normalizationUtils.js
 * Utility functions for normalizing data before sending to API.
 */

// Keys that should be automatically lowercased
const EMAIL_KEYS = [
  "email",
  "new_email",
  "contact_email",
  "child_email",
  "official_email",
  "hospital_email",
  "staff_email",
];

/**
 * Recursively traverses an object or array and lowercases any string values
 * associated with keys identified as email fields.
 * 
 * @param {any} data - The data to normalize.
 * @returns {any} - The normalized data.
 */
export const normalizeEmailFields = (data) => {
  if (data === null || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(normalizeEmailFields);
  }

  const normalized = {};
  for (const [key, value] of Object.entries(data)) {
    if (EMAIL_KEYS.includes(key.toLowerCase()) && typeof value === "string") {
      normalized[key] = value.trim().toLowerCase();
    } else if (typeof value === "object") {
      normalized[key] = normalizeEmailFields(value);
    } else {
      normalized[key] = value;
    }
  }

  return normalized;
};
