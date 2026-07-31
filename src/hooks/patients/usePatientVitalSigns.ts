import { queryKeys } from "../../lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { fetchPatientVitalSigns } from "../../services/patientDashboardService";

export function usePatientVitalSigns(page: number, options: any = {}) {
    return useQuery({
        queryKey: queryKeys.vitalSigns(page),
        queryFn: () => fetchPatientVitalSigns(page),
        ...options,
    });
}