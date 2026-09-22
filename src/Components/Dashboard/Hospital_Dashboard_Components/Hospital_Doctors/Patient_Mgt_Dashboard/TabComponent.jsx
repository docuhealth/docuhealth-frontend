import React, { useState, useContext } from "react";
import { DoctorsAdmittedPatientMGTContext } from "../../../../../context/HospitalContext/Doctors/DoctorsAdmittedPatientMGTContext";

const TabComponent = ({ tabs }) => {
  const { tab: activeStatus, setTab } = useContext(DoctorsAdmittedPatientMGTContext);

  const activeTabData = tabs.find((t) => (Array.isArray(t.status) ? t.status.includes(activeStatus) : t.status === activeStatus)) || tabs[0];

  return (
    <div>
      <div className="w-full mb-4 lg:mb-0 lg:border-b lg:border-gray-200">
        <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-row lg:gap-6">
          {tabs.map((t, index) => {
            const isActive = Array.isArray(t.status) ? t.status.includes(activeStatus) : activeStatus === t.status;
            return (
              <button
                key={t.status || index}
                onClick={() => setTab(t.defaultStatus || t.status)}
                className={`px-3 sm:px-4 py-2 lg:px-2 lg:py-2.5 text-center text-[13px] sm:text-sm font-medium transition-colors cursor-pointer lg:-mb-[1px] ${
                  isActive 
                    ? "bg-docuhealth-primary text-white rounded-md lg:bg-transparent lg:text-docuhealth-primary lg:border-b-2 lg:border-docuhealth-primary lg:rounded-none font-semibold" 
                    : "text-gray-500 hover:text-gray-700 lg:border-b-2 lg:border-transparent"}`}
              >
                {t.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-4 animate-in fade-in duration-300">
        {activeTabData?.content}
      </div>
    </div>
  );
};

export default TabComponent;
