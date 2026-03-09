import React,{useContext} from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import Settings from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Settings_Dashboard/Settings";
import { NursesAppContext } from "../../../context/HospitalContext/Nurses/NursesAppContext";


const Hospital_Nurses_Settings_Dashboard = () => {

    const {profile} = useContext(NursesAppContext)

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>
      <div className="block p-5 border rounded-lg bg-white my-5 ">
        <div>
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center text-xl font-semibold ">
              {profile
                ? `${profile.firstname?.[0] || ""}${
                    profile.lastname?.[0] || ""
                  }`.toUpperCase()
                : "NA"}
        
            </div>
            <div className="flex flex-col items-start">
              <p className="ml-2 text-sm font-medium">
                {profile
                  ? `${profile.firstname} ${profile.lastname} `
                  : "Loading..."}
              </p>
              <p className="ml-2 text-[12px] text-gray-500">
                {profile ? `${profile.email} ` : `loading...`}
              </p>
            </div>
          </div>
        </div>
        <Settings />
      </div>
    </>
  )
}

export default Hospital_Nurses_Settings_Dashboard