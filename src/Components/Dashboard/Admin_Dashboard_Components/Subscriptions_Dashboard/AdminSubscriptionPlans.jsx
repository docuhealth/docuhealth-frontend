import React, { useContext } from "react";
import { AdminSubscriptionsContext } from "../../../../context/AdminContext/AdminSubscriptionsContext";

const AdminSubscriptionPlans = () => {
  const { subscriptionPlans, loading } = useContext(AdminSubscriptionsContext);

  return (
    <div className="bg-white my-5 border rounded-lg p-4 lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Subscription Plans</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-gray-600 text-sm animate-pulse">
            Loading subscription plans...
          </p>
        </div>
      ) : subscriptionPlans.length === 0 ? (
        <div className="flex flex-col justify-center items-center text-center py-10 h-full">
          <svg
            width="200"
            height="200"
            viewBox="0 0 366 366"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g filter="url(#filter0_d_1501_46523)">
              <circle cx="183" cy="171" r="159" fill="#DBDBDB" />
            </g>
            <circle cx="183" cy="171" r="132" fill="#F6F6F6" />
            <path
              d="M183 233.5C148.482 233.5 120.5 205.518 120.5 171C120.5 136.482 148.482 108.5 183 108.5C217.518 108.5 245.5 136.482 245.5 171C245.5 205.518 217.518 233.5 183 233.5ZM183 221C210.614 221 233 198.614 233 171C233 143.386 210.614 121 183 121C155.386 121 133 143.386 133 171C133 198.614 155.386 221 183 221ZM176.75 139.75H189.25V152.25H176.75V139.75ZM176.75 164.75H189.25V202.25H176.75V164.75Z"
              fill="#929AA3"
            />
            <defs>
              <filter
                id="filter0_d_1501_46523"
                x="0"
                y="0"
                width="366"
                height="366"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="12" />
                <feGaussianBlur stdDeviation="12" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0.15 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow_1501_46523"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow_1501_46523"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>

          <h2 className="font-medium pb-1">No subscription plans!</h2>
          <div className="max-w-md text-center">
            <p className="text-[12px] text-gray-500">
              There are no subscription plans available.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className="p-4 rounded-xl bg-gradient-to-b from-[#ECFAFF] to-[#EEEEFD]"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <p
                  className="text-[12px] text-gray-600 pb-2"
                  style={{ color: "#FE9000" }}
                >
                  {plan.name}
                </p>
              </div>

              {/* Price Section */}
              <div className="pb-4">
                <p className="text-2xl font-semibold pb-2">
                  ₦{plan.price}
                  <span className="text-sm font-normal text-gray-500">
                    /{plan.interval}
                  </span>
                </p>
                <p className="text-[12px] text-gray-600 leading-4">
                  {plan.description}
                </p>
              </div>

              <hr />

              {/* Features */}
              <div className="py-5 space-y-1">
                {plan.features?.map((feature, i) => (
                  <p key={i} className="flex items-center text-[12px]">
                    <i className="bx bx-check text-[#3E4095] text-xl mr-1"></i>
                    {feature}
                  </p>
                ))}
              </div>
              
              {/* Action Button for Admin */}
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-full py-2 border border-[#3E4095] text-[#3E4095] font-semibold text-sm hover:bg-[#3E4095] hover:text-white transition-colors">
                  Edit Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionPlans;
