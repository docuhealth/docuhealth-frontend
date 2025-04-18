import React, { useState, useEffect } from "react";
import UserDashHead from "./Dashboard Part/UserDashHead";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/img/logo.png";
import axios from "axios";
import UserSideBar from "../Components/UserSideBar/UserSideBar";

const UserLogoutDasboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState("");
  const [isEmergencyModeEnabled, setEmergencyModeEnabled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path = "/user-home-dashboard") =>
    location.pathname === path;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const [noticeDisplay, setNoticeDisplay] = useState(false);

  useEffect(() => {
    // Show notice immediately when the dashboard loads
    setNoticeDisplay(true);
  }, []);

  const closeNoticeMessage = () => {
    setNoticeDisplay(false);
    navigate("/user-home-dashboard");
  };
  const noticeMessage = [
    {
      title: "Health Identification Number (HIN)",
      details: "Are you sure you want to log out ?",
      by: "Yes I am sure, Log Out",
    },
  ];

  const handleLogOut = async () => {
    setLoading("Logging Out");

    const token = localStorage.getItem("jwtToken"); // Retrieve token from localStorage
    console.log("Token:", token);

    if (!token) {
      console.log("Token not found. Please log in again.");
      setLoading(false);
      return;
    }
    try {
      // Make the POST request to the API
      const response = await axios.post(
        "https://docuhealth-backend-h03u.onrender.com/api/auth/logout",
        {}, // No body needed for this request
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include token if required
          },
        }
      );

      // Check if the response is successful
      if (response.status === 200) {
        console.log("Logout successful:", response.data.message);

        setLoading("Yes I am sure, Log Out");
        // Perform logout logic
        localStorage.removeItem("jwtToken"); // Remove token if applicable
        localStorage.removeItem("userlogin"); // Remove login data
        navigate("/user-login"); // Redirect to the login page
      }
    } catch (error) {
      // Handle error response
      if (error.response) {
        console.error("Logout failed:", error.response.data.message);
        alert("Logout failed. Please try again.");
        setLoading("Yes I am sure, Log Out");
      } else {
        // Handle network or unexpected errors
        console.error("An error occurred during logout:", error.message);
        alert("An error occurred. Please try again later.");
        setLoading("Yes I am sure, Log Out");
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
          <UserSideBar
      
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
      closeSidebar={closeSidebar}
      isEmergencyModeEnabled={isEmergencyModeEnabled}
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
          {/* Content */}
          <section className="p-8">
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
                          <p className="font-semibold">Confirm Log Out</p>
                        </div>
                        <div>
                          <i
                            class="bx bx-x text-2xl cursor-pointer"
                            onClick={closeNoticeMessage}
                          ></i>
                        </div>
                      </div>
                      <div className="py-3">
                        <p className=" text-gray-600 pb-4 text-center">
                          {message.details}
                        </p>
                      </div>
                      <div className="text-center bg-[#0000FF] text-white py-2 rounded-full">
                        <p
                          className="font-normal cursor-pointer"
                          onClick={handleLogOut}
                        >
                          {" "}
                          {loading ? loading : message.by}
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

export default UserLogoutDasboard;
