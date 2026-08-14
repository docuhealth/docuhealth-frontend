import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { queryKeys } from "../../lib/queryKeys";
import toast from "react-hot-toast";

export function useToggleEmergency(options: any = {}) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async () => {
            const res = await axiosInstance.patch("api/patients/emergency");
            return res.data?.emergency;
        },
        onSuccess: () => {
            toast.success("Emergency status updated!");
            queryClient.invalidateQueries({ queryKey: queryKeys.profile });
        },
        onError: () => {
            toast.error("Failed to update emergency status");
        },
        ...options
    });
}
