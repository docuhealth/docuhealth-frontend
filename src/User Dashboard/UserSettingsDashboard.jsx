import React, { useState, useEffect } from "react";
import UserDashHead from "./Dashboard Part/UserDashHead";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/img/logo.png";
import TabComponents from "../Hospital Dashboard/Tabs/TabComponent";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import toast from 'react-hot-toast';
import DynamicDate from "../Components/Dynamic Date/DynamicDate";
import { useNavigate } from "react-router-dom";
import UserSideBar from "../Components/UserSideBar/UserSideBar";
import EmergencyNotice from "../Components/EmergencyNotice/EmergencyNotice";

const UserSettingsDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [newpassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [datainfo, setDataInfo] = useState("");

  const [isEmailEnabled, setIsEmailEnabled] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [isDashboardEnabled, setIsDashboardEnabled] = useState(false);
  const [isEmergencyModeEnabled, setEmergencyModeEnabled] = useState(false);

  const [loadingInfo, setLoadingInfo] = useState("");
  const [deactivate, setDeactivate] = useState("");
  const [loading, setLoading] = useState("");

  const location = useLocation();

  const isActive = (path = "/user-home-dashboard") =>
    location.pathname === path;

  useEffect(() => {
    const fetchPatientDashboard = async (page = 1, size = 10) => {
      // Retrieve the JWT token from localStorage
      const jwtToken = localStorage.getItem("jwtToken"); // Replace "jwtToken" with your token key
      const role = "patient"; // Replace with the required role

      try {
        // Construct the URL with query parameters
        const url = `https://docuhealth-backend-h03u.onrender.com/api/patient/dashboard?page=${page}&size=${size}`;

        // Make the GET request
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`, // Add JWT token to the Authorization header
            Role: role, // Add role to the headers
          },
        });

        // Handle the response
        if (response.ok) {
          const data = await response.json();
          // console.log("Patient Dashboard Data:", data);
          setDataInfo(data);

          // Display a success message or process the data as needed
          return data;
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch dashboard data:", errorData);

          // Handle errors with a message from the API
          throw new Error(
            errorData.message || "Failed to fetch dashboard data."
          );
        }
      } catch (error) {
        console.error("An unexpected error occurred:", error);

        // Handle unexpected errors
        throw error;
      } finally {
        // console.log(datainfo);
      }
    };

    // Example Usage
    fetchPatientDashboard(1, 10)
      .then((data) => {
        // Process the dashboard data
        // console.log("Dashboard Data:", data);
      })
      .catch((error) => {
        // Handle errors
        console.error("Error:", error.message);
      });
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone_num: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingInfo("Saving Changes");
    // console.log("Form submitted:", formData);

    try {
      // Retrieve token from local storage
      const token = localStorage.getItem("jwtToken");

      if (!token) {
        console.error("No token found. Please log in again.");
        toast.error("Authentication token is missing. Please log in.");
        return;
      }

      // Create payload by filtering only filled fields
      const payload = {};

      Object.keys(formData).forEach((key) => {
        if (formData[key] && formData[key].trim() !== "") {
          // Map form field names to API field names
          payload[key === "fullname" ? "fullname" : key] = formData[key].trim();
        }
      });

      // Ensure there's at least one field to update
      if (Object.keys(payload).length === 0) {
        console.warn("No fields to update.");
        toast.warning("Please fill at least one field before submitting.");
        return;
      }

      console.log("Payload:", payload);

      // Send the PATCH request using fetch
      const response = await fetch(
        "https://docuhealth-backend-h03u.onrender.com/api/patient/settings/update_patient_info",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("API Response:", responseData);
      toast.success("Patient Info Updated Successfully");
    } catch (error) {
      console.error("Error submitting the form:", error.message);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoadingInfo("Save Changes");
      setFormData({
        fullname: "",
        email: "",
        phone_num: "",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      fullname: "",
      email: "",
      phone_num: "",
    });
  };

  const handleSecurityCancel = () => {
    setPassword("");
    setConfirmPassword("");
    setNewPassword("");
  };

  const [isConfirmed, setIsConfirmed] = useState(false);

  const [noticeDisplay, setNoticeDisplay] = useState(false);

  const closeNoticeMessage = () => {
    setNoticeDisplay(false);
  };
  const noticeMessage = [
    {
      title: "Health Identification Number (HIN)",
      details:
        "Are you sure you want to proceed with deactivating your Docu Health account ? Deactivation your Docu Health account means you will loose access to Docu Health and all your information stored on the platform.",
      by: "Yes I am sure, Deactivate Account",
    },
  ];

  const handleAccountDeactivation = async () => {
    setDeactivate("Deactivating Account");
    setNoticeDisplay(false);

    try {
      // Make the DELETE request to the API
      const token = localStorage.getItem("jwtToken"); // Retrieve token from localStorage
      if (!token) {
        toast.error("Authentication failed. Please log in again.");
        return;
      }

      const response = await axios.delete(
        "https://docuhealth-backend-h03u.onrender.com/api/patient/delete", // Replace with your API endpoint
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT token
            "Content-Type": "application/json",
          },
        }
      );

      // Check if the response is successful
      if (response.status === 200) {
        // Remove token and login from localStorage
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userlogin");

        setDeactivate("Deactivate Account");
        // Navigate to hospital-login
        toast.success("Account successfully deactivated.");
        navigate("/user-login");
      } else {
        // If the API responds with an error
        toast.error(
          response.data.message ||
            "Failed to deactivate account. Please try again."
        );
        setDeactivate("Deactivate Account");
      }
    } catch (error) {
      // Handle errors
      if (error.response) {
        console.error("API Error Response:", error.response.data);
        toast.error(
          error.response.data.message || "An error occurred. Please try again."
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error(
          "No response from the server. Please check your internet connection."
        );
      } else {
        console.error("Error:", error.message);
        toast.error(`An error occurred: ${error.message}`);
      }
    } finally {
      setDeactivate("Deactivate Account");
    }
  };

  const handlePasswordUpdate = async (e) => {
    setLoading("Saving Changes");
    e.preventDefault();

    // Validate input fields
    if (!password || !newpassword || !confirmPassword) {
      toast.error("All fields are required!"); // Show error toast
      setLoading("Save Changes");
      return;
    }

    if (newpassword !== confirmPassword) {
      toast.error("New password and confirm password do not match!"); // Show error toast
      setLoading("Save Changes");
      return;
    }

    try {
      const token = localStorage.getItem("jwtToken"); // Retrieve token from localStorage
      // console.log("Token:", token);

      if (!token) {
        console.log("Token not found. Please log in again.");
        toast.error("Token not found. Please log in again."); // Show error toast

        return;
      }

      const payloadinfo = {
        old_password: password,
        new_password: newpassword,
      };

      // Send the PATCH request
      const response = await axios.patch(
        "https://docuhealth-backend-h03u.onrender.com/api/patient/settings/update_patient_password", // Replace with your API URL
        payloadinfo,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT token
            "Content-Type": "application/json",
          },
        }
      );

      // Display success notification
      if (response.status === 200) {
        // console.log("API Response:", response.data);
        toast.success("Password updated successfully!"); // Show success toast
        setLoading("Save Changes");
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.warning(
          "Password update encountered an issue. Please try again."
        );
        setLoading("Save Changes");
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      // Handle error and display notification
      if (error.response) {
        console.error("API Error Response:", error.response.data);
        toast.error(
          error.response.data.message ||
            "Failed to update password. Please try again."
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error(
          "No response from the server. Please check your connection."
        );
      } else {
        console.error("Error:", error.message);
        toast.error(`An error occurred: ${error.message}`);
      }
      setLoading("Save Changes");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleNotificationUpdate = async (e) => {
    setLoading("Saving Changes");
    e.preventDefault();

    const token = localStorage.getItem("jwtToken"); // Retrieve token from localStorage
    // console.log("Token:", token);

    if (!token) {
      console.log("Token not found. Please log in again.");
      setLoading(false);
      return;
    }
    // Prepare the payload data
    const payload = {
      sign_in: {
        email: isEmailEnabled ? "true" : "false",
        push: isNotificationEnabled ? "true" : "false",
        dashboard: isDashboardEnabled ? "true" : "false",
      },
      info_change: {
        email: isEmailEnabled ? "true" : "false",
        push: isNotificationEnabled ? "true" : "false",
        dashboard: isDashboardEnabled ? "true" : "false",
      },
      accessment_diagnosis: {
        email: isEmailEnabled ? "true" : "false",
        push: isNotificationEnabled ? "true" : "false",
        dashboard: isDashboardEnabled ? "true" : "false",
      },
    };

    // Check if any toggle button is changed
    const isAnyOptionChanged = Object.values(payload).some((section) =>
      Object.values(section).includes("true")
    );

    if (!isAnyOptionChanged) {
      toast.error("No changes detected. Please toggle at least one option.");
      setLoading("Save Changes");
      return;
    }

    try {
      // Send the payload to the API
      const response = await axios.patch(
        "https://docuhealth-backend-h03u.onrender.com/api/patient/settings/update_patient_notification_settings", // Replace with your API endpoint
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Handle success
      if (response.status === 200) {
        toast.success("Notification preferences updated successfully!");
        setLoading("Save Changes");
        setIsEmailEnabled(false);
        setIsDashboardEnabled(false);
        setIsNotificationEnabled(false);
      } else {
        toast.warning("Unexpected response from the server.");
        setLoading("Save Changes");
        setIsEmailEnabled(false);
        setIsDashboardEnabled(false);
        setIsNotificationEnabled(false);
      }
    } catch (error) {
      // Handle error
      if (error.response) {
        console.error("API Error Response:", error.response.data);
        toast.error(
          error.response.data.message || "Failed to update preferences."
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error(
          "No response from the server. Please check your connection."
        );
      } else {
        console.error("Error:", error.message);
        toast.error(`An error occurred: ${error.message}`);
        setIsEmailEnabled(false);
        setIsDashboardEnabled(false);
        setIsNotificationEnabled(false);
      }
    } finally {
      setLoading("Save Changes");
      setIsEmailEnabled(false);
      setIsDashboardEnabled(false);
      setIsNotificationEnabled(false);
    }
  };

  const handleNotificationCancel = () => {
    setIsEmailEnabled(false);
    setIsDashboardEnabled(false);
    setIsNotificationEnabled(false);
  };

  const tabs = [
    {
      title: "Accounts Setting",
      content: (
        <div className="space-y-4">
          <div className="w-full  mx-auto ">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="fname"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullname"
                    name="fullname"
                    type="text"
                    value={formData.fullname}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:ring-blue-500 focus:border-blue-500 outline-hidden "
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                  />
                </div>

                {/* Other Phone Number Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone_num"
                    name="phone_num"
                    type="number"
                    value={formData.phone_num}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-row justify-around sm:justify-start space-x-4">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium text-white bg-[#0000FF] border border-transparent rounded-full shadow-xs hover:bg-blue-700 focus:outline-hidden "
                >
                  {loadingInfo ? loadingInfo : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium text-[#0000FF] bg-white border border-[#0000FF] rounded-full shadow-xs hover:bg-gray-50 focus:outline-hidden  "
                >
                  Cancel Changes
                </button>
              </div>
            </form>
          </div>
          <div>
            <div className="w-full max-w-md p-4 space-y-4">
              <h3 className="text-red-600 font-medium">Delete Account</h3>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="rounded-sm border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  I confirm account deactivation
                </span>
              </label>

              <button
                onClick={() => {
                  setNoticeDisplay(true);
                }}
                disabled={!isConfirmed}
                className={` px-5 py-2 text-sm font-medium text-white rounded-full 
            ${
              isConfirmed
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-300 cursor-not-allowed"
            }
          `}
              >
                {deactivate ? deactivate : "Deactivate Account"}
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Security Settings",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Account Settings</h3>
          <div className=" grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative">
              <p className="pb-1">Password:</p>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=""
                  className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4 text-gray-400" />
                  ) : (
                    <FaEye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div className="relative">
              <p className="pb-1"> New Password:</p>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=""
                  className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-blue-500"
                  value={newpassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4 text-gray-400" />
                  ) : (
                    <FaEye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <p className="pb-1">Confirm Password:</p>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=""
                  className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-blue-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4 text-gray-400" />
                  ) : (
                    <FaEye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-row justify-around sm:justify-start space-x-4">
            <button
              type="submit"
              onClick={handlePasswordUpdate}
              className="sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium text-white bg-[#0000FF] border border-transparent rounded-full shadow-xs hover:bg-blue-700 focus:outline-hidden "
            >
              {loading ? loading : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleSecurityCancel}
              className="sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium text-[#0000FF] bg-white border border-[#0000FF] rounded-full shadow-xs hover:bg-gray-50 focus:outline-hidden  "
            >
              Cancel Changes
            </button>
          </div>
        </div>
      ),
    },
    {
      title: "Notification Settings",
      content: (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-start sm:items-center ">
            <div className="max-w-[300px]">
              <h3 className="pb-1 font-semibold">Accont Sign-In</h3>
              <p className="text-sm">
                You'll get notified when an hospital view your profile via your
                HIN.
              </p>
            </div>
            <div className="flex flex-col gap-3 py-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsEmailEnabled(!isEmailEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isEmailEnabled ? "bg-blue-600" : "bg-gray-200"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isEmailEnabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
                <span className="text-sm text-gray-700">Email</span>
              </div>
              <div className="flex items-center space-x-3 ">
                <button
                  onClick={() =>
                    setIsNotificationEnabled(!isNotificationEnabled)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isNotificationEnabled ? "bg-blue-600" : "bg-gray-200"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isNotificationEnabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
                <span className="text-sm text-gray-700">Push Notification</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsDashboardEnabled(!isDashboardEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isDashboardEnabled ? "bg-blue-600" : "bg-gray-200"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isDashboardEnabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
                <span className="text-sm text-gray-700">Dashboard</span>
              </div>
            </div>
          </div>
          <hr />
          <div className="flex flex-col sm:flex-row justify-start sm:items-center py-4">
            <div className="max-w-[300px]">
              <h3 className="pb-1 font-semibold">Accont Information Changes</h3>
              <p className="text-sm">
                You'll get notified when an account information is updated in
                the dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-3 py-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsEmailEnabled(!isEmailEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isEmailEnabled ? "bg-blue-600" : "bg-gray-200"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isEmailEnabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
                <span className="text-sm text-gray-700">Email</span>
              </div>
              <div className="flex items-center space-x-3 ">
                <button
                  onClick={() =>
                    setIsNotificationEnabled(!isNotificationEnabled)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isNotificationEnabled ? "bg-blue-600" : "bg-gray-200"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isNotificationEnabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
                <span className="text-sm text-gray-700">Push Notification</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsDashboardEnabled(!isDashboardEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isDashboardEnabled ? "bg-blue-600" : "bg-gray-200"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isDashboardEnabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
                <span className="text-sm text-gray-700">Dashboard</span>
              </div>
            </div>
          </div>
          <hr />

          <div className="flex flex-col sm:flex-row justify-start sm:items-center py-4">
            <div className="max-w-[300px]">
              <h3 className="pb-1 font-semibold">
                Summary Of Diagnosis & Treatment
              </h3>
              <p className="text-sm">
                You'll get notified when the summary of a diagnosis/treatment is
                carried out on your profile by any hospital visited.
              </p>
            </div>
            <div className="flex flex-col gap-3 py-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsEmailEnabled(!isEmailEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isEmailEnabled ? "bg-blue-600" : "bg-gray-200"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isEmailEnabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
                <span className="text-sm text-gray-700">Email</span>
              </div>
              <div className="flex items-center space-x-3 ">
                <button
                  onClick={() =>
                    setIsNotificationEnabled(!isNotificationEnabled)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isNotificationEnabled ? "bg-blue-600" : "bg-gray-200"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isNotificationEnabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
                <span className="text-sm text-gray-700">Push Notification</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsDashboardEnabled(!isDashboardEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isDashboardEnabled ? "bg-blue-600" : "bg-gray-200"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isDashboardEnabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
                <span className="text-sm text-gray-700">Dashboard</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-row justify-around sm:justify-start  space-x-4">
            <button
              type="submit"
              className="sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium text-white bg-[#0000FF] border border-transparent rounded-full shadow-xs hover:bg-blue-700 focus:outline-hidden "
              onClick={handleNotificationUpdate}
            >
              {loading ? loading : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleNotificationCancel}
              className="sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium text-[#0000FF] bg-white border border-[#0000FF] rounded-full shadow-xs hover:bg-gray-50 focus:outline-hidden  "
            >
              Cancel Changes
            </button>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const fetchPatientDashboard = async (page = 1, size = 10) => {
      // Retrieve the JWT token from localStorage
      const jwtToken = localStorage.getItem("jwtToken"); // Replace "jwtToken" with your token key
      const role = "patient"; // Replace with the required role

      try {
        // Construct the URL with query parameters
        const url = `https://docuhealth-backend-h03u.onrender.com/api/patient/dashboard?page=${page}&size=${size}`;

        // Make the GET request
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`, // Add JWT token to the Authorization header
            Role: role, // Add role to the headers
          },
        });

        // Handle the response
        if (response.ok) {
          const data = await response.json();
          // console.log("Patient Dashboard Data:", data);
          // setHin(data.HIN);
          // setName(data.fullname);
          // setDob(data.DOB);
          localStorage.setItem("toggleState", data.emergency);
          setEmergencyModeEnabled(data.emergency);
          // Display a success message or process the data as needed
          return data;
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch dashboard data:", errorData);

          // Handle errors with a message from the API
          throw new Error(
            errorData.message || "Failed to fetch dashboard data."
          );
        }
      } catch (error) {
        console.error("An unexpected error occurred:", error);

        // Handle unexpected errors
        throw error;
      }
    };

    // Example Usage
    fetchPatientDashboard(1, 10);
  }, []);

  const [emergencyNotice, setEmergencyNotice] = useState(false);

  const handleToggleEmergencyMode = async () => {
    const newState = !isEmergencyModeEnabled;
    setEmergencyModeEnabled(newState);
    setEmergencyNotice(false);

    localStorage.setItem("toggleState", newState.toString()); // Update local storage

    const jwtToken = localStorage.getItem("jwtToken");

    try {
      const response = await fetch(
        "https://docuhealth-backend-h03u.onrender.com/api/patient/emergency/toggle_emergency_mode",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update emergency mode");
      }

      const responseData = await response.json();
      toast.success(responseData.message);
      // console.log(responseData);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={closeSidebar}
          ></div>
        )}
        <UserSideBar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
          isEmergencyModeEnabled={isEmergencyModeEnabled}
          setEmergencyNotice={setEmergencyNotice}
          isActive={isActive}
        />

        {/* Main Content */}
        <main className="flex-1">
          {/* Header */}
          <UserDashHead
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            closeSidebar={closeSidebar}
          />

          <EmergencyNotice
            emergencyNotice={emergencyNotice}
            setEmergencyNotice={setEmergencyNotice}
            handleToggleEmergencyMode={handleToggleEmergencyMode}
          />

          {/* Content */}
          <section className="p-0 sm:p-8 ">
            <div className="p-5 sm:p-0">
              <DynamicDate />
            </div>
            <hr className="sm:hidden" />

            <div className=" sm:border my-5 px-5 py-5 sm:rounded-3xl bg-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center p-1">
                  {datainfo?.fullname
                    ? datainfo.fullname
                        .split(" ")
                        .map((word) => (word ? word[0].toUpperCase() : "")) // Add safeguard for empty strings
                        .join("")
                    : ""}
                </div>
                <div>
                  <p>{datainfo.fullname}</p>
                  <p className="text-gray-500 text-sm">Patient</p>
                </div>
              </div>
              <div>
                <TabComponents tabs={tabs} />
              </div>
            </div>
            {noticeDisplay && (
              <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 ">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative max-h-[80vh] overflow-y-auto mx-5">
                  {noticeMessage.map((message, index) => (
                    <div key={index} className="">
                      {" "}
                      <div className="flex justify-between items-center gap-2 pb-2">
                        <div className="flex justify-start items-center gap-2 ">
                          <p>
                            <i className="bx bx-info-circle text-3xl text-red-600"></i>
                          </p>
                          <p className="font-semibold">
                            Confirm Account Deactivation
                          </p>
                        </div>
                        <div>
                          <i
                            class="bx bx-x text-2xl cursor-pointer"
                            onClick={closeNoticeMessage}
                          ></i>
                        </div>
                      </div>
                      <div className="py-3">
                        <p className=" text-gray-600 pb-4">{message.details}</p>
                      </div>
                      <div className="text-center bg-red-600 text-white py-2 rounded-full">
                        <p
                          className="font-normal cursor-pointer"
                          onClick={handleAccountDeactivation}
                        >
                          {" "}
                          {message.by}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default UserSettingsDashboard;
