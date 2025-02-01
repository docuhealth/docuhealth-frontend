import React, { useEffect, useState } from "react";
import axios from "axios";

const DashHead = ({ isSidebarOpen, toggleSidebar, closeSidebar }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const[data, setData] = useState(null)
  const [email, setEmail] = useState("fetching...");
  const [name, setName] = useState("fetching...");
  const [imageUrl, setImageUrl] = useState(null); // State for hospital image URL
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setData(response.data)
        // Extract and save specific data
        setName(response.data.hospital.name);
        setEmail(response.data.hospital.email);
        setImageUrl(response.data.hospital.image.secure_url)
      
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

  return (
    <div>
      {/* Header */}
      <header className="hidden bg-white py-4 px-8 sm:flex justify-between items-center border">
        <h2 className="text-xl font-semibold">
          Welcome back {name} Hospital! 👋
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              1
            </span>
            <button className="p-2 bg-gray-200 rounded-full">🔔</button>
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
          <div className="relative">
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              1
            </span>
            <button className="p-2 bg-gray-200 rounded-full">🔔</button>
          </div>
          <div className="flex justify-center items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
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
