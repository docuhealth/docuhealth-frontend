import { queryKeys } from "../../lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSubaccount } from "../../services/patientDashboardService";

export function useCreateSubaccount(options: any = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createSubaccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.subAccountsList });
        },
        ...options,
    });
}