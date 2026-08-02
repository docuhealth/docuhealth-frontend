
import DynamicDate from "../../Components/DynamicDate/DynamicDate";
import toast from "react-hot-toast";
import SubscriptionPlans from "../../Components/Dashboard/Patient_Dashboard_Components/Subscriptions_Dashboard/SubscriptionPlans";

const Patient_Subscriptions_Dashboard = () => {

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
