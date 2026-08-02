import { useMutation } from "@tanstack/react-query";
import { subscribeToPlan } from "../../services/patientDashboardService";

export function useSubscribeToPlan(options: any = {}) {
    return useMutation<any, any, string>({
        mutationFn: subscribeToPlan,
        ...options,
    });
}
