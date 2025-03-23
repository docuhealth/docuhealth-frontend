import React, { useEffect, useState } from "react";
import axios from "axios";

const DashHead = ({ isSidebarOpen, toggleSidebar, closeSidebar }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [data, setData] = useState(null);
  const [email, setEmail] = useState("fetching...");
  const [name, setName] = useState("fetching...");
  const [imageUrl, setImageUrl] = useState(null); // State for hospital image URL
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState("Loading..");
  const [showNotifications, setShowNotifications] = useState(false);
  

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("jwtToken"); // Retrieve token from localStorage
      console.log("Token:", token);

      if (!token) {
        console.log("Token not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching data...");
        const response = await axios.get(
          "https://docuhealth-backend.onrender.com/api/hospital/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
              "Content-Type": "application/json",
            },
          }
        );

        console.log("API Response:", response.data);

        setLoading(false);
        setData(response.data);
        // Extract and save specific data
        setName(response.data.hospital.name);
        setEmail(response.data.hospital.email);
        setImageUrl(response.data.hospital.image.secure_url);
      } catch (err) {
        console.error("Error fetching data:", err);
        console.log(err.response?.data?.message || "Error fetching data");
        setLoading(false);

        // Handle errors gracefully
        setName("Error, refresh");
        setEmail("Error, refresh");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("jwtToken"); // Retrieve token from localStorage
        console.log("Token:", token);

        if (!token) {
          console.log("Token not found. Please log in again.");
          setLoading(false);
          return;
        }
        console.log("Fetching hospital notifications...");

        // Make the GET request
        const response = await axios.get(
          "https://docuhealth-backend.onrender.com/api/hospital/get_notifications", // Replace with your actual API URL
          {
            headers: {
              Authorization: `Bearer ${token}`, // Replace with a valid JWT token
              "Content-Type": "application/json",
            },
          }
        );

        // Success notification
        setNotifications(response.data.notifications);
        console.log("Notifications retrieved successfully:", response.data);
      } catch (error) {
        // Error notification
        console.error(
          "Error retrieving hospital notifications:",
          error.response?.data || error.message
        );
      }
    };

    // Call the function inside useEffect
    fetchNotifications();
  }, []); // Empty dependency array ensures it runs only once when the component mounts

  return (
    <div>
      {/* Header */}
      <header className="hidden bg-white py-4 px-8 sm:flex justify-between items-center border">
        <h2 className="text-xl font-semibold">
          Welcome back {name}! 👋
        </h2>
        <div className="flex items-center gap-4">
          <div
            className="relative p-2 w-11 h-11 rounded-full bg-gray-100 flex justify-center items-center"
            onClick={toggleNotifications}
          >
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-2 h-2 flex items-center justify-center"></span>
            <button className="">
              <i class="bx bxs-bell text-yellow-400 text-2xl"></i>
            </button>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
              <img
                src={imageUrl}
                alt="Hospital Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col items-start">
              <p className="ml-2 text-sm font-medium">{name} Hospital</p>
              <p className="ml-2 text-sm text-gray-500">{email}</p>
            </div>
          </div>
        </div>
        {/* {showNotifications && (
        <div className="absolute top-20 right-0 mt-2 w-80 bg-white shadow-lg rounded-lg overflow-auto z-10">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          <ul className="divide-y">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <li key={notification._id} className="p-4 hover:bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-800">{notification.message.title}</h4>
                  <p className="text-xs text-gray-600">{notification.message.body}</p>
                  <span className="text-xs text-gray-500">{new Date(notification.created_at).toLocaleString()}</span>
                </li>
              ))
            ) : (
              <div className="p-4 text-sm text-gray-500">No notifications available.</div>
            )}
          </ul>
        </div>
      )} */}
      </header>

      <header className="sm:hidden bg-white shadow py-4 flex justify-between items-center px-4">
        <div className="text-sm font-semibold flex items-center gap-2">
          <p onClick={toggleSidebar}>
            <i className="bx bx-menu text-2xl"></i>
          </p>
          <p>
            {" "}
            <span className="font-light">Welcome back,</span> <br />
            {name} Hospital!{" "}
          </p>
          <p className="text-md">👋</p>
        </div>
        <div className="flex items-center gap-4">
          {/* <div className="relative">
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              1
            </span>
            <button className="p-2 bg-gray-200 rounded-full">🔔</button>
          </div> */}

          <div className="relative p-2 w-11 h-11 rounded-full bg-gray-100 flex justify-center items-center">
            {/* <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-2 h-2 flex items-center justify-center">
              
            </span> */}
            <button className="">
              <i class="bx bxs-bell text-yellow-400 text-2xl"></i>
            </button>
          </div>
          <div className="flex justify-center items-center">
            <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
              <img
                src={imageUrl}
                alt="Hospital Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <p onClick={togglePopover} className="cursor-pointer relative">
              <i
                className={`bx text-2xl ${
                  isPopoverOpen ? "bx-chevron-up" : "bx-chevron-down"
                }`}
              ></i>
            </p>
          </div>
          {isPopoverOpen && (
            <div className="absolute top-20 right-4 bg-white shadow-md rounded-lg  p-2 z-50">
              <ul className="text-sm text-gray-700">
                <li className="py-1 px-3 hover:bg-gray-100 cursor-pointer font-semibold">
                  {name} Hospital
                </li>
                <li className="pb-1 px-3 hover:bg-gray-100 cursor-pointer text-sm">
                  {email}
                </li>
              </ul>
            </div>
          )}
          
        </div>
      </header>
    </div>
  );
};

export default DashHead;
