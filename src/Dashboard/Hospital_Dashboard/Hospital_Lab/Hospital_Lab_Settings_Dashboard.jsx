import React, { useContext } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import Settings from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/Settings_Dashboard/Settings";
import { LabAppContext } from "../../../context/HospitalContext/Lab/LabAppContext";

const Hospital_Lab_Settings_Dashboard = () => {
  const { profile } = useContext(LabAppContext);

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>
      <div className="block p-5 border rounded-lg bg-white my-5">
        <div>
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center text-xl font-semibold">
              {profile
                ? `${profile.firstname?.[0] || ""}${profile.lastname?.[0] || ""}`.toUpperCase()
                : "LS"}
            </div>
            <div className="flex flex-col items-start">
              <p className="ml-2 text-sm font-medium">
                {profile ? `${profile.firstname} ${profile.lastname}` : "Lab Scientist"}
              </p>
              <p className="ml-2 text-[12px] text-gray-500">
                {profile ? profile.email : "labscientist@hospital.com"}
              </p>
            </div>
          </div>
        </div>
        <Settings />
      </div>
    </>
  );
};

export default Hospital_Lab_Settings_Dashboard;
