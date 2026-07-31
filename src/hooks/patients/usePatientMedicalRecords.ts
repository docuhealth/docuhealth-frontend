import { queryKeys } from "../../lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { fetchPatientMedicalRecords } from "../../services/patientDashboardService";

export function usePatientMedicalRecords(page: number, pageSize: number, search?: string, options: any = {}) {
    return useQuery({
        queryKey: queryKeys.medicalRecords(page, pageSize, search),
        queryFn: () => fetchPatientMedicalRecords(page, pageSize, search),
        ...options,
    });
}