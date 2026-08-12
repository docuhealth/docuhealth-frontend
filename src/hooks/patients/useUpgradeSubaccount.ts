import { queryKeys } from "../../lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upgradeSubaccount } from "../../services/patientDashboardService";

export function useUpgradeSubaccount(options: any = {}) {
    const queryClient = useQueryClient();
    const { onSuccess, ...restOptions } = options;
    return useMutation({
        mutationFn: upgradeSubaccount,
        onSuccess: (data: any, variables: any, context: any) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.subAccountsList });
            onSuccess?.(data, variables, context);
        },
        ...restOptions,
    });
}
