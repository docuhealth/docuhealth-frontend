import React, { useState } from "react";
import { Calendar, User, FileText, Activity } from "lucide-react";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";

const demoTasks = [
  {
    id: 1,
    status: "Completed",
    dateTime: "Aug 24, 2026 / 10:00 AM",
    task: "Administer 500mg Paracetamol",
    orderingDoctor: "Dr. Smith",
    type: "medication_administration",
  },
  {
    id: 2,
    status: "Completed",
    dateTime: "Aug 24, 2026 / 08:30 AM",
    task: "Check Blood Pressure",
    orderingDoctor: "Dr. Adams",
    type: "vitals_monitoring",
  },
  {
    id: 3,
    status: "Completed",
    dateTime: "Aug 24, 2026 / 11:15 AM",
    task: "Check blood sugar level",
    orderingDoctor: "Dr. Clark",
    type: "glucose_monitoring",
  },
  {
    id: 4,
    status: "Completed",
    dateTime: "Aug 24, 2026 / 12:00 PM",
    task: "Monitor urine output",
    orderingDoctor: "Dr. Clark",
    type: "input_output_monitoring",
  }
];

const NursingTaskHistory = () => {
  const [tasksCurrentPage, setTasksCurrentPage] = useState(1);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
      default: return { text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  return (
    <div className="text-[12px] my-4 text-left">
      <div className="hidden lg:block">
        {demoTasks.map((task) => {
          const colors = getStatusColor(task.status);
          return (
            <div
              key={task.id}
              className="mb-4 p-4 border border-slate-100 rounded-md flex flex-wrap gap-4 lg:gap-10 bg-white"
            >
              {/* Status */}
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${colors.bg}`}>
                  <Activity className={`w-4 h-4 ${colors.text}`} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">
                    Status
                  </p>
                  <p className={`text-sm font-medium ${colors.text}`}>
                    {task.status}
                  </p>
                </div>
              </div>

              {/* Date / Time */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-md">
                  <Calendar className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">
                    Date / Time
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {task.dateTime}
                  </p>
                </div>
              </div>

              {/* Ordering Doctor */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-md">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">
                    Ordering Doctor
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {task.orderingDoctor}
                  </p>
                </div>
              </div>

              {/* Task */}
              <div className="flex items-center justify-between relative flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-md">
                    <FileText className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">
                      Task
                    </p>
                    <p className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                      {task.task}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-full">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile view */}
      <div className="block lg:hidden space-y-4 mb-6">
        {demoTasks.map((task) => {
          const colors = getStatusColor(task.status);
          return (
            <div key={task.id} className="bg-white border border-slate-200 rounded-xl p-4  relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-md border border-slate-100">
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Date / Time</p>
                    <p className="text-sm font-semibold text-slate-700">{task.dateTime}</p>
                  </div>
                </div>
                <div className="p-1 cursor-pointer">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                  </svg>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs border ${colors.border} ${colors.bg}`}>
                    <Activity className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Status</p>
                    <p className={`text-sm font-semibold ${colors.text}`}>{task.status}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Ordering Doctor</p>
                    <p className="text-[13px] text-slate-600">{task.orderingDoctor}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Task</p>
                    <p className="text-[13px] text-slate-600 truncate italic">"{task.task}"</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination2 count={4} currentPage={tasksCurrentPage} totalPages={1} setCurrentPage={setTasksCurrentPage} />
    </div>
  );
};

export default NursingTaskHistory;
