import { queryKeys } from "../../lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    changePassword,
    sendEmailChangeOtp,
    verifyEmailChangeOtp,
} from "../../services/patientDashboardService";

export function useChangePassword(options: any = {}) {
    return useMutation<any, any, { old_password: string; new_password: string }>({ mutationFn: changePassword, ...options });
}

export function useSendEmailChangeOtp(options: any = {}) {
    return useMutation<any, any, string>({ mutationFn: sendEmailChangeOtp, ...options });
}

export function useVerifyEmailChangeOtp(options: any = {}) {
    const queryClient = useQueryClient();
    const { onSuccess, ...restOptions } = options;
    return useMutation<any, any, string>({
        mutationFn: verifyEmailChangeOtp,
        onSuccess: (data: any, variables: any, context: any) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.profile });
            onSuccess?.(data, variables, context);
        },
        ...restOptions,
    });
}
