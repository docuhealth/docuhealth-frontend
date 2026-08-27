import React, { useState } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import MyTasksTab from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/My_Tasks/MyTasksTab";
import Pagination2 from "../../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination2";

const Hospital_Nurses_My_Tasks = () => {
  const [activeTab, setActiveTab] = useState("My Pending Tasks");
  const [currentPage, setCurrentPage] = useState(1);

  const tabs = [
    { name: "My Pending Tasks" },
    { name: "My Completed Tasks" }
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
                onClick={() => {
                  setActiveTab(t.name);
                  setCurrentPage(1); // Reset page on tab change
                }}
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
          {activeTab === "My Pending Tasks" && (
            <MyTasksTab type="pending" />
          )}
          {activeTab === "My Completed Tasks" && (
            <MyTasksTab type="completed" />
          )}
        </div>

        {/* Pagination */}
       
          <Pagination2 
            count={20} 
            currentPage={currentPage} 
            totalPages={8} 
            setCurrentPage={setCurrentPage} 
          />
   
      </div>
    </>
  );
};

export default Hospital_Nurses_My_Tasks;
