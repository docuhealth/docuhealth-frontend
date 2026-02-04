import React, { useState, useEffect, createContext } from "react";
import { getHospitalToken } from "../../../services/authService";
import axiosInstanceHos from "../../../utils/axiosInstanceHos";
import toast from "react-hot-toast";

export const HosSubscriptionsContext = createContext();

const HosSubscriptionsProvider = (props) => {
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const isUserLoggedIn = !!getHospitalToken();

  const fetchSubscriptionPlans = async () => {
    setLoading(true);
    try {
      const res = await axiosInstanceHos.get("api/subscriptions/plans");
      console.log(res)
      setSubscriptionPlans(res.data);
      setLoading(false);
    } catch (err) {
        setLoading(false)
          toast.error("Error fetching subscription plans");
      console.error(err);

    }
  };

  useEffect(() => {
    if(isUserLoggedIn){
        fetchSubscriptionPlans()
    } else rteurn
  },[isUserLoggedIn])


return (
    <HosSubscriptionsContext.Provider value={{loading, subscriptionPlans}}>
        {props.children}
    </HosSubscriptionsContext.Provider>
)
}

export default HosSubscriptionsProvider