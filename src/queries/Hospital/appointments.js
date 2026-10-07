import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosInstanceHos from "../../lib/axios/hospital";
import { extractApiErrorMessage } from "../../utils/apiError";

// Marks the appointment `completed`. Any staff with the same role as the booked staff may close it;
// other roles and hospital admins get 403, an already-closed appointment gets 400.
export const closeAppointment = async (sqid) => {
  const res = await axiosInstanceHos.post(`api/appointments/${sqid}/close`);
  return res.data;
};

export const isAppointmentClosed = (appointment) =>
  appointment?.status === "completed" || !!appointment?.closed_at;

// `listKey` is the appointment list query to refresh, e.g. "radiology-appointments".
export const useCloseAppointment = (listKey, { onSuccess } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: closeAppointment,
    onSuccess: (res, sqid) => {
      toast.success(res?.detail || "Appointment closed.");
      if (listKey) {
        // Mark it completed in the cached list now; staging can take several seconds to refetch.
        queryClient.setQueriesData({ queryKey: [listKey] }, (old) =>
          old?.results
            ? {
                ...old,
                results: old.results.map((a) =>
                  a.sqid === sqid ? { ...a, status: "completed", closed_at: a.closed_at || new Date().toISOString() } : a,
                ),
              }
            : old,
        );
        queryClient.invalidateQueries({ queryKey: [listKey] });
      }
      onSuccess?.(res, sqid);
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Could not close this appointment."));
    },
  });
};
