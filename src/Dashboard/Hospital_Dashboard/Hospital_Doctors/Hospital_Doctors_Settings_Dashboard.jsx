import React,{useContext} from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import Settings from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Settings_Dashboard/Settings";
import { DoctorAppContext } from "../../../context/HospitalContext/Doctors/DoctorAppContext";
import Skeleton from "../../../Components/ui/Skeleton";

const Hospital_Doctors_Settings_Dashboard = () => {
 const {profile} = useContext(DoctorAppContext)


  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>
      <div className="block p-5 border rounded-lg bg-white my-5 ">
        {!profile ? (
          <div role="status" aria-label="Loading profile" className="flex items-center">
            <Skeleton className="w-14 h-14 rounded-full" />
            <div className="ml-2 flex flex-col gap-2">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center text-xl font-semibold ">
              {`${profile.firstname?.[0] || ""}${profile.lastname?.[0] || ""}`.toUpperCase()}
            </div>
            <div className="flex flex-col items-start">
              <p className="ml-2 text-sm font-medium">{`${profile.firstname} ${profile.lastname}`}</p>
              <p className="ml-2 text-[12px] text-gray-500">{profile.email}</p>
            </div>
          </div>
        )}
        <Settings />
      </div>
    </>
  );

}
export default Hospital_Doctors_Settings_Dashboard;