import React, { useState } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import DoctorHandoverHistoryTab from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Handover_History/DoctorHandoverHistoryTab";

const Hospital_Doctors_Handover_History = () => {
  const [activeTab, setActiveTab] = useState("Received notes");

  const tabs = [
    { name: "Received notes" },
    { name: "Sent-out handover notes" },
  ];

  return (
    <>
      <div className="py-2 text-sm flex justify-between items-center">
        <DynamicDate />
      </div>

      <div className="bg-white my-5 border rounded-2xl p-5 lg:p-6 shadow-2xs">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((t, index) => {
            const isActive = activeTab === t.name;
            return (
              <button
                key={index}
                onClick={() => setActiveTab(t.name)}
                className={`text-sm px-5 py-2.5 font-medium transition-all duration-200 whitespace-nowrap cursor-pointer
                  ${
                    isActive
                      ? "text-docuhealth-primary border-b-2 border-docuhealth-primary font-semibold"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "Received notes" && (
            <DoctorHandoverHistoryTab type="received" />
          )}
          {activeTab === "Sent-out handover notes" && (
            <DoctorHandoverHistoryTab type="sent" />
          )}
        </div>
      </div>
    </>
  );
};

export default Hospital_Doctors_Handover_History;
