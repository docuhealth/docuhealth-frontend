import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, ClipboardList, User } from "lucide-react";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";
import EmptyState from "../../../../ui/EmptyState";
import Spinner from "../../../../ui/Spinner";
import { fetchInpatientTasks } from "../../../../../queries/Hospital/doctor/inpatientTasks";
import {
  taskTypeLabel,
  PRIORITY_OPTIONS,
  FREQUENCY_OPTIONS,
  DURATION_RATE_OPTIONS,
} from "../../../../../utils/careTaskConstants";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";

// Reads the doctor-issued care task definitions for the admission via
// GET /api/inpatients/tasks/<admission_sqid>. The endpoint has no filter params, so we
// pull one large page and filter + paginate client-side off `effective_status`.
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

// snake_case enum values the backend hands back on a task/config (e.g.
// `solution_type: "normal_saline_09"`) don't have a shared label lookup the
// way frequency/priority/duration do, so this is the best-effort fallback
// for anything the task-details view doesn't have a dedicated label for.
const prettifyText = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value !== "string") return String(value);
  return value.includes("_")
    ? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : value;
};

const prettifyKey = (key) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const priorityLabel = (value) =>
  PRIORITY_OPTIONS.find((option) => option.value === value)?.label || prettifyText(value);

const frequencyLabel = (value) =>
  FREQUENCY_OPTIONS.find((option) => option.value === value)?.label || prettifyText(value);

const durationLabel = (duration) => {
  if (!duration) return null;
  const rate = DURATION_RATE_OPTIONS.find((option) => option.value === duration.rate)?.label || duration.rate;
  return `${duration.value} ${rate}`;
};

const runsUntilLabel = (task) =>
  task.repeatUntil === "discharge" ? "Runs until discharge" : durationLabel(task.duration) || "—";

// Renders a care task's `config` — its shape is entirely dependent on
// `task_type` (see the individual TaskCreationModal callers), so aside from
// medication's `drugs[]`, which is common enough to warrant a dedicated
// layout, everything else falls back to a generic prettified key/value list.
const TaskConfigDetails = ({ taskType, config }) => {
  if (!config || Object.keys(config).length === 0) {
    return <p className="text-[12px] text-gray-500">NIL</p>;
  }

  if (taskType === "medication" && Array.isArray(config.drugs)) {
    return (
      <div className="space-y-3">
        {config.drugs.map((drug, index) => {
          const manual = drug.manual_drug || {};
          const name = manual.name || drug.catalog_drug_info?.name || drug.drug_name || "Drug";
          const dosage = drug.dosage || {};
          return (
            <div key={index} className="border rounded-md p-3 bg-white">
              <p className="font-medium text-gray-800">{name}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2 text-gray-600">
                <p>Route: <span className="text-gray-900 font-medium">{prettifyText(manual.route)}</span></p>
                {manual.strength && (
                  <p>Strength: <span className="text-gray-900 font-medium">{manual.strength}</span></p>
                )}
                {manual.dose_form && (
                  <p>Form: <span className="text-gray-900 font-medium">{prettifyText(manual.dose_form)}</span></p>
                )}
                <p>
                  Dosage:{" "}
                  <span className="text-gray-900 font-medium">
                    {dosage.quantity != null ? `${dosage.quantity} ${dosage.unit || ""}`.trim() : "—"}
                  </span>
                </p>
                <p>Frequency: <span className="text-gray-900 font-medium">{frequencyLabel(dosage.frequency)}</span></p>
                <p>
                  Duration:{" "}
                  <span className="text-gray-900 font-medium">
                    {durationLabel(dosage.duration) || "Ongoing"}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Object.entries(config).map(([key, value]) => {
        if (Array.isArray(value)) {
          return (
            <div key={key} className="col-span-full">
              <p className="text-gray-500">{prettifyKey(key)}:</p>
              <p className="text-gray-900 font-medium">
                {value.length
                  ? value.map((item) => (typeof item === "object" ? JSON.stringify(item) : prettifyText(item))).join(", ")
                  : "—"}
              </p>
            </div>
          );
        }
        if (value !== null && typeof value === "object") {
          return (
            <div key={key} className="col-span-full">
              <p className="text-gray-500 mb-1">{prettifyKey(key)}:</p>
              <div className="pl-3 space-y-1">
                {Object.entries(value).map(([nestedKey, nestedValue]) => (
                  <p key={nestedKey}>
                    <span className="text-gray-500">{prettifyKey(nestedKey)}: </span>
                    <span className="text-gray-900 font-medium">{prettifyText(nestedValue)}</span>
                  </p>
                ))}
              </div>
            </div>
          );
        }
        return (
          <p key={key}>
            <span className="text-gray-500">{prettifyKey(key)}: </span>
            <span className="text-gray-900 font-medium">{prettifyText(value)}</span>
          </p>
        );
      })}
    </div>
  );
};

// Full-detail view for one task, opened from the row's action menu — mirrors
// the "See full progress note" / "See full SOAP Note" overview pattern used
// by the other patient-management tabs.
const TaskDetailView = ({ task, onBack }) => {
  if (!task) return null;
  const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.active;

  return (
    <div className="text-sm">
      <button
        type="button"
        className="flex items-center gap-1 cursor-pointer border-b pb-4 w-fit"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4 text-gray-800" />
        <span className="text-sm">Task Details Overview</span>
      </button>

      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-medium mb-4 text-docuhealth-dark">General Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px] text-gray-700">
          <p>
            <span className="text-gray-500">Status: </span>
            <span className={`font-medium ${statusStyle.text}`}>{statusStyle.label}</span>
          </p>
          <p><span className="text-gray-500">Task: </span><span className="font-medium">{task.task}</span></p>
          <p><span className="text-gray-500">Ordering doctor: </span><span className="font-medium">{task.orderingDoctor}</span></p>
          <p><span className="text-gray-500">Task start date/time: </span><span className="font-medium">{task.startAt}</span></p>
          <p><span className="text-gray-500">Completion: </span><span className="font-medium">{task.completion}</span></p>
        </div>
      </div>

      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-medium mb-4 text-docuhealth-dark">Priority &amp; Scheduling</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px] text-gray-700">
          <p><span className="text-gray-500">Priority: </span><span className="font-medium">{priorityLabel(task.priority)}</span></p>
          <p><span className="text-gray-500">Frequency: </span><span className="font-medium">{task.frequency ? frequencyLabel(task.frequency) : "—"}</span></p>
          <p><span className="text-gray-500">Runs until: </span><span className="font-medium">{runsUntilLabel(task)}</span></p>
        </div>
      </div>

      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-medium mb-4 text-docuhealth-dark">Task Instructions</p>
        <p className="text-[12px] text-gray-700">{task.instructions || "NIL"}</p>
      </div>

      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-medium mb-4 text-docuhealth-dark">Task Details</p>
        <div className="text-[12px] text-gray-700">
          <TaskConfigDetails taskType={task.taskType} config={task.config} />
        </div>
      </div>
    </div>
  );
};

const DoctorIssuedTasksHistory = ({ admissionSqid }) => {
  const [filter, setFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openPopover, setOpenPopover] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [seeTaskDetails, setSeeTaskDetails] = useState(false);
  const filterRef = useRef(null);

  const togglePopover = (index) => {
    setOpenPopover(openPopover === index ? null : index);
  };

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
      taskType: task.task_type,
      orderingDoctor: orderingDoctorName(task.created_by_info),
      priority: task.priority,
      instructions: task.instructions,
      frequency: task.frequency,
      repeatUntil: task.repeat_until,
      duration: task.duration,
      config: task.config,
    }));
  }, [data]);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

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

  if (seeTaskDetails) {
    return (
      <div className="text-[12px] my-4 text-left">
        <TaskDetailView task={selectedTask} onBack={() => setSeeTaskDetails(false)} />
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
            {pagedTasks.map((task, index) => {
              const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.active;
              return (
                <div key={task.id} className="mb-4 border rounded-xl bg-white overflow-hidden">
                  <div className="px-4 py-3 border-b flex items-center justify-between gap-2 relative">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Status:</span>
                      <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                      <span className={`font-medium ${statusStyle.text}`}>{statusStyle.label}</span>
                    </div>

                    <button
                      type="button"
                      aria-label="Task actions"
                      aria-haspopup="true"
                      aria-expanded={openPopover === index}
                      onClick={() => {
                        togglePopover(index);
                        setSelectedTaskId(task.id);
                      }}
                      className={`h-8 w-9 flex justify-center items-center rounded-full cursor-pointer ${openPopover === index ? "bg-slate-300" : "hover:bg-gray-200"}`}
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                      </svg>
                    </button>

                    {openPopover === index && (
                      <div className="absolute top-10 right-4 bg-white border shadow-sm rounded-xs p-2 w-52 z-30">
                        <button
                          type="button"
                          className="w-full text-left text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                          onClick={() => {
                            setSelectedTaskId(task.id);
                            setSeeTaskDetails(true);
                            setOpenPopover(null);
                          }}
                        >
                          See task details
                        </button>
                      </div>
                    )}
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
            {pagedTasks.map((task, index) => {
              const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.active;
              return (
                <div key={task.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b flex items-center justify-between gap-2 relative">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Status:</span>
                      <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                      <span className={`font-medium ${statusStyle.text}`}>{statusStyle.label}</span>
                    </div>

                    <button
                      type="button"
                      aria-label="Task actions"
                      onClick={() => {
                        togglePopover(index);
                        setSelectedTaskId(task.id);
                      }}
                      className={`h-9 w-9 flex items-center justify-center rounded-full ${openPopover === index ? "bg-slate-200" : "bg-gray-50"}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M14 8C14 7.45 13.55 7 13 7C12.45 7 12 7.45 12 8C12 8.55 12.45 9 13 9C13.55 9 14 8.55 14 8ZM4 8C4 7.45 3.55 7 3 7C2.45 7 2 7.45 2 8C2 8.55 2.45 9 3 9C3.55 9 4 8.55 4 8ZM9 8C9 7.45 8.55 7 8 7C7.45 7 7 7.45 7 8C7 8.55 7.45 9 8 9C8.55 9 9 8.55 9 8Z"
                          fill="#1A263E"
                        />
                      </svg>
                    </button>

                    {openPopover === index && (
                      <div className="absolute top-10 right-4 bg-white border shadow-sm rounded-xs p-2 w-52 z-30">
                        <button
                          type="button"
                          className="w-full text-left text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                          onClick={() => {
                            setSelectedTaskId(task.id);
                            setSeeTaskDetails(true);
                            setOpenPopover(null);
                          }}
                        >
                          See task details
                        </button>
                      </div>
                    )}
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
