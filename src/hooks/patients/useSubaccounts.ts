import { queryKeys } from "../../lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { fetchSubaccounts } from "../../services/patientDashboardService";

export function useSubaccounts(page: number, pageSize: number, search?: string, options: any = {}) {
    return useQuery({
        queryKey: queryKeys.subAccounts(page, pageSize, search),
        queryFn: () => fetchSubaccounts(page, pageSize, search),
        ...options,
    });
}