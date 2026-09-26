import React, { useState } from "react";

// The component now accepts tabs as a prop.
// `initialActiveIndex` lets a caller open the panel on a specific tab
// (e.g. jump straight to "SOAP Notes" after a note is created). It only
// seeds the first render — this component owns the active tab afterwards,
// so callers that need it to re-seed should remount (a changing `key` or
// an unmount/remount between views both work).
const TabComponent = ({ tabs, initialActiveIndex = 0 }) => {
  const [activeTab, setActiveTab] = useState(
    Number.isInteger(initialActiveIndex) &&
      initialActiveIndex >= 0 &&
      initialActiveIndex < tabs.length
      ? initialActiveIndex
      : 0,
  );

  return (
    <div className="w-full py-3 mx-auto">
      {/* Tab Headers */}
      <div className="w-full mb-4 lg:mb-0 lg:border-b lg:border-gray-200">
        <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-row lg:gap-6">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-3 sm:px-4 py-2 lg:px-2 lg:py-2.5 text-center text-[13px] sm:text-sm font-medium transition-colors duration-200 cursor-pointer lg:-mb-[1px] ${
                activeTab === index
                  ? "bg-docuhealth-primary text-white rounded-md lg:bg-transparent lg:text-docuhealth-primary lg:border-b-2 lg:border-docuhealth-primary lg:rounded-none font-semibold"
                  : "text-gray-500 hover:text-gray-700 lg:border-b-2 lg:border-transparent"
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {tabs[activeTab]?.content || (
          <div className="py-12 text-center text-gray-500 text-sm">
            {tabs[activeTab]?.title} coming soon
          </div>
        )}
      </div>
    </div>
  );
};
export default TabComponent;




