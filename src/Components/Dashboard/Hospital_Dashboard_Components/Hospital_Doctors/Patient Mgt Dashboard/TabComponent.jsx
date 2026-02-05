import React, { useState, useContext } from "react";
import { DoctorsAdmittedPatientMGTContext } from "../../../../../context/Hospital Context/Doctors/DoctorsAdmittedPatientMGTContext";

const TabComponent = ({ tabs }) => {
  const { tab, setTab } = useContext(DoctorsAdmittedPatientMGTContext);

const activeTabIndex = Math.max(
  tabs.findIndex((t) => t.status === tab),
  0
);


  const handleTabSwitch = (index, value) => {
    setTab(value);
  };

  return (
    <div>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, index) => (
          <button
            key={index}
    onClick={() => handleTabSwitch(index, tab.status)} 
            className={`text-sm px-2 sm:px-4  py-2 sm:text-sm font-medium transition-colors duration-200 cursor-pointer
              ${
                activeTabIndex === index
                  ? "text-[#3E4095]  border-b-2 border-[#3E4095] font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-4">{tabs[activeTabIndex].content}</div>
    </div>
  );
};

export default TabComponent;
