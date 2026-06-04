import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstanceHos from "../../../../../../utils/axiosInstanceHos";

const AccountSettingsTab = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });

  const queryClient = useQueryClient();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSymbol: false,
    hasMinLength: false,
  });

  const validatePassword = (password) => {
    const requirements = {
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      hasMinLength: password.length >= 8,
    };
    setPasswordRequirements(requirements);
    setIsPasswordValid(Object.values(requirements).every(Boolean));
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    if (score <= 1) return { strength: score, label: "Very Weak", color: "bg-red-500" };
    if (score <= 2) return { strength: score, label: "Weak", color: "bg-orange-500" };
    if (score <= 3) return { strength: score, label: "Fair", color: "bg-yellow-500" };
    if (score <= 4) return { strength: score, label: "Good", color: "bg-[#3E4095]" };
    return { strength: score, label: "Strong", color: "bg-green-500" };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "email" ? value.toLowerCase() : value,
    });
    if (name === "newPassword") validatePassword(value);
  };

  const updateNameMutation = useMutation({
    mutationFn: (data) => {
      const payload = {};
      if (data.firstname?.trim()) payload.firstname = data.firstname.trim();
      if (data.lastname?.trim()) payload.lastname = data.lastname.trim();
      return axiosInstanceHos.patch("api/auth/profile", payload);
    },
    onSuccess: () => {
      toast.success("Profile name updated!");
      queryClient.invalidateQueries(["lab-profile"]);
      setFormData((prev) => ({ ...prev, firstname: "", lastname: "" }));
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update name");
    },
  });

  const handleUpdateName = (e) => {
    e.preventDefault();
    if (!formData.firstname.trim() && !formData.lastname.trim())
      return toast.error("Please provide at least a first name or a last name.");
    updateNameMutation.mutate({ firstname: formData.firstname, lastname: formData.lastname });
  };

  const requestOtpMutation = useMutation({
    mutationFn: (emailData) =>
      axiosInstanceHos.post("api/auth/email/send-otp", emailData),
    onSuccess: () => {
      toast.success("OTP sent to your new email!");
      setShowOtpModal(true);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Error sending OTP");
    },
  });

  const handleRequestEmailOTP = (e) => {
    e.preventDefault();
    if (!formData.email.trim()) return toast.error("Please enter a new email");
    requestOtpMutation.mutate({ new_email: formData.email });
  };

  const verifyOtpMutation = useMutation({
    mutationFn: (otpData) =>
      axiosInstanceHos.patch("api/auth/email/verify-otp", otpData),
    onSuccess: () => {
      toast.success("Email updated successfully!");
      queryClient.invalidateQueries(["lab-profile"]);
      setShowOtpModal(false);
      setFormData((prev) => ({ ...prev, email: "", otp: "" }));
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Invalid OTP");
    },
  });

  const handleVerifyEmail = () => {
    verifyOtpMutation.mutate({ new_email: formData.email, otp: formData.otp });
  };

  const updatePasswordMutation = useMutation({
    mutationFn: (passwordData) =>
      axiosInstanceHos.patch("api/auth/hospital/password", {
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword,
      }),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setFormData((prev) => ({ ...prev, oldPassword: "", newPassword: "", confirmPassword: "" }));
      setIsPasswordValid(false);
      setPasswordRequirements({
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSymbol: false,
        hasMinLength: false,
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to change password");
    },
  });

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!formData.oldPassword || !formData.newPassword)
      return toast.error("Both password fields are required");
    if (!isPasswordValid)
      return toast.error("Please meet all password security requirements.");
    if (formData.newPassword !== formData.confirmPassword)
      return toast.error("Passwords do not match");
    updatePasswordMutation.mutate({
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="w-full max-w-lg">
          <form className="my-3">
            {/* Profile Info */}
            <div>
              <div className="border-b text-xs uppercase text-gray-600 pb-1">
                <p>Profile Info</p>
              </div>
              <div className="mt-3">
                <label htmlFor="firstname" className="block text-[12px] font-medium text-gray-700 mb-0.5">
                  FirstName
                </label>
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-[#3E4095] text-sm appearance-none"
                />
              </div>
              <div className="mt-3">
                <label htmlFor="lastname" className="block text-[12px] font-medium text-gray-700 mb-0.5">
                  LastName
                </label>
                <input
                  id="lastname"
                  name="lastname"
                  type="text"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-[#3E4095] text-sm appearance-none"
                />
              </div>
              <button
                onClick={handleUpdateName}
                disabled={
                  updateNameMutation.isPending ||
                  (!formData.firstname.trim() && !formData.lastname.trim())
                }
                className="mt-4 text-[12px] w-full lg:w-[50%] py-2 bg-[#3E4095] text-white rounded-full text-sm disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {updateNameMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  "Update Name"
                )}
              </button>
            </div>

            {/* Login Credentials */}
            <div className="mt-10">
              <div className="border-b text-xs uppercase text-gray-600 pb-1">
                <p>Login Credentials</p>
              </div>
              <div className="mt-3">
                <label htmlFor="email" className="block text-[12px] font-medium text-gray-700 mb-0.5">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-[#3E4095] text-sm appearance-none"
                />
              </div>
              <button
                onClick={handleRequestEmailOTP}
                disabled={
                  requestOtpMutation.isPending ||
                  !formData?.email?.includes("@") ||
                  !formData?.email?.includes(".")
                }
                className="mt-4 text-[12px] w-full lg:w-[50%] py-2 bg-[#3E4095] text-white rounded-full text-sm disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {requestOtpMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  "Change Email"
                )}
              </button>

              {/* Password */}
              <div className="mt-10">
                <div className="mb-3">
                  <p className="block text-[12px] font-medium text-gray-700 mb-0.5">Old Password :</p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="oldPassword"
                      className="w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-[#3E4095] text-sm appearance-none pl-8"
                      value={formData.oldPassword}
                      onChange={handleChange}
                    />
                    <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-3 transform -translate-y-1/2">
                      {showPassword ? <FaEyeSlash className="h-3 w-3 text-gray-400" /> : <FaEye className="h-3 w-3 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div className="relative text-sm">
                  <p className="block text-[12px] font-medium text-gray-700 mb-0.5">New Password :</p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      className={`w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-[#3E4095] text-sm appearance-none pl-8 ${
                        formData.newPassword && !isPasswordValid ? "focus:border-red-500" : ""
                      }`}
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                    <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-3 transform -translate-y-1/2">
                      {showPassword ? <FaEyeSlash className="h-3 w-3 text-gray-400" /> : <FaEye className="h-3 w-3 text-gray-400" />}
                    </button>
                  </div>

                  {formData.newPassword && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-[12px]">
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[12px] font-medium text-gray-700">Password Strength:</span>
                          <span className={`font-medium ${getPasswordStrength(formData.newPassword).color.replace("bg-", "text-")}`}>
                            {getPasswordStrength(formData.newPassword).label}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(formData.newPassword).color}`}
                            style={{ width: `${(getPasswordStrength(formData.newPassword).strength / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                      <p className="font-medium text-gray-700 mb-2">Password Requirements:</p>
                      <div className="space-y-1">
                        {[
                          { key: "hasLowercase", label: "Include lowercase letters (a-z)" },
                          { key: "hasUppercase", label: "Include uppercase letters (A-Z)" },
                          { key: "hasNumber",    label: "Include at least one number (0-9)" },
                          { key: "hasSymbol",    label: "Include at least one symbol (!@#$%^&*)" },
                          { key: "hasMinLength", label: "Be at least 8 characters long" },
                        ].map(({ key, label }) => (
                          <div key={key} className={`flex items-center ${passwordRequirements[key] ? "text-green-600" : "text-red-500"}`}>
                            <span className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements[key] ? "bg-green-500" : "bg-red-500"}`} />
                            {label}
                          </div>
                        ))}
                      </div>
                      {isPasswordValid && (
                        <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded-sm">
                          <p className="text-sm text-green-700 font-medium">✓ Password meets all requirements!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="block text-[12px] font-medium text-gray-700 mb-0.5">Confirm Password :</p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      className={`w-full h-[38px] px-3 py-2 border rounded-md outline-hidden focus:border-[#3E4095] text-sm appearance-none pl-8 ${
                        formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? "focus:border-red-500" : ""
                      }`}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-3 transform -translate-y-1/2">
                      {showPassword ? <FaEyeSlash className="h-3 w-3 text-gray-400" /> : <FaEye className="h-3 w-3 text-gray-400" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="text-red-500 text-[10px] mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  onClick={handleUpdatePassword}
                  disabled={
                    updatePasswordMutation.isPending ||
                    !isPasswordValid ||
                    !formData.oldPassword ||
                    formData.newPassword !== formData.confirmPassword ||
                    !formData.confirmPassword
                  }
                  className={`mt-4 text-[12px] w-full lg:w-[50%] py-2 rounded-full text-white transition-all flex items-center justify-center gap-2 ${
                    !isPasswordValid ||
                    updatePasswordMutation.isPending ||
                    !formData.oldPassword ||
                    formData.newPassword !== formData.confirmPassword ||
                    !formData.confirmPassword
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#3E4095]"
                  }`}
                >
                  {updatePasswordMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* OTP Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 px-3">
            <div className="bg-white rounded-lg py-6 px-3.5 lg:px-6 w-full max-w-sm relative">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-[#3E4095]">Verify Email</h3>
                <button onClick={() => setShowOtpModal(false)} className="text-gray-700">
                  <FaTimes />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Enter the OTP sent to {formData.email}</p>
              <input
                name="otp"
                placeholder="Enter OTP"
                maxLength={6}
                value={formData.otp}
                onChange={handleChange}
                className="w-full py-2 text-center text-sm tracking-widest border-2 rounded-lg focus:border-[#3E4095] outline-none mb-3"
              />
              <button
                onClick={handleVerifyEmail}
                disabled={verifyOtpMutation.isPending || !formData.otp.trim()}
                className="w-full py-2 bg-[#3E4095] text-white rounded-full text-[12px] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {verifyOtpMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  "Verify & Update Email"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const tabs = [{ title: "Account Settings", content: <AccountSettingsTab /> }];

export default tabs;
