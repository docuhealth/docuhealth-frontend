import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Menu, ChevronDown, LogOut, User } from "lucide-react";
import Hospital_Doctors_Sidebar_Mobile from "./Hospital_Doctors_Sidebar_Mobile";
import { DoctorAppContext } from "../../../../context/HospitalContext/Doctors/DoctorAppContext";

const Hospital_Doctors_Header = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);
  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const { profile, hospitalLogo } = useContext(DoctorAppContext);

  const navigate = useNavigate();

  const initials = profile
    ? `${profile.firstname?.[0] || ""}${profile.lastname?.[0] || ""}`.toUpperCase()
    : "NA";

  const handleLogout = () => {
    sessionStorage.clear(); // removes ALL session-based auth data
    navigate("/login"); // redirect to login page
  };

  return (
    <>
       <div className="sticky top-0 z-30 w-full bg-white border-b border-gray-100 shadow">
      {/* --- Desktop Header --- */}
      <header className="hidden lg:flex justify-between items-center py-3.5 px-6">
        <div>
          <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Dashboard</h2>
          <p className="text-lg font-medium text-gray-800">
            Welcome back, {profile ? profile.firstname : "..."} 👋
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-[#3E4095] hover:bg-indigo-50 rounded-full transition-all">
            <span className="absolute top-2 right-2.5 bg-red-500 border-2 border-white rounded-full w-2.5 h-2.5"></span>
            <Bell className="w-5 h-5" />
          </button>

          {/* Profile Section */}
          <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900 leading-tight">
                {profile ? `${profile.firstname} ${profile.lastname}` : "Loading..."}
              </p>
              <p className="text-[11px] font-medium text-[#3E4095] bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                Hospital Doctor
              </p>
            </div>
            {hospitalLogo ? (
              <img src={hospitalLogo} alt="Hospital Logo" className="w-10 h-10 rounded-full object-cover shadow-md" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3E4095] to-indigo-400 flex justify-center items-center text-white text-sm font-bold shadow-md">
                {initials}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- Mobile Header --- */}
      <header className="lg:hidden flex justify-between items-center py-3 px-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setOpenMobileSidebar(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="leading-tight">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Welcome back</p>
            <p className="text-sm font-medium text-gray-800">
                {profile ? profile.firstname : "..."} !
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <button className="relative p-2 bg-gray-50 rounded-full text-gray-600">
                <span className="absolute top-1.5 right-1.5 bg-red-500 rounded-full w-2 h-2"></span>
                <Bell className="w-5 h-5" />
            </button>
            
            <div className="relative">
                <button 
                    onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                    className="flex items-center gap-1"
                >
                    {hospitalLogo ? (
                      <img src={hospitalLogo} alt="Hospital Logo" className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-50" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#3E4095] to-indigo-400  flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-50">
                        {initials}
                      </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isPopoverOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Mobile Dropdown Popover */}
                {isPopoverOpen && (
                    <div className="absolute right-0 top-14 w-48 bg-white border border-gray-100 shadow rounded-lg p-2 animate-in fade-in zoom-in duration-200">
                        <div className="px-3 py-2 mb-1 border-b border-gray-50">
                            <p className="text-xs font-bold text-gray-900 truncate">
                                {profile?.firstname} {profile?.lastname}
                            </p>
                            <p className="text-[10px] text-gray-500">Doctor</p>
                        </div>
                        {/* <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg">
                            <User className="w-3.5 h-3.5" /> Profile
                        </button> */}
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg mt-1"
                        onClick={handleLogout}
                        >
                            <LogOut className="w-3.5 h-3.5" /> Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
      </header>
      <div className="lg:hidden">
      {/* Mobile Sidebar Component */}
      <Hospital_Doctors_Sidebar_Mobile
        openMobileSidebar={openMobileSidebar}
        setOpenMobileSidebar={setOpenMobileSidebar}
      />
      </div>
    </div>
    </>
  );
};

export default Hospital_Doctors_Header;
