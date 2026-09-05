import React, { useState, useContext } from "react";
import { ReceptionistAdmittedPatientMGTContext } from "../../../../../context/HospitalContext/Receptionist/ReceptionistAdmittedPatientMGTContext";

const TabComponent = ({ tabs }) => {
  const { tab: activeStatus, setTab } = useContext(ReceptionistAdmittedPatientMGTContext);

  const activeTabData = tabs.find((t) => (Array.isArray(t.status) ? t.status.includes(activeStatus) : t.status === activeStatus)) || tabs[0];

  return (
    <div>
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((t, index) => {
          const isActive = Array.isArray(t.status) ? t.status.includes(activeStatus) : activeStatus === t.status;
          return (
            <button
              key={t.status || index}
              onClick={() => setTab(t.defaultStatus || t.status)}
              className={`text-sm px-4 py-2 font-medium transition-all duration-200 whitespace-nowrap
                ${isActive 
                  ? "text-docuhealth-primary border-b-2 border-docuhealth-primary font-semibold" 
                  : "text-gray-600 hover:text-gray-800"}`}
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