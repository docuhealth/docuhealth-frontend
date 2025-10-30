import React, { useState, useEffect } from "react";

const AdminHead = ({ isSidebarOpen, toggleSidebar, closeSidebar }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const [datainfo, setDataInfo] = useState("");
  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
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
  return (
    <div>
      {/* Header */}
      <header className="hidden bg-white py-4 px-8 sm:flex justify-between items-center border">
        <h2 className="text-md font-semibold">
          Welcome back {datainfo?.metrics?.name || "loading..."}! 👋
        </h2>
        <div className="flex items-center gap-4">
        <div
            className="relative p-2 w-11 h-11 rounded-full bg-gray-100 flex justify-center items-center"
         
          >
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-2 h-2 flex items-center justify-center"></span>
            <button className="">
              <i class="bx bxs-bell text-yellow-400 text-2xl"></i>
            </button>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
              <img
                src="https://img.freepik.com/free-vector/minimalist-geometric-judith-s-tiktok-profile-picture_742173-12131.jpg?ga=GA1.1.384133121.1729851340&semt=ais_hybrid"
                alt="description"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col items-start">
              <p className="ml-2 text-sm font-medium">{datainfo?.metrics?.name || "loading..."}</p>
              <p className="ml-2 text-sm text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      </header>

      <header className=" sm:hidden bg-white shadow-sm py-4 flex justify-between items-center px-4 ">
        <div className="text-sm font-semibold flex items-center gap-2">
          <p onClick={toggleSidebar}>
            <i class="bx bx-menu text-2xl"></i>
          </p>
          <p>
            {" "}
            <span className="font-light">Welcome back,</span> <br />
            {datainfo?.metrics?.name || "loading..."}!{" "}
          </p>
          <p className="text-md">👋</p>
        </div>
        <div className="flex items-center gap-4">
        
          <div className="flex justify-center items-center">
          <div
            className="relative p-2 w-11 h-11 rounded-full bg-gray-100 flex justify-center items-center"
         
          >
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-2 h-2 flex items-center justify-center"></span>
            <button className="">
              <i class="bx bxs-bell text-yellow-400 text-2xl"></i>
            </button>
          </div>
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
              <img
                src="https://img.freepik.com/free-vector/minimalist-geometric-judith-s-tiktok-profile-picture_742173-12131.jpg?ga=GA1.1.384133121.1729851340&semt=ais_hybrid"
                alt="description"
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
            <div className="absolute top-20 right-4 bg-white shadow-md rounded-lg w-40 p-2 z-50">
              <ul className="text-sm text-gray-700">
                <li className="py-1 px-3 hover:bg-gray-100 cursor-pointer font-semibold">
                {datainfo?.metrics?.name || "loading..."}
                </li>
                <li className="pb-1 px-3 hover:bg-gray-100 cursor-pointer">
                  Admin
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default AdminHead;
