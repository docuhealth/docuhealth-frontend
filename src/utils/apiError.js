/**
 * DRF validation errors come back keyed by field — e.g.
 * `{ patient: ["Object with hin=... does not exist."] }` or nested like
 * `{ items: [{ test: ["Object with sqid=... does not exist."] }] }` —
 * rather than as a flat `{ message: "..." }`. Callers that only check
 * `err.response?.data?.message` almost always miss the real reason a
 * request failed and fall back to a generic, unhelpful string instead.
 *
 * This walks whatever shape the API returned (string / `message` /
 * `detail` / field-keyed validation errors, nested any number of levels)
 * and surfaces the first human-readable message it finds.
 */
export const extractApiErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.message === "string") return data.message;
  if (typeof data.detail === "string") return data.detail;

  const firstMessage = (value) => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = firstMessage(item);
        if (found) return found;
      }
      return null;
    }
    if (value && typeof value === "object") {
      for (const key of Object.keys(value)) {
        const found = firstMessage(value[key]);
        if (found) return found;
      }
    }
    return null;
  };

  return firstMessage(data) || fallback;
};
