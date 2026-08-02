import { queryKeys } from "../../lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePatientAccount } from "../../services/patientDashboardService";

export function useUpdatePatientAccount(options: any = {}) {
    const queryClient = useQueryClient();
    const { onSuccess, ...restOptions } = options;
    return useMutation({
        mutationFn: updatePatientAccount,
        onSuccess: (data: any, variables: any, context: any) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.profile });
            onSuccess?.(data, variables, context);
        },
        ...restOptions,
    });
}
