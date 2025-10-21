import React, { useContext } from "react";
import { SubscriptionsContext } from "../../context/Patient Context/SubscriptionsContext";
import DynamicDate from "../../Components/Dynamic Date/DynamicDate";
import toast from "react-hot-toast";
import SubscriptionPlans from "../../Components/Dashboard/Patient_Dashboard_Components/Subscriptions_Dashboard/SubscriptionPlans";

const Patient_Subscriptions_Dashboard = () => {
  const { subscriptionPlans, loading } = useContext(SubscriptionsContext);

  // Payment handler (stub)
  const handlePayment = (planId) => {
    toast.success(`Selected plan: ${planId}`);
  };

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>
      <SubscriptionPlans />
    </>
  );
};

export default Patient_Subscriptions_Dashboard;
