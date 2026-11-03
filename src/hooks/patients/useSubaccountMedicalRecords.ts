import { queryKeys } from "../../lib/queryKeys";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchSubaccountMedicalRecords } from "../../services/patientDashboardService";
import { PaginatedResponse } from "../../types/patients/shared";

export function useSubaccountMedicalRecords(hin?: string, page: number = 1, pageSize: number = 6, options: any = {}) {
    return useQuery<PaginatedResponse<any>>({
        queryKey: queryKeys.subaccountMedicalRecords(hin, page, pageSize),
        queryFn: () => fetchSubaccountMedicalRecords(hin as string, page, pageSize),
        enabled: !!hin,
        placeholderData: keepPreviousData,
        // 404 means the dependant upgraded and the guardian lost access; retrying won't help
        retry: (count: number, err: any) => err?.response?.status !== 404 && count < 3,
        ...options,
    });
}
