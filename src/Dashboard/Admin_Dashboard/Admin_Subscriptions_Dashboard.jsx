import React, { useState, useContext } from "react";
import DynamicDate from "../../Components/DynamicDate/DynamicDate";
import AdminSubscriptionPlans from "../../Components/Dashboard/Admin_Dashboard_Components/Subscriptions_Dashboard/AdminSubscriptionPlans";
import AdminSubscribedUsers from "../../Components/Dashboard/Admin_Dashboard_Components/Subscriptions_Dashboard/AdminSubscribedUsers";
import { CreatePlanModal } from "../../Components/Dashboard/Admin_Dashboard_Components/Subscriptions_Dashboard/SubscriptionModals";
import { AdminSubscriptionsContext } from "../../context/AdminContext/AdminSubscriptionsContext";
import { ChevronDown } from "lucide-react";

const ROLE_OPTIONS = [
  { label: "Hospital", value: "hospital" },
  { label: "Individuals", value: "patient" },
];

const Admin_Subscriptions_Dashboard = () => {
  const [activeTab, setActiveTab] = useState("plans"); // "plans" | "users"
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const {
    subscribedUsersRole,
    setSubscribedUsersRole,
  } = useContext(AdminSubscriptionsContext);

  const displayedRole = ROLE_OPTIONS.find((o) => o.value === subscribedUsersRole)?.label || "Hospital";

  const handleRoleSelect = (value) => {
    setSubscribedUsersRole(value);
    setRoleDropdownOpen(false);
  };

  return (
    <div className="flex flex-col">
      {/* Top bar */}
      <div className="py-2 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <DynamicDate />

        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-3">
          {activeTab === "plans" ? (
            <>
              <button
                id="create-new-plan-btn"
                onClick={() => setShowCreateModal(true)}
                className="flex justify-center items-center gap-2 px-5 py-2 border border-[#3E4095] text-[#3E4095] font-medium rounded-full hover:bg-blue-50 transition w-full sm:w-auto text-sm"
              >
                Create a new plan
              </button>
              <button
                id="view-subscribed-users-btn"
                onClick={() => setActiveTab("users")}
                className="flex justify-center items-center gap-2 px-5 py-2 bg-[#3E4095] text-white font-medium rounded-full hover:bg-[#2e3070] transition w-full sm:w-auto text-sm"
              >
                View subscribed users
              </button>
            </>
          ) : (
            <>
              <button
                id="view-subscription-plans-btn"
                onClick={() => setActiveTab("plans")}
                className="flex justify-center items-center gap-2 px-5 py-2 bg-[#3E4095] text-white font-medium rounded-full hover:bg-[#2e3070] transition w-full sm:w-auto text-sm"
              >
                View subscription plans
              </button>

              {/* Role filter dropdown */}
              <div className="relative w-full sm:w-auto">
                <button
                  id="subscribed-users-role-filter"
                  onClick={() => setRoleDropdownOpen((v) => !v)}
                  className="flex justify-center items-center gap-2 px-5 py-2 border border-[#3E4095] text-[#3E4095] font-medium rounded-full hover:bg-blue-50 transition w-full sm:w-auto text-sm"
                >
                  {displayedRole}
                  <ChevronDown className={`w-4 h-4 transition-transform ${roleDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-full lg:w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    {ROLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleRoleSelect(opt.value)}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-blue-50 ${
                          subscribedUsersRole === opt.value ? "text-[#3E4095] font-semibold" : "text-gray-700"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white my-5 border rounded-lg p-4 lg:p-6">
        {activeTab === "plans" ? (
          <AdminSubscriptionPlans />
        ) : (
          <AdminSubscribedUsers />
        )}
      </div>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <CreatePlanModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default Admin_Subscriptions_Dashboard;