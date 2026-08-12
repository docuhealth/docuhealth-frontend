import { queryKeys } from "../../lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { fetchPatientDrugRecords } from "../../services/patientDashboardService";
import { PaginatedResponse } from "../../types/patients/shared";
import { DrugRecordDetail } from "../../types/patients/drugs";

export function usePatientDrugRecords(page: number, pageSize: number, search?: string, options: any = {}) {
    return useQuery<PaginatedResponse<DrugRecordDetail>>({
        queryKey: queryKeys.drugRecords(page, pageSize, search),
        queryFn: () => fetchPatientDrugRecords(page, pageSize, search),
        ...options,
    });
}
