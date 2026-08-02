import { queryKeys } from "../../lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { fetchPatientVitalSigns } from "../../services/patientDashboardService";
import { PaginatedResponse, VitalSignsInfo } from "../../types/patients/shared";

export function usePatientVitalSigns(page: number, options: any = {}) {
    return useQuery<PaginatedResponse<VitalSignsInfo>>({
        queryKey: queryKeys.vitalSigns(page),
        queryFn: () => fetchPatientVitalSigns(page),
        ...options,
    });
}
