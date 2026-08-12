import { queryKeys } from "../../lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSubaccount } from "../../services/patientDashboardService";

export function useCreateSubaccount(options: any = {}) {
    const queryClient = useQueryClient();
    const { onSuccess, ...restOptions } = options;
    return useMutation({
        mutationFn: createSubaccount,
        onSuccess: (data: any, variables: any, context: any) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.subAccountsList });
            onSuccess?.(data, variables, context);
        },
        ...restOptions,
    });
}
