import { queryKeys } from "../../lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { fetchPatientAppointments } from "../../services/patientDashboardService";

export function usePatientAppointments(
    page: number, 
    pageSize: number, 
    search?: string, 
    dateFrom?: string, 
    dateTo?: string, 
    options: any = {}
) {
    return useQuery({
        queryKey: queryKeys.appointments(page, pageSize, search, dateFrom, dateTo),
        queryFn: () => fetchPatientAppointments(page, pageSize, search, dateFrom, dateTo),
        ...options,
    });
}