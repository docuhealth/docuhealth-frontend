import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Menu, ChevronDown, LogOut, User, Trash2 } from "lucide-react";
import Hospital_Admin_Sidebar_Mobile from "./Hospital_Admin_Sidebar_Mobile";
import { HosAppContext } from "../../../../context/HospitalContext/Admin/HosAppContext";
import RemoveBrandingModal from "./Home_Dashboard/RemoveBrandingModal";

const Hospital_Admin_Header = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);

  const [isDesktopPopoverOpen, setIsDesktopPopoverOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const { profile } = useContext(HosAppContext);
  const navigate = useNavigate();

  const initials = profile
    ? `${profile.name?.[0] || ""}${profile.name?.[1] || ""}`.toUpperCase()
    : "NA";

  const profileImage = profile?.theme?.profile_image;

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <div className="sticky top-0 z-30 w-full bg-white border-b border-gray-100 shadow">
        {/* --- Desktop Header --- */}
        <header className="hidden lg:flex justify-between items-center py-3.5 px-6">
          <div>
            <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
              Dashboard
            </h2>
            <p className="text-lg font-medium text-gray-800">
              Welcome back, {profile ? profile.name : "..."} 👋
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-[#3E4095] hover:bg-indigo-50 rounded-full transition-all">
              <span className="absolute top-2 right-2.5 bg-red-500 border-2 border-white rounded-full w-2.5 h-2.5"></span>
              <Bell className="w-5 h-5" />
            </button>

            {/* Profile Section */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100 relative">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {profile ? `${profile.name}` : "Loading..."}
                </p>
                <p className="text-[11px] font-medium text-[#3E4095] bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                  Hospital Admin
                </p>
              </div>
              <button
                onClick={() => setIsDesktopPopoverOpen(!isDesktopPopoverOpen)}
                className="flex items-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-[#3E4095] to-indigo-400 flex justify-center items-center text-white text-sm font-bold shadow-md overflow-hidden border border-gray-100 transition-transform group-hover:scale-105">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Admin Profile Image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerText = initials;
                      }}
                    />
                  ) : (
                    initials
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform duration-200 ${isDesktopPopoverOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Desktop Dropdown Popover */}
              {isDesktopPopoverOpen && (
                <div className="absolute right-0 top-14 w-52 bg-white border border-gray-100 shadow-xl rounded-lg p-2 animate-in fade-in zoom-in duration-200 z-50">
                  <div className="px-3 py-2 mb-1 border-b border-gray-50">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {profile?.name}
                    </p>
                    <p className="text-[10px] text-gray-500">Hospital Admin</p>
                  </div>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    onClick={() => {
                      setIsRemoveModalOpen(true);
                      setIsDesktopPopoverOpen(false);
                    }}
                  >
                    <Trash2 size={15} />
                    Remove Profile Image
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg mt-1 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
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
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                Welcome back
              </p>
              <p className="text-sm font-medium text-gray-800">
                {profile ? profile.name : "..."} !
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
                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-[#3E4095] to-indigo-400 flex justify-center items-center text-white text-sm font-bold shadow-md overflow-hidden border border-gray-100">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Admin Profile Image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerText = initials;
                      }}
                    />
                  ) : (
                    initials
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${isPopoverOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Mobile Dropdown Popover */}
              {isPopoverOpen && (
                <div className="absolute right-0 top-14 w-48 bg-white border border-gray-100 shadow rounded-lg p-2 animate-in fade-in zoom-in duration-200">
                  <div className="px-3 py-2 mb-1 border-b border-gray-50">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {profile?.name}
                    </p>
                    <p className="text-[10px] text-gray-500">Hospital Admin</p>
                  </div>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg " 
                       onClick={() => {
                        setIsRemoveModalOpen(true)
                        setIsPopoverOpen(false)
                       }}
                  >
                    <Trash2 size={15} />
                            Remove Image
                        </button>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg mt-1"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Component */}
        <div className="lg:hidden">
          <Hospital_Admin_Sidebar_Mobile
            openMobileSidebar={openMobileSidebar}
            setOpenMobileSidebar={setOpenMobileSidebar}
          />
        </div>
      </div>


         {isRemoveModalOpen && (
        <RemoveBrandingModal type = 'profile_image' onClose={() => setIsRemoveModalOpen(false)} />
      )}
    </>
  );
};

export default Hospital_Admin_Header;
