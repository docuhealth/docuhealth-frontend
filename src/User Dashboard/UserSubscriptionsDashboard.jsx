import React, { useState, useEffect } from "react";
import UserDashHead from "./Dashboard Part/UserDashHead";
import Data from "./UserSubscriptionData/UserData.json";
import logo from "../assets/img/logo.png";
import { Link, useLocation } from "react-router-dom";
import DynamicDate from "../Components/Dynamic Date/DynamicDate";
import axios from "axios";
import { toast } from "react-toastify";
import UserSideBar from "../Components/UserSideBar/UserSideBar";
import EmergencyNotice from "../Components/EmergencyNotice/EmergencyNotice";

const UserSubscriptionsDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEmergencyModeEnabled, setEmergencyModeEnabled] = useState(false);

  const isActive = (path = "/user-home-dashboard") =>
    location.pathname === path;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const fetchPatientPlans = async () => {
    setLoading(true); // Show loading spinner
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      const response = await axios.get(
        "https://docuhealth-backend-h03u.onrender.com/api/patient/subscriptions/get_all_plans",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add JWT token in the header
          },
        }
      );
      console.log(response.data)

      setPlans(response.data.subscriptionPlans || []); // Assuming response.data.plans contains the plans
      // console.log(response.data.subscriptionPlans);
      // // toast.success("Plans fetched successfully!");
    } catch (err) {
      console.error("Error fetching plans:", err.message);
      // toast.error("Failed to fetch plans. Please try again.");
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  useEffect(() => {
    fetchPatientPlans();
  }, []);


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

    const handlePayment = async (planId) => {
      console.log("Plan ID:", planId); // Log the planId to see if it's being passed correctly
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
          toast.error("Token not found. Please log in again.");
          return; // don't continue if no token
        }
    
        const response = await axios.post(
          "https://docuhealth-backend-h03u.onrender.com/api/patient/subscriptions/initialize_payment_to_plan",
          {
            role: "patient",
            plan_id: planId, // also send the planId if needed
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
    
        const data = response.data;
        console.log("Fetched:", data);
        // maybe show success toast here if you want
      } catch (error) {
        toast.error(
          error.response?.data?.message || "An error occurred while processing payment."
        );
        console.error("Error initializing payment:", error.response.data.message);
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
          <section className="p-0 sm:p-8">
            <div className="p-5 sm:p-0">
              <DynamicDate />
            </div>
            <div className=" sm:border my-5 px-5 py-5 sm:rounded-3xl bg-white">
              {loading ? (
                // Show loading state when data is being fetched
                <div className="flex justify-center items-center py-10">
                  <p className="text-gray-500 text-lg font-semibold">
                    Loading plans...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plans
                    .slice() // Create a copy of the array to avoid mutating the original
                    .sort((a, b) => {
                      // Custom sorting logic: Basic → Monthly → Yearly
                      if (a.title.includes("Basic")) return -1;
                      if (
                        a.title.includes("Monthly") &&
                        !b.title.includes("Basic")
                      )
                        return -1;
                      return 1;
                    })
                    .map((plan, index) => (
                      <div
                        key={plan._id}
                        className={`p-4 rounded-xl ${
                          index === 0
                            ? "bg-[#F5F8F8]"
                            : "bg-gradient-to-b from-[#ECFAFF] to-[#EEEEFD]"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <p
                            className="text-sm text-gray-600"
                            style={{
                              color:
                                index === 1 || index === 2
                                  ? "#FE9000 "
                                  : "inherit",
                              paddingBottom:
                                index === 1 || index === 2 ? "10px" : "inherit",
                            }}
                          >
                            {plan.title}
                          </p>
                        </div>

                        {/* Price Section */}
                        <div className="pb-4">
                          <p className="text-2xl font-semibold pb-1">
                            ₦
                            {plan.price}
                            <span className="text-sm font-normal">
                              /{plan.duration}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 leading-6">
                            {plan.description}
                          </p>
                        </div>

                        <hr />

                        {/* Features Section */}
                        <div className="py-5">
                          {plan.features.map((feature, featureIndex) => (
                            <p
                              key={featureIndex}
                              className="flex items-center text-[12px]"
                            >
                              {feature.status === "on" ? (
                                <i className="bx bx-check text-[#0000FF] text-2xl"></i>
                              ) : (
                                <i className="bx bx-x text-2xl text-red-600"></i>
                              )}
                              {feature.feature}
                            </p>
                          ))}
                        </div>

                        {/* Button Section */}
                        <div
                         onClick={ () => handlePayment(plan._id)}
                          className={`rounded-full my-4 ${
                            index === 0
                              ? "font-semibold"
                              : index === 1
                              ? "border border-[#0000FF] text-[#0000FF] font-semibold"
                              : "bg-[#0000FF] text-white font-semibold"
                          }`}
                        >
                          <div className="py-3">
                            <p className="text-sm text-center cursor-pointer">
                              Choose {plan.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default UserSubscriptionsDashboard;
