import React, { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

const demoTasks = [
  {
    id: 1,
    type: "pending",
    priority: "High",
    taskName: "Procedure monitoring",
    doctor: "David Obed",
    ward: "Emergency ward",
    patient: "Jonah Judah",
    dueDate: "14/7/2026",
    dueTime: "8:00 AM",
    progress: 30
  },
  {
    id: 2,
    type: "pending",
    priority: "Medium",
    taskName: "Procedure monitoring",
    doctor: "David Obed",
    ward: "Emergency ward",
    patient: "Jonah Judah",
    dueDate: "14/7/2026",
    dueTime: "8:00 AM",
    progress: 30
  },
  {
    id: 3,
    type: "pending",
    priority: "Low",
    taskName: "Procedure monitoring",
    doctor: "David Obed",
    ward: "Emergency ward",
    patient: "Jonah Judah",
    dueDate: "14/7/2026",
    dueTime: "8:00 AM",
    progress: 30
  },
  {
    id: 4,
    type: "pending",
    priority: "High",
    taskName: "Procedure monitoring",
    doctor: "David Obed",
    ward: "Emergency ward",
    patient: "Jonah Judah",
    dueDate: "14/7/2026",
    dueTime: "8:00 AM",
    progress: 30
  },
  {
    id: 5,
    type: "completed",
    priority: "High",
    taskName: "Procedure monitoring",
    doctor: "David Obed",
    ward: "Emergency ward",
    patient: "Jonah Judah",
    dueDate: "14/7/2026",
    dueTime: "8:00 AM",
    progress: 100
  },
];

const PriorityBadge = ({ priority }) => {
  let bgColor = "bg-red-100";
  let textColor = "text-red-500";
  
  if (priority === "Medium") {
    bgColor = "bg-orange-100";
    textColor = "text-orange-500";
  } else if (priority === "Low") {
    bgColor = "bg-blue-100";
    textColor = "text-blue-500";
  }

  return (
    <div className={`${bgColor} ${textColor} text-xs font-medium px-3 py-1 rounded-full`}>
      {priority} priority
    </div>
  );
};

const MyTasksTab = ({ type }) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // Filter based on type ('pending' or 'completed')
  const displayedTasks = demoTasks.filter(task => task.type === type);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (id, event) => {
    event.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6">
      {displayedTasks.map((task) => (
        <div key={task.id} className="border border-gray-200 rounded-xl bg-white relative flex flex-col p-5 ">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <PriorityBadge priority={task.priority} />
            
            {/* Popover Menu */}
            <div className="relative">
              <button 
                onClick={(e) => toggleDropdown(task.id, e)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MoreVertical size={20} />
              </button>
              
              {openDropdownId === task.id && (
                <div 
                  ref={dropdownRef}
                  className="absolute right-0 top-6 w-40 bg-white border border-gray-100 rounded-lg shadow-lg z-10 py-1"
                >
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    View patient info
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Centered Clipboard SVG (Matching color with Handover Notes but blue) */}
          <div className="flex justify-center items-center py-6 mb-4">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-docuhealth-primary">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 5h2M4 9h2M4 13h2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Details Section */}
          <div className="flex flex-col flex-grow text-sm text-gray-500 space-y-2.5">
            <div className="font-semibold text-gray-800 text-[15px] border-b border-gray-100 pb-3 mb-2">
              Tasks: {task.taskName}
            </div>
            
            <div>
              Ordering Doctor: <span className="font-medium text-gray-700">{task.doctor}</span>
            </div>
            <div>
              Ward: <span className="font-medium text-gray-700">{task.ward}</span>
            </div>
            <div>
              Patient: <span className="font-medium text-gray-700">{task.patient}</span>
            </div>
            <div>
              Due date: <span className="font-medium text-gray-700">{task.dueDate}</span>
            </div>
            <div>
              Due time: <span className="font-medium text-gray-700">{task.dueTime}</span>
            </div>

            {/* Progress Bar */}
            <div className="mt-auto pt-4">
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full" 
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
          
        </div>
      ))}
      
      {displayedTasks.length === 0 && (
        <div className="col-span-full py-12 text-center text-gray-500">
          No {type} tasks found.
        </div>
      )}
    </div>
  );
};

export default MyTasksTab;
