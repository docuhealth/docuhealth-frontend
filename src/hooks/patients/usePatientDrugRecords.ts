import { queryKeys } from "../../lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { fetchPatientDrugRecords } from "../../services/patientDashboardService";

export function usePatientDrugRecords(page: number, pageSize: number, search?: string, options: any = {}) {
    return useQuery({
        queryKey: queryKeys.drugRecords(page, pageSize, search),
        queryFn: () => fetchPatientDrugRecords(page, pageSize, search),
        ...options,
    });
}