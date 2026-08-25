import React, { useState } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import TabComponent from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/TabComponent";
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
        <TabComponent
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={(tabName) => setActiveTab(tabName)}
        />

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
