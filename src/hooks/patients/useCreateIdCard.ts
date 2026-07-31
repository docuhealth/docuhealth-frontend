import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { queryKeys } from "../../lib/queryKeys";
import { useIdCardStore } from "../../store/useIdCardStore";
import toast from "react-hot-toast";

export function useCreateIdCard(options: any = {}) {
    const queryClient = useQueryClient();
    const { 
        idCardData, 
        setOnboardIDCard, 
        setIsIDCreatedSuccessfully 
    } = useIdCardStore();
    
    return useMutation({
        mutationFn: async (selectedPatient: any) => {
            let res;
            if ("emergency" in (selectedPatient || {})) {
                const payload = {
                    first_emergencey_number: idCardData.firstEmergency,
                    second_emergencey_number: idCardData.secondEmergency,
                    emergence_address: idCardData.emergencyAddress
                };
                res = await axiosInstance.post("api/patients/id-card", payload);
            } else {
                res = await axiosInstance.patch(`api/patients/subaccounts/id-card/${selectedPatient?.hin}`);
            }
            return res.data;
        },
        onSuccess: () => {
            toast.success("ID Card Created Successfully");
            setOnboardIDCard(false);
            setIsIDCreatedSuccessfully(true);
            queryClient.invalidateQueries({ queryKey: queryKeys.profile });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "An error occurred");
        },
        ...options
    });
}
