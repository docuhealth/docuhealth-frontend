import { queryKeys } from "../../lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { fetchPatientAppointments } from "../../services/patientDashboardService";
import { PaginatedResponse } from "../../types/patients/shared";
import { AppointmentDetail } from "../../types/patients/appointments";

export function usePatientAppointments(
    page: number,
    pageSize: number,
    search?: string,
    dateFrom?: string,
    dateTo?: string,
    options: any = {}
) {
    return useQuery<PaginatedResponse<AppointmentDetail>>({
        queryKey: queryKeys.appointments(page, pageSize, search, dateFrom, dateTo),
        queryFn: () => fetchPatientAppointments(page, pageSize, search, dateFrom, dateTo),
        ...options,
    });
}
