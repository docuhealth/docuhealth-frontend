import { SubscriptionSummary } from "../types/patients/shared";

// Subscription statuses that mean the patient currently has live, paid-plan access.
// Mirrors the statuses SubscriptionPlans.tsx treats as "still subscribed".
export const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "non-renewing"];

/**
 * Derives whether a patient currently has an active subscription from their
 * profile's `subscription` summary (the source of truth returned by the API),
 * rather than any locally cached flag.
 *
 * The two endpoints that return a subscription summary disagree on shape:
 * `POST api/auth/login` includes a `status` string (e.g. "active"), while
 * `GET api/patients/dashboard` (what `usePatientProfile` uses on every page
 * load) omits `status` entirely and instead sends a plain `is_subscribed`
 * boolean. `is_subscribed` is checked first since it's what the dashboard
 * actually returns; `status` is a fallback for shapes that provide it.
 */
export function hasActiveSubscription(subscription?: SubscriptionSummary | null): boolean {
  if (!subscription) return false;
  if (typeof subscription.is_subscribed === "boolean") {
    return subscription.is_subscribed;
  }
  const status = subscription.status?.toLowerCase();
  if (!status) return false;
  return ACTIVE_SUBSCRIPTION_STATUSES.includes(status);
}
