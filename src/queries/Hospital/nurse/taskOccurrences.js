import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstanceHos from "../../../lib/axios/hospital";

export const TASKS_PAGE_SIZE = 8;

// Tasks fall due on a schedule and other nurses claim them, so keep the ward view polling
const TASKS_REFETCH_MS = 30 * 1000;

// Prefix shared by every task list and count of one admission, so one invalidate refreshes them all
export const admissionTasksKey = (admissionSqid) => ["admission-task-occurrences", admissionSqid];

export const fetchAdmissionTaskOccurrences = async (admissionSqid, status, page = 1, size = TASKS_PAGE_SIZE) => {
    const res = await axiosInstanceHos.get(`/api/inpatients/admissions/${admissionSqid}/task-occurrences?status=${status}&page=${page}&size=${size}`);
    return { results: res.data?.results || [], count: res.data?.count || 0 };
};

export const useAdmissionTaskOccurrences = (admissionSqid, status, page) => useQuery({
    queryKey: [...admissionTasksKey(admissionSqid), status, page],
    queryFn: () => fetchAdmissionTaskOccurrences(admissionSqid, status, page),
    enabled: !!admissionSqid,
    // Keep the old page on screen while paging, but never show another tab's rows
    placeholderData: (prev, prevQuery) => (prevQuery?.queryKey[2] === status ? prev : undefined),
    refetchInterval: TASKS_REFETCH_MS,
});

// size=1 is enough: only the count is read
const useAdmissionTaskCount = (admissionSqid, status, enabled) => useQuery({
    queryKey: [...admissionTasksKey(admissionSqid), status, "count"],
    queryFn: () => fetchAdmissionTaskOccurrences(admissionSqid, status, 1, 1),
    enabled: enabled && !!admissionSqid,
    select: (data) => data.count,
    refetchInterval: TASKS_REFETCH_MS,
});

export const useAdmissionTaskCounts = (admissionSqid, enabled = true) => ({
    pending: useAdmissionTaskCount(admissionSqid, "pending", enabled).data ?? 0,
    inProgress: useAdmissionTaskCount(admissionSqid, "in_progress", enabled).data ?? 0,
});

export const useInvalidateAdmissionTasks = () => {
    const queryClient = useQueryClient();
    return (admissionSqid) => queryClient.invalidateQueries({ queryKey: admissionTasksKey(admissionSqid) });
};
