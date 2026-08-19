import { usePatientProfile } from "./usePatientProfile";
import { hasActiveSubscription } from "../../utils/subscriptionUtils";

/**
 * Whether the logged-in patient currently has an active subscription,
 * derived from their profile (`usePatientProfile`'s cached query, so this
 * doesn't trigger an extra request). Use this instead of the old
 * `fetchSubscriptionStatus()` sessionStorage check, which was never
 * populated and always reported patients as unsubscribed.
 */
export function useHasActiveSubscription(): boolean {
  const { data: profile } = usePatientProfile();
  return hasActiveSubscription(profile?.subscription);
}
