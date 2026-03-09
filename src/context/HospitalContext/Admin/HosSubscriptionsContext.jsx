import React, { useState, useEffect, createContext } from "react";
import { getHospitalToken } from "../../../services/authService";
import { fetchSubscriptionPlans } from "../../../queries/Hospital/admin/subscription";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const HosSubscriptionsContext = createContext();

const HosSubscriptionsProvider = (props) => {
  // const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  // const [loading, setLoading] = useState(false);

  const isUserLoggedIn = !!getHospitalToken();

  // const fetchSubscriptionPlans = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await axiosInstanceHos.get("api/subscriptions/plans");
  //     console.log(res)
  //     setSubscriptionPlans(res.data);
  //     setLoading(false);
  //   } catch (err) {
  //       setLoading(false)
  //         toast.error("Error fetching subscription plans");
  //     console.error(err);

  //   }
  // };

  // useEffect(() => {
  //   if(isUserLoggedIn){
  //       fetchSubscriptionPlans()
  //   } else rteurn
  // },[isUserLoggedIn])

  const {
    data,
    isPending ,
    isError,
    error
  } = useQuery ({
    queryKey : ["hospital-subscription-plans"],
    queryFn : fetchSubscriptionPlans,
    enabled : isUserLoggedIn,
    placeholderData : keepPreviousData
  })

      useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || "Error fetching subscription plans");
      console.error(error);
    }
  }, [isError, error]);

  const subscriptionPlans = data

  const value = {
    subscriptionPlans,
    loading : isPending
  }


return (
    <HosSubscriptionsContext.Provider value={value}>
        {props.children}
    </HosSubscriptionsContext.Provider>
)
}

export default HosSubscriptionsProvider