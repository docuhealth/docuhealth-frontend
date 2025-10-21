import React, { useState, useEffect } from "react";
import { createContext } from "react";
import { getToken } from "../../services/authService";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";


export const SubscriptionsContext = createContext();

const SubscriptionPlansProvider = (props) => {

    const [loading, setLoading] = useState(false);
    const [subscriptionPlans, setSubscriptionPlans] = useState([])

     const isUserLoggedIn = !!getToken();

    const fetchSubscriptionPlans = async() => {
        setLoading(true)
        try{
            const res = await axiosInstance.get('api/subscriptions/plans')
            setSubscriptionPlans(res.data)
            console.log(res.data)
        }catch(err){
                console.log(err)
                toast.error("Error fetching subscriptions plans");
        }finally{
            setLoading(false)
        }
    }

     useEffect(() => {
        if (isUserLoggedIn) {
          fetchSubscriptionPlans(); // ✅ Fetch on mount
        }
      }, [isUserLoggedIn]);

    return (
        <SubscriptionsContext.Provider  value = {{ loading, subscriptionPlans }} >
            {props.children}
        </SubscriptionsContext.Provider>
    )
}

export default SubscriptionPlansProvider