import React, { useContext, useRef, useEffect, useState } from "react";
import { AdminSubscriptionsContext } from "../../../../context/AdminContext/AdminSubscriptionsContext";
import { EditPlanModal } from "./SubscriptionModals";

const AdminSubscriptionPlans = () => {
  const { subscriptionPlans, plansLoading } = useContext(AdminSubscriptionsContext);

  const [editingPlan, setEditingPlan] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (plansLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-500 text-sm animate-pulse">Loading subscription plans...</p>
      </div>
    );
  }

  if (subscriptionPlans.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center text-center py-16 h-full">
        <svg width="180" height="180" viewBox="0 0 366 366" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_d_sub)">
            <circle cx="183" cy="171" r="159" fill="#DBDBDB" />
          </g>
          <circle cx="183" cy="171" r="132" fill="#F6F6F6" />
          <path
            d="M183 233.5C148.482 233.5 120.5 205.518 120.5 171C120.5 136.482 148.482 108.5 183 108.5C217.518 108.5 245.5 136.482 245.5 171C245.5 205.518 217.518 233.5 183 233.5ZM183 221C210.614 221 233 198.614 233 171C233 143.386 210.614 121 183 121C155.386 121 133 143.386 133 171C133 198.614 155.386 221 183 221ZM176.75 139.75H189.25V152.25H176.75V139.75ZM176.75 164.75H189.25V202.25H176.75V164.75Z"
            fill="#929AA3"
          />
          <defs>
            <filter id="filter0_d_sub" x="0" y="0" width="366" height="366" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="12" />
              <feGaussianBlur stdDeviation="12" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0.15 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_sub" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_sub" result="shape" />
            </filter>
          </defs>
        </svg>
        <h2 className="font-medium pb-1 mt-2">No subscription plans!</h2>
        <p className="text-[12px] text-gray-500 max-w-xs">
          There are no subscription plans available. Create a new plan to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.id || plan.sqid}
            className="p-5 rounded-2xl bg-gradient-to-b from-docuhealth-blue-lightest to-docuhealth-primary-lightest flex flex-col relative"
          >
            {/* Header row: name + three-dots menu */}
            <div className="flex justify-between items-start mb-1">
              <p className="text-[12px] font-semibold" style={{ color: "#FE9000" }}>
                {plan.name}
              </p>
              <div className="relative" ref={activeMenu === (plan.sqid || plan.id) ? menuRef : null}>
                <button
                  id={`plan-menu-${plan.sqid || plan.id}`}
                  onClick={() =>
                    setActiveMenu(activeMenu === (plan.sqid || plan.id) ? null : (plan.sqid || plan.id))
                  }
                  className="p-1.5 rounded-full hover:bg-black/5 transition-colors"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="text-gray-500">
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                  </svg>
                </button>
                {activeMenu === (plan.sqid || plan.id) && (
                  <div className="absolute right-0 top-8 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                    <button
                      onClick={() => { setEditingPlan(plan); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Edit plan
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="pb-4">
              <p className="text-2xl font-bold text-gray-900">
                ₦{Number(plan.price).toLocaleString()}
                <span className="text-sm font-normal text-gray-500 ml-0.5">/{plan.interval}</span>
              </p>
              {plan.role && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-docuhealth-primary/10 text-docuhealth-primary capitalize">
                  {plan.role}
                </span>
              )}
              {plan.description && (
                <p className="text-[12px] text-gray-600 leading-4 mt-2">{plan.description}</p>
              )}
            </div>

            <hr className="border-white/60" />

            {/* Features */}
            <div className="py-4 space-y-1.5 flex-1">
              {plan.features && plan.features.length > 0 ? (
                plan.features.map((feature, i) => (
                  <p key={i} className="flex items-center text-[12px] text-gray-700">
                    <i className="bx bx-check text-docuhealth-primary text-lg mr-1 shrink-0"></i>
                    {feature}
                  </p>
                ))
              ) : (
                <p className="text-[12px] text-gray-400 italic">No features listed.</p>
              )}
            </div>

            {/* Edit Button */}
            <button
              id={`edit-plan-btn-${plan.sqid || plan.id}`}
              onClick={() => setEditingPlan(plan)}
              className="mt-4 w-full rounded-full py-2.5 border border-docuhealth-primary text-docuhealth-primary font-semibold text-sm hover:bg-docuhealth-primary hover:text-white transition-colors"
            >
              Edit plan
            </button>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPlan && (
        <EditPlanModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
        />
      )}
    </>
  );
};

export default AdminSubscriptionPlans;
