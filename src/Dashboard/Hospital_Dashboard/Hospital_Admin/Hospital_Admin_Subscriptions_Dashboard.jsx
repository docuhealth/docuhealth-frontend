import React from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import SubscriptionPlans from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Subscriptions_Dashboard/SubscriptionPlans";


const Hospital_Admin_Subscriptions_Dashboard = () => {
    return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>
      <SubscriptionPlans />
    </>
    )
}
export default Hospital_Admin_Subscriptions_Dashboard;