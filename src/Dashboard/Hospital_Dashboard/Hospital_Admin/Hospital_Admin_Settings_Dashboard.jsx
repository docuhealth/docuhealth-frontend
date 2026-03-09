import React,{useContext} from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import Settings from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Settings_Dashboard/Settings";
import { HosAppContext } from "../../../context/HospitalContext/Admin/HosAppContext";

const Hospital_Admin_Settings_Dashboard = () => {

  const {profile, hospital_email} = useContext(HosAppContext)

  console.log(profile)
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
                ? `${profile.name?.[0] || ""}${
                    profile.name?.[1] || ""
                  }`.toUpperCase()
                : "NA"}
        
            </div>
            <div className="flex flex-col items-start">
              <p className="ml-2 text-sm font-medium">
                {profile
                  ? `${profile.name} `
                  : "Loading..."}
                Hospital
              </p>
              <p className="ml-2 text-[12px] text-gray-500">
                {hospital_email ? `${hospital_email} ` : `loading...`}
              </p>
            </div>
          </div>
        </div>
        <Settings />
      </div>
    </>
  );
};
export default Hospital_Admin_Settings_Dashboard;
