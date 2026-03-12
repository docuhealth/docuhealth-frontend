import React, { useEffect, useState } from "react";
import { createContext } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { getToken } from "../../services/authService";
import toast from "react-hot-toast";
import { fetchPatientProfile } from "../../queries/Patient/patientProfile";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { setSubscriptionStatus, fetchSubscriptionStatus } from "../../services/authService";

export const AppContext = createContext();

const ProfileProvider = (props) => {
  const isUserLoggedIn = !!getToken();

  const [subscriptionStatus, setSubscriptionStatusState] = useState(
  fetchSubscriptionStatus() // previous stored value
);

  const queryClient = useQueryClient()

  const {
    data: profile,
    isPending,
    isError,
    error

  } = useQuery({
    queryKey: ['patient-profile'],
    queryFn: fetchPatientProfile,
    enabled : isUserLoggedIn,
    placeholderData : keepPreviousData

  })

  useEffect(() => {
  if (profile?.is_subscribed !== undefined) {
    // console.log(profile)
    setSubscriptionStatus(profile.is_subscribed);
    setSubscriptionStatusState(profile.is_subscribed); 
  }
}, [profile]);


  const toggleEmergencyMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.patch("api/patients/emergency");
      return res.data?.emergency;
    },
    onSuccess: () => {
      toast.success("Emergency status updated!");
      // 🔥 Refetch profile after update
      queryClient.invalidateQueries(["patient-profile"]);
    },
    onError: () => {
      toast.error("Failed to update emergency status");
    },
  });

  return (
    <AppContext.Provider
      value={{
        profile,
        isPending,
        isError,
        toggleEmergencyStatus: toggleEmergencyMutation.mutate,
      }}
    >{props.children}</AppContext.Provider>
  );
};

export default ProfileProvider;
