import React, { useState, useContext, useRef, useEffect } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { usePatientProfile } from "../../../../../hooks/patients/usePatientProfile";
import { useUpdatePatientAccount } from "../../../../../hooks/patients/useUpdatePatientAccount";
import { useDeactivatePatientAccount } from "../../../../../hooks/patients/useDeactivatePatientAccount";
import html2canvas from "html2canvas";
import IDCardUI from "../../Home_Dashboard/Components/IdCard/IDCardUI";
import { getPasswordRequirements, isPasswordValid as checkPasswordValid } from "../../../../../utils/passwordStrength";
import PasswordStrengthMeter from "../../../../ui/PasswordStrengthMeter";
import Spinner from "../../../../ui/Spinner";

const AccountSettingsTab = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    password: "",
    confirmPassword: "",
    middlename: "",
    email: "",
    phone_num: "",
    gender: "",
    DOB: "",
  });

  const navigate = useNavigate();
  const { data: profile } = usePatientProfile();
  const hasPrefilled = useRef(false);

  const [isAcctDeleteConfirmed, setIsAcctDeleteConfirmed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAcctDeleting, setIsAcctDeleting] = useState(false)
  const isPasswordValid = checkPasswordValid(getPasswordRequirements(formData.password));

  // 🔹 Pre-fill the form with the current profile once it loads
  useEffect(() => {
    if (profile && !hasPrefilled.current) {
      hasPrefilled.current = true;
      setFormData((prev) => ({
        ...prev,
        email: profile.email || "",
        phone_num: profile.phone_num || "",
        gender: profile.gender || "",
        DOB: profile.dob || "",
      }));
    }
  }, [profile]);


  const updateAccountMutation = useUpdatePatientAccount({
    onSuccess: () => {
      toast.success("Account updated successfully!");
      resetForm();
    },
    onError: (err: any) => {
      console.error("Error updating account:", err);
      toast.error("Error updating account.");
    },
  });

  const deleteAccountMutation = useDeactivatePatientAccount({
    onSuccess: () => {
      toast.success("Account deactivated successfully");
      sessionStorage.removeItem("token");
      navigate("/user-login");
    },
    onError: (err: any) => {
      console.error("Account deletion failed", err);
      toast.error("Failed to deactivate account.");
    },
  });

  const resetForm = () => {
    setFormData({
      firstname: "",
      lastname: "",
      middlename: "",
      email: profile?.email || "",
      password: "",
      confirmPassword: "",
      phone_num: profile?.phone_num || "",
      gender: profile?.gender || "",
      DOB: profile?.dob || "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  }


  // 🔹 Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "email" ? value.toLowerCase() : value,
    }));
  };

  // 🔹 Handle Save Changes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Separate password/email (root fields) from others (profile fields)
    const { email, password, confirmPassword, ...profileFields } = formData;

    // Fields are pre-filled with the current profile, so only send ones that actually changed
    const originalValues: Record<string, string> = {
      phone_num: profile?.phone_num || "",
      gender: profile?.gender || "",
      DOB: profile?.dob || "",
    };
    const filledProfile = Object.fromEntries(
      Object.entries(profileFields).filter(
        ([key, value]) => value.trim() !== "" && value !== originalValues[key]
      )
    );

    const emailChanged = email.trim() && email !== (profile?.email || "");

    // Include changed email and password if present
    const payload = {
      ...(emailChanged && { email }),
      ...(password.trim() && { password }),
      ...(Object.keys(filledProfile).length > 0 && { profile: filledProfile }),
    };

    // Ensure there's something to send
    if (Object.keys(payload).length === 0) {
      toast.error("Please fill at least one field before saving changes.");
      return;
    }

    // Validate password if it's included
    if (payload.password && !isPasswordValid) {
      toast.error("Password does not meet all requirements.");
      return;
    }

    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    updateAccountMutation.mutate(payload);
  };

  // 🔹 Handle Cancel Changes (reset to empty or previous data)
  const handleCancel = () => {
    resetForm();
    toast.success("Changes cancelled successfully.");
  };

  // 🔹 Handle Account Deactivation
  const handleAcctDeactivate = async () => {

    if (!isAcctDeleteConfirmed) return;

    const confirmDeactivate = window.confirm(
      "⚠️ Are you sure you want to deactivate your account? This cannot be undone."
    );

    if (!confirmDeactivate) {
      toast.error("Account deactivation cancelled");
      setIsAcctDeleteConfirmed(false);
      return;
    }

    deleteAccountMutation.mutate();
    setIsAcctDeleteConfirmed(false);
  };






  return (
    <>
      <div className="space-y-4">
        <div className="w-full  mx-auto ">
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-2">
              {/* Name Input */}
              {/* <div className="">
                <label
                  htmlFor="fname"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name
                </label>
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-docuhealth-primary text-sm appearance-none "
                />
              </div>
              <div className="">
                <label
                  htmlFor="lname"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name
                </label>
                <input
                  id="lastname"
                  name="lastname"
                  type="text"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-docuhealth-primary text-sm appearance-none "
                />
              </div>
              <div className="">
                <label
                  htmlFor="mname"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Middle Name
                </label>
                <input
                  id="middlename"
                  name="middlename"
                  type="text"
                  value={formData.middlename}
                  onChange={handleChange}
                  className="w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-docuhealth-primary text-sm appearance-none "
                />
              </div> */}

              {/* Email Input */}
              <div className="">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-docuhealth-primary text-sm appearance-none "
                />
              </div>

              {/* Other Phone Number Input */}
              <div className="">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  id="phone_num"
                  name="phone_num"
                  type="number"
                  value={formData.phone_num}
                  onChange={handleChange}
                  className="w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-docuhealth-primary text-sm appearance-none "
                />
              </div>

              <div className="relative text-sm ">
                <p className="font-medium pb-1 text-gray-700">Gender :</p>
                <div className="relative">
                  <select
                    name="gender"
                    className="w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-docuhealth-primary text-sm appearance-none "
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select Gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>

                  {/* Custom dropdown arrow */}
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="relative text-sm">
                <p className="font-medium mb-1 text-gray-700">New Password :</p>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder=""
                    className={`w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-docuhealth-primary text-sm appearance-none pl-8 ${formData.password && !isPasswordValid
                      ? "focus:border-red-500"
                      : ""
                      }`}
                    value={formData.password}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                  />
                  <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-3 w-3 text-gray-400" />
                    ) : (
                      <FaEye className="h-3 w-3 text-gray-400" />
                    )}
                  </button>
                </div>

                <PasswordStrengthMeter password={formData.password} />
              </div>

              <div className="relative text-sm">
                <p className="font-medium mb-1 text-gray-700">Confirm New Password :</p>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder=""
                    className={`w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-docuhealth-primary text-sm appearance-none pl-8 ${formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? "focus:border-red-500"
                      : ""
                      }`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-3 w-3 text-gray-400" />
                    ) : (
                      <FaEye className="h-3 w-3 text-gray-400" />
                    )}
                  </button>
                </div>
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-[10px] mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="relative text-sm">
                <p className="font-medium text-gray-700 pb-1">
                  Date Of Birth :
                </p>
                <div className="relative">
                  <input
                    name="DOB"
                    type="date"
                    className="w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-docuhealth-primary text-sm appearance-none "
                    value={formData.DOB}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 relative pt-5">
                <button
                  onClick={handleSubmit}
                  disabled={updateAccountMutation.isPending}
                  className={`w-full px-3 sm:px-4 py-2 text-sm font-medium text-white rounded-full shadow-xs focus:outline-hidden transition-all cursor-pointer ${!updateAccountMutation.isPending
                    ? "bg-docuhealth-primary "
                    : "bg-gray-300 cursor-not-allowed"
                    }`}
                >
                  {updateAccountMutation.isPending ? (<span className="flex items-center justify-center gap-2">
                    <Spinner className="h-4 w-4 text-white" />
                    Saving Changes...
                  </span>) : "Save Changes"}
                </button>
                <button
                  type="button"
                  disabled={updateAccountMutation.isPending}
                  onClick={handleCancel}
                  className={`w-full px-3 sm:px-4 py-2 text-sm font-medium  rounded-full shadow-xs cursor-pointer ${!updateAccountMutation.isPending ? 'text-docuhealth-primary bg-white border border-docuhealth-primary hover:bg-gray-50' : 'cursor-not-allowed border broder-gray-300 text-gray-300'} focus:outline-hidden`}
                >
                  Cancel Changes
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="w-full max-w-md pt-10 space-y-4">
          <h3 className="text-red-600 font-medium">Deactivate Account</h3>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isAcctDeleteConfirmed}
              onChange={(e) => setIsAcctDeleteConfirmed(e.target.checked)}
              className="rounded-sm border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">
              I confirm account deactivation
            </span>
          </label>

          <button
            onClick={handleAcctDeactivate}
            disabled={!isAcctDeleteConfirmed || deleteAccountMutation.isPending}
            className={`px-8 py-2 text-sm font-medium rounded-full transition-all duration-200 w-full sm:w-auto cursor-pointer ${isAcctDeleteConfirmed && !deleteAccountMutation.isPending
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            {
              deleteAccountMutation.isPending ? (<span className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4 text-white" />
                Deactivating Account...
              </span>) : ("Deactivate Account")
            }
          </button>
        </div>
      </div>
    </>
  );
};

const IDCardTab = () => {
  const { data: profile } = usePatientProfile();
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const navigate = useNavigate();
  
  const isIdCardGenerated = profile?.id_card_generated;

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setDownloading(true);
    const toastId = toast.loading("Preparing your ID card...");

    try {
      // Small delay to ensure any fonts/images are ready
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // quality bootstrap
        useCORS: true,
        logging: false,
        backgroundColor: null, // Transparent background
        onclone: (clonedDoc) => {
          const elements = clonedDoc.getElementsByTagName("*");
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;

            const style = window.getComputedStyle(el);
            ["color", "backgroundColor", "borderColor", "outlineColor"].forEach(prop => {
              const val = (style as any)[prop];
              if (val && (val.includes("oklch") || val.includes("var("))) {
                // Force standard values for the capture
                if (prop === "color") {
                  if (el.classList.contains("text-white") || el.classList.contains("text-[white]")) {
                    el.style.color = "#ffffff";
                  } else {
                    el.style.color = "var(--color-docuhealth-gray-dark)";
                  }
                }
                if (prop === "backgroundColor") {
                  if (el.classList.contains("bg-white")) el.style.backgroundColor = "#ffffff";
                  else if (el.classList.contains("bg-docuhealth-bg-gray")) el.style.backgroundColor = "var(--color-docuhealth-bg-gray)";
                  // Don't override transparent or images
                }
                if (prop === "borderColor") el.style.borderColor = "var(--color-docuhealth-border-gray)";
              }
            });
          }
        }
      });

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `DocuHealth_ID_Card_${profile?.firstname || "Patient"}.png`;
      link.href = image;
      link.click();

      toast.success("ID card downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("ID card download failed:", error);
      toast.error("Failed to download ID card. Please try again.", { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-lg font-semibold text-docuhealth-primary">My DocuHealth Identity Card</h2>
          <p className="text-gray-500 text-sm">
            View and download your official DocuHealth Identity Card.
          </p>
        </div>

        {isIdCardGenerated && (
          <button
            disabled={downloading}
            onClick={handleDownload}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-medium transition-all shadow active:scale-95 ${downloading ? "bg-gray-400 cursor-not-allowed" : "bg-docuhealth-primary "
              }`}
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Downloading...
              </>
            ) : (
              <>
                <i className="bx bx-download text-lg"></i>
                Download Card
              </>
            )}
          </button>
        )}
      </div>

      {isIdCardGenerated ? (
        <div className="bg-gray-50 rounded-xl border  sm:p-12 shadow-inner">
          <div ref={cardRef} className="p-2 rounded-lg">
            <IDCardUI selectedProfile={profile} idCardData={profile.id_card} />
          </div>
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <i className="bx bx-info-circle"></i>
              This card contains both front and back views.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-10 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="bx bx-id-card text-4xl text-docuhealth-primary"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">ID Card Not Generated</h3>
          <p className="text-gray-600 text-sm max-w-md mx-auto mb-8">
            Your identity card hasn't been generated yet. It provides quick access to your medical history across our network.
          </p>
          <button
            onClick={() => navigate("/user-home-dashboard")}
            className="px-8 py-3 bg-docuhealth-primary text-white rounded-full text-sm font-medium hover:bg-docuhealth-primary-darker transition-colors"
          >
            Go Generate Now
          </button>
        </div>
      )}
    </div>
  );
}


const tabs = [
  { title: "Account Settings", content: <AccountSettingsTab /> },
  { title: "ID Card", content: <IDCardTab /> }
];

export default tabs;
