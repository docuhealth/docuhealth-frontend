import React, { useContext } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { NursingEncounterContext } from "../../../context/HospitalContext/Nurses/NursingEncounterContext";
import NursingEncounterTable from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Nursing_Encounter/NursingEncounterTable";
import Pagination2 from "../../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination2";
import SearchBar from "../../../Components/SearchBar/SearchBar";

const tabs = ["Pending", "Closed", "Doctor’s call-up/consultation"];

const Hospital_Nurses_Nursing_Encounter_Dashboard = () => {
  const { activeTab, setActiveTab, currentPage, totalPages, setCurrentPage, count, searchQuery, setSearchQuery } = useContext(NursingEncounterContext);

  return (
    <>
      <div className="py-2 text-sm flex justify-between items-center">
        <DynamicDate />
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 mb-6 gap-2 sm:gap-6 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm px-2 py-3 font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === tab
                  ? "text-docuhealth-primary border-docuhealth-primary"
                  : "text-gray-500 hover:text-gray-800 border-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Pending holds both waiting and in-progress (reserved) check-ins */}
        {activeTab === "Pending" && (
          <div className="mb-6">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search patient's name or HIN..."
            />
          </div>
        )}

        {/* Table Content */}
        <div className="w-full">
          <NursingEncounterTable />
        </div>

        {/* Pagination */}
        {count > 0 && totalPages > 1 && (
          <div className="mt-6">
            <Pagination2
              count={count}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Hospital_Nurses_Nursing_Encounter_Dashboard;
