import React, { useState, useEffect } from "react";
import UserDashHead from "./Dashboard Part/UserDashHead";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import profilepic from "../assets/profile.png";
import TabComponents from "../Hospital Dashboard/Tabs/TabComponent";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import DynamicDate from "../Dynamic Date/DynamicDate";
import { useNavigate } from "react-router-dom";

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
        const url = `https://docuhealth-backend.onrender.com/api/patient/dashboard?page=${page}&size=${size}`;

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
          console.log("Patient Dashboard Data:", data);
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
        console.log(datainfo);
      }
    };

    // Example Usage
    fetchPatientDashboard(1, 10)
      .then((data) => {
        // Process the dashboard data
        console.log("Dashboard Data:", data);
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
    fname: "",
    email: "",
    lname: "",
    phone: "",
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
    console.log("Form submitted:", formData);

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
          payload[
            key === "fname" ? "firstname" : key === "lname" ? "lastname" : key
          ] = formData[key].trim();
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
        "https://docuhealth-backend.onrender.com/api/patient/settings/update_patient_info",
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
        fname: "",
        email: "",
        lname: "",
        phone: "",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      fname: "",
      email: "",
      lname: "",
      phone: "",
      nin: "",
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
        "https://docuhealth-backend.onrender.com/api/patient/delete", // Replace with your API endpoint
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
      console.log("Token:", token);

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
        "https://docuhealth-backend.onrender.com/api/patient/settings/update_patient_password", // Replace with your API URL
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
        console.log("API Response:", response.data);
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
    console.log("Token:", token);

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
        "https://docuhealth-backend.onrender.com/api/patient/settings/update_patient_notification_settings", // Replace with your API endpoint
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
                    First Name
                  </label>
                  <input
                    id="fname"
                    name="fname"
                    type="text"
                    value={formData.fname}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 outline-none "
                  />
                </div>

                {/* Last Name Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="lname"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <input
                    id="lname"
                    name="lname"
                    type="text"
                    value={formData.lname}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                    id="phone"
                    name="phone"
                    type="number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-row justify-around sm:justify-start space-x-4">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium text-white bg-[#0000FF] border border-transparent rounded-full shadow-sm hover:bg-blue-700 focus:outline-none "
                >
                  {loadingInfo ? loadingInfo : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium text-[#0000FF] bg-white border border-[#0000FF] rounded-full shadow-sm hover:bg-gray-50 focus:outline-none  "
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
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
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
                  className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500"
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
                  className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500"
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
                  className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500"
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
              className="sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium text-white bg-[#0000FF] border border-transparent rounded-full shadow-sm hover:bg-blue-700 focus:outline-none "
            >
              {loading ? loading : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleSecurityCancel}
              className="sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium text-[#0000FF] bg-white border border-[#0000FF] rounded-full shadow-sm hover:bg-gray-50 focus:outline-none  "
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
              className="sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium text-white bg-[#0000FF] border border-transparent rounded-full shadow-sm hover:bg-blue-700 focus:outline-none "
              onClick={handleNotificationUpdate}
            >
              {loading ? loading : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleNotificationCancel}
              className="sm:w-auto flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium text-[#0000FF] bg-white border border-[#0000FF] rounded-full shadow-sm hover:bg-gray-50 focus:outline-none  "
            >
              Cancel Changes
            </button>
          </div>
        </div>
      ),
    },
  ];


  const handleToggleEmergencyMode = async () => {
    setEmergencyModeEnabled(!isEmergencyModeEnabled);

    const jwtToken = localStorage.getItem("jwtToken");
    try {
      const response = await fetch(
        "https://docuhealth-backend.onrender.com/api/patient/emergency/toggle_emergency_mode",
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
      // toast.success(responseData.message)
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
        <aside
          className={`fixed top-0 left-0 min-h-screen w-64 bg-white shadow-lg border z-20 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 sm:translate-x-0 sm:static sm:block`}
        >
          <div className="p-4 flex justify-between items-center  ">
            <div className="flex justify-start items-start gap-2">
              <img src={logo} alt="" />
              <h1 className="text-xl font-bold text-blue-600">DocuHealth</h1>
            </div>
            <div className=" sm:hidden " onClick={closeSidebar}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.9994 15L9 9M9.00064 15L15 9"
                  stroke="#1B2B40"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
                  stroke="#1B2B40"
                  stroke-width="1.5"
                />
              </svg>
            </div>
          </div>
          <nav className="mt-4">
            <ul>
              <Link to="/user-home-dashboard" onClick={closeSidebar}>
                <div className="px-4 my-4">
                  <li
                    className={`group px-4 py-2   ${
                      isActive("/user-home-dashboard")
                        ? "bg-[#0000FF] text-white"
                        : "text-gray-700"
                    } text-gray-700 hover:bg-[#0000FF] hover:text-white rounded-lg flex items-center gap-2 justify-start`}
                  >
                    <span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        id="svg"
                        className={`group-hover:fill-white ${
                          isActive("/user-home-dashboard") ? "fill-white" : ""
                        }`}
                      >
                        <path
                          d="M2.5 10C2.5 10.4602 2.8731 10.8333 3.33333 10.8333H8.33333C8.79358 10.8333 9.16667 10.4602 9.16667 10V3.33333C9.16667 2.8731 8.79358 2.5 8.33333 2.5H3.33333C2.8731 2.5 2.5 2.8731 2.5 3.33333V10ZM2.5 16.6667C2.5 17.1269 2.8731 17.5 3.33333 17.5H8.33333C8.79358 17.5 9.16667 17.1269 9.16667 16.6667V13.3333C9.16667 12.8731 8.79358 12.5 8.33333 12.5H3.33333C2.8731 12.5 2.5 12.8731 2.5 13.33333V16.6667ZM10.8333 16.6667C10.8333 17.1269 11.2064 17.5 11.6667 17.5H16.6667C17.1269 17.5 17.5 17.1269 17.5 16.6667V10C17.5 9.53975 17.1269 9.16667 16.6667 9.16667H11.6667C11.2064 9.16667 10.8333 9.53975 10.8333 10V16.6667ZM11.6667 2.5C11.2064 2.5 10.8333 2.8731 10.8333 3.33333V6.66667C10.8333 7.1269 11.2064 7.5 11.6667 7.5H16.6667C17.1269 7.5 17.5 7.1269 17.5 6.66667V3.33333C17.5 2.8731 17.1269 2.5 16.6667 2.5H11.6667Z"
                          className={`group-hover:fill-white ${
                            isActive("/user-home-dashboard")
                              ? "fill-white"
                              : "fill-[#647284]"
                          }`}
                        />
                      </svg>
                    </span>
                    My Medical Record
                  </li>
                </div>
              </Link>
              <Link to="/user-sub-account" onClick={closeSidebar}>
                <div className="px-4 my-4">
                  <li
                    className={`group px-4 py-2   ${
                      isActive("/user-sub-account")
                        ? "bg-[#0000FF] text-white"
                        : "text-gray-700"
                    } text-gray-700 hover:bg-[#0000FF] hover:text-white rounded-lg flex items-center gap-2 justify-start`}
                  >
                    <span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`group-hover:fill-white ${
                          isActive("/user-sub-account")
                            ? "fill-white"
                            : "fill-[#647284]"
                        }`}
                      >
                        <path
                          d="M1.66675 18.3333C1.66675 14.6514 4.65151 11.6667 8.33341 11.6667C12.0153 11.6667 15.0001 14.6514 15.0001 18.3333H13.3334C13.3334 15.5719 11.0948 13.3333 8.33341 13.3333C5.57199 13.3333 3.33341 15.5719 3.33341 18.3333H1.66675ZM8.33341 10.8333C5.57091 10.8333 3.33341 8.59583 3.33341 5.83333C3.33341 3.07083 5.57091 0.833333 8.33341 0.833333C11.0959 0.833333 13.3334 3.07083 13.3334 5.83333C13.3334 8.59583 11.0959 10.8333 8.33341 10.8333ZM8.33341 9.16667C10.1751 9.16667 11.6667 7.675 11.6667 5.83333C11.6667 3.99167 10.1751 2.5 8.33341 2.5C6.49175 2.5 5.00008 3.99167 5.00008 5.83333C5.00008 7.675 6.49175 9.16667 8.33341 9.16667ZM15.2365 12.2523C17.5537 13.2967 19.1667 15.6267 19.1667 18.3333H17.5001C17.5001 16.3033 16.2903 14.5559 14.5524 13.7726L15.2365 12.2523ZM14.6636 2.84434C16.3287 3.53086 17.5001 5.16967 17.5001 7.08333C17.5001 9.47517 15.6702 11.4377 13.3334 11.648V9.9705C14.7473 9.7685 15.8334 8.55333 15.8334 7.08333C15.8334 5.93279 15.1681 4.93836 14.2009 4.46362L14.6636 2.84434Z"
                          className={`group-hover:fill-white ${
                            isActive("/user-sub-account")
                              ? "fill-white"
                              : "fill-[#647284]"
                          }`}
                        />
                      </svg>
                    </span>
                    Sub-Accounts
                  </li>
                </div>
              </Link>
              <Link to="/user-settings-dashboard" onClick={closeSidebar}>
                <div className="px-4 my-4">
                  <li
                    className={`group px-4 py-2   ${
                      isActive("/user-settings-dashboard")
                        ? "bg-[#0000FF] text-white"
                        : "text-gray-700"
                    } text-gray-700 hover:bg-[#0000FF] hover:text-white rounded-lg flex items-center gap-2 justify-start`}
                  >
                    <span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`group-hover:fill-white ${
                          isActive("/user-settings-dashboard")
                            ? "fill-white"
                            : "fill-[#647284]"
                        }`}
                      >
                        <g clip-path="url(#clip0_274_2617)">
                          <path
                            d="M7.2386 3.33324L9.4108 1.16107C9.73621 0.835632 10.2639 0.835632 10.5893 1.16107L12.7615 3.33324H15.8334C16.2936 3.33324 16.6667 3.70634 16.6667 4.16657V7.23848L18.8389 9.41067C19.1643 9.73609 19.1643 10.2638 18.8389 10.5892L16.6667 12.7613V15.8333C16.6667 16.2935 16.2936 16.6666 15.8334 16.6666H12.7615L10.5893 18.8388C10.2639 19.1642 9.73621 19.1642 9.4108 18.8388L7.2386 16.6666H4.1667C3.70646 16.6666 3.33336 16.2935 3.33336 15.8333V12.7613L1.1612 10.5892C0.835754 10.2638 0.835754 9.73609 1.1612 9.41067L3.33336 7.23848V4.16657C3.33336 3.70634 3.70646 3.33324 4.1667 3.33324H7.2386ZM5.00003 4.99991V7.92884L2.92896 9.99992L5.00003 12.071V14.9999H7.92896L10 17.071L12.0711 14.9999H15V12.071L17.0711 9.99992L15 7.92884V4.99991H12.0711L10 2.92884L7.92896 4.99991H5.00003ZM10 13.3333C8.15908 13.3333 6.6667 11.8408 6.6667 9.99992C6.6667 8.15896 8.15908 6.66657 10 6.66657C11.841 6.66657 13.3334 8.15896 13.3334 9.99992C13.3334 11.8408 11.841 13.3333 10 13.3333ZM10 11.6666C10.9205 11.6666 11.6667 10.9204 11.6667 9.99992C11.6667 9.07942 10.9205 8.33326 10 8.33326C9.07955 8.33326 8.33338 9.07942 8.33338 9.99992C8.33338 10.9204 9.07955 11.6666 10 11.6666Z"
                            className={`group-hover:fill-white ${
                              isActive("/user-settings-dashboard")
                                ? "fill-white"
                                : "fill-[#647284]"
                            }`}
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_274_2617">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </span>
                    Settings
                  </li>
                </div>
              </Link>
              <Link to="/user-subscriptions-dashboard" onClick={closeSidebar}>
                <div className="px-4 my-4">
                  <li
                    className={`group px-4 py-2   ${
                      isActive("/user-subscriptions-dashboard")
                        ? "bg-[#0000FF] text-white"
                        : "text-gray-700"
                    } text-gray-700 hover:bg-[#0000FF] hover:text-white rounded-lg flex items-center gap-2 justify-start`}
                  >
                    <span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`group-hover:fill-white ${
                          isActive("/user-subscriptions-dashboard")
                            ? "fill-white"
                            : "fill-[#647284]"
                        }`}
                      >
                        <path
                          d="M2.50411 2.50244H17.5041C17.9644 2.50244 18.3375 2.87553 18.3375 3.33577V16.6691C18.3375 17.1293 17.9644 17.5024 17.5041 17.5024H2.50411C2.04388 17.5024 1.67078 17.1293 1.67078 16.6691V3.33577C1.67078 2.87553 2.04388 2.50244 2.50411 2.50244ZM3.33744 4.16911V15.8357H16.6708V4.16911H3.33744ZM7.08744 11.6691H11.6708C11.9009 11.6691 12.0875 11.4826 12.0875 11.2524C12.0875 11.0223 11.9009 10.8357 11.6708 10.8357H8.33746C7.18685 10.8357 6.25411 9.90307 6.25411 8.7524C6.25411 7.60184 7.18685 6.66911 8.33746 6.66911H9.17079V5.00244H10.8375V6.66911H12.9208V8.33573H8.33746C8.10733 8.33573 7.92078 8.52232 7.92078 8.7524C7.92078 8.98257 8.10733 9.16907 8.33746 9.16907H11.6708C12.8214 9.16907 13.7541 10.1018 13.7541 11.2524C13.7541 12.4031 12.8214 13.3357 11.6708 13.3357H10.8375V15.0024H9.17079V13.3357H7.08744V11.6691Z"
                          className={`group-hover:fill-white ${
                            isActive("/user-subscriptions-dashboard")
                              ? "fill-white"
                              : "fill-[#647284]"
                          }`}
                        />
                      </svg>
                    </span>
                    Subscriptions
                  </li>
                </div>
              </Link>
              <Link to="/user-logout-dashboard" onClick={closeSidebar}>
                <div className="px-4 my-4">
                  <li
                    className={`group px-4 py-2   ${
                      isActive("/user-logout-dashboard")
                        ? "bg-[#0000FF] text-white"
                        : "text-gray-700"
                    } text-gray-700 hover:bg-[#0000FF] hover:text-white rounded-lg flex items-center gap-2 justify-start`}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`group-hover:fill-white ${
                        isActive("/user-logout-dashboard")
                          ? "fill-white"
                          : "fill-[#647284]"
                      }`}
                    >
                      <path
                        d="M3.33329 12.4998H4.99996V16.6665H15V3.33317H4.99996V7.49984H3.33329V2.49984C3.33329 2.0396 3.70639 1.6665 4.16663 1.6665H15.8333C16.2935 1.6665 16.6666 2.0396 16.6666 2.49984V17.4998C16.6666 17.9601 16.2935 18.3332 15.8333 18.3332H4.16663C3.70639 18.3332 3.33329 17.9601 3.33329 17.4998V12.4998ZM8.33329 9.1665V6.6665L12.5 9.99984L8.33329 13.3332V10.8332H1.66663V9.1665H8.33329Z"
                        className={`group-hover:fill-white ${
                          isActive("/user-logout-dashboard")
                            ? "fill-white"
                            : "fill-[#647284]"
                        }`}
                      />
                    </svg>
                    Log-out
                  </li>
                </div>
              </Link>
            </ul>
          </nav>
          <hr />
          <div className="flex justify-center items-center py-3 gap-2 text-gray-700 cursor-pointer">
            <p>Emergency Mode</p>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleToggleEmergencyMode()}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isEmergencyModeEnabled ? "bg-black" : "bg-gray-200"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isEmergencyModeEnabled ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Header */}
          <UserDashHead
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            closeSidebar={closeSidebar}
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
