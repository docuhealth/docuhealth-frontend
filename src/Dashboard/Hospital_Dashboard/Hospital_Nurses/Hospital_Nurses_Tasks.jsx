import React, { useState, useEffect } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import MyTasksTab from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/My_Tasks/MyTasksTab";
import Pagination2 from "../../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination2";
import axiosInstanceHos from "../../../lib/axios/hospital";

const Hospital_Nurses_Tasks = () => {
  const [activeTab, setActiveTab] = useState("Pending Tasks");
  const [currentPage, setCurrentPage] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const tabs = [
    { name: "Pending Tasks" },
    { name: "In Progress Tasks" },
    { name: "Completed Tasks" }
  ];

  const getStatus = (tab) => {
    if (tab === "Pending Tasks") return "pending";
    if (tab === "In Progress Tasks") return "in_progress";
    if (tab === "Completed Tasks") return "history";
    return "pending";
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axiosInstanceHos.get(`/api/inpatients/task-occurrences?status=${getStatus(activeTab)}&page=${currentPage}&size=8`);
        setTasks(response.data.results || []);
        setTotalCount(response.data.count || 0);
      } catch (err) {
        console.error("Error fetching tasks", err);
        setTasks([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [activeTab, currentPage]);

  const totalPages = Math.ceil(totalCount / 8) || 1;

  return (
    <>
      <div className="py-2 text-sm flex justify-between items-center">
        <DynamicDate />
      </div>

      <div className="bg-white my-5 border rounded-lg p-5">
        {/* Tab Navigation & Legend */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-200">
          <div className="grid grid-cols-2 gap-2 md:flex md:gap-0 overflow-x-auto mb-3 md:mb-0">
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
                      ? "bg-docuhealth-primary text-white rounded-md md:bg-transparent md:text-docuhealth-primary md:border-b-2 md:border-docuhealth-primary md:rounded-none md:font-semibold" 
                      : "bg-gray-50 text-gray-600 hover:text-gray-800 rounded-md md:bg-transparent md:rounded-none"}`}
                >
                  {t.name}
                </button>
              );
            })}   
          </div>
          
          {/* Status Color Legend */}
          <div className="flex items-center flex-wrap gap-4 text-xs font-medium text-gray-500 pb-2 md:pb-0 md:pr-4">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>Upcoming</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>Due</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>Overdue</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>Completed</div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          <MyTasksTab tasks={tasks} loading={loading} type={getStatus(activeTab)} />
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <Pagination2 
            count={totalCount} 
            currentPage={currentPage} 
            totalPages={totalPages} 
            setCurrentPage={setCurrentPage} 
          />
        )}
      </div>
    </>
  );
};

export default Hospital_Nurses_Tasks;
