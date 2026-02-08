import React, { useState, useContext } from "react";
import { SubscriptionsContext } from "../../../../context/Patient Context/SubscriptionsContext";
import axiosInstance from "../../../../utils/axiosInstance";
import DynamicDate from "../../../Dynamic Date/DynamicDate";
import toast from "react-hot-toast";

const SubscriptionPlans = () => {
  const { subscriptionPlans, isPending } = useContext(SubscriptionsContext);

// Add this state to your component
const [paymentUrl, setPaymentUrl] = useState(null);

const handlePayment = async (planId) => {
  const loadingToast = toast.loading("Initializing payment...");

  try {
    const res = await axiosInstance.post("api/subscriptions/subscribe", {
      plan: planId,
    });
    
    const { authorization_url } = res.data;

    if (authorization_url) {
      toast.success("Opening checkout...", { id: loadingToast });
      setPaymentUrl(authorization_url);
    } else {
      toast.error("Initialization failed. No payment link received.", { id: loadingToast });
    }
  } catch (err) {
    const errorMsg = err.response?.data?.message || "Payment initialization failed.";
    toast.error(errorMsg, { id: loadingToast });
    console.error("Payment Error:", err);
  }
};


  return (
    <>
      <div className="bg-white my-5 border rounded-lg py-8 px-6">
              <div className="border rounded-lg bg-[#F5F8F8] mb-4 p-5">
            <p className="text-[12px]">
              Please remain subscribed to enjoy these features. Your <i className="font-bold">Annual Plan</i> subscription plan also supports the deployment of DocuHealth 24/7 First - Aid Vending Machines in strategic community locations, helping ensure access to essential medications during emergency hours in the near future.
            </p>
        </div>
        {/* ===== Loading State ===== */}
        {isPending ? (
          <div className="flex justify-center items-center ">
            <p className="text-gray-600 text-sm animate-pulse">
              Loading subscription plans...
            </p>
          </div>
        ) : subscriptionPlans.length === 0 ? (
          // ===== Empty State =====
          <div className="flex flex-col justify-center items-center text-center  h-full">
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
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
                {" "}
                There are no subscription plans available, we’ll notify you once
                we have any new update!
              </p>
            </div>
          </div>
        ) : (
          // ===== Plans Grid =====
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* ---------- Static Basic Plan ---------- */}
            <div className="p-4 rounded-xl bg-[#F5F8F8]">
              <div className="flex justify-between items-center">
                <p className="text-[12px] text-gray-900 pb-2">Basic Plan</p>
              </div>

              {/* Price Section */}
              <div className="pb-4">
                <p className="text-2xl font-semibold pb-2">
                  ₦0
                  <span className="text-sm font-normal text-gray-500">
                    /forever
                  </span>
                </p>
                <p className="text-[12px] text-gray-600 leading-4">
                  The basic plan is a free, interesting and complete plan. It
                  has some features to get you started. 
                </p>
              </div>

              <hr />

              {/* Features Section */}
              <div className="py-5 space-y-1">
                {[
                  "Access to dashboard",
                  "View basic profile",
                  "View your HIN ( Health Identification Number )",
                ].map((feature, i) => (
                  <p key={i} className="flex items-center text-[12px]">
                    <i className="bx bx-check text-[#3E4095] text-xl mr-1"></i>
                    {feature}
                  </p>
                ))}
                {[
                  "No access to medical record summary and dowloads.",
                  "No access to uploaded documents",
                  "No access to creating a Kid's account",
                  "No access to creating or printing ID Card",
                  "No access to appointments",
                  "No access to Emergency Mode",
                ].map((feature, i) => (
                  <p key={i} className="flex items-center text-[12px]">
                    <i className="bx bx-x text-xl text-red-600 mr-1"></i>
                    {feature}
                  </p>
                ))}
              </div>

              {/* Button */}
              <div className="rounded-full my-4 font-semibold">
                <div className="py-3">
                  <p
                    className="text-sm text-center cursor-pointer"
                    onClick={() =>
                      toast.success("You are already on the free plan!")
                    }
                  >
                    Choose Free Plan
                  </p>
                </div>
              </div>
            </div>

            {/* ---------- Dynamic Plans from API ---------- */}
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-xl bg-linear-to-b from-[#ECFAFF] to-[#EEEEFD]"
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
                  {plan.features.map((feature, i) => (
                    <p key={i} className="flex items-center text-[12px]">
                      <i className="bx bx-check text-[#3E4095] text-xl mr-1"></i>
                      {feature}
                    </p>
                  ))}
                </div>

                {/* Button */}
                <div
                  onClick={() => handlePayment(plan.paystack_plan_code)}
                  className="rounded-full my-4 border border-[#3E4095] text-[#3E4095] font-semibold"
                >
                  <div className="py-3">
                    <p className="text-sm text-center cursor-pointer">
                      Choose {plan.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

  
      </div>
      {/* Payment Modal Overlay */}
{paymentUrl && (
  <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 ">
    <div className="bg-white w-full max-w-lg h-full rounded-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 ">
      <button 
        onClick={() => {
           setPaymentUrl(null);
        }}
        className="absolute top-2 right-2 z-50 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Payment Iframe */}
      <div className="relative h-full  bg-gray-50">
        <iframe
          src={paymentUrl}
          className="w-full h-full"
          title="Payment Checkout"
          allow="payment"
        />
      </div>

    </div>
  </div>
)}
    </>
  );
};

export default SubscriptionPlans;
