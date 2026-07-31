import { queryKeys } from "../../lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { fetchPatientProfile } from "../../services/patientDashboardService";

export function usePatientProfile(options: any = {}) {
    return useQuery({
        queryKey: queryKeys.profile,
        queryFn: () => fetchPatientProfile(),
        ...options,
    });
}