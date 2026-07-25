import { useState, useContext } from "react";
import { SubscriptionsContext } from "../../../../context/PatientContext/SubscriptionsContext";
import { AppContext } from "../../../../context/PatientContext/AppContext.jsx";
import axiosInstance from "../../../../utils/axiosInstance";
import toast from "react-hot-toast";

// How each subscription status is labelled and coloured in the UI.
const SUBSCRIPTION_STATUS_META = {
  active: { label: "ACTIVE", className: "text-green-600" },
  "non-renewing": { label: "NON-RENEWING", className: "text-amber-600" },
  attention: { label: "ATTENTION", className: "text-amber-600" },
  past_due: { label: "PAST DUE", className: "text-red-500" },
  cancelled: { label: "CANCELLED", className: "text-gray-500" },
  canceled: { label: "CANCELLED", className: "text-gray-500" },
  completed: { label: "COMPLETED", className: "text-gray-500" },
  expired: { label: "EXPIRED", className: "text-red-500" },
  inactive: { label: "INACTIVE", className: "text-gray-500" },
};

// Statuses that mean the plan is still live, so the user can't re-subscribe to it.
const BLOCKING_STATUSES = ["active", "non-renewing"];

const getStatusMeta = (status) => {
  if (!status) return { label: "", className: "" };
  const key = String(status).toLowerCase();
  return (
    SUBSCRIPTION_STATUS_META[key] || {
      label: key.replace(/[_-]/g, " ").toUpperCase(),
      className: "text-gray-500",
    }
  );
};

const SubscriptionPlans = () => {
  const { subscriptionPlans, isPending: subscriptionDataIsPending } = useContext(SubscriptionsContext);
  const { profile, isPending: profileDataIsPending } = useContext(AppContext);

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
      let errorMsg = "Payment initialization failed.";
      const data = err.response?.data;
      if (data) {
        if (typeof data === "string") {
          errorMsg = data;
        } else if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
          errorMsg = data.non_field_errors[0];
        } else if (data.error || data.message || data.detail) {
          errorMsg = data.error || data.message || data.detail;
        } else {
          // Fall back to the first DRF field error (e.g. { plan: ["..."] })
          const firstFieldError = Object.values(data).find(
            (value) => Array.isArray(value) && value.length
          );
          if (firstFieldError) errorMsg = firstFieldError[0];
        }
      }

      toast.error(errorMsg, { id: loadingToast });
      console.error("Payment Error:", err);
    }
  };

  const currentSubscription = profileDataIsPending === false ? profile.subscription : null;
  const currentStatus = currentSubscription?.status?.toLowerCase() ?? null;
  const userIsSubscribed = currentSubscription !== null;
  // The user only counts as being on a paid plan while that plan is still live.
  const hasActivePaidPlan = currentStatus !== null && BLOCKING_STATUSES.includes(currentStatus);

  // True when `planName` is the plan the user is currently subscribed to.
  const isCurrentPlan = (planName) =>
    userIsSubscribed && currentSubscription.plan_name === planName;

  return (
    <>
      <div className="bg-white my-5 border rounded-lg py-8 px-6">
        <div className="border rounded-lg bg-docuhealth-gray-cool mb-4 p-5">
          <p className="text-[12px]">
            Please remain subscribed to enjoy these features. Your <i className="font-bold">Annual Plan</i> subscription plan also supports the deployment of DocuHealth 24/7 First - Aid Vending Machines in strategic community locations, helping ensure access to essential medications during emergency hours in the near future.
          </p>
        </div>
        {/* ===== Loading State ===== */}
        {subscriptionDataIsPending || profileDataIsPending ? (
          <div className="flex justify-center items-center ">
            <p className="text-gray-600 text-sm animate-pulse">
              Loading subscription plans...
            </p>
          </div>
        ) : !subscriptionPlans || subscriptionPlans.length === 0 ? (
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
          // Plans Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Static Basic Plan */}
            <div className="p-4 rounded-xl bg-docuhealth-gray-cool">
              <div className="flex justify-between items-center">
                <p className="text-[12px] text-gray-900 pb-2">
                  Basic Plan
                  {!hasActivePaidPlan && (
                      <span className="text-xs text-green-600 font-bold"> (ACTIVE)</span>
                  )}
                </p>
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
                    <i className="bx bx-check text-docuhealth-primary text-xl mr-1"></i>
                    {feature}
                  </p>
                ))}
                {[
                  "No access to medical record summary.",
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
              <button
                  className="py-3 rounded-full my-4 font-semibold w-full border border-gray-400 disabled:cursor-not-allowed disabled:text-gray-500"
                  onClick={() => toast.success("You are already on the free plan!")}
                  disabled={hasActivePaidPlan}
              >
                <p className="text-sm text-center">Choose Free Plan</p>
              </button>
            </div>

            {/* Dynamic Plans from API */}
            {subscriptionPlans.map((plan) => {
              const isPlanCurrent = isCurrentPlan(plan.name);
              const statusMeta = isPlanCurrent ? getStatusMeta(currentSubscription.status) : null;
              // Can't re-subscribe to a plan whose subscription is still live.
              const planIsLocked = isPlanCurrent && BLOCKING_STATUSES.includes(currentStatus);

              return (
              <div
                key={plan.id}
                className="p-4 rounded-xl bg-linear-to-b from-docuhealth-blue-lightest to-docuhealth-primary-lightest"
              >
                {/* Header */}
                <div className="flex justify-between items-center">
                  <p
                    className="text-[12px] text-gray-600 pb-2"
                    style={{ color: "#FE9000" }}
                  >
                    {plan.name + " "}
                    {statusMeta && (
                        <span className={`text-xs font-bold ${statusMeta.className}`}>
                          ({statusMeta.label})
                        </span>
                    )}
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
                      <i className="bx bx-check text-docuhealth-primary text-xl mr-1"></i>
                      {feature}
                    </p>
                  ))}
                </div>

                <button
                    className="rounded-full my-4 border border-docuhealth-primary text-docuhealth-primary font-semibold w-full disabled:cursor-not-allowed disabled:text-gray-400 disabled:border-gray-300"
                    onClick={() => handlePayment(plan.paystack_plan_code)}
                    disabled={planIsLocked}
                >
                  <p className="py-3 text-sm text-center">
                    {planIsLocked ? "Current Plan" : `Choose ${plan.name}`}
                  </p>
                </button>
              </div>
              );
            })}
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
