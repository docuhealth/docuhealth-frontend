import React, { useState, useEffect, useContext } from "react";
import { Bell } from "lucide-react";
import Hospital_Doctors_Sidebar_Mobile from "./Hospital_Doctors_Sidebar_Mobile";

const Hospital_Doctors_Header = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);
    const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
    };

    const profile = null;
    const defaultProfile = {
    firstname: "Guest",
    lastname: "Guest",
  };

    const hospitalDoctorsProfile = profile || defaultProfile;


    return(
        <>
           <div className="relative">
        <header className="hidden bg-white py-4 px-6 sm:flex justify-between items-center border ">
          <h2 className="text-md font-medium">
            Welcome back{" "}
            {hospitalDoctorsProfile
              ? `${hospitalDoctorsProfile.firstname} ${hospitalDoctorsProfile.lastname}`
              : "Loading..."}{" "}
            ! 👋
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-2 h-2 flex items-center justify-center"></span>
              <button className="p-2 bg-gray-200 rounded-full">
                <Bell className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center text-sm font-semibold ">
                {hospitalDoctorsProfile
                  ? `${hospitalDoctorsProfile.firstname?.[0] || ""}${
                      hospitalDoctorsProfile.lastname?.[0] || ""
                    }`.toUpperCase()
                  : "NA"}
              </div>
              <div className="flex flex-col items-start">
                <p className="ml-2 text-sm font-medium">
                  {hospitalDoctorsProfile
                    ? `${hospitalDoctorsProfile.firstname} ${hospitalDoctorsProfile.lastname}`
                    : "Loading..."}
                </p>
                <p className="ml-2 text-sm text-gray-500">Hospital</p>
              </div>
            </div>
          </div>
        </header>

        <header className=" sm:hidden bg-white shadow-sm py-4 flex justify-between items-center px-4 ">
          <div className="text-sm font-semibold flex items-center gap-2">
            <p>
              <i
                class="bx bx-menu text-2xl"
                onClick={() => setOpenMobileSidebar(!openMobileSidebar)}
              ></i>
            </p>
            <p>
              {" "}
              <span className="font-light">Welcome back,</span> <br />
              {hospitalDoctorsProfile
                ? `${hospitalDoctorsProfile.firstname} ${hospitalDoctorsProfile.lastname}`
                : "Loading..."}{" "}
              !{" "}
            </p>
            <p className="text-md">👋</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-2 h-2 flex items-center justify-center"></span>
              <button className="p-2 bg-gray-200 rounded-full">
                <Bell className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-center items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center">
                {hospitalDoctorsProfile
                  ? `${hospitalDoctorsProfile.firstname?.[0] || ""}${
                      hospitalDoctorsProfile.lastname?.[0] || ""
                    }`.toUpperCase()
                  : "NA"}
              </div>
              <p onClick={togglePopover} className="cursor-pointer relative">
                <i
                  className={`bx bx-chevron-down text-2xl transform transition-transform duration-300 ${
                    isPopoverOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </p>
            </div>
            {isPopoverOpen && (
              <div className="absolute top-20 right-4 bg-white shadow-sm rounded-md  p-2 z-50">
                <ul className="text-sm text-gray-700">
                  <li className="py-1 px-3 hover:bg-gray-100 cursor-pointer font-semibold">
                    {hospitalDoctorsProfile
                      ? `${hospitalDoctorsProfile.firstname} ${hospitalDoctorsProfile.lastname}`
                      : "Loading..."}
                  </li>
                  <li className="pb-1 px-3 hover:bg-gray-100 cursor-pointer">
                    Hospital
                  </li>
                </ul>
              </div>
            )}
          </div>
        </header>
        <div className="sm:hidden">
          <Hospital_Doctors_Sidebar_Mobile
            openMobileSidebar={openMobileSidebar}
            setOpenMobileSidebar={setOpenMobileSidebar}
          />
        </div>
      </div>
        
        </>
    )

}

export default Hospital_Doctors_Header;