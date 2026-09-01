import React, { useState, useContext } from "react";
import { NursesAdmittedPatientMGTContext } from "../../../../../context/HospitalContext/Nurses/NursesAdmittedPatientMGTContext";

const TabComponent = ({ tabs }) => {


    const { tab: activeStatus, setTab } = useContext(NursesAdmittedPatientMGTContext);
   

  const activeTabData = tabs.find((t) => (Array.isArray(t.status) ? t.status.includes(activeStatus) : t.status === activeStatus)) || tabs[0];

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 md:flex md:gap-0 md:border-b border-gray-200 overflow-x-auto">
        {tabs.map((t, index) => {
          const isActive = Array.isArray(t.status) ? t.status.includes(activeStatus) : activeStatus === t.status;
          return (
            <button
              key={t.status || index}
              onClick={() => setTab(t.defaultStatus || t.status)}
              className={`text-sm px-4 py-2 font-medium transition-all duration-200 whitespace-nowrap
                ${isActive 
                  ? "bg-docuhealth-primary text-white rounded-md md:bg-transparent md:text-docuhealth-primary md:border-b-2 md:border-docuhealth-primary md:rounded-none md:font-semibold" 
                  : "bg-gray-50 text-gray-600 hover:text-gray-800 rounded-md md:bg-transparent md:rounded-none"}`}
            >
              {t.title}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="py-2 animate-in fade-in duration-300">
        {activeTabData?.content}
      </div>
        </div>
    )
}

export default TabComponent