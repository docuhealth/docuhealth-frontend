import { queryKeys } from "../../lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { fetchSubscriptionPlans } from "../../services/patientDashboardService";

export function useSubscriptionPlans(options: any = {}) {
    return useQuery({
        queryKey: queryKeys.subscriptions,
        queryFn: () => fetchSubscriptionPlans(),
        ...options,
    });
}