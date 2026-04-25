import React from 'react'
import DynamicDate from '../../Components/DynamicDate/DynamicDate'
import AdminSubscriptionPlans from '../../Components/Dashboard/Admin_Dashboard_Components/Subscriptions_Dashboard/AdminSubscriptionPlans'

const Admin_Subscriptions_Dashboard = () => {
  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>
      <AdminSubscriptionPlans />
    </>
  )
}

export default Admin_Subscriptions_Dashboard