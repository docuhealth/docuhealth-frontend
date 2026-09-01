import React, { useState } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import HandoverHistoryTab from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/HandoverHistoryTab";

const Hospital_Nurses_Handover_History = () => {
  const [activeTab, setActiveTab] = useState("Received notes");

  const tabs = [
    { name: "Received notes" },
    { name: "Sent-out handover notes" }
  ];

  return (
    <>
      <div className="py-2 text-sm flex justify-between items-center">
        <DynamicDate />
      </div>

      <div className="bg-white my-5 border rounded-lg p-5">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((t, index) => {
            const isActive = activeTab === t.name;
            return (
              <button
                key={index}
                onClick={() => setActiveTab(t.name)}
                className={`text-sm px-4 py-2 font-medium transition-all duration-200 whitespace-nowrap
                  ${isActive 
                    ? "text-docuhealth-primary border-b-2 border-docuhealth-primary font-semibold" 
                    : "text-gray-600 hover:text-gray-800"}`}
              >
                {t.name}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "Received notes" && (
            <HandoverHistoryTab type="received" />
          )}
          {activeTab === "Sent-out handover notes" && (
            <HandoverHistoryTab type="sent" />
          )}
        </div>

      </div>
    </>
  );
};

export default Hospital_Nurses_Handover_History;
