import React, { useState, useEffect } from "react";
import { createContext } from "react";
import { getToken } from "../../services/authService";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

import { fetchSubscriptionPlans } from "../../queries/Patient/patientSubscriptionPlans";
import { useQuery } from "@tanstack/react-query"; 


export const SubscriptionsContext = createContext();

const SubscriptionPlansProvider = (props) => {

     const isUserLoggedIn = !!getToken();

     const {
        data,
        isPending,
        isFetching,
        isError,
        error
     } = useQuery(
        {
            queryKey: ['patient-subscription-plans'],
            queryFn : fetchSubscriptionPlans,
            enabled : isUserLoggedIn,
            onError: () => {
                toast.error("Error fetching subscription plans");
              },
        }
     )


     const subscriptionPlans = data

    return (
        <SubscriptionsContext.Provider  value = {{ isPending, isFetching, subscriptionPlans }} >
            {props.children}
        </SubscriptionsContext.Provider>
    )
}

export default SubscriptionPlansProvider