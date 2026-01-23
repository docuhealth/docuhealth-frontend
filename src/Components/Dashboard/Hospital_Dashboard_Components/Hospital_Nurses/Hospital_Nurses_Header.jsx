import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import Hospital_Nurses_Sidebar_Mobile from './Hospital_Nurses_Sidebar_Mobile'
import { NursesAppContext } from "../../../../context/Hospital Context/Nurses/NursesAppContext";

import LogOutModal from "./LogOut/components/LogOutModal";
import { fetchStaff } from "../../../../queries/Hospital/fetchStaff";
import toast from "react-hot-toast";
import axiosInstanceHos from "../../../../utils/axiosInstanceHos";


const Hospital_Nurses_Header = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);
    const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
    };

    const {profile} = useContext(NursesAppContext);


    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState('nurse')
    const [handoverData, setHandoverData] = useState(null);
  
    const [staffList, setStaffList] = useState(null);
    const [isFetching, setIsFetching] = useState(false);

    const [processingId, setProcessingId] = useState(null);


    const handleLogoutLogic = async (handoverSelection) => {
      // If user clicked "Just Logout" (handoverSelection is null)
      if (!handoverSelection) {
        sessionStorage.clear();
        navigate("/login");
        return;
      }
  
      // If they clicked "Proceed to assign"
      setHandoverData(handoverSelection);
      setIsFetching(true);
  
      try {
        console.log("Fetching staff manually...");
        const data = await fetchStaff(selected);
        setStaffList(data);
        console.log("Staff list loaded:", data);
      } catch (error) {
        console.error("Error fetching staff:", error);
        alert("Failed to load staff list. Please try again.");
      } finally {
        setIsFetching(false);
      }
    };
  
    const handleCloseModal = () => {
      setIsModalOpen(false);
      setStaffList(null); // Reset data so it starts from the checkbox view next time
      setHandoverData(null);
    };

    const handleFinalRequest = async(staff_id) => {
      console.log(handoverData)
  
      const {patientManagement: handover_appointments_state, myAppointments : handover_patients_state} = handoverData
  
      if(profile.staff_id === staff_id){
        toast.error('You cannot assign to yourself !')
        return
      }
  
      const payload = {
        to_nurse : staff_id,
        handover_appointments : handover_appointments_state,
        handover_patients : handover_patients_state
      }
  
      setProcessingId(staff_id);

          try {
      // Replace with your actual axios call
      const data = await axiosInstanceHos.post('/api/nurses/handover', payload);
      
      toast.success('Handover successful. Logging out...');
      
      // Clear session and navigate
      sessionStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Handover failed:", error);
      toast.error(error.response?.data?.message || "Handover failed. Please try again.");
    } finally {
    
      setProcessingId(null)
    }
  
    }
  

  return (
    <>
        <div className="relative">
        <header className="hidden bg-white py-4 px-6 lg:flex justify-between items-center border ">
          <h2 className="text-md font-medium">
            Welcome back{" "}
            {profile ? `${profile.firstname} ${profile.lastname}` : "Loading..."}{" "}
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
              {profile
                ? `${profile.firstname?.[0] || ""}${profile.lastname?.[0] || ""
                  }`.toUpperCase()
                : "NA"}
              </div>
              <div className="flex flex-col items-start">
                <p className="ml-2 text-sm font-medium">
                {profile
                  ? `${profile.firstname} ${profile.lastname}`
                  : "Loading..."}
                </p>
                <p className="ml-2 text-sm text-gray-500">Hospital</p>
              </div>
            </div>
          </div>
        </header>

        <header className=" lg:hidden bg-white shadow-sm py-4 flex justify-between items-center px-4 ">
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
              {profile
              ? `${profile.firstname} ${profile.lastname}`
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
              {profile
                ? `${profile.firstname?.[0] || ""}${profile.lastname?.[0] || ""
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
                  {profile
                    ? `${profile.firstname} ${profile.lastname}`
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
        <div className="lg:hidden">
          <Hospital_Nurses_Sidebar_Mobile
            openMobileSidebar={openMobileSidebar}
            setOpenMobileSidebar={setOpenMobileSidebar}
            setIsModalOpen ={setIsModalOpen}
          />
        </div>
        <div>
          <LogOutModal 
                isOpen={isModalOpen}
                 processingId={processingId}
                isFetching={isFetching}
                onClose={handleCloseModal}
                onLogout={handleLogoutLogic}
                staffList={staffList}
                selected ={selected}
                setStaffList={setStaffList}
                handleFinalRequest={handleFinalRequest}
          />
        </div>
      </div>
    </>
  )
}

export default Hospital_Nurses_Header