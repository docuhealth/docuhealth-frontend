import { queryKeys } from "../../lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { fetchPatientProfile } from "../../services/patientDashboardService";
import { PatientInfo } from "../../types/patients/shared";

export function usePatientProfile(options: any = {}) {
    return useQuery<PatientInfo>({
        queryKey: queryKeys.profile,
        queryFn: () => fetchPatientProfile(),
        ...options,
    });
}
