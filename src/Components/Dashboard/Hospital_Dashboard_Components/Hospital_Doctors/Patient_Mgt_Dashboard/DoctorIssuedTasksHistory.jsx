import React, { useMemo, useRef, useState, useEffect } from "react";
import { CalendarClock, ClipboardList, User } from "lucide-react";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";
import EmptyState from "../../../../ui/EmptyState";

// TODO: placeholder data only — the backend doesn't expose a task-level
// (as opposed to task-occurrence) list endpoint yet, so this tab can't be
// wired to real data until that contract exists. Swap `demoIssuedTasks` for
// a real fetch once it does; the status keys ("active" / "duration_complete")
// and field names here are guesses meant to match the design, not a verified
// API shape.
const demoIssuedTasks = [
  { id: 1, status: "active", startAt: "August 21, 2025 / 10:00 PM", completion: "August 21, 2025 / 10:00 PM", task: "Seizure event Monitoring", orderingDoctor: "Dr Obed" },
  { id: 2, status: "active", startAt: "August 21, 2025 / 10:00 PM", completion: "August 21, 2025 / 10:00 PM", task: "Seizure event Monitoring", orderingDoctor: "Dr Obed" },
  { id: 3, status: "duration_complete", startAt: "August 21, 2025 / 10:00 PM", completion: "August 21, 2025 / 10:00 PM", task: "Seizure event Monitoring", orderingDoctor: "Dr Obed" },
  { id: 4, status: "duration_complete", startAt: "August 20, 2025 / 09:00 AM", completion: "August 20, 2025 / 05:00 PM", task: "Glucose Monitoring", orderingDoctor: "Dr Obed" },
  { id: 5, status: "duration_complete", startAt: "August 19, 2025 / 08:00 AM", completion: "August 19, 2025 / 08:00 PM", task: "Vital Signs Monitoring", orderingDoctor: "Dr Adeyemi" },
  { id: 6, status: "active", startAt: "August 19, 2025 / 07:30 AM", completion: "August 22, 2025 / 07:30 AM", task: "IV Fluid Administration", orderingDoctor: "Dr Obed" },
  { id: 7, status: "duration_complete", startAt: "August 18, 2025 / 06:00 PM", completion: "August 19, 2025 / 06:00 AM", task: "Fluid Intake / Output Monitoring", orderingDoctor: "Dr Bello" },
  { id: 8, status: "duration_complete", startAt: "August 17, 2025 / 11:00 AM", completion: "August 17, 2025 / 01:00 PM", task: "Ward Procedure", orderingDoctor: "Dr Obed" },
  { id: 9, status: "duration_complete", startAt: "August 16, 2025 / 09:15 AM", completion: "August 16, 2025 / 09:45 AM", task: "Glucose Monitoring", orderingDoctor: "Dr Adeyemi" },
  { id: 10, status: "active", startAt: "August 15, 2025 / 07:00 PM", completion: "August 18, 2025 / 07:00 PM", task: "Seizure event Monitoring", orderingDoctor: "Dr Obed" },
];

const STATUS_STYLES = {
  active: { label: "Active", dot: "bg-amber-400", text: "text-amber-600" },
  duration_complete: { label: "Duration complete", dot: "bg-emerald-400", text: "text-emerald-600" },
};

const FILTER_OPTIONS = [
  { value: "all", label: "All tasks" },
  { value: "active", label: "Active" },
  { value: "duration_complete", label: "Duration complete" },
];

const PAGE_SIZE = 5;

const DoctorIssuedTasksHistory = () => {
  const [filter, setFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTasks = useMemo(() => {
    if (filter === "all") return demoIssuedTasks;
    return demoIssuedTasks.filter((task) => task.status === filter);
  }, [filter]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const pagedTasks = filteredTasks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleSetFilter = (value) => {
    setFilter(value);
    setFilterOpen(false);
    setCurrentPage(1);
  };

  const activeFilterLabel = FILTER_OPTIONS.find((option) => option.value === filter)?.label;

  return (
    <div className="text-[12px] my-4 text-left">
      <div className="flex justify-end mb-4 relative">
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-md text-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors h-8"
          >
            <span>Filter: {activeFilterLabel}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-10 w-48 bg-white border border-slate-100 shadow-[0px_4px_20px_rgba(0,0,0,0.08)] rounded-lg p-1.5 z-40">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors"
                  onClick={() => handleSetFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {pagedTasks.length === 0 ? (
        <div className="py-10">
          <EmptyState
            title="No issued tasks"
            description="There are no issued tasks available in this category for the current patient."
          />
        </div>
      ) : (
        <>
          <div className="hidden lg:block">
            {pagedTasks.map((task) => {
              const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.active;
              return (
                <div key={task.id} className="mb-4 border rounded-xl bg-white overflow-hidden">
                  <div className="px-4 py-3 border-b flex items-center gap-2">
                    <span className="text-gray-600">Status:</span>
                    <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                    <span className={`font-medium ${statusStyle.text}`}>{statusStyle.label}</span>
                  </div>

                  <div className="p-4 flex flex-wrap gap-4 lg:gap-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-md">
                        <CalendarClock className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">
                          Task start date/time
                        </p>
                        <p className="text-sm font-medium text-gray-800">{task.startAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-md">
                        <CalendarClock className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">
                          Completion
                        </p>
                        <p className="text-sm font-medium text-gray-800">{task.completion}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-md">
                        <ClipboardList className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">
                          Task
                        </p>
                        <p className="text-sm font-medium text-gray-800">{task.task}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-md">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">
                          Ordering doctor
                        </p>
                        <p className="text-sm font-medium text-gray-800">{task.orderingDoctor}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="block lg:hidden space-y-4">
            {pagedTasks.map((task) => {
              const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.active;
              return (
                <div key={task.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b flex items-center gap-2">
                    <span className="text-gray-600">Status:</span>
                    <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                    <span className={`font-medium ${statusStyle.text}`}>{statusStyle.label}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">Task start date/time</p>
                      <p className="text-[13px] font-semibold text-slate-700">{task.startAt}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">Completion</p>
                      <p className="text-[13px] font-semibold text-slate-700">{task.completion}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-medium">Task</p>
                        <p className="text-[13px] text-slate-600">{task.task}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-medium">Ordering doctor</p>
                        <p className="text-[13px] text-slate-600">{task.orderingDoctor}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination2
            count={filteredTasks.length}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default DoctorIssuedTasksHistory;
