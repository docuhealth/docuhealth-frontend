import React, { useState, useContext } from "react";
import { HosAdmittedPatientMGTContext } from "../../../../../context/Hospital Context/Admin/HosAdmittedPatientMGTContext";


const TabComponent = ({ tabs }) => {

    const { setTab } = useContext(HosAdmittedPatientMGTContext);
    const [activeTab, setActiveTab] = useState(0);

    const handleTabSwitch = (index, value) => {
        setActiveTab(index);
        setTab(value);   // 🔥 Tell context which status to fetch
      };

    return (
        <div>
            <div className="flex border-b border-gray-200">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => handleTabSwitch(index, tab.status)}
                        className={`text-sm px-2 sm:px-4  py-2 sm:text-sm font-medium transition-colors duration-200 cursor-pointer
              ${activeTab === index
                                ? "text-[#3E4095]  border-b-2 border-[#3E4095] font-semibold"
                                : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        {tab.title}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-4">{tabs[activeTab].content}</div>
        </div>
    )
}

export default TabComponent