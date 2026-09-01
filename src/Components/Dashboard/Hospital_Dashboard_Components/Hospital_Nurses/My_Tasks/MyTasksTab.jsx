import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const PriorityBadge = ({ priority }) => {
  let bgColor = "bg-blue-100";
  let textColor = "text-blue-500";
  
  const p = priority?.toLowerCase() || 'low';
  if (p === "medium") {
    bgColor = "bg-orange-100";
    textColor = "text-orange-500";
  } else if (p === "high") {
    bgColor = "bg-red-100";
    textColor = "text-red-500";
  } else if (p === "urgent") {
    bgColor = "bg-red-600";
    textColor = "text-white";
  }

  return (
    <div className={`${bgColor} ${textColor} text-xs font-medium px-3 py-1 rounded-full capitalize`}>
      {priority || 'low'} priority
    </div>
  );
};

const getProgress = (timingState, type) => {
  if (type === "history") return 100;
  if (timingState === "upcoming") return 33;
  if (timingState === "due") return 66;
  if (timingState === "overdue") return 100;
  return 0; // for in_progress where it might be null
};

const getProgressColor = (timingState, type) => {
  if (type === "history") return "bg-green-500";
  if (timingState === "upcoming") return "bg-blue-500";
  if (timingState === "due") return "bg-orange-500";
  if (timingState === "overdue") return "bg-red-500";
  return "bg-green-500"; // fallback for completed/in-progress
};

const MyTasksTab = ({ tasks, loading, type }) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  const handleViewPatient = (task) => {
    const patientSqid = task.patient_info?.sqid;
    if (patientSqid) {
      navigate("/hospital-nurses-patients-dashboard", {
        state: { selectedPatient: task }
      });
    } else {
      toast.error("Patient information is missing.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-docuhealth-primary" />
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-6">
      {tasks?.map((task) => {
        const scheduledDate = new Date(task.scheduled_for);
        const formattedDate = scheduledDate.toLocaleDateString();
        const formattedTime = scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const patientName = task.patient_info ? `${task.patient_info.firstname} ${task.patient_info.lastname}` : 'Unknown';
        
        return (
          <div key={task.sqid} className="border border-gray-200 rounded-xl bg-white relative flex flex-col p-5 ">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <PriorityBadge priority={task.priority} />
              
              {/* Popover Menu */}
              <div className="relative">
                <button 
                  onClick={(e) => toggleDropdown(task.sqid, e)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MoreVertical size={20} />
                </button>
                
                {openDropdownId === task.sqid && (
                  <div 
                    ref={dropdownRef}
                    className="absolute right-0 top-6 w-40 bg-white border border-gray-100 rounded-lg shadow-lg z-10 py-1"
                  >
                    <button 
                      onClick={() => handleViewPatient(task)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
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
              <div className="font-semibold text-gray-800 text-[15px] border-b border-gray-100 pb-3 mb-2 capitalize">
                Tasks: {task.task_type.replace(/_/g, ' ')}
              </div>
              
              <div>
                Instructions: <span className="font-medium text-gray-700 truncate block">{task.instructions || "None"}</span>
              </div>
              <div>
                Patient: <span className="font-medium text-gray-700">{patientName}</span>
              </div>
              <div>
                Due date: <span className="font-medium text-gray-700">{formattedDate}</span>
              </div>
              <div>
                Due time: <span className="font-medium text-gray-700">{formattedTime}</span>
              </div>

              {/* Progress Bar (Meaningful only for pending tasks mostly) */}
              <div className="mt-auto pt-4">
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className={`${getProgressColor(task.timing_state, type)} h-1.5 rounded-full`} 
                    style={{ width: `${getProgress(task.timing_state, type)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
          </div>
        );
      })}
      
      {(!tasks || tasks.length === 0) && (
        <div className="col-span-full py-12 text-center text-gray-500">
          No {type.replace(/_/g, ' ')} tasks found.
        </div>
      )}
    </div>
  );
};

export default MyTasksTab;
