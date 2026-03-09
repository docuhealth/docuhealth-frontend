import React, { useState, useContext } from "react";
import { NursesAdmittedPatientMGTContext } from "../../../../../context/HospitalContext/Nurses/NursesAdmittedPatientMGTContext";

const TabComponent = ({ tabs }) => {


    const { tab: activeStatus, setTab } = useContext(NursesAdmittedPatientMGTContext);
   

    return (
        <div>
            <div className="flex border-b border-gray-200">
                {tabs.map((t, index) => (
                     <button
            key={index}
            onClick={() => setTab(t.status)}
            className={`text-sm px-4 py-2 font-medium transition-all duration-200 
              ${activeStatus === t.status 
                ? "text-[#3E4095] border-b-2 border-[#3E4095] font-semibold" 
                : "text-gray-600 hover:text-gray-800"}`}
          >
            {t.title}
          </button>
                ))}
            </div>

            {/* Tab Content */}
             <div className="py-2">
        {tabs.find(t => t.status === activeStatus)?.content}
      </div>
        </div>
    )
}

export default TabComponent