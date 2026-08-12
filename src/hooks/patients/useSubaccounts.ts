import { queryKeys } from "../../lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { fetchSubaccounts } from "../../services/patientDashboardService";
import { PaginatedResponse } from "../../types/patients/shared";
import { SubAccount } from "../../types/patients/sub-accounts";

export function useSubaccounts(page: number, pageSize: number, search?: string, options: any = {}) {
    return useQuery<PaginatedResponse<SubAccount>>({
        queryKey: queryKeys.subAccounts(page, pageSize, search),
        queryFn: () => fetchSubaccounts(page, pageSize, search),
        ...options,
    });
}
