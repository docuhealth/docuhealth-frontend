import { useMutation } from "@tanstack/react-query";
import { deactivatePatientAccount } from "../../services/patientDashboardService";

export function useDeactivatePatientAccount(options: any = {}) {
    return useMutation({
        mutationFn: deactivatePatientAccount,
        ...options,
    });
}
