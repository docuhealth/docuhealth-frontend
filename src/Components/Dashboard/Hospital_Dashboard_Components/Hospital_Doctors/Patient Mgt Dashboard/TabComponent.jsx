import React, { useState, useContext } from "react";
import { DoctorsAdmittedPatientMGTContext } from "../../../../../context/Hospital Context/Doctors/DoctorsAdmittedPatientMGTContext";

const TabComponent = ({ tabs }) => {
  const { tab: activeStatus, setTab } = useContext(DoctorsAdmittedPatientMGTContext);

  // 🔹 Use the status directly to find the content
  const activeTabData = tabs.find((t) => t.status === activeStatus) || tabs[0];

  return (
    <div>
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((t, index) => (
          <button
            key={t.status || index}
            onClick={() => setTab(t.status)}
            className={`text-sm px-4 py-2 font-medium transition-all duration-100 whitespace-nowrap
              ${activeStatus === t.status 
                ? "text-[#3E4095] border-b-2 border-[#3E4095] font-semibold" 
                : "text-gray-600 hover:text-gray-800"}`}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-4 animate-in fade-in duration-300">
        {activeTabData?.content}
      </div>
    </div>
  );
};

export default TabComponent;
