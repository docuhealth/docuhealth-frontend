import React, { useState } from "react";

// The component now accepts tabs as a prop
const TabComponent2 = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);


  return (
    <div className="w-full py-3 mx-auto">
      {/* Tab Headers */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2 border-b-0 sm:border-b border-gray-200 pb-4 sm:pb-0 sm:mb-5">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`text-[13px] px-2 sm:px-6 py-2 sm:py-3 font-medium transition-colors duration-200 cursor-pointer text-center sm:whitespace-nowrap sm:shrink-0 rounded-lg sm:rounded-none ${
              activeTab === index
                ? "bg-docuhealth-primary text-white sm:bg-transparent sm:text-docuhealth-primary sm:border-b-2 sm:border-docuhealth-primary font-semibold"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800 sm:hover:bg-transparent sm:border-b-2 sm:border-transparent"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-4">{tabs[activeTab].content}</div>
    </div>
  );
};
export default TabComponent2;




