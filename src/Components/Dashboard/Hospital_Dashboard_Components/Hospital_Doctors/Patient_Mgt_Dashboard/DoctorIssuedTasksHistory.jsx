import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, ClipboardList, User } from "lucide-react";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";
import EmptyState from "../../../../ui/EmptyState";
import Spinner from "../../../../ui/Spinner";
import { fetchInpatientTasks } from "../../../../../queries/Hospital/doctor/inpatientTasks";
import { taskTypeLabel } from "../../../../../utils/careTaskConstants";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";

// Reads the doctor-issued care tasks for the current admission via
// GET /api/inpatients/tasks/<admission_sqid> (task definitions, not the
// per-schedule occurrences the nurse queue shows). The endpoint has no
// filter params, so — matching the Handover tab's approach — we pull one
// large page (size 100 covers every realistic per-admission task count)
// and filter + paginate client-side off `effective_status`.
const STATUS_STYLES = {
  active: { label: "Active", dot: "bg-amber-400", text: "text-amber-600" },
  duration_completed: { label: "Duration complete", dot: "bg-emerald-400", text: "text-emerald-600" },
  completed: { label: "Completed", dot: "bg-slate-400", text: "text-slate-600" },
};

const FILTER_OPTIONS = [
  { value: "all", label: "All tasks" },
  { value: "active", label: "Active" },
  { value: "duration_completed", label: "Duration complete" },
  { value: "completed", label: "Completed" },
];

const PAGE_SIZE = 5;

const orderingDoctorName = (info) => {
  if (!info) return "—";
  const name = [info.firstname, info.lastname].filter(Boolean).join(" ").trim();
  return name ? `Dr ${name}` : "—";
};

const DoctorIssuedTasksHistory = ({ admissionSqid }) => {
  const [filter, setFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const filterRef = useRef(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["inpatient-tasks", admissionSqid],
    queryFn: () => fetchInpatientTasks({ admissionSqid, page: 1, size: 100 }),
    enabled: !!admissionSqid,
    // A co-managing doctor (or this doctor, from the quick-services FAB on
    // the same page) can add a task while this tab is open — keep it fresh
    // without a reload.
    staleTime: 15 * 1000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tasks = useMemo(() => {
    return (data?.results || []).map((task) => ({
      id: task.sqid,
      status: task.effective_status || task.status || "active",
      startAt: formatFullDateTime(task.start_time) || "—",
      completion: task.completion_time
        ? formatFullDateTime(task.completion_time)
        : "Runs until discharge",
      task: taskTypeLabel(task.task_type),
      orderingDoctor: orderingDoctorName(task.created_by_info),
    }));
  }, [data]);

  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((task) => task.status === filter);
  }, [filter, tasks]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));

  // Keep the current page in range when the filter (or the data) shrinks the list.
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spinner className="h-6 w-6 text-docuhealth-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 flex flex-col items-center gap-3 text-center">
        <p className="text-[13px] text-gray-500">
          Couldn&apos;t load the task history for this admission.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-1.5 text-sm rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

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
            {isFetching && <Spinner className="h-3 w-3 text-slate-400" />}
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
            description={
              filter === "all"
                ? "No care tasks have been issued for this admission yet."
                : "There are no issued tasks in this category for the current admission."
            }
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
