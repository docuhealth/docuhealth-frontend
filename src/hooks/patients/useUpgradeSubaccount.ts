import { queryKeys } from "../../lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upgradeSubaccount } from "../../services/patientDashboardService";

export function useUpgradeSubaccount(options: any = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: upgradeSubaccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.subAccountsList });
        },
        ...options,
    });
}