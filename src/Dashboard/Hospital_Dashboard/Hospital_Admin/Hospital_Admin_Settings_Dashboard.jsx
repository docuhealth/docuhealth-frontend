import React,{useContext} from "react";
import DynamicDate from "../../../Components/Dynamic Date/DynamicDate";
import Settings from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Settings Dashboard/Settings";
import { HosAppContext } from "../../../context/Hospital Context/Admin/HosAppContext";

const Hospital_Admin_Settings_Dashboard = () => {

  const {profile} = useContext(HosAppContext)

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
                {profile ? `${profile.email} ` : `loading...`}
                hospital@gmail.com
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
