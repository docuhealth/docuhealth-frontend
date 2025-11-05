import React from "react";
import DynamicDate from "../../../Components/Dynamic Date/DynamicDate";
import Settings from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Settings Dashboard/Settings";


const Hospital_Admin_Settings_Dashboard = () => {
    return (
        <>
               <div className="py-2">
        <DynamicDate />
      </div>
      <div className="block py-8 px-6 border rounded-2xl bg-white my-5 ">
        <div>
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center text-xl font-semibold ">
              {/* {profile
                ? `${profile.firstname?.[0] || ""}${
                    profile.lastname?.[0] || ""
                  }`.toUpperCase()
                : "NA"} */}
                NA
            </div>
            <div className="flex flex-col items-start">
              <p className="ml-2 text-sm font-medium">
                {/* {profile
                  ? `${profile.firstname} ${profile.lastname}`
                  : "Loading..."} */}
                  Hospital
              </p>
              <p className="ml-2 text-[12px] text-gray-500">
                {/* {profile ? `${profile.email} ` : `loading...`} */}
                hospital@gmail.com
              </p>
            </div>
          </div>
        </div>
        <Settings />
      </div>
        </>
    )
}
export default Hospital_Admin_Settings_Dashboard;