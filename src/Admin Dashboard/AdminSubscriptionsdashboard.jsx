import React, { useState, useEffect } from "react";
import logo from "../assets/img/logo.png";
import { Link, useLocation } from "react-router-dom";
import AdminHead from "./Admin Part/AdminHead";
import axios from "axios";
import { toast } from "react-toastify";
import DynamicDate from "../Components/Dynamic Date/DynamicDate";
import { ChevronDown } from "lucide-react";
import AdminSideBar from "../Components/AdminSideBar/AdminSideBar";

const AdminSubscriptionsdashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [datainfo, setDataInfo] = useState("");
  const location = useLocation();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubDataAval, setisSubDataAval] = useState(false);

  const [selected, setSelected] = useState("Individuals");
  const [isOpen, setIsOpen] = useState(false);

  const [popoverOpen, setPopoverOpen] = useState({});

  const options = ["Individuals", "Hospitals"];

  const isActive = (path = "/admin-home-dashboard") =>
    location.pathname === path;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const fetchPatientDashboard = async (page = 1, size = 10) => {
      // Retrieve the JWT token from localStorage
      const jwtToken = localStorage.getItem("jwtToken"); // Replace "jwtToken" with your token key
      const role = "admin"; // Replace with the required role

      try {
        // Construct the URL with query parameters
        const url = `https://docuhealth-backend-h03u.onrender.com/api/admin/dashboard?page=${page}&size=${size}`;

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
          console.log("Admin Dashboard Data:", data);
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

  const fetchSubscriptionPlans = async () => {
    toast.success("Fetching Subscription Plans...");
    setLoading(true); // Show loading spinner
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      const response = await axios.get(
        "https://docuhealth-backend-h03u.onrender.com/api/admin/subscriptions/get_all_plans",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add JWT token in the header
          },
        }
      );

      setPlans(response.data.subscriptionPlans || []); // Assuming response.data.plans contains the plans
      toast.success("Fetched Subscription Plans");
      console.log(response.data.subscriptionPlans);
      setisSubDataAval(true);
      // toast.success("Plans fetched successfully!");
    } catch (err) {
      console.error("Error fetching plans:", err.message);
      // toast.error("Failed to fetch plans. Please try again.");
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  const togglePopover = (planId) => {
    setPopoverOpen((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  const deleteSubscriptionPlan = async (plan_id) => {
    toast.success('Removing Subscription Plan');
    console.log(plan_id)
  
    try {
      // Retrieve token from localStorage
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        toast.error("Authentication failed. Please log in again.");
        return;
      }
  
      // Make the DELETE request to the API with JSON body
      const response = await axios.delete(
        "https://docuhealth-backend-h03u.onrender.com/api/admin/subscriptions/delete", // Replace with your API endpoint
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT token
            "Content-Type": "application/json",
          },
          data: { plan_id }, // Send plan_id as JSON data
        }
      );
  
      // Check if the response is successful
      if (response.status === 200) {
        toast.success('Subscription plan removed successfully');
        window.location.reload();

      } else {
        toast.error(response.data.message || "Failed to remove subscription plan");
      }
    } catch (error) {
      // Handle errors
      if (error.response) {
        console.error("API Error Response:", error.response.data);
        toast.error(error.response.data.message || "An error occurred. Please try again.");
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("No response from the server. Please check your internet connection.");
      } else {
        console.error("Error:", error.message);
        toast.error(`An error occurred: ${error.message}`);
      }
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

        <AdminSideBar 
           isSidebarOpen={isSidebarOpen}
           closeSidebar={closeSidebar}
           isActive={isActive}
        />
        {/* Main Content */}
        <main className="flex-1">
          {/* Header */}
          <AdminHead
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            closeSidebar={closeSidebar}
          />

          {/* Content */}
          <section className="p-8">
            <div className="flex flex-col md:flex-row justify-start items-start md:justify-between md:items-center gap-3">
              <div className=" sm:p-0">
                <DynamicDate />
              </div>
              <div>
                <div className="relative text-left flex flex-col   md:flex-row items-start md:items-center gap-4">
                  {isSubDataAval && (
                    <button className="border border-[#0000FF] text-[#0000FF] py-2 px-4 rounded-full flex items-center gap-2">
                      Create A New Plan
                    </button>
                  )}
                  <button
                    className="bg-[#0000FF] text-[#FFF] py-2 px-4 rounded-full flex items-center gap-2"
                    onClick={() => fetchSubscriptionPlans()}
                  >
                    View subscriptions plans
                  </button>

                  {!isSubDataAval && (
                    <button
                      className="border border-[#0000FF] text-[#0000FF] py-2 px-4 rounded-full flex items-center gap-2"
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      {selected} <ChevronDown className="w-4 h-4" />
                    </button>
                  )}

                  {isOpen && (
                    <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-md">
                      {options.map((option) => (
                        <button
                          key={option}
                          className="block w-full px-4 py-2 text-left hover:bg-blue-100"
                          onClick={() => {
                            setSelected(option);
                            setIsOpen(false);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {isSubDataAval && (
              <div className="bg-white border my-4 p-8 rounded-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plans.map((plan, index) => (
                    <div
                      key={plan._id}
                      className={`p-4 rounded-xl relative ${
                        index === 0
                          ? "bg-[#F5F8F8]"
                          : "bg-gradient-to-b from-[#ECFAFF] to-[#EEEEFD]"
                      }`}
                    >
                      {/* Plan Title and Price */}
                      <div className="flex justify-between items-center">
                        <p
                          className="text-sm text-gray-600"
                          style={{
                            color:
                              index === 1 || index === 2
                                ? "#FE9000"
                                : "inherit",
                            paddingBottom:
                              index === 1 || index === 2 ? "10px" : "inherit",
                          }}
                        >
                          {plan.title}
                        </p>
                        <i
                          className={`bx bx-dots-vertical-rounded cursor-pointer text-xl ${
                            popoverOpen[plan._id]
                              ? "bg-gray-300 rounded-md p-1"
                              : ""
                          }`}
                          onClick={() => togglePopover(plan._id)}
                        ></i>
                      </div>

                      {popoverOpen[plan._id] && (
                        <div className="absolute top-14 right-0 bg-white shadow p-2 rounded">
                          <p className="text-sm text-gray-700 cursor-pointer" onClick={() => {deleteSubscriptionPlan(plan.plan_id)
                            togglePopover(plan._id) }
                          }>Remove Plan</p>
                        </div>
                      )}

                      <div className="pb-4">
                        <p className="text-2xl font-semibold pb-1">
                          ₦{plan.price}{" "}
                          <span className="text-sm font-normal">
                            /{plan.duration}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 leading-6">
                          {plan.description}
                        </p>
                      </div>
                      <hr />

                      {/* Plan Features */}
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

                      {/* Plan Button */}
                      <div
                        className={`rounded-full my-4 font-semibold border border-[#0000FF] text-[#0000FF] cursor-pointer`}
                      >
                        <div className="py-3">
                          <p className="text-sm text-center">Edit Plan</p>
                        </div>
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

export default AdminSubscriptionsdashboard;
