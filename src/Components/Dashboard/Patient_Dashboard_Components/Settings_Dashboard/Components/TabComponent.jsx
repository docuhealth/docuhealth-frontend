import React, { useState } from "react";

// The component now accepts tabs as a prop
const TabComponent = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);


  return (
    <div className="w-full py-3 mx-auto">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`text-sm px-2 sm:px-4  py-2 sm:text-sm font-medium transition-colors duration-200
              ${
                activeTab === index
                  ? "text-[#0000FF]  border-b-2 border-[#0000FF] font-semibold"
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
  );
};
export default TabComponent;




