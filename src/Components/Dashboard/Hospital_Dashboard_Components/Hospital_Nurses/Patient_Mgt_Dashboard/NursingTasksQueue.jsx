import React, { useState, useRef, useEffect } from "react";
import { Calendar, User, FileText, Activity, ArrowLeft } from "lucide-react";
import Modal from "../../../../ui/Modal";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";

const demoTasks = [
  {
    id: 1,
    status: "Pending",
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
    status: "In-progress",
    dateTime: "Aug 24, 2026 / 11:15 AM",
    task: "Check blood sugar level",
    orderingDoctor: "Dr. Clark",
    type: "glucose_monitoring",
  },
  {
    id: 4,
    status: "Pending",
    dateTime: "Aug 24, 2026 / 12:00 PM",
    task: "Monitor urine output",
    orderingDoctor: "Dr. Clark",
    type: "input_output_monitoring",
  }
];

const intakeSources = [
  "Oral / Free Fluids",
  "Enteral Nutrition / Tube Feeds",
  "Intravenous (IV) Fluids",
  "IV Medications / Infusions",
  "Blood & Blood Products",
  "Dialysis / Peritoneal Dialysate"
];

const fluidFeeds = [
  "Water",
  "Clear Liquids (Broth, Apple Juice, Clear Tea)",
  "Full Liquids (Milk, Smooth Soup, Custard)",
  "Oral Rehydration Therapy (ORS)",
  "Standard Polymeric Feed",
  "High-Protein / High-Calorie Formula",
  "Diabetic Formula",
  "Renal Formula",
  "Blenderized Hospital Diet / Expressed Breast Milk (EBM)",
  "0.9% Normal Saline (NS)",
  "5% Dextrose in Water (D5W)",
  "10% Dextrose in Water (D10W)",
  "Dextrose Saline (4.3% Dextrose / 0.18% NaCl)",
  "Ringer's Lactate / Hartmann's Solution",
  "Half-Normal Saline (0.45% NaCl)",
  "Whole Blood",
  "Packed Red Blood Cells (PRBC)",
  "Fresh Frozen Plasma (FFP)",
  "Platelet Concentrate",
  "Cryoprecipitate / Human Albumin 20%"
];

const routes = [
  "Oral (PO)",
  "Nasogastric Tube (NGT)",
  "Orogastric Tube (OGT)",
  "Percutaneous Endoscopic Gastrostomy (PEG Tube)",
  "Jejunostomy Tube (J-Tube)",
  "Peripheral Intravenous (PIV) Line",
  "Central Venous Catheter (CVC) / Triple Lumen",
  "Peripherally Inserted Central Catheter (PICC Line)",
  "Subcutaneous (Hypodermoclysis)"
];

const outputTypes = [
  "Urine",
  "Stool / Bowel",
  "Vomitus / Emesis",
  "Nasogastric (NG) / Gastric Suction",
  "Surgical Drain / Wound Drain",
  "Chest Tube Drainage",
  "Ascitic / Peritoneal Fluid",
  "Sputum / Exudate",
  "CSF Drainage"
];

const outputCharacteristicsMap = {
  "Urine": [
    "Clear / Straw-Colored",
    "Amber / Concentrated",
    "Concentrated / Tea-Colored",
    "Frank Blood / Hematuria",
    "Cloudy / Turbid",
    "Sediment / Mucus Present"
  ],
  "Surgical Drain / Wound Drain": [
    "Serous",
    "Serosanguinous",
    "Sanguineous",
    "Purulent",
    "Haemoserous"
  ],
  "Stool / Bowel": [
    "Formed / Soft",
    "Loose / Semi-Liquid",
    "Watery / Liquid",
    "Rice-Water",
    "Melena",
    "Bloody / Dysenteric",
    "Bilious"
  ],
  "Chest Tube Drainage": [
    "Serous",
    "Serosanguinous",
    "Sanguineous",
    "Purulent / Empyema",
    "Chylous / Milky",
    "Clotted"
  ],
  "Ascitic / Peritoneal Fluid": [
    "Straw-Colored / Transudative",
    "Turbid / Cloudy",
    "Purulent",
    "Hemorrhagic / Bloody",
    "Chylous",
    "Bile-Stained / Bilious"
  ],
  "Sputum / Exudate": [
    "Mucoid",
    "Mucopurulent",
    "Purulent",
    "Hemoptysis / Blood-Stained",
    "Frank Blood",
    "Frothy / Pink-Tinged"
  ],
  "Vomitus / Emesis": [
    "Clear / Gastric Secretions",
    "Undigested Food Particles",
    "Bilious (Dark green/yellow)",
    "Coffee-Ground",
    "Frank Blood / Hematemesis"
  ],
  "Nasogastric (NG) / Gastric Suction": [
    "Green / Bilious",
    "Coffee-ground",
    "Bloody",
    "Clear"
  ],
  "CSF Drainage": [
    "Clear / \"Rock Water\"",
    "Xanthochromic",
    "Sanguineous / Bloody",
    "Turbid / Cloudy",
    "Sediment / Debris Present"
  ]
};

const NursingTasksQueue = ({ setAdvanceCheckUp }) => {
  const [openPopover, setOpenPopover] = useState(null);
  const dropdownRef = useRef(null);

  const [filterOption, setFilterOption] = useState("Due task");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  const [globalActionsOpen, setGlobalActionsOpen] = useState(false);
  const globalActionsRef = useRef(null);

  const [openTasksModal, setOpenTasksModal] = useState(false);
  const [modalPopover, setModalPopover] = useState(null);
  const [ioSubmitSuccessModalOpen, setIoSubmitSuccessModalOpen] = useState(false);
  const modalDropdownRef = useRef(null);

  const [glucoseModalOpen, setGlucoseModalOpen] = useState(false);
  const [glucoseSubmitSuccessModalOpen, setGlucoseSubmitSuccessModalOpen] = useState(false);

  const [showMedicationRecord, setShowMedicationRecord] = useState(false);
  const [showGlucoseRecord, setShowGlucoseRecord] = useState(false);
  const [showIORecord, setShowIORecord] = useState(false);
  const [showIOEntry, setShowIOEntry] = useState(false);
  const [selectedOutputType, setSelectedOutputType] = useState("Urine");
  const [isCalculatingIO, setIsCalculatingIO] = useState(false);
  const [ioCalculationModalOpen, setIoCalculationModalOpen] = useState(false);
  
  const [tasksCurrentPage, setTasksCurrentPage] = useState(1);
  const [medsCurrentPage, setMedsCurrentPage] = useState(1);
  const [glucoseCurrentPage, setGlucoseCurrentPage] = useState(1);

  const demoGlucoseRecords = [
    { id: 1, date: "14/03/2026", time: "12 PM", reading: "12.2 mg/gl", context: "Post-meal", insulinStatus: "Not Given", status: "Pending" },
    { id: 2, date: "14/03/2026", time: "12 PM", reading: "12.2 mg/gl", context: "Post-meal", insulinStatus: "Given", status: "Completed" },
    { id: 3, date: "14/03/2026", time: "12 PM", reading: "12.2 mg/gl", context: "Post-meal", insulinStatus: "Not Given", status: "Completed" },
    { id: 4, date: "14/03/2026", time: "12 PM", reading: "12.2 mg/gl", context: "Post-meal", insulinStatus: "Not Given", status: "Completed" },
    { id: 5, date: "14/03/2026", time: "12 PM", reading: "12.2 mg/gl", context: "Post-meal", insulinStatus: "Not Given", status: "Completed" },
    { id: 6, date: "14/03/2026", time: "12 PM", reading: "12.2 mg/gl", context: "Post-meal", insulinStatus: "Given", status: "Completed" },
    { id: 7, date: "14/03/2026", time: "12 PM", reading: "12.2 mg/gl", context: "Post-meal", insulinStatus: "Given", status: "Completed" },
    { id: 8, date: "14/03/2026", time: "12 PM", reading: "12.2 mg/gl", context: "Post-meal", insulinStatus: "Given", status: "Completed" },
  ];

  const demoMedRecords = [
    { id: 1, date: "14/03/2026", time: "12 PM", drug: "Paracetamol", dosage: "10 MG", route: "Oral", freq: "3 times daily", status: "Missed" },
    { id: 2, date: "14/03/2026", time: "12 PM", drug: "Paracetamol", dosage: "10 MG", route: "Oral", freq: "3 times daily", status: "Pending" },
    { id: 3, date: "14/03/2026", time: "12 PM", drug: "Paracetamol", dosage: "10 MG", route: "Oral", freq: "3 times daily", status: "Completed" },
    { id: 4, date: "14/03/2026", time: "12 PM", drug: "Paracetamol", dosage: "10 MG", route: "Oral", freq: "3 times daily", status: "Completed" },
    { id: 5, date: "14/03/2026", time: "12 PM", drug: "Paracetamol", dosage: "10 MG", route: "Oral", freq: "3 times daily", status: "Completed" },
    { id: 6, date: "14/03/2026", time: "12 PM", drug: "Paracetamol", dosage: "10 MG", route: "Oral", freq: "3 times daily", status: "Completed" },
    { id: 7, date: "14/03/2026", time: "12 PM", drug: "Paracetamol", dosage: "10 MG", route: "Oral", freq: "3 times daily", status: "Completed" },
    { id: 8, date: "14/03/2026", time: "12 PM", drug: "Paracetamol", dosage: "10 MG", route: "Oral", freq: "3 times daily", status: "Completed" },
  ];

  const demoIORecords = [
    { id: 1, date: "14/03/2026", dueTime: "12 PM", intakeSource: "Oral", fluidFeed: "Water", intakeVolume: "250 ml", timeRec: "11:45 AM", intakeRoute: "Oral", outputType: "Urine", outputChar: "Clear yellow", outputVolume: "250ml", outputTimeRec: "11:40 AM", timeInterval: "0-4 hours", status: "Missed" },
    { id: 2, date: "14/03/2026", dueTime: "12 PM", intakeSource: "Oral", fluidFeed: "Water", intakeVolume: "250 ml", timeRec: "11:45 AM", intakeRoute: "Oral", outputType: "Urine", outputChar: "Clear yellow", outputVolume: "250ml", outputTimeRec: "11:40 AM", timeInterval: "0-4 hours", status: "Pending" },
    { id: 3, date: "14/03/2026", dueTime: "12 PM", intakeSource: "Oral", fluidFeed: "Water", intakeVolume: "250 ml", timeRec: "11:45 AM", intakeRoute: "Oral", outputType: "Urine", outputChar: "Clear yellow", outputVolume: "250ml", outputTimeRec: "11:40 AM", timeInterval: "0-4 hours", status: "Completed" },
    { id: 4, date: "14/03/2026", dueTime: "12 PM", intakeSource: "Oral", fluidFeed: "Water", intakeVolume: "250 ml", timeRec: "11:45 AM", intakeRoute: "Oral", outputType: "Urine", outputChar: "Clear yellow", outputVolume: "250ml", outputTimeRec: "11:40 AM", timeInterval: "0-4 hours", status: "Completed" },
    { id: 5, date: "14/03/2026", dueTime: "12 PM", intakeSource: "Oral", fluidFeed: "Water", intakeVolume: "250 ml", timeRec: "11:45 AM", intakeRoute: "Oral", outputType: "Urine", outputChar: "Clear yellow", outputVolume: "250ml", outputTimeRec: "11:40 AM", timeInterval: "0-4 hours", status: "Completed" },
    { id: 6, date: "14/03/2026", dueTime: "12 PM", intakeSource: "Oral", fluidFeed: "Water", intakeVolume: "250 ml", timeRec: "11:45 AM", intakeRoute: "Oral", outputType: "Urine", outputChar: "Clear yellow", outputVolume: "250ml", outputTimeRec: "11:40 AM", timeInterval: "0-4 hours", status: "Completed" },
    { id: 7, date: "14/03/2026", dueTime: "12 PM", intakeSource: "Oral", fluidFeed: "Water", intakeVolume: "250 ml", timeRec: "11:45 AM", intakeRoute: "Oral", outputType: "Urine", outputChar: "Clear yellow", outputVolume: "250ml", outputTimeRec: "11:40 AM", timeInterval: "0-4 hours", status: "Completed" },
    { id: 8, date: "14/03/2026", dueTime: "12 PM", intakeSource: "Oral", fluidFeed: "Water", intakeVolume: "250 ml", timeRec: "11:45 AM", intakeRoute: "Oral", outputType: "Urine", outputChar: "Clear yellow", outputVolume: "250ml", outputTimeRec: "11:40 AM", timeInterval: "0-4 hours", status: "Completed" },
  ];

  const getMedStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "text-[#F59E0B]";
      case "Completed":
        return "text-[#10B981]";
      case "Missed":
        return "text-[#EF4444]";
      default:
        return "text-gray-600";
    }
  };

  const getInsulinStatusStyle = (status) => {
    if (status === "Given") return "text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded text-[11px] uppercase";
    if (status?.toLowerCase() === "not given") return "text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded text-[11px] uppercase";
    return "text-gray-600";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenPopover(null);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setFilterDropdownOpen(false);
      }
      if (globalActionsRef.current && !globalActionsRef.current.contains(event.target)) {
        setGlobalActionsOpen(false);
      }
      if (modalDropdownRef.current && !modalDropdownRef.current.contains(event.target)) {
        setModalPopover(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePopover = (index) => {
    setOpenPopover(openPopover === index ? null : index);
  };

  const handleAutoCalculate = (e) => {
    e.preventDefault();
    console.log("Auto calculate clicked");
    setIsCalculatingIO(true);
    setTimeout(() => {
      setIsCalculatingIO(false);
      setIoCalculationModalOpen(true);
    }, 1500);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
      case 'pending': return { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
      case 'in-progress': return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'escalated': return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      case 'missed': return { text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
      default: return { text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  return (
    <div className="text-[12px] my-4 text-left">
      {!showMedicationRecord && !showGlucoseRecord && !showIOEntry && !showIORecord ? (
        <>
          <div className="flex justify-end mb-4 relative gap-2">
        <div className="relative" ref={filterDropdownRef}>
          <button 
            onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-md text-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors h-8"
          >
            <span>Filter: {filterOption}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {filterDropdownOpen && (
            <div className="absolute right-0 top-10 w-48 bg-white border border-slate-100 shadow-[0px_4px_20px_rgba(0,0,0,0.08)] rounded-lg p-1.5 z-40">
              <button 
                className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors"
                onClick={() => { setFilterOption("Due now/high priority"); setFilterDropdownOpen(false); }}
              >
                Due now/high priority
              </button>
              <button 
                className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors"
                onClick={() => { setFilterOption("Overdue"); setFilterDropdownOpen(false); }}
              >
                Overdue
              </button>
              <button 
                className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors"
                onClick={() => { setFilterOption("upcoming"); setFilterDropdownOpen(false); }}
              >
                upcoming
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={globalActionsRef}>
          <button
            onClick={() => setGlobalActionsOpen(!globalActionsOpen)}
            className="flex items-center justify-center h-8 w-9 border border-slate-300 rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
            </svg>
          </button>

          {globalActionsOpen && (
            <div className="absolute right-0 top-10 w-48 bg-white border border-slate-100 shadow-[0px_4px_20px_rgba(0,0,0,0.08)] rounded-lg p-1.5 z-40">
              <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors" onClick={() => { setGlobalActionsOpen(false); setOpenTasksModal(true); }}>
                Open tasks
              </button>
              <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors" onClick={() => setGlobalActionsOpen(false)}>
                Mark all as completed
              </button>
              <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors" onClick={() => setGlobalActionsOpen(false)}>
                Mark all as missed
              </button>
              <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors" onClick={() => setGlobalActionsOpen(false)}>
                Mark all as in-progress
              </button>
              <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors" onClick={() => setGlobalActionsOpen(false)}>
                Mark all as escalated
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:block">
        {demoTasks.map((task, index) => {
          const colors = getStatusColor(task.status);
          return (
            <div
              key={task.id}
              className={`mb-4 p-4 border rounded-md flex flex-wrap gap-4 lg:gap-10 bg-white relative ${openPopover === index ? 'z-50' : 'z-10'}`}
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

              {/* Task & Action */}
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

                <div className="relative" ref={openPopover === index ? dropdownRef : null}>
                  <div
                    onClick={() => setOpenPopover(openPopover === index ? null : index)}
                    className={`hidden h-8 w-9 lg:flex justify-center items-center rounded-full cursor-pointer
                      ${openPopover === index ? "bg-slate-300" : "hover:bg-gray-200"}
                    `}
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                    </svg>
                  </div>

                  {openPopover === index && (
                    <div className="hidden lg:block lg:absolute top-0 lg:top-10 right-0 mt-2 bg-white border shadow-[0px_4px_20px_rgba(0,0,0,0.08)] rounded-lg p-1.5 w-max z-50">
                      {task.type === 'glucose_monitoring' ? (
                        <>
                          <button 
                            className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setGlucoseModalOpen(true); }}
                          >
                            Add new entry
                          </button>
                          <button 
                            className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setShowGlucoseRecord(true); }}
                          >
                            View glucose record
                          </button>
                        </>
                      ) : task.type === 'input_output_monitoring' ? (
                        <>
                          <button 
                            className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setShowIOEntry(true); }}
                          >
                            Add new entry
                          </button>
                          <button 
                            className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setShowIORecord(true); }}
                          >
                            Input and Output record
                          </button>
                        </>
                      ) : (
                        <button 
                          className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap" 
                          onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setShowMedicationRecord(true); }}
                        >
                          View medication record
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="block lg:hidden space-y-4 px-1">
        {demoTasks.map((task, index) => {
          const colors = getStatusColor(task.status);
          return (
            <div
              key={task.id}
              className={`bg-white border border-gray-200 rounded-lg p-4 relative ${openPopover === index ? 'z-50' : 'z-10'}`}
            >
              {/* Mobile Header: Time and Menu */}
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">
                    Task date/time
                  </p>
                  <p className="text-[13px] font-semibold text-slate-700">
                    {task.dateTime}
                  </p>
                </div>

                <div className="relative" ref={openPopover === index ? dropdownRef : null}>
                  <button
                    onClick={() => setOpenPopover(openPopover === index ? null : index)}
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
                    <div className="absolute right-0 top-10 w-max bg-white border border-slate-100 shadow-[0px_8px_30px_rgba(0,0,0,0.12)] rounded-lg p-1.5 z-50">
                      {task.type === 'glucose_monitoring' ? (
                        <>
                          <button 
                            className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                            onClick={() => { setOpenPopover(null); setGlucoseModalOpen(true); }}
                          >
                            Add new entry
                          </button>
                          <button 
                            className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                            onClick={() => { setOpenPopover(null); setShowGlucoseRecord(true); }}
                          >
                            View glucose record
                          </button>
                        </>
                      ) : task.type === 'input_output_monitoring' ? (
                        <>
                          <button 
                            className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                            onClick={() => { setOpenPopover(null); setShowIOEntry(true); }}
                          >
                            Add new entry
                          </button>
                          <button 
                            className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                            onClick={() => { setOpenPopover(null); setShowIORecord(true); }}
                          >
                            Input and Output record
                          </button>
                        </>
                      ) : (
                        <button 
                          className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" 
                          onClick={() => { setOpenPopover(null); setShowMedicationRecord(true); }}
                        >
                          View medication record
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Body: Task & Ordering Doctor & Status */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs border ${colors.border} ${colors.bg}`}>
                    <Activity className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">
                      Status
                    </p>
                    <p className={`text-sm font-semibold ${colors.text}`}>
                      {task.status}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">
                      Ordering Doctor
                    </p>
                    <p className="text-[13px] text-slate-600">
                      {task.orderingDoctor}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">
                      Task
                    </p>
                    <p className="text-[13px] text-slate-600 truncate italic">
                      "{task.task}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination2 count={20} currentPage={tasksCurrentPage} totalPages={8} setCurrentPage={setTasksCurrentPage} />
        </>
      ) : showMedicationRecord ? (
        <>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button 
                  onClick={() => setShowMedicationRecord(false)}
                  className="flex items-center gap-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors font-medium border border-slate-200 bg-white"
              >
                  <ArrowLeft className="w-4 h-4" /> Back to tasks
              </button>
              <h2 className="text-[16px] font-bold text-gray-800">Patient's drug chart</h2>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4 overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[700px]">
               <thead>
                 <tr className="border-b border-gray-200 bg-white">
                   <th className="py-5 px-6 font-bold text-gray-700 w-[15%]">Date</th>
                   <th className="py-5 px-6 font-bold text-gray-700 w-[10%]">Due Time</th>
                   <th className="py-5 px-6 font-bold text-gray-700 w-[20%]">Drug name</th>
                   <th className="py-5 px-6 font-bold text-gray-700 w-[15%]">Dosage</th>
                   <th className="py-5 px-6 font-bold text-gray-700 w-[10%]">Route</th>
                   <th className="py-5 px-6 font-bold text-gray-700 w-[20%]">Frequency</th>
                   <th className="py-5 px-6 font-bold text-gray-700 w-[10%]">Status</th>
                 </tr>
               </thead>
               <tbody>
                 {demoMedRecords.map((med) => (
                   <tr key={med.id} className="border-b border-gray-100 last:border-b-0 hover:bg-slate-50 transition-colors text-[13px]">
                     <td className="py-4 px-6 flex items-center gap-2 text-gray-600"><Calendar className="w-3.5 h-3.5" /> {med.date}</td>
                     <td className="py-4 px-6 text-gray-600">{med.time}</td>
                     <td className="py-4 px-6 font-semibold text-gray-800">{med.drug}</td>
                     <td className="py-4 px-6 text-gray-600">{med.dosage}</td>
                     <td className="py-4 px-6 text-gray-600">{med.route}</td>
                     <td className="py-4 px-6 text-gray-600">{med.freq}</td>
                     <td className={`py-4 px-6 font-bold ${getMedStatusColor(med.status)}`}>{med.status}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>

          {/* Mobile View */}
          <div className="block lg:hidden space-y-4 mb-4">
                {demoMedRecords.map((med) => (
                  <div key={med.id} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <span className="flex items-center gap-2 text-gray-500 text-[12px] font-medium uppercase"><Calendar className="w-3 h-3" /> {med.date} • {med.time}</span>
                        <span className={`text-[12px] font-bold ${getMedStatusColor(med.status)}`}>{med.status}</span>
                    </div>
                    <div>
                        <p className="font-bold text-[16px] text-gray-800 mb-3">{med.drug}</p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-4 text-[13px] text-gray-600 bg-slate-50 p-4 rounded-md border border-slate-100">
                            <p><span className="font-semibold text-gray-400 block mb-1 text-[10px] uppercase">Dosage</span> {med.dosage}</p>
                            <p><span className="font-semibold text-gray-400 block mb-1 text-[10px] uppercase">Route</span> {med.route}</p>
                            <p className="col-span-2"><span className="font-semibold text-gray-400 block mb-1 text-[10px] uppercase">Frequency</span> {med.freq}</p>
                        </div>
                    </div>
                  </div>
                ))}
             </div>

          <Pagination2 count={20} currentPage={medsCurrentPage} totalPages={8} setCurrentPage={setMedsCurrentPage} />
        </>
      ) : showGlucoseRecord ? (
        <>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button 
                  onClick={() => setShowGlucoseRecord(false)}
                  className="flex items-center gap-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors font-medium border border-slate-200 bg-white"
              >
                  <ArrowLeft className="w-4 h-4" /> Back to tasks
              </button>
              <h2 className="text-[16px] font-bold text-gray-800">Patient's glucose chart</h2>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4 overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[700px]">
               <thead>
                 <tr className="border-b border-gray-200 bg-white">
                   <th className="py-5 px-6 font-bold text-gray-700 w-[15%]">Date</th>
                   <th className="py-5 px-6 font-bold text-gray-700 w-[15%]">Due Time</th>
                   <th className="py-5 px-6 font-bold text-gray-700 w-[20%]">Reading</th>
                   <th className="py-5 px-6 font-bold text-gray-700 w-[15%]">Context</th>
                   <th className="py-5 px-6 font-bold text-gray-700 w-[20%]">Insulin status</th>
                   <th className="py-5 px-6 font-bold text-gray-700 w-[15%]">Status</th>
                 </tr>
               </thead>
               <tbody>
                 {demoGlucoseRecords.map((rec) => (
                   <tr key={rec.id} className="border-b border-gray-100 last:border-b-0 hover:bg-slate-50 transition-colors text-[13px]">
                     <td className="py-4 px-6 flex items-center gap-2 text-gray-600"><Calendar className="w-3.5 h-3.5" /> {rec.date}</td>
                     <td className="py-4 px-6 text-gray-600">{rec.time}</td>
                     <td className="py-4 px-6 font-semibold text-gray-800">{rec.reading}</td>
                     <td className="py-4 px-6 text-gray-600">{rec.context}</td>
                     <td className="py-4 px-6"><span className={getInsulinStatusStyle(rec.insulinStatus)}>{rec.insulinStatus}</span></td>
                     <td className={`py-4 px-6 font-bold ${getMedStatusColor(rec.status)}`}>{rec.status}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>

          {/* Mobile View */}
          <div className="block lg:hidden space-y-4 mb-4">
                {demoGlucoseRecords.map((rec) => (
                  <div key={rec.id} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <span className="flex items-center gap-2 text-gray-500 text-[12px] font-medium uppercase"><Calendar className="w-3 h-3" /> {rec.date} • {rec.time}</span>
                        <span className={`text-[12px] font-bold ${getMedStatusColor(rec.status)}`}>{rec.status}</span>
                    </div>
                    <div>
                        <p className="font-bold text-[16px] text-gray-800 mb-3">{rec.reading}</p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-4 text-[13px] text-gray-600 bg-slate-50 p-4 rounded-md border border-slate-100">
                            <p><span className="font-semibold text-gray-400 block mb-1 text-[10px] uppercase">Context</span> {rec.context}</p>
                            <p><span className="font-semibold text-gray-400 block mb-2 text-[10px] uppercase">Insulin status</span> <span className={getInsulinStatusStyle(rec.insulinStatus)}>{rec.insulinStatus}</span></p>
                        </div>
                    </div>
                  </div>
                ))}
             </div>

          <Pagination2 count={20} currentPage={glucoseCurrentPage} totalPages={8} setCurrentPage={setGlucoseCurrentPage} />
        </>
      ) : showIORecord ? (
        <>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button 
                  onClick={() => setShowIORecord(false)}
                  className="flex items-center justify-center gap-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors font-medium border border-slate-200 bg-white"
              >
                  <ArrowLeft className="w-4 h-4" /> Back to tasks
              </button>
              <h2 className="text-[16px] font-bold text-gray-800">Intake and Output chart</h2>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-4 sm:mt-0">
              <button 
                type="button"
                onClick={handleAutoCalculate}
                disabled={isCalculatingIO}
                className="flex items-center justify-center gap-2 border-2 border-docuhealth-primary text-docuhealth-primary hover:bg-docuhealth-primary hover:text-white px-4 py-2 rounded-md transition-colors font-medium text-[13px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-docuhealth-primary"
              >
                {isCalculatingIO ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculating...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="16" height="16" rx="2" ry="2"></rect><line x1="16" y1="3" x2="16" y2="7"></line><line x1="8" y1="3" x2="8" y2="7"></line><line x1="4" y1="11" x2="20" y2="11"></line><rect x="8" y="15" width="2" height="2"></rect><rect x="14" y="15" width="2" height="2"></rect></svg>
                    Auto-calculate chart for last 24 hours
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4 overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[1100px]">
               <thead>
                 <tr className="border-b border-gray-200 bg-white text-[13px]">
                   <th className="py-5 px-4 font-bold text-gray-700 w-[12%]">Date</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Due Time</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Intake source</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Fluid/feed</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Intake volume</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Time rec.</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Intake route</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Output type</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Output Char.</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Output volume</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Time rec.</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Time (4hr interval)</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Status</th>
                 </tr>
               </thead>
               <tbody>
                 {demoIORecords.map((rec) => (
                   <tr key={rec.id} className="border-b border-gray-100 last:border-b-0 hover:bg-slate-50 transition-colors text-[13px]">
                     <td className="py-4 px-4 flex items-center gap-2 text-gray-600 whitespace-nowrap"><Calendar className="w-3.5 h-3.5" /> {rec.date}</td>
                     <td className="py-4 px-3 text-gray-600 whitespace-nowrap">{rec.dueTime}</td>
                     <td className="py-4 px-3 text-gray-600">{rec.intakeSource}</td>
                     <td className="py-4 px-3 text-gray-600">{rec.fluidFeed}</td>
                     <td className="py-4 px-3 text-gray-600 whitespace-nowrap">{rec.intakeVolume}</td>
                     <td className="py-4 px-3 text-gray-600 whitespace-nowrap">{rec.timeRec}</td>
                     <td className="py-4 px-3 text-gray-600">{rec.intakeRoute}</td>
                     <td className="py-4 px-3 text-gray-600">{rec.outputType}</td>
                     <td className="py-4 px-3 text-gray-600">{rec.outputChar}</td>
                     <td className="py-4 px-3 text-gray-600 whitespace-nowrap">{rec.outputVolume}</td>
                     <td className="py-4 px-3 text-gray-600 whitespace-nowrap">{rec.outputTimeRec}</td>
                     <td className="py-4 px-3 text-gray-600 whitespace-nowrap">{rec.timeInterval}</td>
                     <td className={`py-4 px-3 font-bold ${getMedStatusColor(rec.status)} whitespace-nowrap`}>{rec.status}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>

          {/* Mobile View */}
          <div className="block lg:hidden space-y-4 mb-4">
            {demoIORecords.map((rec) => (
              <div key={rec.id} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <span className="flex items-center gap-2 text-gray-500 text-[12px] font-medium uppercase"><Calendar className="w-3 h-3" /> {rec.date} • {rec.dueTime}</span>
                    <span className={`text-[12px] font-bold ${getMedStatusColor(rec.status)}`}>{rec.status}</span>
                </div>
                <div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-4 text-[13px] text-gray-600 bg-slate-50 p-4 rounded-md border border-slate-100 mb-4">
                        <p><span className="font-semibold text-gray-400 block mb-1 text-[10px] uppercase">Intake Source</span> {rec.intakeSource}</p>
                        <p><span className="font-semibold text-gray-400 block mb-1 text-[10px] uppercase">Fluid/feed</span> {rec.fluidFeed}</p>
                        <p><span className="font-semibold text-gray-400 block mb-1 text-[10px] uppercase">Intake Vol.</span> {rec.intakeVolume}</p>
                        <p><span className="font-semibold text-gray-400 block mb-1 text-[10px] uppercase">Route</span> {rec.intakeRoute}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-4 text-[13px] text-gray-600 bg-blue-50/50 p-4 rounded-md border border-blue-100/50">
                        <p><span className="font-semibold text-gray-400 block mb-1 text-[10px] uppercase">Output Type</span> {rec.outputType}</p>
                        <p><span className="font-semibold text-gray-400 block mb-1 text-[10px] uppercase">Output Char.</span> {rec.outputChar}</p>
                        <p><span className="font-semibold text-gray-400 block mb-1 text-[10px] uppercase">Output Vol.</span> {rec.outputVolume}</p>
                        <p><span className="font-semibold text-gray-400 block mb-1 text-[10px] uppercase">4hr interval</span> {rec.timeInterval}</p>
                    </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination2 count={20} currentPage={tasksCurrentPage} totalPages={8} setCurrentPage={setTasksCurrentPage} />
        </>
      ) : showIOEntry ? (
        <div className="bg-white">
          <div className="mb-8 flex items-center gap-3 border-b border-gray-100 pb-4">
            <button 
                onClick={() => setShowIOEntry(false)}
                className="flex items-center justify-center gap-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors font-medium border border-slate-200 bg-white"
            >
                <ArrowLeft className="w-4 h-4" /> Back to tasks
            </button>
            <h2 className="text-[16px] font-bold text-gray-800">Add new entry</h2>
          </div>

          <div className="space-y-8 pb-10">
            {/* Fluid Intake Section */}
            <section>
              <h3 className="text-[15px] font-bold text-slate-700 mb-4">Fluid Intake</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Intake source</label>
                  <div className="relative">
                    <select className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary transition-all appearance-none bg-white cursor-pointer">
                      {intakeSources.map(source => <option key={source} value={source}>{source}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
                
                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Fluid/Feed</label>
                  <div className="relative">
                    <select className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary transition-all appearance-none bg-white cursor-pointer">
                      {fluidFeeds.map(feed => <option key={feed} value={feed}>{feed}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Route</label>
                  <div className="relative">
                    <select className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary transition-all appearance-none bg-white cursor-pointer">
                      {routes.map(route => <option key={route} value={route}>{route}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Intake volume (ML)</label>
                  <div className="relative flex items-center">
                    <input type="text" className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary transition-all" defaultValue="250" />
                    <div className="absolute right-2 text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded-md">ML</div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Time recorded</label>
                  <div className="relative flex items-center">
                    <input type="time" className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary transition-all [&::-webkit-calendar-picker-indicator]:hidden" defaultValue="11:55" />
                    <div className="absolute right-3 text-docuhealth-primary pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Fluid Output Section */}
            <section>
              <h3 className="text-[15px] font-bold text-slate-700 mb-4 mt-8">Fluid output</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Output type</label>
                  <div className="relative">
                    <select 
                      className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary transition-all appearance-none bg-white cursor-pointer"
                      value={selectedOutputType}
                      onChange={(e) => setSelectedOutputType(e.target.value)}
                    >
                      {outputTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Output characteristics</label>
                  <div className="relative">
                    <select className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-400 outline-none focus:border-docuhealth-primary transition-all appearance-none bg-white cursor-pointer">
                      {(outputCharacteristicsMap[selectedOutputType] || ["Normal"]).map(char => <option key={char} value={char}>{char}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-300">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Output volume (ML)</label>
                  <div className="relative flex items-center">
                    <input type="text" className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary transition-all" defaultValue="250" />
                    <div className="absolute right-2 text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded-md">ML</div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Time recorded</label>
                  <div className="relative flex items-center">
                    <input type="time" className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary transition-all [&::-webkit-calendar-picker-indicator]:hidden" defaultValue="11:55" />
                    <div className="absolute right-3 text-docuhealth-primary pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Time (4 hours intervals)</label>
                  <div className="relative flex items-center">
                    <input type="text" className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-400 outline-none focus:border-docuhealth-primary transition-all" placeholder="0-4 hours" />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Nursing remark</label>
                  <textarea className="w-full border border-slate-200 rounded-md px-3 py-3 text-sm text-slate-400 outline-none focus:border-docuhealth-primary transition-all min-h-[100px] resize-none" placeholder="Type here..."></textarea>
                </div>
              </div>
            </section>
            
            <div className="pt-6 flex justify-end">
              <button 
                onClick={() => {
                    setShowIOEntry(false); 
                    setIoSubmitSuccessModalOpen(true);
                }}
                className="bg-docuhealth-primary hover:opacity-90 text-white font-medium px-16 py-3 rounded-full text-sm transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Modal isOpen={openTasksModal} onClose={() => setOpenTasksModal(false)} maxWidth="7xl">
        <div className="relative py-10 px-2">
          <button 
            onClick={() => setOpenTasksModal(false)}
            className="absolute top-0 right-0  p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center mb-10">
            <h3 className="text-xl font-bold text-slate-800">Task details</h3>
            <p className="text-sm text-slate-500 mt-1">Below are details of the task issued</p>
          </div>
          
          <div className="text-[12px] text-left">
          <div className="hidden lg:block">
            {demoTasks.map((task, index) => {
              const colors = getStatusColor(task.status);
              return (
                <div key={task.id} className={`mb-4 p-4 border border-slate-200 rounded-xl flex flex-wrap gap-4 lg:gap-10 bg-white relative ${modalPopover === index ? 'z-50' : 'z-10'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${colors.bg}`}>
                      <Activity className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">Status</p>
                      <p className={`text-sm font-medium ${colors.text}`}>{task.status}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-md">
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">Date / Time</p>
                      <p className="text-sm font-medium text-gray-800">{task.dateTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-md">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">Ordering Doctor</p>
                      <p className="text-sm font-medium text-gray-800">{task.orderingDoctor}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between relative flex-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-md">
                        <FileText className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Task</p>
                        <p className="text-sm font-medium text-gray-800 truncate max-w-[150px]">{task.task}</p>
                      </div>
                    </div>

                    <div className="relative" ref={modalPopover === index ? modalDropdownRef : null}>
                      <div
                        onClick={() => setModalPopover(modalPopover === index ? null : index)}
                        className={`hidden h-8 w-9 lg:flex justify-center items-center rounded-full cursor-pointer ${modalPopover === index ? "bg-slate-200" : "hover:bg-slate-100"}`}
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                        </svg>
                      </div>

                      {modalPopover === index && (
                        <div className="hidden lg:block lg:absolute top-0 lg:top-10 right-0 mt-2 bg-white border shadow-[0px_4px_20px_rgba(0,0,0,0.08)] rounded-lg p-1.5 w-max z-40">
                          <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => setModalPopover(null)}>Mark as completed</button>
                          <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => setModalPopover(null)}>Mark as missed</button>
                          <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => setModalPopover(null)}>Mark as in-progress</button>
                          <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => setModalPopover(null)}>Mark as escalated</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
                <div className="block lg:hidden space-y-4 px-1">
            {demoTasks.map((task, index) => {
              const colors = getStatusColor(task.status);
              return (
                <div key={task.id} className={`bg-white border border-gray-200 rounded-lg p-4 relative ${modalPopover === index ? 'z-50' : 'z-10'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Task date/time</p>
                      <p className="text-[13px] font-semibold text-slate-700">{task.dateTime}</p>
                    </div>
                    <div className="relative" ref={modalPopover === index ? modalDropdownRef : null}>
                      <button onClick={() => setModalPopover(modalPopover === index ? null : index)} className={`h-9 w-9 flex items-center justify-center rounded-full ${modalPopover === index ? "bg-slate-200" : "bg-gray-50"}`}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 8C14 7.45 13.55 7 13 7C12.45 7 12 7.45 12 8C12 8.55 12.45 9 13 9C13.55 9 14 8.55 14 8ZM4 8C4 7.45 3.55 7 3 7C2.45 7 2 7.45 2 8C2 8.55 2.45 9 3 9C3.55 9 4 8.55 4 8ZM9 8C9 7.45 8.55 7 8 7C7.45 7 7 7.45 7 8C7 8.55 7.45 9 8 9C8.55 9 9 8.55 9 8Z" fill="#1A263E"/></svg>
                      </button>
                      {modalPopover === index && (
                        <div className="absolute right-0 top-10 w-max bg-white border border-slate-100 shadow-[0px_8px_30px_rgba(0,0,0,0.12)] rounded-lg p-1.5 z-50">
                          <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => setModalPopover(null)}>Mark as completed</button>
                          <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => setModalPopover(null)}>Mark as missed</button>
                          <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => setModalPopover(null)}>Mark as in-progress</button>
                          <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => setModalPopover(null)}>Mark as escalated</button>
                        </div>
                      )}
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
        </div>
        </div>
      </Modal>
      <Modal isOpen={glucoseModalOpen} onClose={() => setGlucoseModalOpen(false)} maxWidth="xl">
        <div className="relative p-6">
          <button 
            onClick={() => setGlucoseModalOpen(false)}
            className="absolute top-0 right-0 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <h3 className="text-xl font-bold text-slate-800 text-center mb-8">Glucose monitoring chart</h3>

          <div className="space-y-6 text-left">
            {/* Reading/Unit Input */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">Reading/Unit</label>
              <div className="relative flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-docuhealth-primary/20 focus-within:border-docuhealth-primary transition-all">
                <input 
                  type="text" 
                  className="flex-1 px-4 py-3 text-sm outline-none text-slate-700 placeholder:text-slate-400" 
                  placeholder="16.6" 
                />
                <div className="absolute right-2 top-2 bottom-2">
                  <div className="relative h-full flex items-center bg-blue-50 rounded px-3 pr-8 cursor-pointer">
                    <select className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                      <option value="mg/gl">mg/gl</option>
                      <option value="mmol/L">mmol/L</option>
                    </select>
                    <span className="text-blue-900 text-sm font-medium select-none">mg/gl</span>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-blue-900">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Context Dropdown */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">Context</label>
              <div className="relative">
                <select className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-docuhealth-primary/20 focus:border-docuhealth-primary transition-all appearance-none cursor-pointer bg-white">
                  <option value="" disabled selected hidden>Pre-meal</option>
                  <option value="Pre-meal">Pre-meal</option>
                  <option value="Post-meal">Post-meal</option>
                  <option value="Fasting">Fasting</option>
                  <option value="Bedtime">Bedtime</option>
                  <option value="Routine">Routine</option>
                  <option value="Other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <input 
                type="checkbox" 
                id="insulin_check" 
                className="w-4 h-4 text-docuhealth-primary bg-gray-100 border-gray-300 rounded focus:ring-docuhealth-primary cursor-pointer accent-docuhealth-primary"
              />
              <label htmlFor="insulin_check" className="text-sm font-medium text-slate-400 cursor-pointer">
                I have administered insulin
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button 
                onClick={() => {
                  setGlucoseModalOpen(false);
                  setGlucoseSubmitSuccessModalOpen(true);
                }}
                className="w-full bg-docuhealth-primary  text-white font-medium text-sm py-4 rounded-full transition-colors duration-200"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={glucoseSubmitSuccessModalOpen} onClose={() => setGlucoseSubmitSuccessModalOpen(false)}>
        <div className="py-3 text-center max-w-sm mx-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Success!</h2>
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            You have successfully completed this task !
          </p>
          <button
            onClick={() => setGlucoseSubmitSuccessModalOpen(false)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-full transition-colors mb-3"
          >
            Go to my tasks
          </button>
          <button
            onClick={() => {
              setGlucoseSubmitSuccessModalOpen(false);
              if (setAdvanceCheckUp) setAdvanceCheckUp(false);
            }}
            className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-full transition-colors"
          >
            Go back to patient's management
          </button>
        </div>
      </Modal>

      {/* IO Success Modal */}
      <Modal isOpen={ioSubmitSuccessModalOpen} onClose={() => setIoSubmitSuccessModalOpen(false)}>
        <div className="py-3 text-center max-w-sm mx-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Success!</h2>
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            Upload is successful, you are to make another upload in the next 4 hours
          </p>
          <button
            onClick={() => setIoSubmitSuccessModalOpen(false)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-full transition-colors mb-3"
          >
            Go to my tasks
          </button>
          <button
            onClick={() => {
              setIoSubmitSuccessModalOpen(false);
              if (setAdvanceCheckUp) setAdvanceCheckUp(false);
            }}
            className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-full transition-colors"
          >
            Go back to patient's management
          </button>
        </div>
      </Modal>

      {/* IO Calculation Modal */}
      <Modal isOpen={ioCalculationModalOpen} onClose={() => setIoCalculationModalOpen(false)}>
        <div className="py- text-center  flex flex-col items-center relative">
          <button 
            onClick={() => setIoCalculationModalOpen(false)}
            className="absolute top-0 right-0 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          
          <div className="mb-6 flex justify-center text-docuhealth-primary mt-4">
            <svg width="116" height="116" viewBox="0 0 116 116" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.3333 9.66699H96.6667C99.3361 9.66699 101.5 11.831 101.5 14.5003V101.5C101.5 104.17 99.3361 106.334 96.6667 106.334H19.3333C16.664 106.334 14.5 104.17 14.5 101.5V14.5003C14.5 11.831 16.664 9.66699 19.3333 9.66699ZM24.1667 19.3337V96.667H91.8333V19.3337H24.1667ZM33.8333 29.0003H82.1667V48.3337H33.8333V29.0003ZM33.8333 58.0003H43.5V67.667H33.8333V58.0003ZM33.8333 77.3337H43.5V87.0003H33.8333V77.3337ZM53.1667 58.0003H62.8333V67.667H53.1667V58.0003ZM53.1667 77.3337H62.8333V87.0003H53.1667V77.3337ZM72.5 58.0003H82.1667V87.0003H72.5V58.0003Z" fill="currentColor"/>
            </svg>
          </div>
          
          <p className="text-gray-800 text-[16px] mb-8 font-medium tracking-wide">
            2,200 ml - 1450 ml = <span className="text-docuhealth-primary font-bold">750 ML fluid</span>
          </p>
          
          <button
            onClick={() => {
              setIoCalculationModalOpen(false);
              setShowIORecord(false);
            }}
            className="w-[90%] bg-docuhealth-primary hover:bg-docuhealth-primary/90 text-white font-medium py-3 rounded-full transition-colors mb-2"
          >
            Go to my task
          </button>
        </div>
      </Modal>
    </div>
  );
};
export default NursingTasksQueue;
