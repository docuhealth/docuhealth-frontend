import React, { useState, useRef, useEffect } from "react";
import { Calendar, User, FileText, Activity, ArrowLeft, Loader2 } from "lucide-react";
import Modal from "../../../../ui/Modal";
import EmptyState from "../../../../ui/EmptyState";
import toast from "react-hot-toast";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import NursingDischargeSummaryForm from "./NursingDischargeSummaryForm";

const tasks = [
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
    status: "Pending",
    dateTime: "Aug 24, 2026 / 08:30 AM",
    task: "Check Blood Pressure",
    orderingDoctor: "Dr. Adams",
    type: "vital_signs",
  },
  {
    id: 3,
    status: "Pending",
    dateTime: "Aug 24, 2026 / 11:15 AM",
    task: "Check blood sugar level",
    orderingDoctor: "Dr. Clark",
    type: "glucose",
  },
  {
    id: 4,
    status: "Pending",
    dateTime: "Aug 24, 2026 / 12:00 PM",
    task: "Monitor urine output",
    orderingDoctor: "Dr. Clark",
    type: "input_output",
  },
  {
    id: 5,
    status: "Pending",
    dateTime: "Aug 24, 2026 / 02:00 PM",
    task: "Monitor for seizure events",
    orderingDoctor: "Dr. Evans",
    type: "seizure",
  },
  {
    id: 6,
    status: "Pending",
    dateTime: "Aug 24, 2026 / 04:30 PM",
    task: "Lumbar Puncture",
    orderingDoctor: "Dr. Bello",
    type: "procedure",
  },
  {
    id: 7,
    status: "Pending",
    dateTime: "Aug 24, 2026 / 06:00 PM",
    task: "Administer Normal Saline",
    orderingDoctor: "Dr. Evans",
    type: "iv_fluid",
  },
  {
    id: 8,
    status: "Pending",
    dateTime: "Aug 24, 2026 / 06:00 PM",
    task: "Complete Nursing Discharge",
    orderingDoctor: "Dr. Evans",
    type: "discharge_summary",
  }
];

const intakeSources = [
  { value: "oral_free_fluids", label: "Oral / Free Fluids" },
  { value: "enteral_nutrition", label: "Enteral Nutrition / Tube Feeds" },
  { value: "iv_fluids", label: "Intravenous (IV) Fluids" },
  { value: "iv_medications", label: "IV Medications / Infusions" },
  { value: "blood_products", label: "Blood & Blood Products" },
  { value: "dialysate", label: "Dialysis / Peritoneal Dialysate" }
];

const fluidFeeds = [
  { value: "water", label: "Water" },
  { value: "clear_liquids", label: "Clear Liquids (Broth, Apple Juice, Clear Tea)" },
  { value: "full_liquids", label: "Full Liquids (Milk, Smooth Soup, Custard)" },
  { value: "oral_rehydration_salt", label: "Oral Rehydration Therapy (ORS)" },
  { value: "standard_polymeric_feed", label: "Standard Polymeric Feed" },
  { value: "high_protein_formula", label: "High-Protein / High-Calorie Formula" },
  { value: "diabetic_formula", label: "Diabetic Formula" },
  { value: "renal_formula", label: "Renal Formula" },
  { value: "blenderized_diet_ebm", label: "Blenderized Hospital Diet / Expressed Breast Milk (EBM)" },
  { value: "normal_saline", label: "0.9% Normal Saline (NS)" },
  { value: "dextrose_water_5", label: "5% Dextrose in Water (D5W)" },
  { value: "dextrose_water_10", label: "10% Dextrose in Water (D10W)" },
  { value: "dextrose_saline", label: "Dextrose Saline (4.3% Dextrose / 0.18% NaCl)" },
  { value: "ringers_lactate", label: "Ringer's Lactate / Hartmann's Solution" },
  { value: "half_normal_saline", label: "Half-Normal Saline (0.45% NaCl)" },
  { value: "whole_blood", label: "Whole Blood" },
  { value: "packed_red_blood_cells", label: "Packed Red Blood Cells (PRBC)" },
  { value: "fresh_frozen_plasma", label: "Fresh Frozen Plasma (FFP)" },
  { value: "platelet_concentrate", label: "Platelet Concentrate" },
  { value: "cryoprecipitate_albumin", label: "Cryoprecipitate / Human Albumin 20%" }
];

const routes = [
  { value: "oral", label: "Oral (PO)" },
  { value: "nasogastric_tube", label: "Nasogastric Tube (NGT)" },
  { value: "orogastric_tube", label: "Orogastric Tube (OGT)" },
  { value: "peg_tube", label: "Percutaneous Endoscopic Gastrostomy (PEG Tube)" },
  { value: "jejunostomy_tube", label: "Jejunostomy Tube (J-Tube)" },
  { value: "peripheral_iv_line", label: "Peripheral Intravenous (PIV) Line" },
  { value: "central_venous_catheter", label: "Central Venous Catheter (CVC) / Triple Lumen" },
  { value: "picc_line", label: "Peripherally Inserted Central Catheter (PICC Line)" },
  { value: "subcutaneous", label: "Subcutaneous (Hypodermoclysis)" }
];

const outputTypes = [
  { value: "urine", label: "Urine" },
  { value: "stool_bowel", label: "Stool / Bowel" },
  { value: "vomitus_emesis", label: "Vomitus / Emesis" },
  { value: "ng_gastric_suction", label: "Nasogastric (NG) / Gastric Suction" },
  { value: "surgical_wound_drain", label: "Surgical Drain / Wound Drain" },
  { value: "chest_tube_drainage", label: "Chest Tube Drainage" },
  { value: "ascitic_peritoneal_fluid", label: "Ascitic / Peritoneal Fluid" },
  { value: "sputum_exudate", label: "Sputum / Exudate" },
  { value: "csf_drainage", label: "CSF Drainage" }
];

const outputCharacteristicsMap = {
  "urine": [
    { value: "clear_straw_colored", label: "Clear / Straw-Colored" },
    { value: "amber_concentrated", label: "Amber / Concentrated" },
    { value: "concentrated_tea_colored", label: "Concentrated / Tea-Colored" },
    { value: "hematuria", label: "Frank Blood / Hematuria" },
    { value: "cloudy_turbid", label: "Cloudy / Turbid" },
    { value: "sediment_mucus", label: "Sediment / Mucus Present" }
  ],
  "surgical_wound_drain": [
    { value: "serous", label: "Serous" },
    { value: "serosanguinous", label: "Serosanguinous" },
    { value: "sanguineous", label: "Sanguineous" },
    { value: "purulent", label: "Purulent" },
    { value: "haemoserous", label: "Haemoserous" }
  ],
  "stool_bowel": [],
  "chest_tube_drainage": [
    { value: "serous", label: "Serous" },
    { value: "serosanguinous", label: "Serosanguinous" },
    { value: "sanguineous", label: "Sanguineous" },
    { value: "purulent_empyema", label: "Purulent / Empyema" },
    { value: "chylous_milky", label: "Chylous / Milky" },
    { value: "clotted", label: "Clotted" }
  ],
  "ascitic_peritoneal_fluid": [
    { value: "straw_colored_transudative", label: "Straw-Colored / Transudative" },
    { value: "turbid_cloudy", label: "Turbid / Cloudy" },
    { value: "purulent", label: "Purulent" },
    { value: "hemorrhagic_bloody", label: "Hemorrhagic / Bloody" },
    { value: "chylous", label: "Chylous" },
    { value: "bile_stained_bilious", label: "Bile-Stained / Bilious" }
  ],
  "sputum_exudate": [
    { value: "mucoid", label: "Mucoid" },
    { value: "mucopurulent", label: "Mucopurulent" },
    { value: "purulent", label: "Purulent" },
    { value: "hemoptysis", label: "Hemoptysis / Blood-Stained" },
    { value: "frank_blood", label: "Frank Blood" },
    { value: "frothy_pink_tinged", label: "Frothy / Pink-Tinged" }
  ],
  "vomitus_emesis": [
    { value: "clear_gastric_secretions", label: "Clear / Gastric Secretions" },
    { value: "undigested_food", label: "Undigested Food Particles" },
    { value: "bilious", label: "Bilious (Dark green/yellow)" },
    { value: "coffee_ground", label: "Coffee-Ground" },
    { value: "hematemesis", label: "Frank Blood / Hematemesis" }
  ],
  "ng_gastric_suction": [],
  "csf_drainage": [
    { value: "rock_water_clear", label: "Clear / \"Rock Water\"" },
    { value: "xanthochromic", label: "Xanthochromic" },
    { value: "sanguineous_bloody", label: "Sanguineous / Bloody" },
    { value: "turbid_cloudy", label: "Turbid / Cloudy" },
    { value: "sediment_debris", label: "Sediment / Debris Present" }
  ]
};

const NursingTasksQueue = ({ setAdvanceCheckUp, admission, patientFullInfo, taskStatus }) => {
  const [openPopover, setOpenPopover] = useState(null);
  const dropdownRef = useRef(null);

  const [filterOption, setFilterOption] = useState("Due task");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  const [globalActionsOpen, setGlobalActionsOpen] = useState(false);
  const globalActionsRef = useRef(null);

  const [openTasksModal, setOpenTasksModal] = useState(false);
  const [modalPopover, setModalPopover] = useState(null);
  const [isSubmittingTaskAction, setIsSubmittingTaskAction] = useState(null);

  const [ioSubmitSuccessModalOpen, setIoSubmitSuccessModalOpen] = useState(false);
  const modalDropdownRef = useRef(null);

  const [glucoseModalOpen, setGlucoseModalOpen] = useState(false);
  const [glucoseSubmitSuccessModalOpen, setGlucoseSubmitSuccessModalOpen] = useState(false);

  const [showMedicationRecord, setShowMedicationRecord] = useState(false);
  const [showGlucoseRecord, setShowGlucoseRecord] = useState(false);
  const [showIORecord, setShowIORecord] = useState(false);
  const [showIOEntry, setShowIOEntry] = useState(false);
  const [vitalsInfoModalOpen, setVitalsInfoModalOpen] = useState(false);
  const [showVitalsEntry, setShowVitalsEntry] = useState(false);
  const [showVitalsRecord, setShowVitalsRecord] = useState(false);
  const [vitalsSubmitSuccessModalOpen, setVitalsSubmitSuccessModalOpen] = useState(false);
  
  const [seizureInfoModalOpen, setSeizureInfoModalOpen] = useState(false);
  const [showSeizureEntry, setShowSeizureEntry] = useState(false);
  const [showSeizureRecord, setShowSeizureRecord] = useState(false);
  const [seizureSubmitSuccessModalOpen, setSeizureSubmitSuccessModalOpen] = useState(false);

  const [showProcedureEntry, setShowProcedureEntry] = useState(false);
  const [showProcedureRecord, setShowProcedureRecord] = useState(false);
  const [showDischargeSummary, setShowDischargeSummary] = useState(false);
  const [procedureSubmitSuccessModalOpen, setProcedureSubmitSuccessModalOpen] = useState(false);

  const [showIVFluidEntry, setShowIVFluidEntry] = useState(false);
  const [showIVFluidRecord, setShowIVFluidRecord] = useState(false);
  const [ivFluidSubmitSuccessModalOpen, setIvFluidSubmitSuccessModalOpen] = useState(false);

  const [selectedOutputType, setSelectedOutputType] = useState("urine");
  const [isCalculatingIO, setIsCalculatingIO] = useState(false);
  const [ioCalculationModalOpen, setIoCalculationModalOpen] = useState(false);
  const [fluidBalanceData, setFluidBalanceData] = useState(null);

  const formatLabel = (str) => {
    if (!str) return '-';
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  
  const [tasksCurrentPage, setTasksCurrentPage] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasksTotalCount, setTasksTotalCount] = useState(0);

  const [medsCurrentPage, setMedsCurrentPage] = useState(1);
  const [glucoseCurrentPage, setGlucoseCurrentPage] = useState(1);
  const [vitalsCurrentPage, setVitalsCurrentPage] = useState(1);
  const [seizureCurrentPage, setSeizureCurrentPage] = useState(1);
  const [procedureCurrentPage, setProcedureCurrentPage] = useState(1);
  const [ivFluidCurrentPage, setIvFluidCurrentPage] = useState(1);
  const [ioCurrentPage, setIoCurrentPage] = useState(1);

  useEffect(() => {
    setTasksCurrentPage(1);
  }, [taskStatus]);

  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [chartTotalCount, setChartTotalCount] = useState(0);
  const handleTaskAction = async (action, sqid, payload = null) => {
    try {
      setIsSubmittingTaskAction(sqid);
      if (action === 'claim') {
        await axiosInstanceHos.post(`/api/inpatients/task-occurrences/${sqid}/claim`);
      } else if (action === 'confirm-medication') {
        await axiosInstanceHos.post(`/api/inpatients/task-occurrences/${sqid}/confirm-medication`);
      } else if (action === 'release') {
        await axiosInstanceHos.post(`/api/inpatients/task-occurrences/${sqid}/release`);
      } else if (action === 'mark-missed') {
        await axiosInstanceHos.post(`/api/inpatients/task-occurrences/${sqid}/mark-missed`);
      } else if (action === 'escalate') {
        await axiosInstanceHos.post(`/api/inpatients/task-occurrences/${sqid}/escalate`, { escalation_reason: payload || "Escalated by nurse" });
      }
      
      const admissionSqid = admission?.sqid;
      if (admissionSqid) {
        const res = await axiosInstanceHos.get(`/api/inpatients/admissions/${admissionSqid}/task-occurrences?status=${taskStatus}&page=${tasksCurrentPage}&size=8`);
        setTasks(res.data.results || []);
        setTasksTotalCount(res.data.count || 0);
      }
    } catch (err) {
      console.error(err);
      let errorMsg = "Action failed. Please try again.";
      if (err.response?.data) {
        const data = err.response.data;
        if (data.detail) {
          errorMsg = Array.isArray(data.detail) ? data.detail[0] : data.detail;
        } else if (typeof data === 'object') {
          const firstValue = Object.values(data)[0];
          if (Array.isArray(firstValue)) errorMsg = firstValue[0];
          else if (typeof firstValue === 'string') errorMsg = firstValue;
        }
      }
      toast.error(errorMsg);
    } finally {
      setIsSubmittingTaskAction(null);
    }
  };

  useEffect(() => {
    let chartType = null;
    let page = 1;
    if (showVitalsRecord) { chartType = 'vital-signs'; page = vitalsCurrentPage; }
    else if (showMedicationRecord) { chartType = 'medications'; page = medsCurrentPage; }
    else if (showGlucoseRecord) { chartType = 'glucose'; page = glucoseCurrentPage; }
    else if (showIORecord) { chartType = 'fluid-balance'; page = ioCurrentPage; }
    else if (showSeizureRecord) { chartType = 'seizures'; page = seizureCurrentPage; }
    else if (showProcedureRecord) { chartType = 'procedures'; page = procedureCurrentPage; }
    else if (showIVFluidRecord) { chartType = 'iv-fluids'; page = ivFluidCurrentPage; }

    if (chartType && admission?.sqid) {
      const fetchChart = async () => {
        setLoadingChart(true);
        try {
          const res = await axiosInstanceHos.get(`/api/inpatients/admissions/${admission.sqid}/charts/${chartType}?page=${page}&size=10`);
          setChartData(res.data.results || []);
          setChartTotalCount(res.data.count || 0);
        } catch (err) {
          console.error(err);
          setChartData([]);
          setChartTotalCount(0);
        } finally {
          setLoadingChart(false);
        }
      };
      fetchChart();
    } else {
      setChartData([]);
      setChartTotalCount(0);
    }
  }, [showVitalsRecord, showMedicationRecord, showGlucoseRecord, showIORecord, showSeizureRecord, showProcedureRecord, showIVFluidRecord, admission?.sqid, vitalsCurrentPage, medsCurrentPage, glucoseCurrentPage, ioCurrentPage, seizureCurrentPage, procedureCurrentPage, ivFluidCurrentPage]);


  useEffect(() => {
    const admissionSqid = admission?.sqid;
    if (admissionSqid) {
      const fetchTasks = async () => {
        setLoadingTasks(true);
        try {
          const res = await axiosInstanceHos.get(`/api/inpatients/admissions/${admissionSqid}/task-occurrences?status=${taskStatus}&page=${tasksCurrentPage}&size=8`);
          setTasks(res.data.results || []);
          setTasksTotalCount(res.data.count || 0);
        } catch (err) {
          console.error(err);
          setTasks([]);
        } finally {
          setLoadingTasks(false);
        }
      };
      fetchTasks();
    }
  }, [admission?.sqid, taskStatus, tasksCurrentPage]);

  





  const [activeTask, setActiveTask] = useState(null);
  const [escalationModalOpen, setEscalationModalOpen] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");

  // Form states for execution
  const [vitalSignsForm, setVitalSignsForm] = useState({ blood_pressure: "", temp: "", resp_rate: "", heart_rate: "", spo2: "", height: "", weight: "", pain_score: "0 (No pain)", notes: "" });
  const [glucoseForm, setGlucoseForm] = useState({ value: "", unit: "mg_dl", context: "fasting", insulin_administered: false });
  const [ivFluidForm, setIvFluidForm] = useState({ add_to_patient_fluid_chart: true, site_condition: "clean", cannula_location: "left_forearm", nursing_remark: "" });
  const [procedureForm, setProcedureForm] = useState({ consent: "given", post_procedure_status: "clean_dry", estimated_blood_volume_ml: "", current_position: "flat_supine" });
  const [seizureForm, setSeizureForm] = useState({ duration_minutes: 0, duration_seconds: 0, physical_signs: "", body_parts_involved: "", level_of_consciousness: "", patient_reaction: "", interventions_administered: "" });
  
  // I/O Form states
  const [ioIntake, setIoIntake] = useState({ source: "oral_free_fluids", fluid_feed: "water", route: "oral", volume_ml: "", recorded_at: "" });
  const [ioOutput, setIoOutput] = useState({ output_type: "urine", characteristics: "", volume_ml: "", recorded_at: "", interval: "0-4 hours", nursing_remark: "" });

  const handleExecuteTask = async (taskType) => {
    if (!activeTask) return;
    
    let payload = {};
    if (taskType === 'vital_signs') {
      const allowedParams = activeTask.summary?.parameters || [];
      const data = {};
      const calculateInpatientBmiLocal = (w, h) => {
        const weightNum = parseFloat(w);
        let heightNum = parseFloat(h);
        if (!weightNum || !heightNum || heightNum <= 0) return "";
        if (heightNum > 3) heightNum = heightNum / 100;
        const val = (weightNum / (heightNum * heightNum)).toFixed(1);
        return isNaN(val) ? "" : val;
      };
      const computedBmi = calculateInpatientBmiLocal(vitalSignsForm.weight, vitalSignsForm.height);

      Object.keys(vitalSignsForm).forEach(key => {
        if (key === 'notes' || key === 'pain_score') return;
        if ((allowedParams.length === 0 || allowedParams.includes(key)) && vitalSignsForm[key]) {
          data[key] = key === 'temp' || key === 'resp_rate' || key === 'heart_rate' || key === 'spo2' || key === 'height' || key === 'weight' ? Number(vitalSignsForm[key]) : vitalSignsForm[key];
        }
      });

      if (computedBmi && (allowedParams.length === 0 || allowedParams.includes('bmi'))) {
        data.bmi = Number(computedBmi);
      }
      if (vitalSignsForm.pain_score && (allowedParams.length === 0 || allowedParams.includes('pain_score'))) {
        data.pain_score = parseInt(vitalSignsForm.pain_score.split(" ")[0], 10);
      }
      if (vitalSignsForm.notes) {
        data.notes = vitalSignsForm.notes;
      }

      if (Object.keys(data).length === 0) { toast.error("At least one vital sign must be entered"); return false; }
      payload = data;
    } else if (taskType === 'glucose') {
      payload = { ...glucoseForm, value: Number(glucoseForm.value) };
    } else if (taskType === 'procedure') {
      payload = { ...procedureForm, estimated_blood_volume_ml: procedureForm.estimated_blood_volume_ml ? Number(procedureForm.estimated_blood_volume_ml) : null };
    } else if (taskType === 'iv_fluid') {
      payload = ivFluidForm;
    } else if (taskType === 'seizure') {
      payload = { ...seizureForm, duration_minutes: Number(seizureForm.duration_minutes), duration_seconds: Number(seizureForm.duration_seconds) };
      if (!payload.interventions_administered) delete payload.interventions_administered;
      if (!payload.physical_signs) payload.physical_signs = null;
      if (!payload.body_parts_involved) payload.body_parts_involved = null;
      if (!payload.level_of_consciousness) payload.level_of_consciousness = null;
      if (!payload.patient_reaction) payload.patient_reaction = null;
    } else if (taskType === 'input_output') {
      const mode = activeTask.summary?.tracking_mode;
      const formatTimeInputToISO = (timeStr) => {
        if (!timeStr) return undefined;
        const now = new Date();
        const [hours, minutes] = timeStr.split(':');
        now.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return now.toISOString();
      };
      if (mode !== 'output_only') {
        payload.intake = { 
          ...ioIntake, 
          volume_ml: Number(ioIntake.volume_ml),
          recorded_at: ioIntake.recorded_at ? formatTimeInputToISO(ioIntake.recorded_at) : undefined
        };
      }
      if (mode !== 'intake_only') {
        payload.output = { 
          ...ioOutput, 
          volume_ml: Number(ioOutput.volume_ml),
          recorded_at: ioOutput.recorded_at ? formatTimeInputToISO(ioOutput.recorded_at) : undefined
        };
        if (!payload.output.characteristics) payload.output.characteristics = null;
      }
    }
    
    try {
      setIsSubmittingTaskAction(activeTask.sqid);
      await axiosInstanceHos.post(`/api/inpatients/task-occurrences/${activeTask.sqid}/execute`, payload);
      toast.success("Task executed successfully");
      if (taskType === 'vital_signs') setVitalSignsForm({ blood_pressure: "", temp: "", resp_rate: "", heart_rate: "", spo2: "", height: "", weight: "", pain_score: "0 (No pain)", notes: "" });
      else if (taskType === 'glucose') setGlucoseForm({ value: "", unit: "mg_dl", context: "fasting", insulin_administered: false });
      else if (taskType === 'procedure') setProcedureForm({ consent: "given", post_procedure_status: "clean_dry", estimated_blood_volume_ml: "", current_position: "flat_supine" });
      else if (taskType === 'iv_fluid') setIvFluidForm({ add_to_patient_fluid_chart: true, site_condition: "clean", cannula_location: "left_forearm", nursing_remark: "" });
      else if (taskType === 'seizure') setSeizureForm({ duration_minutes: 0, duration_seconds: 0, physical_signs: "", body_parts_involved: "", level_of_consciousness: "", patient_reaction: "", interventions_administered: "" });
      else if (taskType === 'input_output') {
        setIoIntake({ source: "oral_free_fluids", fluid_feed: "water", route: "oral", volume_ml: "", recorded_at: "" });
        setIoOutput({ output_type: "urine", characteristics: "", volume_ml: "", recorded_at: "", interval: "0-4 hours", nursing_remark: "" });
      }

      
      const admissionSqid = admission?.sqid;
      if (admissionSqid) {
        const res = await axiosInstanceHos.get(`/api/inpatients/admissions/${admissionSqid}/task-occurrences?status=${taskStatus}&page=${tasksCurrentPage}&size=8`);
        setTasks(res.data.results || []);
        setTasksTotalCount(res.data.count || 0);
      }
      return true;
    } catch (err) {
      console.error(err);
      let errorMsg = "Action failed. Please try again.";
      if (err.response?.data?.detail) {
        errorMsg = Array.isArray(err.response.data.detail) ? err.response.data.detail[0] : err.response.data.detail;
      } else if (err.response?.data) {
        const firstKey = Object.keys(err.response.data)[0];
        if (firstKey) {
          const firstVal = err.response.data[firstKey];
          errorMsg = `${firstKey}: ${Array.isArray(firstVal) ? firstVal[0] : firstVal}`;
        }
      }
      toast.error(errorMsg);
      return false;
    } finally {
      setIsSubmittingTaskAction(null);
    }
  };

  useEffect(() => {
    let chartType = null;
    let page = 1;
    if (showVitalsRecord) { chartType = 'vital-signs'; page = vitalsCurrentPage; }
    else if (showMedicationRecord) { chartType = 'medications'; page = medsCurrentPage; }
    else if (showGlucoseRecord) { chartType = 'glucose'; page = glucoseCurrentPage; }
    else if (showIORecord) { chartType = 'fluid-balance'; page = ioCurrentPage; }
    else if (showSeizureRecord) { chartType = 'seizures'; page = seizureCurrentPage; }
    else if (showProcedureRecord) { chartType = 'procedures'; page = procedureCurrentPage; }
    else if (showIVFluidRecord) { chartType = 'iv-fluids'; page = ivFluidCurrentPage; }

    if (chartType && admission?.sqid) {
      const fetchChart = async () => {
        setLoadingChart(true);
        try {
          const res = await axiosInstanceHos.get(`/api/inpatients/admissions/${admission.sqid}/charts/${chartType}?page=${page}&size=10`);
          setChartData(res.data.results || []);
          setChartTotalCount(res.data.count || 0);
        } catch (err) {
          console.error(err);
          setChartData([]);
          setChartTotalCount(0);
        } finally {
          setLoadingChart(false);
        }
      };
      fetchChart();
    } else {
      setChartData([]);
      setChartTotalCount(0);
    }
  }, [showVitalsRecord, showMedicationRecord, showGlucoseRecord, showIORecord, showSeizureRecord, showProcedureRecord, showIVFluidRecord, admission?.sqid, vitalsCurrentPage, medsCurrentPage, glucoseCurrentPage, ioCurrentPage, seizureCurrentPage, procedureCurrentPage, ivFluidCurrentPage]);


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

  const demoVitalsRecords = [
    { id: 1, date: "14/03/2026", dueTime: "12 PM", bp: "120 mmHg", temp: "51°C", resp: "5/min", height: "65 cm", hr: "8 Bpm", weight: "76 KG", bmi: "16.4 BMI", pain: "0-3 (Mild pain)", status: "Completed" },
    { id: 2, date: "14/03/2026", dueTime: "12 PM", bp: "120 mmHg", temp: "51°C", resp: "5/min", height: "65 cm", hr: "8 Bpm", weight: "76 KG", bmi: "16.4 BMI", pain: "0-3 (Mild pain)", status: "Completed" },
    { id: 3, date: "14/03/2026", dueTime: "12 PM", bp: "120 mmHg", temp: "51°C", resp: "5/min", height: "65 cm", hr: "8 Bpm", weight: "76 KG", bmi: "16.4 BMI", pain: "0-3 (Mild pain)", status: "Completed" },
    { id: 4, date: "14/03/2026", dueTime: "12 PM", bp: "120 mmHg", temp: "51°C", resp: "5/min", height: "65 cm", hr: "8 Bpm", weight: "76 KG", bmi: "16.4 BMI", pain: "0-3 (Mild pain)", status: "Completed" },
    { id: 5, date: "14/03/2026", dueTime: "12 PM", bp: "120 mmHg", temp: "51°C", resp: "5/min", height: "65 cm", hr: "8 Bpm", weight: "76 KG", bmi: "16.4 BMI", pain: "0-3 (Mild pain)", status: "Completed" },
    { id: 6, date: "14/03/2026", dueTime: "12 PM", bp: "120 mmHg", temp: "51°C", resp: "5/min", height: "65 cm", hr: "8 Bpm", weight: "76 KG", bmi: "16.4 BMI", pain: "0-3 (Mild pain)", status: "Completed" },
    { id: 7, date: "14/03/2026", dueTime: "12 PM", bp: "120 mmHg", temp: "51°C", resp: "5/min", height: "65 cm", hr: "8 Bpm", weight: "76 KG", bmi: "16.4 BMI", pain: "0-3 (Mild pain)", status: "Completed" },
    { id: 8, date: "14/03/2026", dueTime: "12 PM", bp: "120 mmHg", temp: "51°C", resp: "5/min", height: "65 cm", hr: "8 Bpm", weight: "76 KG", bmi: "16.4 BMI", pain: "0-3 (Mild pain)", status: "Completed" },
  ];

  const demoSeizureRecords = [
    { id: 1, date: "14/03/2026", type: "Tonic", postIctal: "Somnolent", escalated: "Yes", duration: "7 min/5 sec", status: "Completed" },
    { id: 2, date: "14/03/2026", type: "Tonic", postIctal: "Somnolent", escalated: "Yes", duration: "7 min/5 sec", status: "Completed" },
    { id: 3, date: "14/03/2026", type: "Tonic", postIctal: "Somnolent", escalated: "Yes", duration: "7 min/5 sec", status: "Completed" },
    { id: 4, date: "14/03/2026", type: "Tonic", postIctal: "Somnolent", escalated: "Yes", duration: "7 min/5 sec", status: "Completed" },
    { id: 5, date: "14/03/2026", type: "Tonic", postIctal: "Somnolent", escalated: "Yes", duration: "7 min/5 sec", status: "Completed" },
    { id: 6, date: "14/03/2026", type: "Tonic", postIctal: "Somnolent", escalated: "Yes", duration: "7 min/5 sec", status: "Completed" },
    { id: 7, date: "14/03/2026", type: "Tonic", postIctal: "Somnolent", escalated: "Yes", duration: "7 min/5 sec", status: "Completed" },
    { id: 8, date: "14/03/2026", type: "Tonic", postIctal: "Somnolent", escalated: "Yes", duration: "7 min/5 sec", status: "Completed" },
  ];

  const demoProcedureRecords = [
    { id: 1, date: "14/03/2026", procedureName: "Lumbar puncture", performingClinician: "Dr. Obed", dressingStatus: "Clean and dry", surgicalDrainVolume: "67ml", positioningAndSafety: "Flat supine", status: "Completed" },
    { id: 2, date: "14/03/2026", procedureName: "Lumbar puncture", performingClinician: "Dr. Obed", dressingStatus: "Clean and dry", surgicalDrainVolume: "67ml", positioningAndSafety: "Flat supine", status: "Completed" },
    { id: 3, date: "14/03/2026", procedureName: "Lumbar puncture", performingClinician: "Dr. Obed", dressingStatus: "Clean and dry", surgicalDrainVolume: "67ml", positioningAndSafety: "Flat supine", status: "Completed" },
    { id: 4, date: "14/03/2026", procedureName: "Lumbar puncture", performingClinician: "Dr. Obed", dressingStatus: "Clean and dry", surgicalDrainVolume: "67ml", positioningAndSafety: "Flat supine", status: "Completed" },
    { id: 5, date: "14/03/2026", procedureName: "Lumbar puncture", performingClinician: "Dr. Obed", dressingStatus: "Clean and dry", surgicalDrainVolume: "67ml", positioningAndSafety: "Flat supine", status: "Completed" },
    { id: 6, date: "14/03/2026", procedureName: "Lumbar puncture", performingClinician: "Dr. Obed", dressingStatus: "Clean and dry", surgicalDrainVolume: "67ml", positioningAndSafety: "Flat supine", status: "Completed" },
    { id: 7, date: "14/03/2026", procedureName: "Lumbar puncture", performingClinician: "Dr. Obed", dressingStatus: "Clean and dry", surgicalDrainVolume: "67ml", positioningAndSafety: "Flat supine", status: "Completed" },
    { id: 8, date: "14/03/2026", procedureName: "Lumbar puncture", performingClinician: "Dr. Obed", dressingStatus: "Clean and dry", surgicalDrainVolume: "67ml", positioningAndSafety: "Flat supine", status: "Completed" },
  ];

  const demoIVFluidRecords = [
    { id: 1, date: "14/03/2026", dueTime: "12 PM", drugs: "Inj. Morphine", cannulaLocation: "Left forearm", solutionType: "Normal saline", volumePerBag: "500 ml", noOfBags: "1 bag only", siteCondition: "Clean and dry", status: "Completed" },
    { id: 2, date: "14/03/2026", dueTime: "12 PM", drugs: "Inj. Morphine", cannulaLocation: "Left forearm", solutionType: "Normal saline", volumePerBag: "500 ml", noOfBags: "1 bag only", siteCondition: "Clean and dry", status: "Completed" },
    { id: 3, date: "14/03/2026", dueTime: "12 PM", drugs: "Inj. Morphine", cannulaLocation: "Left forearm", solutionType: "Normal saline", volumePerBag: "500 ml", noOfBags: "1 bag only", siteCondition: "Clean and dry", status: "Completed" },
    { id: 4, date: "14/03/2026", dueTime: "12 PM", drugs: "Inj. Morphine", cannulaLocation: "Left forearm", solutionType: "Normal saline", volumePerBag: "500 ml", noOfBags: "1 bag only", siteCondition: "Clean and dry", status: "Completed" },
    { id: 5, date: "14/03/2026", dueTime: "12 PM", drugs: "Inj. Morphine", cannulaLocation: "Left forearm", solutionType: "Normal saline", volumePerBag: "500 ml", noOfBags: "1 bag only", siteCondition: "Clean and dry", status: "Completed" },
    { id: 6, date: "14/03/2026", dueTime: "12 PM", drugs: "Inj. Morphine", cannulaLocation: "Left forearm", solutionType: "Normal saline", volumePerBag: "500 ml", noOfBags: "1 bag only", siteCondition: "Clean and dry", status: "Completed" },
    { id: 7, date: "14/03/2026", dueTime: "12 PM", drugs: "Inj. Morphine", cannulaLocation: "Left forearm", solutionType: "Normal saline", volumePerBag: "500 ml", noOfBags: "1 bag only", siteCondition: "Clean and dry", status: "Completed" },
    { id: 8, date: "14/03/2026", dueTime: "12 PM", drugs: "Inj. Morphine", cannulaLocation: "Left forearm", solutionType: "Normal saline", volumePerBag: "500 ml", noOfBags: "1 bag only", siteCondition: "Clean and dry", status: "Completed" },
  ];

  const getMedStatusColor = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'completed' || s === 'given') return "text-[#10B981]";
    if (s === 'pending' || s === 'ongoing' || s === 'in_progress') return "text-[#F59E0B]";
    if (s === 'missed' || s === 'cancelled') return "text-[#EF4444]";
    return "text-gray-600";
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

  const handleAutoCalculate = async (e) => {
    e.preventDefault();
    if (!admission?.sqid) return;
    setIsCalculatingIO(true);
    try {
      const res = await axiosInstanceHos.get(`/api/inpatients/admissions/${admission.sqid}/fluid-balance`);
      setFluidBalanceData(res.data);
      setIoCalculationModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch fluid balance");
    } finally {
      setIsCalculatingIO(false);
    }
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
      {!showMedicationRecord && !showGlucoseRecord && !showIOEntry && !showIORecord && !showVitalsEntry && !showVitalsRecord && !showSeizureEntry && !showSeizureRecord && !showProcedureEntry && !showProcedureRecord && !showIVFluidEntry && !showIVFluidRecord && !showDischargeSummary ? (
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

      </div>

      {loadingTasks ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-docuhealth-primary" />
        </div>
      ) : tasks?.length === 0 ? (
        <div className="py-10">
          <EmptyState 
            title={`No ${taskStatus.replace('_', ' ')} tasks`}
            description="There are no tasks available in this category for the current patient."
          />
        </div>
      ) : (
        <>
          <div className="hidden lg:block">
        {tasks?.map((task, index) => {
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
                    {new Date(task.scheduled_for).toLocaleString()}
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
                    {(task.instructions || "No instructions")}
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
                      {task.task_type.replace(/_/g, " ")}
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
                    {isSubmittingTaskAction === task.sqid ? (
                      <Loader2 className="w-4 h-4 animate-spin text-docuhealth-primary" />
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                      </svg>
                    )}
                  </div>

                  {openPopover === index && (
                    <div className="hidden lg:block lg:absolute top-0 lg:top-10 right-0 mt-2 bg-white border shadow-[0px_4px_20px_rgba(0,0,0,0.08)] rounded-lg p-1.5 w-56 z-50">
                      {taskStatus === "history" ? null : taskStatus === "pending" ? (
                        <button 
                          className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                          onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); handleTaskAction("claim", task.sqid); }}
                        >
                          Claim task
                        </button>
                      ) : (
                        <>
                          {task.task_type === 'glucose' ? (
                            <>
                              <button 
                                className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setActiveTask(task); setGlucoseModalOpen(true); }}
                              >
                                Add new entry
                              </button>
                              <button 
                                className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setShowGlucoseRecord(true); }}
                              >
                                View glucose chart
                              </button>
                            </>
                          ) : task.task_type === 'input_output' ? (
                            <>
                              <button 
                                className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setActiveTask(task); setShowIOEntry(true); }}
                              >
                                Add new entry
                              </button>
                              <button 
                                className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setShowIORecord(true); }}
                              >
                                Input and Output chart
                              </button>
                            </>
                          ) : task.task_type === 'vital_signs' ? (
                            <>
                              <button 
                                className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setActiveTask(task); setVitalsInfoModalOpen(true); }}
                              >
                                Add new entry
                              </button>
                              <button 
                                className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setShowVitalsRecord(true); }}
                              >
                                Vital Signs Chart
                              </button>
                            </>
                          ) : (task.task_type === 'seizure' || task.task_type === 'seizure_event') ? (
                            <>
                              <button 
                                className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setActiveTask(task); setShowSeizureEntry(true); }}
                              >
                                Add new entry
                              </button>
                              <button 
                                className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setShowSeizureRecord(true); }}
                              >
                                View seizure charts
                              </button>
                            </>
                          ) : task.task_type === 'procedure' ? (
                            <>
                              <button 
                                className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setActiveTask(task); setShowProcedureEntry(true); }}
                              >
                                Add new entry
                              </button>
                              <button 
                                className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setShowProcedureRecord(true); }}
                              >
                                Procedure chart
                              </button>
                            </>
                          ) : task.task_type === 'iv_fluid' ? (
                            <>
                              <button 
                                className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setActiveTask(task); setShowIVFluidEntry(true); }}
                              >
                                Add new entry
                              </button>
                              <button 
                                className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setShowIVFluidRecord(true); }}
                              >
                                IV Fluid chart
                              </button>
                            </>
                          ) : (task.task_type === 'discharge_summary' || task.task_type === 'nurse_in_patient_discharge') ? (
                            <button 
                              className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap" 
                              onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setActiveTask(task); setShowDischargeSummary(true); }}
                            >
                              Add entry
                            </button>
                          ) : (
                            <>
                              <button 
                                className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap" 
                                onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); handleTaskAction("confirm-medication", task.sqid); }}
                              >
                                Confirm medication
                              </button>
                              <button 
                                className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap" 
                                onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); setShowMedicationRecord(true); }}
                              >
                                View medication chart
                              </button>
                            </>
                          )}
                          
                          <button 
                            className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); handleTaskAction("release", task.sqid); }}
                          >
                            Release task
                          </button>
                          <button 
                            className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); handleTaskAction("mark-missed", task.sqid); }}
                          >
                            Mark as missed
                          </button>
                          <button 
                            className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            onMouseDown={(e) => { e.preventDefault(); setOpenPopover(null); handleTaskAction("escalate", task.sqid); }}
                          >
                            Mark as escalated
                          </button>
                        </>
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
        {tasks?.map((task, index) => {
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
                    {new Date(task.scheduled_for).toLocaleString()}
                  </p>
                </div>

                <div className="relative" ref={openPopover === index ? dropdownRef : null}>
                  <button
                    onClick={() => setOpenPopover(openPopover === index ? null : index)}
                    className={`h-9 w-9 flex items-center justify-center rounded-full ${openPopover === index ? "bg-slate-200" : "bg-gray-50"}`}
                  >
                    {isSubmittingTaskAction === task.sqid ? (
                      <Loader2 className="w-4 h-4 animate-spin text-docuhealth-primary" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M14 8C14 7.45 13.55 7 13 7C12.45 7 12 7.45 12 8C12 8.55 12.45 9 13 9C13.55 9 14 8.55 14 8ZM4 8C4 7.45 3.55 7 3 7C2.45 7 2 7.45 2 8C2 8.55 2.45 9 3 9C3.55 9 4 8.55 4 8ZM9 8C9 7.45 8.55 7 8 7C7.45 7 7 7.45 7 8C7 8.55 7.45 9 8 9C8.55 9 9 8.55 9 8Z"
                          fill="#1A263E"
                        />
                      </svg>
                    )}
                  </button>

                  {openPopover === index && (
                    <div className="absolute right-0 top-10 w-56 bg-white border border-slate-100 shadow-[0px_8px_30px_rgba(0,0,0,0.12)] rounded-lg p-1.5 z-50">
                      {taskStatus === "history" ? null : taskStatus === "pending" ? (
                        <button 
                          className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                          onClick={() => { setOpenPopover(null); handleTaskAction("claim", task.sqid); }}
                        >
                          Claim task
                        </button>
                      ) : (
                        <>
                          {task.task_type === 'glucose' ? (
                            <>
                              <button 
                                className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                                onClick={() => { setOpenPopover(null); setActiveTask(task); setGlucoseModalOpen(true); }}
                              >
                                Add new entry
                              </button>
                              <button 
                                className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                                onClick={() => { setOpenPopover(null); setShowGlucoseRecord(true); }}
                              >
                                View glucose chart
                              </button>
                            </>
                          ) : task.task_type === 'input_output' ? (
                            <>
                              <button 
                                className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                                onClick={() => { setOpenPopover(null); setActiveTask(task); setShowIOEntry(true); }}
                              >
                                Add new entry
                              </button>
                              <button 
                                className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                                onClick={() => { setOpenPopover(null); setShowIORecord(true); }}
                              >
                                Input and Output chart
                              </button>
                            </>
                          ) : task.task_type === 'vital_signs' ? (
                            <>
                              <button 
                                className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                                onClick={() => { setOpenPopover(null); setActiveTask(task); setVitalsInfoModalOpen(true); }}
                              >
                                Add new entry
                              </button>
                              <button 
                                className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                                onClick={() => { setOpenPopover(null); setShowVitalsRecord(true); }}
                              >
                                Vital Signs Chart
                              </button>
                            </>
                          ) : (task.task_type === 'seizure' || task.task_type === 'seizure_event') ? (
                            <>
                              <button 
                                className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                                onClick={() => { setOpenPopover(null); setActiveTask(task); setShowSeizureEntry(true); }}
                              >
                                Add new entry
                              </button>
                              <button 
                                className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                                onClick={() => { setOpenPopover(null); setShowSeizureRecord(true); }}
                              >
                                View seizure charts
                              </button>
                            </>
                          ) : task.task_type === 'procedure' ? (
                            <>
                              <button 
                                className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                                onClick={() => { setOpenPopover(null); setActiveTask(task); setShowProcedureEntry(true); }}
                              >
                                Add new entry
                              </button>
                              <button 
                                className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                                onClick={() => { setOpenPopover(null); setShowProcedureRecord(true); }}
                              >
                                Procedure chart
                              </button>
                            </>
                          ) : task.task_type === 'iv_fluid' ? (
                            <>
                              <button 
                                className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                                onClick={() => { setOpenPopover(null); setActiveTask(task); setShowIVFluidEntry(true); }}
                              >
                                Add new entry
                              </button>
                              <button 
                                className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                                onClick={() => { setOpenPopover(null); setShowIVFluidRecord(true); }}
                              >
                                IV Fluid chart
                              </button>
                            </>
                          ) : (task.task_type === 'discharge_summary' || task.task_type === 'nurse_in_patient_discharge') ? (
                            <button 
                              className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                              onClick={() => { setOpenPopover(null); setActiveTask(task); setShowDischargeSummary(true); }}
                            >
                              Add entry
                            </button>
                          ) : (
                            <>
                              <button 
                                className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                                onClick={() => { setOpenPopover(null); handleTaskAction("confirm-medication", task.sqid); }}
                              >
                                Confirm medication
                              </button>
                              <button 
                                className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                                onClick={() => { setOpenPopover(null); setShowMedicationRecord(true); }}
                              >
                                View medication chart
                              </button>
                            </>
                          )}
                          
                          <button 
                            className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                            onClick={() => { setOpenPopover(null); handleTaskAction("release", task.sqid); }}
                          >
                            Release task
                          </button>
                          <button 
                            className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                            onClick={() => { setOpenPopover(null); handleTaskAction("mark-missed", task.sqid); }}
                          >
                            Mark as missed
                          </button>
                          <button 
                            className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                            onClick={() => { setOpenPopover(null); handleTaskAction("escalate", task.sqid); }}
                          >
                            Mark as escalated
                          </button>
                        </>
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
                      {(task.instructions || "No instructions")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">
                      Task
                    </p>
                    <p className="text-[13px] text-slate-600 truncate italic">
                      "{task.task_type.replace(/_/g, " ")}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Pagination2 count={tasksTotalCount} currentPage={tasksCurrentPage} totalPages={Math.ceil(tasksTotalCount / 8) || 1} setCurrentPage={setTasksCurrentPage} />
      </>
      )}
      </>
      ) : showDischargeSummary ? (
        <NursingDischargeSummaryForm onCancel={() => setShowDischargeSummary(false)} setAdvanceCheckUp={setAdvanceCheckUp} admission={admission} patientFullInfo={patientFullInfo} activeTask={activeTask} tasks={tasks} />
      ) : showMedicationRecord ? (
        <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-6 mb-6">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <button 
                  onClick={() => setShowMedicationRecord(false)}
                  className="flex items-center gap-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors font-medium border border-slate-200 bg-white"
              >
                  <ArrowLeft className="w-4 h-4" /> Back to tasks
              </button>
            </div>
          </div>
          <h2 className="text-[16px] font-bold text-gray-800 mb-6">Patient's drug chart</h2>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[700px]">
               <thead>
                 <tr className="border border-gray-100 rounded-full bg-white text-[13px]">
                   <th className="py-5 px-4 font-bold text-gray-700 w-[15%] rounded-l-full">Date</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[10%]">Due Time</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[20%]">Drug name</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[15%]">Dosage</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[10%]">Route</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[20%]">Frequency</th>
                   <th className="py-5 px-4 font-bold text-gray-700 w-[10%] rounded-r-full">Status</th>
                 </tr>
               </thead>
               <tbody>
                 {chartData.map((med) => {
                   const dosageStr = [med.quantity, med.unit].filter(Boolean).join(' ') || med.strength || '-';
                   const freqStr = med.frequency?.rate ? med.frequency.rate.toUpperCase() : (typeof med.frequency === 'string' ? med.frequency.toUpperCase() : '-');
                   return (
                     <tr key={med.id} className="border-b border-gray-100 last:border-b-0 hover:bg-slate-50 transition-colors text-[13px]">
                       <td className="py-6 px-4 flex items-center gap-2 text-gray-600 whitespace-nowrap"><Calendar className="w-3.5 h-3.5" /> {med.created_at ? new Date(med.created_at).toLocaleDateString() : (med.date || '-')}</td>
                       <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{med.created_at ? new Date(med.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : (med.time || '-')}</td>
                       <td className="py-6 px-3 font-semibold text-gray-800 whitespace-nowrap">{med.name || med.drug || '-'}</td>
                       <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{dosageStr}</td>
                       <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{med.route || '-'}</td>
                       <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{freqStr}</td>
                       <td className={`py-6 px-4 font-bold ${getMedStatusColor(med.status)} whitespace-nowrap`}>{formatLabel(med.status)}</td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
          </div>

          {/* Mobile View */}
          <div className="block lg:hidden space-y-4 mb-4">
                {chartData.map((med) => {
                  const dosageStr = [med.quantity, med.unit].filter(Boolean).join(' ') || med.strength || '-';
                  const freqStr = med.frequency?.rate ? med.frequency.rate.toUpperCase() : (typeof med.frequency === 'string' ? med.frequency.toUpperCase() : '-');
                  return (
                    <div key={med.id} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                          <span className="flex items-center gap-2 text-gray-500 text-[12px] font-medium uppercase"><Calendar className="w-3 h-3" /> {med.created_at ? new Date(med.created_at).toLocaleDateString() : (med.date || '-')} • {med.created_at ? new Date(med.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : (med.time || '-')}</span>
                          <span className={`text-[12px] font-bold ${getMedStatusColor(med.status)}`}>{formatLabel(med.status)}</span>
                      </div>
                      <div>
                          <p className="font-bold text-[16px] text-gray-800 mb-3">{med.name || med.drug || '-'}</p>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-4 text-[13px] text-gray-600 bg-slate-50 p-4 rounded-md border border-slate-100">
                              <p><span className="font-semibold text-gray-400 block mb-1 text-[10px] uppercase">Dosage</span> {dosageStr}</p>
                              <p><span className="font-semibold text-gray-400 block mb-1 text-[10px] uppercase">Route</span> {med.route || '-'}</p>
                              <p className="col-span-2"><span className="font-semibold text-gray-400 block mb-1 text-[10px] uppercase">Frequency</span> {freqStr}</p>
                          </div>
                      </div>
                    </div>
                  );
                })}
             </div>

          <Pagination2 count={chartTotalCount} currentPage={medsCurrentPage} totalPages={Math.ceil(chartTotalCount / 10) || 1} setCurrentPage={setMedsCurrentPage} />
        </div>
      ) : showGlucoseRecord ? (
        <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-6 mb-6">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <button 
                  onClick={() => setShowGlucoseRecord(false)}
                  className="flex items-center gap-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors font-medium border border-slate-200 bg-white"
              >
                  <ArrowLeft className="w-4 h-4" /> Back to tasks
              </button>
            </div>
          </div>
          <h2 className="text-[16px] font-bold text-gray-800 mb-6">Patient's glucose chart</h2>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[700px]">
               <thead>
                 <tr className="border border-gray-100 rounded-full bg-white text-[13px]">
                   <th className="py-5 px-4 font-bold text-gray-700 w-[15%] rounded-l-full">Date</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[15%]">Due Time</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[20%]">Reading</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[15%]">Context</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[20%]">Insulin status</th>
                   <th className="py-5 px-4 font-bold text-gray-700 w-[15%] rounded-r-full">Status</th>
                 </tr>
               </thead>
               <tbody>
                 {chartData.map((rec) => (
                   <tr key={rec.id} className="border-b border-gray-100 last:border-b-0 hover:bg-slate-50 transition-colors text-[13px]">
                     <td className="py-6 px-4 flex items-center gap-2 text-gray-600 whitespace-nowrap"><Calendar className="w-3.5 h-3.5" /> {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : '-'}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.created_at ? new Date(rec.created_at).toLocaleTimeString() : '-'}</td>
                     <td className="py-6 px-3 font-semibold text-gray-800 whitespace-nowrap">{rec.value} {rec.unit}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.context}</td>
                     <td className="py-6 px-3 whitespace-nowrap"><span className={getInsulinStatusStyle(rec.insulin_administered ? "Given" : "Not Given")}>{rec.insulin_administered ? "Given" : "Not Given"}</span></td>
                     <td className={`py-6 px-4 font-bold ${getMedStatusColor(rec.status)} whitespace-nowrap`}>{rec.status}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>

          {/* Mobile View */}
          <div className="block lg:hidden space-y-4 mb-4">
                {chartData.map((rec) => (
                  <div key={rec.id} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <span className="flex items-center gap-2 text-gray-500 text-[12px] font-medium uppercase"><Calendar className="w-3 h-3" /> {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : '-'} • {rec.created_at ? new Date(rec.created_at).toLocaleTimeString() : '-'}</span>
                        <span className={`text-[12px] font-bold ${getMedStatusColor(rec.status)}`}>{rec.status}</span>
                    </div>
                    <div>
                        <p className="font-bold text-[16px] text-gray-800 mb-3">{rec.value} {rec.unit}</p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-4 text-[13px] text-gray-600 bg-slate-50 p-4 rounded-md border border-slate-100">
                            <p><span className="font-semibold text-gray-400 block mb-1 text-[10px] uppercase">Context</span> {rec.context}</p>
                            <p><span className="font-semibold text-gray-400 block mb-2 text-[10px] uppercase">Insulin status</span> <span className={getInsulinStatusStyle(rec.insulin_administered ? "Given" : "Not Given")}>{rec.insulin_administered ? "Given" : "Not Given"}</span></p>
                        </div>
                    </div>
                  </div>
                ))}
             </div>

          <Pagination2 count={chartTotalCount} currentPage={glucoseCurrentPage} totalPages={Math.ceil(chartTotalCount / 10) || 1} setCurrentPage={setGlucoseCurrentPage} />
        </div>
      ) : showIORecord ? (
        <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-6 mb-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <button 
                  onClick={() => setShowIORecord(false)}
                  className="flex items-center justify-center gap-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors font-medium border border-slate-200 bg-white"
              >
                  <ArrowLeft className="w-4 h-4" /> Back to tasks
              </button>
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
          <h2 className="text-[16px] font-bold text-gray-800 mb-6">Intake and Output chart</h2>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[1100px]">
               <thead>
                 <tr className="border border-gray-100 rounded-full bg-white text-[13px]">
                   <th className="py-5 px-4 font-bold text-gray-700 w-[12%] rounded-l-full">Date</th>
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
                   <th className="py-5 px-4 font-bold text-gray-700 rounded-r-full">Status</th>
                 </tr>
               </thead>
               <tbody>
                  {chartData.map((rec, index) => (
                    <tr key={rec.id || index} className="border-b border-gray-100 last:border-b-0 hover:bg-slate-50 transition-colors text-[13px]">
                      <td className="py-6 px-4 flex items-center gap-2 text-gray-600 whitespace-nowrap"><Calendar className="w-3.5 h-3.5" /> {rec.recorded_at ? new Date(rec.recorded_at).toLocaleDateString() : '-'}</td>
                      <td className="py-6 px-3 text-gray-600 whitespace-nowrap">-</td>
                      <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{formatLabel(rec.intake?.source)}</td>
                      <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{formatLabel(rec.intake?.fluid_feed)}</td>
                      <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.intake?.volume_ml ? `${rec.intake.volume_ml} ml` : '-'}</td>
                      <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.intake?.recorded_at ? new Date(rec.intake.recorded_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                      <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{formatLabel(rec.intake?.route)}</td>
                      <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{formatLabel(rec.output?.output_type)}</td>
                      <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{formatLabel(rec.output?.characteristics)}</td>
                      <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.output?.volume_ml ? `${rec.output.volume_ml} ml` : '-'}</td>
                      <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.output?.recorded_at ? new Date(rec.output.recorded_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                      <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.output?.interval || '-'}</td>
                      <td className={`py-6 px-4 font-bold text-gray-600 whitespace-nowrap`}>-</td>
                    </tr>
                  ))}
               </tbody>
             </table>
          </div>

          {/* Mobile View */}
          <div className="block lg:hidden space-y-4 mb-4">
            {chartData.map((rec, index) => (
                <div key={rec.id || index} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <div className="flex items-center gap-2 text-gray-600 text-[13px] font-medium"><Calendar className="w-3.5 h-3.5" /> {rec.recorded_at ? new Date(rec.recorded_at).toLocaleDateString() : '-'}</div>
                    <div className={`text-[12px] font-bold text-gray-600`}>-</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-[13px]">
                    <div><span className="text-gray-400 block mb-0.5 text-[11px]">Due Time</span><span className="font-medium text-gray-700">-</span></div>
                    <div><span className="text-gray-400 block mb-0.5 text-[11px]">Intake source</span><span className="font-medium text-gray-700">{formatLabel(rec.intake?.source)}</span></div>
                    <div><span className="text-gray-400 block mb-0.5 text-[11px]">Fluid/feed</span><span className="font-medium text-gray-700">{formatLabel(rec.intake?.fluid_feed)}</span></div>
                    <div><span className="text-gray-400 block mb-0.5 text-[11px]">Intake volume</span><span className="font-medium text-gray-700">{rec.intake?.volume_ml ? `${rec.intake.volume_ml} ml` : '-'}</span></div>
                    <div><span className="text-gray-400 block mb-0.5 text-[11px]">Time rec.</span><span className="font-medium text-gray-700">{rec.intake?.recorded_at ? new Date(rec.intake.recorded_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</span></div>
                    <div><span className="text-gray-400 block mb-0.5 text-[11px]">Intake route</span><span className="font-medium text-gray-700">{formatLabel(rec.intake?.route)}</span></div>
                    <div><span className="text-gray-400 block mb-0.5 text-[11px]">Output type</span><span className="font-medium text-gray-700">{formatLabel(rec.output?.output_type)}</span></div>
                    <div><span className="text-gray-400 block mb-0.5 text-[11px]">Output Char.</span><span className="font-medium text-gray-700">{formatLabel(rec.output?.characteristics)}</span></div>
                    <div><span className="text-gray-400 block mb-0.5 text-[11px]">Output volume</span><span className="font-medium text-gray-700">{rec.output?.volume_ml ? `${rec.output.volume_ml} ml` : '-'}</span></div>
                    <div><span className="text-gray-400 block mb-0.5 text-[11px]">Time rec.</span><span className="font-medium text-gray-700">{rec.output?.recorded_at ? new Date(rec.output.recorded_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</span></div>
                    <div><span className="text-gray-400 block mb-0.5 text-[11px]">Time (4hr interval)</span><span className="font-medium text-gray-700">{rec.output?.interval || '-'}</span></div>
                  </div>
                </div>
              ))}
          </div>

          <Pagination2 count={chartTotalCount} currentPage={tasksCurrentPage} totalPages={Math.ceil(chartTotalCount / 10) || 1} setCurrentPage={setTasksCurrentPage} />
        </div>
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
                    <select 
                      className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all appearance-none bg-white cursor-pointer"
                      value={ioIntake.source}
                      onChange={(e) => setIoIntake({...ioIntake, source: e.target.value})}
                    >
                      {intakeSources.map(source => <option key={source.value} value={source.value}>{source.label}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
                
                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Fluid/Feed</label>
                  <div className="relative">
                    <select 
                      className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all appearance-none bg-white cursor-pointer"
                      value={ioIntake.fluid_feed}
                      onChange={(e) => setIoIntake({...ioIntake, fluid_feed: e.target.value})}
                    >
                      {fluidFeeds.map(feed => <option key={feed.value} value={feed.value}>{feed.label}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Route</label>
                  <div className="relative">
                    <select 
                      className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all appearance-none bg-white cursor-pointer"
                      value={ioIntake.route}
                      onChange={(e) => setIoIntake({...ioIntake, route: e.target.value})}
                    >
                      {routes.map(route => <option key={route.value} value={route.value}>{route.label}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Intake volume (ML)</label>
                  <div className="relative flex items-center">
                    <input 
                      type="number" 
                      className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all" 
                      placeholder="250"
                      value={ioIntake.volume_ml}
                      onChange={(e) => setIoIntake({...ioIntake, volume_ml: e.target.value})}
                    />
                    <div className="absolute right-2 text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded-md">ML</div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Time recorded</label>
                  <div className="relative flex items-center">
                    <input 
                      type="time" 
                      className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all [&::-webkit-calendar-picker-indicator]:hidden" 
                      value={ioIntake.recorded_at}
                      onChange={(e) => setIoIntake({...ioIntake, recorded_at: e.target.value})}
                    />
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
                      className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all appearance-none bg-white cursor-pointer"
                      value={selectedOutputType}
                      onChange={(e) => {
                        setSelectedOutputType(e.target.value);
                        setIoOutput({...ioOutput, output_type: e.target.value});
                      }}
                    >
                      {outputTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Output characteristics</label>
                  <div className="relative">
                    <select 
                      className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-400 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all appearance-none bg-white cursor-pointer"
                      value={ioOutput.characteristics}
                      onChange={(e) => setIoOutput({...ioOutput, characteristics: e.target.value})}
                    >
                      <option value="">None</option>
                      {(outputCharacteristicsMap[selectedOutputType] || []).map(char => <option key={char.value} value={char.value}>{char.label}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-300">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Output volume (ML)</label>
                  <div className="relative flex items-center">
                    <input 
                      type="number" 
                      className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all" 
                      placeholder="250"
                      value={ioOutput.volume_ml}
                      onChange={(e) => setIoOutput({...ioOutput, volume_ml: e.target.value})}
                    />
                    <div className="absolute right-2 text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded-md">ML</div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Time recorded</label>
                  <div className="relative flex items-center">
                    <input 
                      type="time" 
                      className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all [&::-webkit-calendar-picker-indicator]:hidden" 
                      value={ioOutput.recorded_at}
                      onChange={(e) => setIoOutput({...ioOutput, recorded_at: e.target.value})}
                    />
                    <div className="absolute right-3 text-docuhealth-primary pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Time (4 hours intervals)</label>
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-400 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all" 
                      placeholder="0-4 hours" 
                      value={ioOutput.interval}
                      onChange={(e) => setIoOutput({...ioOutput, interval: e.target.value})}
                    />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Nursing remark</label>
                  <textarea 
                    value={ioOutput.nursing_remark} 
                    onChange={(e) => setIoOutput({...ioOutput, nursing_remark: e.target.value})} 
                    className="w-full border border-slate-200 rounded-md px-3 py-3 text-sm text-slate-400 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all min-h-[100px] resize-none" 
                    placeholder="Type here..."
                  ></textarea>
                </div>
              </div>
            </section>
            
            <div className="pt-6 flex justify-end">
              <button 
                onClick={async () => { const ok = await handleExecuteTask('input_output'); if (ok) { setShowIOEntry(false); setIoSubmitSuccessModalOpen(true); } }} disabled={isSubmittingTaskAction === activeTask?.sqid}
                className="bg-docuhealth-primary hover:opacity-90 text-white font-medium px-16 py-3 rounded-full text-sm transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : showVitalsEntry ? (
        <div className="bg-white pb-10 pt-4">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <button 
                  onClick={() => setShowVitalsEntry(false)}
                  className="flex items-center gap-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors font-medium border border-slate-200 bg-white"
              >
                  <ArrowLeft className="w-4 h-4" /> Vitals signs entry
              </button>
            </div>
          </div>
          <div className="border border-slate-200 rounded-xl p-6 mb-6">
            <p className="font-semibold text-slate-800 text-[15px] mb-6">Vital signs</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="relative">
                <p className="pb-1.5 text-xs text-slate-500 font-medium">Blood pressure</p>
                <div className="relative">
                  <input type="text" className="w-full text-sm border border-slate-200 px-3 py-2.5 rounded-lg pr-16 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors placeholder:text-slate-300" value={vitalSignsForm.blood_pressure} onChange={(e) => setVitalSignsForm({...vitalSignsForm, blood_pressure: e.target.value})} placeholder="Enter blood pressure" />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs">mmHg</span>
                </div>
              </div>
              <div className="relative">
                <p className="pb-1.5 text-xs text-slate-500 font-medium">Temperature</p>
                <div className="relative">
                  <input type="number" className="w-full text-sm border border-slate-200 px-3 py-2.5 rounded-lg pr-12 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors placeholder:text-slate-300" value={vitalSignsForm.temp} onChange={(e) => setVitalSignsForm({...vitalSignsForm, temp: e.target.value})} placeholder="Enter temperature" />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs">°C</span>
                </div>
              </div>
              <div className="relative">
                <p className="pb-1.5 text-xs text-slate-500 font-medium">Respiratory rate</p>
                <div className="relative">
                  <input type="number" className="w-full text-sm border border-slate-200 px-3 py-2.5 rounded-lg pr-14 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors placeholder:text-slate-300" value={vitalSignsForm.resp_rate} onChange={(e) => setVitalSignsForm({...vitalSignsForm, resp_rate: e.target.value})} placeholder="Enter respiratory rate" />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs">/Min</span>
                </div>
              </div>
              <div className="relative">
                <p className="pb-1.5 text-xs text-slate-500 font-medium">Height</p>
                <div className="relative">
                  <input type="number" className="w-full text-sm border border-slate-200 px-3 py-2.5 rounded-lg pr-12 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors placeholder:text-slate-300" value={vitalSignsForm.height} onChange={(e) => setVitalSignsForm({...vitalSignsForm, height: e.target.value})} placeholder="Enter height" />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs">Cm</span>
                </div>
              </div>
              <div className="relative">
                <p className="pb-1.5 text-xs text-slate-500 font-medium">Heart rate</p>
                <div className="relative">
                  <input type="number" className="w-full text-sm border border-slate-200 px-3 py-2.5 rounded-lg pr-14 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors placeholder:text-slate-300" value={vitalSignsForm.heart_rate} onChange={(e) => setVitalSignsForm({...vitalSignsForm, heart_rate: e.target.value})} placeholder="Enter heart rate" />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs">Bpm</span>
                </div>
              </div>
              <div className="relative">
                <p className="pb-1.5 text-xs text-slate-500 font-medium">Weight</p>
                <div className="relative">
                  <input type="number" className="w-full text-sm border border-slate-200 px-3 py-2.5 rounded-lg pr-12 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors placeholder:text-slate-300" value={vitalSignsForm.weight} onChange={(e) => setVitalSignsForm({...vitalSignsForm, weight: e.target.value})} placeholder="Enter weight" />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs">Kg</span>
                </div>
              </div>
              <div className="relative">
                <p className="pb-1.5 text-xs text-slate-500 font-medium">BMI</p>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    className="w-full text-sm border border-slate-200 px-3 py-2.5 rounded-lg pr-12 outline-none bg-slate-50 text-slate-700 cursor-not-allowed placeholder:text-slate-400"
                    value={(() => {
                      const weightNum = parseFloat(vitalSignsForm.weight);
                      let heightNum = parseFloat(vitalSignsForm.height);
                      if (!weightNum || !heightNum || heightNum <= 0) return "";
                      if (heightNum > 3) heightNum = heightNum / 100;
                      const val = (weightNum / (heightNum * heightNum)).toFixed(1);
                      return isNaN(val) ? "" : val;
                    })()}
                    placeholder="Auto-calculated"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs">BMI</span>
                </div>
              </div>
              <div className="relative">
                <p className="pb-1.5 text-xs text-slate-500 font-medium">Pain score</p>
                <div className="relative">
                  <select
                    value={vitalSignsForm.pain_score}
                    onChange={(e) => setVitalSignsForm({...vitalSignsForm, pain_score: e.target.value})}
                    className="w-full text-sm border border-slate-200 px-3 py-2.5 rounded-lg outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors text-slate-600 appearance-none bg-white"
                  >
                    <option value="0 (No pain)">0 (No pain)</option>
                    <option value="1 (Mild Pain)">1 (Mild Pain)</option>
                    <option value="2 (Mild Pain)">2 (Mild Pain)</option>
                    <option value="3 (Mild Pain)">3 (Mild Pain)</option>
                    <option value="4 (Moderate Pain)">4 (Moderate Pain)</option>
                    <option value="5 (Moderate Pain)">5 (Moderate Pain)</option>
                    <option value="6 (Moderate Pain)">6 (Moderate Pain)</option>
                    <option value="7 (Severe Pain)">7 (Severe Pain)</option>
                    <option value="8 (Severe Pain)">8 (Severe Pain)</option>
                    <option value="9 (Severe Pain)">9 (Severe Pain)</option>
                    <option value="10 (Severe Pain)">10 (Severe Pain)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
              <div className="relative">
                <p className="pb-1.5 text-xs text-slate-500 font-medium">SPO2</p>
                <div className="relative">
                  <input type="number" className="w-full text-sm border border-slate-200 px-3 py-2.5 rounded-lg pr-10 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors placeholder:text-slate-300" value={vitalSignsForm.spo2} onChange={(e) => setVitalSignsForm({...vitalSignsForm, spo2: e.target.value})} placeholder="98" />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs">%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border border-slate-200 rounded-xl p-6 mb-6">
            <p className="font-semibold text-slate-800 text-[15px] mb-4">Additional note (optional)</p>
            <textarea
              value={vitalSignsForm.notes}
              onChange={(e) => setVitalSignsForm({...vitalSignsForm, notes: e.target.value})}
              className="w-full border border-slate-200 rounded-lg p-4 text-sm outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors min-h-[120px] resize-none placeholder:text-slate-300"
              placeholder="Type here..."
            ></textarea>
          </div>
          
          <div className="flex justify-end pt-2">
            <button 
              onClick={async () => { 
                const ok = await handleExecuteTask('vital_signs');
                if (ok) { setShowVitalsEntry(false); setVitalsSubmitSuccessModalOpen(true); }
              }}
              className="bg-docuhealth-primary text-white font-medium px-10 py-3 rounded-full text-sm disabled:opacity-50"
              disabled={isSubmittingTaskAction === activeTask?.sqid}
            >
              {isSubmittingTaskAction === activeTask?.sqid ? "Updating..." : "Update vitals"}
            </button>
          </div>
        </div>
      ) : showVitalsRecord ? (
        <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-6 mb-6">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <button 
                  onClick={() => setShowVitalsRecord(false)}
                  className="flex items-center gap-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors font-medium border border-slate-200 bg-white"
              >
                  <ArrowLeft className="w-4 h-4" /> Back to tasks
              </button>
            </div>
          </div>
          <h2 className="text-[16px] font-bold text-gray-800 mb-6">Patient's vital signs</h2>
          
          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead>
                 <tr className="border border-gray-100 rounded-full bg-white text-[13px]">
                   <th className="py-5 px-4 font-bold text-gray-700 rounded-l-full">Date</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Due Time</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Blood Pressure</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Temperature</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Respiratory</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Height</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Heart rate</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Weight</th>
                   <th className="py-5 px-3 font-bold text-gray-700">BMI</th>
                   <th className="py-5 px-3 font-bold text-gray-700">Pain score</th>
                   <th className="py-5 px-4 font-bold text-gray-700 rounded-r-full">Status</th>
                 </tr>
               </thead>
               <tbody>
                 {chartData.map((rec) => (
                   <tr key={rec.id} className="border-b border-gray-100 last:border-b-0 hover:bg-slate-50 transition-colors text-[13px]">
                     <td className="py-6 px-4 flex items-center gap-2 text-gray-600 whitespace-nowrap"><Calendar className="w-3.5 h-3.5" /> {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : '-'}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.created_at ? new Date(rec.created_at).toLocaleTimeString() : '-'}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.blood_pressure || '-'}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.temp}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.resp_rate || '-'}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.height}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.heart_rate || '-'}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.weight}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.bmi}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.pain_score || '-'}</td>
                     <td className={`py-6 px-4 font-bold ${getMedStatusColor(rec.status)} whitespace-nowrap`}>{rec.status}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>

          {/* Mobile View */}
          <div className="block lg:hidden space-y-4 mb-4">
            {chartData.map((rec) => (
              <div key={rec.id} className="bg-white border border-gray-200 rounded-xl p-4 ">
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-800">{rec.created_at ? new Date(rec.created_at).toLocaleDateString() : '-'}</span>
                    <span className="text-gray-400 ml-1">({rec.created_at ? new Date(rec.created_at).toLocaleTimeString() : '-'})</span>
                  </div>
                  <span className={`text-[12px] font-bold ${getMedStatusColor(rec.status)} bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100`}>
                    {rec.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[13px]">
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Blood Pressure</p><p className="font-medium text-gray-700">{rec.blood_pressure || '-'}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Temperature</p><p className="font-medium text-gray-700">{rec.temp}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Respiratory</p><p className="font-medium text-gray-700">{rec.resp_rate || '-'}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Heart rate</p><p className="font-medium text-gray-700">{rec.heart_rate || '-'}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Height</p><p className="font-medium text-gray-700">{rec.height}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Weight</p><p className="font-medium text-gray-700">{rec.weight}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">BMI</p><p className="font-medium text-gray-700">{rec.bmi}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Pain score</p><p className="font-medium text-gray-700">{rec.pain_score || '-'}</p></div>
                </div>
              </div>
            ))}
          </div>

          <Pagination2 count={chartTotalCount} currentPage={vitalsCurrentPage} totalPages={Math.ceil(chartTotalCount / 10) || 1} setCurrentPage={setVitalsCurrentPage} />
        </div>
      ) : showSeizureEntry ? (
        <div className="bg-white">
          <div className="mb-8 flex items-center gap-3 border-b border-gray-100 pb-4">
            <button 
                onClick={() => setShowSeizureEntry(false)}
                className="flex items-center justify-center gap-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors font-medium border border-slate-200 bg-white"
            >
                <ArrowLeft className="w-4 h-4" /> Seizure event monitoring
            </button>
          </div>

          <div className="space-y-8 pb-10">
            {/* Seizure characteristics Section */}
            <section>
              <h3 className="text-[15px] font-bold text-slate-700 mb-4">Seizure characteristics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Motor movement</label>
                  <div className="relative">
                    <select className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all appearance-none bg-white cursor-pointer">
                      <option>Tonic (Stiffening)</option>
                      <option>Clonic (Jerking)</option>
                      <option>Tonic-Clonic</option>
                      <option>Atonic (Limp)</option>
                      <option>Absence</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
                
                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Physical signs</label>
                  <div className="relative">
                    <select value={seizureForm.physical_signs} onChange={(e) => setSeizureForm({...seizureForm, physical_signs: e.target.value})} className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all appearance-none bg-white cursor-pointer"><option value="">Select...</option><option value="frothing">Frothing/Foaming</option><option value="tongue_biting">Tongue Biting</option><option value="eye_rolling">Eye rolling</option><option value="incontinence">Incontinence</option></select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Body parts involved</label>
                  <div className="relative">
                    <select value={seizureForm.body_parts_involved} onChange={(e) => setSeizureForm({...seizureForm, body_parts_involved: e.target.value})} className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all appearance-none bg-white cursor-pointer"><option value="">Select...</option><option value="generalized">Generalized (whole body)</option><option value="left_side_only">Left side only</option><option value="right_side_only">Right side only</option><option value="left_arm">Left arm</option><option value="right_arm">Right arm</option><option value="left_leg">Left leg</option><option value="right_leg">Right leg</option></select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Level of consciousness</label>
                  <div className="relative">
                    <select value={seizureForm.level_of_consciousness} onChange={(e) => setSeizureForm({...seizureForm, level_of_consciousness: e.target.value})} className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all appearance-none bg-white cursor-pointer"><option value="">Select...</option><option value="preserved_alert">Preserved / Alert</option><option value="impaired_confused">Impaired/Confused</option><option value="completely_unconscious">Completely unconscious</option><option value="did_not_regain">Unresponsive after seizure (did not regain consciousness)</option></select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Duration Section */}
            <section>
              <h3 className="text-[15px] font-bold text-slate-700 mb-4">How long did the seizure last?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Minutes</label>
                  <div className="relative">
                    <input type="number" value={seizureForm.duration_minutes} onChange={(e) => setSeizureForm({...seizureForm, duration_minutes: e.target.value})} placeholder="5" className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all placeholder:text-gray-400" />
                    <div className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-xs pointer-events-none">
                      Minute(s)
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Seconds</label>
                  <div className="relative">
                    <input type="number" value={seizureForm.duration_seconds} onChange={(e) => setSeizureForm({...seizureForm, duration_seconds: e.target.value})} placeholder="5" className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all placeholder:text-gray-400" />
                    <div className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-xs pointer-events-none">
                      second(s)
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Post-Ictal State */}
            <section>
              <h3 className="text-[15px] font-bold text-slate-700 mb-4">Post-Ictal State (Immediate Post-Seizure Condition)</h3>
              <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2 w-full">
                <label className="text-sm font-semibold text-slate-700">Post seizure reaction</label>
                <div className="relative">
                  <select value={seizureForm.patient_reaction} onChange={(e) => setSeizureForm({...seizureForm, patient_reaction: e.target.value})} className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all appearance-none bg-white cursor-pointer">
                    <option value="">Select...</option>
                    <option value="somnolent">Somnolent (Sleepy/Lethargic)</option>
                    <option value="confused_agitated">Confused/Agitated</option>
                    <option value="temporarily_weak_paralyzed">Temporarily Weak/Paralyzed</option>
                    <option value="awake_alert">Awake and Alert</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
            </section>

            {/* Interventions */}
            <section>
              <h3 className="text-[15px] font-bold text-slate-700 mb-4">Interventions Administered</h3>
              <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2 w-full mb-6">
                <label className="text-sm font-semibold text-slate-700">Input intervention administered</label>
                <input type="text" value={seizureForm.interventions_administered} onChange={(e) => setSeizureForm({...seizureForm, interventions_administered: e.target.value})} placeholder="Input text" className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all placeholder:text-gray-400" />
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" className="peer appearance-none w-4 h-4 border border-slate-300 rounded focus:outline-none/30 checked:bg-docuhealth-primary checked:border-docuhealth-primary transition-colors" defaultChecked />
                  <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[13px] text-gray-500 font-medium">Escalated? Mark if the seizure lasted longer than 5 minutes (Status Epilepticus) or if the patient did not regain consciousness</span>
              </label>
            </section>

            <div className="flex justify-end pt-4">
              <button 
                onClick={async () => { const ok = await handleExecuteTask('seizure'); if (ok) { setShowSeizureEntry(false); setSeizureSubmitSuccessModalOpen(true); } }} disabled={isSubmittingTaskAction === activeTask?.sqid}
                className="bg-docuhealth-primary text-white font-medium px-8 py-2.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingTaskAction === activeTask?.sqid ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Update chart"}
              </button>
            </div>
          </div>
        </div>
      ) : showSeizureRecord ? (
        <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-6 mb-6">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <button 
                  onClick={() => setShowSeizureRecord(false)}
                  className="flex items-center gap-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors font-medium border border-slate-200 bg-white"
              >
                  <ArrowLeft className="w-4 h-4" /> Back to tasks
              </button>
            </div>
          </div>
          <h2 className="text-[16px] font-bold text-gray-800 mb-6">Seizure events</h2>
          
          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[700px]">
               <thead>
                 <tr className="border border-gray-100 rounded-full bg-white text-[13px]">
                   <th className="py-5 px-4 font-bold text-gray-700 w-[15%] rounded-l-full">Date</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[15%]">Type</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[20%]">Post-Ictal State</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[15%]">Escalated</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[20%]">Seizure duration</th>
                   <th className="py-5 px-4 font-bold text-gray-700 w-[15%] rounded-r-full">Status</th>
                 </tr>
               </thead>
               <tbody>
                 {chartData.map((rec) => (
                   <tr key={rec.id} className="border-b border-gray-100 last:border-b-0 hover:bg-slate-50 transition-colors text-[13px]">
                     <td className="py-6 px-4 flex items-center gap-2 text-gray-600 whitespace-nowrap"><Calendar className="w-3.5 h-3.5" /> {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : '-'}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.motor_movement || '-'}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.physical_signs || '-'}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.is_prolonged_or_critical ? "Yes" : "No"}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.duration_minutes}m {rec.duration_seconds}s</td>
                     <td className={`py-6 px-4 font-bold ${getMedStatusColor(rec.status)} whitespace-nowrap`}>{rec.status}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>

          {/* Mobile View */}
          <div className="block lg:hidden space-y-4 mb-4">
            {chartData.map((rec) => (
              <div key={rec.id} className="bg-white border border-gray-200 rounded-xl p-4 ">
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-800">{rec.created_at ? new Date(rec.created_at).toLocaleDateString() : '-'}</span>
                  </div>
                  <span className={`text-[12px] font-bold ${getMedStatusColor(rec.status)} bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100`}>
                    {rec.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[13px]">
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Type</p><p className="font-medium text-gray-700">{rec.motor_movement || '-'}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Post-Ictal State</p><p className="font-medium text-gray-700">{rec.physical_signs || '-'}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Escalated</p><p className="font-medium text-gray-700">{rec.is_prolonged_or_critical ? "Yes" : "No"}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Seizure duration</p><p className="font-medium text-gray-700">{rec.duration_minutes}m {rec.duration_seconds}s</p></div>
                </div>
              </div>
            ))}
          </div>

          <Pagination2 count={chartTotalCount} currentPage={seizureCurrentPage} totalPages={Math.ceil(chartTotalCount / 10) || 1} setCurrentPage={setSeizureCurrentPage} />
        </div>
      ) : showProcedureEntry ? (
        <div className="bg-white">
          <div className="mb-8 flex items-center gap-3 border-b border-gray-100 pb-4">
            <button 
                onClick={() => setShowProcedureEntry(false)}
                className="flex items-center justify-center gap-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors font-medium border border-slate-200 bg-white"
            >
                <ArrowLeft className="w-4 h-4" /> Procedure monitoring
            </button>
          </div>

          <div className="space-y-8 pb-10">
            {/* Procedure verified Section */}
            <section>
              <h3 className="text-[15px] font-bold text-slate-700 mb-4">Procedure verified</h3>
              <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Name of procedure</label>
                <input 
                  type="text" 
                  placeholder="Lumbar Puncture (Performed by Dr. A. Bello)" 
                  className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors bg-white"
                />
              </div>
            </section>

            {/* Immediate Outcome & Post-Procedure Instructions Section */}
            <section>
              <h3 className="text-[15px] font-bold text-slate-700 mb-4">Immediate Outcome & Post-Procedure Instructions</h3>
              <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Instruction</label>
                <input 
                  type="text" 
                  placeholder="Keep patient lying flat for 4 hours post-lumbar puncture" 
                  className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors bg-white"
                />
              </div>
            </section>

            {/* Consent verified? Section */}
            <section>
              <h3 className="text-[15px] font-bold text-slate-700 mb-4">Consent verified?</h3>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="consent" value="given" checked={procedureForm.consent === "given"} onChange={(e) => setProcedureForm({...procedureForm, consent: e.target.value})} className="w-4 h-4 text-docuhealth-primary border-gray-300" />
                  <span className="text-sm text-gray-600">Given</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="consent" value="emergency" checked={procedureForm.consent === "emergency"} onChange={(e) => setProcedureForm({...procedureForm, consent: e.target.value})} className="w-4 h-4 text-docuhealth-primary border-gray-300" />
                  <span className="text-sm text-gray-600">Emergency Exemption</span>
                </label>
              </div>
            </section>

            {/* Post-Procedure Assessment Section */}
            <section>
              <h3 className="text-[15px] font-bold text-slate-700 mb-4">Post-Procedure Assessment</h3>
              
              <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2 mb-4">
                <label className="text-sm font-semibold text-slate-700">Dressing status</label>
                <div className="relative">
                  <select value={procedureForm.post_procedure_status} onChange={(e) => setProcedureForm({...procedureForm, post_procedure_status: e.target.value})} className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all appearance-none bg-white cursor-pointer">
                    <option value="clean_dry">Clean & dry</option>
                    <option value="oozing_bleeding">Oozing/Bleeding</option>
                    <option value="leakage">Leakage</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
              
              <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2 mb-4">
                <label className="text-sm font-semibold text-slate-700">Estimated Volume of blood lost (EBL)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={procedureForm.estimated_blood_volume_ml}
                    onChange={(e) => setProcedureForm({...procedureForm, estimated_blood_volume_ml: e.target.value})}
                    placeholder="Input volume" 
                    className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors bg-white pr-10"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 text-sm">
                    ml
                  </div>
                </div>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="drain" className="w-4 h-4 text-docuhealth-primary border-gray-300" />
                <span className="text-sm text-gray-600">N/A- No drain</span>
              </label>
            </section>
            
            {/* Patient positioning & safety Section */}
            <section>
              <h3 className="text-[15px] font-bold text-slate-700 mb-4">Patient positioning & safety</h3>
              <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2 mb-4">
                <label className="text-sm font-semibold text-slate-700">Current position</label>
                <div className="relative">
                  <select value={procedureForm.current_position} onChange={(e) => setProcedureForm({...procedureForm, current_position: e.target.value})} className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all appearance-none bg-white cursor-pointer">
                    <option value="head_of_bed_elevated">Head of bed elevated</option>
                    <option value="flat_supine">Flat supine</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-6 flex justify-end">
              <button
                onClick={async () => { const ok = await handleExecuteTask('procedure'); if (ok) { setShowProcedureEntry(false); setProcedureSubmitSuccessModalOpen(true); } }} disabled={isSubmittingTaskAction === activeTask?.sqid}
                className="bg-docuhealth-primary text-white font-medium py-2.5 px-6 rounded-full text-[14px] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingTaskAction === activeTask?.sqid ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Update chart"}
              </button>
            </div>
          </div>
        </div>
      ) : showProcedureRecord ? (
        <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-6 mb-6">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <button 
                  onClick={() => setShowProcedureRecord(false)}
                  className="flex items-center gap-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors font-medium border border-slate-200 bg-white"
              >
                  <ArrowLeft className="w-4 h-4" /> Back to tasks
              </button>
            </div>
          </div>
          
          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto mb-6">
            <h2 className="text-[16px] font-bold text-gray-800 mb-4">Procedure charts</h2>
             <table className="w-full text-left border-collapse min-w-[900px]">
               <thead>
                 <tr className="border border-gray-100 rounded-full bg-white text-[13px]">
                   <th className="py-5 px-4 font-bold text-gray-700 w-[12%] rounded-l-full">Date</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[16%]">Procedure name</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[15%]">Performing clinician</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[12%]">Dressing status</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[12%]">Surgical drain volume</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[18%]">Positioning and safety</th>
                   <th className="py-5 px-4 font-bold text-gray-700 w-[15%] rounded-r-full">Status</th>
                 </tr>
               </thead>
               <tbody>
                 {chartData.map((rec) => (
                   <tr key={rec.id} className="border-b border-gray-100 last:border-b-0 hover:bg-slate-50 transition-colors text-[13px]">
                     <td className="py-6 px-4 flex items-center gap-2 text-gray-600 whitespace-nowrap"><Calendar className="w-3.5 h-3.5" /> {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : '-'}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.procedureName}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.performingClinician}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.dressingStatus}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.surgicalDrainVolume}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.positioningAndSafety}</td>
                     <td className={`py-6 px-4 font-bold ${getMedStatusColor(rec.status)} whitespace-nowrap`}>{rec.status}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden space-y-4 mb-6">
            {chartData.map((rec) => (
              <div key={rec.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[13px] font-medium">{rec.created_at ? new Date(rec.created_at).toLocaleDateString() : '-'}</span>
                  </div>
                  <span className={`text-[12px] font-bold ${getMedStatusColor(rec.status)} bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100`}>
                    {rec.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[13px]">
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Procedure name</p><p className="font-medium text-gray-700">{rec.procedureName}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Performing clinician</p><p className="font-medium text-gray-700">{rec.performingClinician}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Dressing status</p><p className="font-medium text-gray-700">{rec.dressingStatus}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Surgical drain vol</p><p className="font-medium text-gray-700">{rec.surgicalDrainVolume}</p></div>
                  <div className="col-span-2"><p className="text-gray-400 text-[11px] uppercase mb-1">Positioning and safety</p><p className="font-medium text-gray-700">{rec.positioningAndSafety}</p></div>
                </div>
              </div>
            ))}
          </div>

          <Pagination2 count={chartTotalCount} currentPage={procedureCurrentPage} totalPages={Math.ceil(chartTotalCount / 10) || 1} setCurrentPage={setProcedureCurrentPage} />
        </div>
      ) : showIVFluidEntry ? (
        <div className="bg-white">
          <div className="mb-8 flex items-center gap-3 border-b border-gray-100 pb-4">
            <button 
                onClick={() => setShowIVFluidEntry(false)}
                className="flex items-center justify-center gap-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors font-medium border border-slate-200 bg-white"
            >
                <ArrowLeft className="w-4 h-4" /> Add new entry
            </button>
          </div>

          <div className="space-y-8 pb-10">
            {/* Preset by doctor Section */}
            <section>
              <h3 className="text-[15px] font-bold text-slate-700 mb-4">Preset by doctor</h3>
              <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2 mb-4">
                <label className="text-sm font-semibold text-slate-700">Drugs/additives</label>
                <input 
                  type="text" 
                  placeholder="Inj. Pethidine, Inj. Morphine, Inj. Ondansetron, Inj. Pantoprazole," 
                  className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors bg-white"
                />
              </div>

              <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2 mb-4">
                <label className="text-sm font-semibold text-slate-700">Fluid solution type</label>
                <input 
                  type="text" 
                  placeholder="Normal saline" 
                  className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Total plan/number of bags</label>
                  <input 
                    type="text" 
                    placeholder="1 bag only" 
                    className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors bg-white"
                  />
                </div>
                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Volume per bag</label>
                  <input 
                    type="text" 
                    placeholder="500 ML" 
                    className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors bg-white"
                  />
                </div>
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer select-none group pt-2">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" className="peer appearance-none w-4 h-4 border border-slate-300 rounded focus:outline-none/30 checked:bg-docuhealth-primary checked:border-docuhealth-primary transition-colors" defaultChecked />
                  <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[13px] text-gray-500 font-medium">Automatically add to patient's fluid Intake chart</span>
              </label>
            </section>

            {/* Nurse input Section */}
            <section>
              <h3 className="text-[15px] font-bold text-slate-700 mb-4">Nurse input</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Select site condition</label>
                  <div className="relative">
                    <select value={ivFluidForm.site_condition} onChange={(e) => setIvFluidForm({...ivFluidForm, site_condition: e.target.value})} className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all appearance-none bg-white cursor-pointer"><option value="clean">Clean & Intact</option><option value="swollen_leaking">Swollen / Leaking</option><option value="red_painful">Red / Painful</option><option value="line_blocked">Line Blocked / Not Flowing</option></select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
                
                <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Cannula location</label>
                  <div className="relative">
                    <select value={ivFluidForm.cannula_location} onChange={(e) => setIvFluidForm({...ivFluidForm, cannula_location: e.target.value})} className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all appearance-none bg-white cursor-pointer"><option value="left_forearm">Left forearm</option><option value="right_forearm">Right forearm</option><option value="left_hand">Left Hand</option><option value="right_hand">Right Hand</option></select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Nursing remark</label>
                <textarea 
                  placeholder="Type here..." 
                  className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-colors bg-white min-h-[100px] resize-y"
                ></textarea>
              </div>
            </section>

            <div className="pt-6 flex justify-end">
              <button
                onClick={async () => { const ok = await handleExecuteTask('iv_fluid'); if (ok) { setShowIVFluidEntry(false); setIvFluidSubmitSuccessModalOpen(true); } }} disabled={isSubmittingTaskAction === activeTask?.sqid}
                className="bg-docuhealth-primary text-white font-medium py-2.5 px-6 rounded-full text-[14px] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingTaskAction === activeTask?.sqid ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Update chart"}
              </button>
            </div>
          </div>
        </div>
      ) : showIVFluidRecord ? (
        <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-6 mb-6">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <button 
                  onClick={() => setShowIVFluidRecord(false)}
                  className="flex items-center gap-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors font-medium border border-slate-200 bg-white"
              >
                  <ArrowLeft className="w-4 h-4" /> Back to tasks
              </button>
            </div>
          </div>
          
          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto mb-6">
            <h2 className="text-[16px] font-bold text-gray-800 mb-4">IV Fluid administration chart</h2>
             <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead>
                 <tr className="border border-gray-100 rounded-full bg-white text-[13px]">
                   <th className="py-5 px-4 font-bold text-gray-700 w-[10%] rounded-l-full">Date</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[8%]">Due Time</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[12%]">Drugs/additives</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[10%]">Cannula location</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[12%]">Solution type</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[10%]">Vol per bag (mL)</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[10%]">Infusion rate</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[10%]">Total plan</th>
                   <th className="py-5 px-3 font-bold text-gray-700 w-[12%]">Site condition</th>
                   <th className="py-5 px-4 font-bold text-gray-700 w-[10%] rounded-r-full">Status</th>
                 </tr>
               </thead>
               <tbody>
                 {chartData.map((rec) => (
                   <tr key={rec.id} className="border-b border-gray-100 last:border-b-0 hover:bg-slate-50 transition-colors text-[13px]">
                     <td className="py-6 px-4 flex items-center gap-2 text-gray-600 whitespace-nowrap"><Calendar className="w-3.5 h-3.5" /> {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : '-'}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.created_at ? new Date(rec.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.additives?.length ? rec.additives.join(', ') : '-'}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{formatLabel(rec.cannula_location)}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{formatLabel(rec.solution_type)}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.volume_per_bag || '-'}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.infusion_rate ? `${rec.infusion_rate} mL/hr` : '-'}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{rec.total_plan || '-'}</td>
                     <td className="py-6 px-3 text-gray-600 whitespace-nowrap">{formatLabel(rec.site_condition)}</td>
                     <td className={`py-6 px-4 font-bold text-green-600 bg-green-50  rounded whitespace-nowrap`}>Completed</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden space-y-4 mb-6">
            <h2 className="text-[16px] font-bold text-gray-800 mb-4 px-1">IV Fluid administration chart</h2>
            {chartData.map((rec) => (
              <div key={rec.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[13px] font-medium">{rec.created_at ? new Date(rec.created_at).toLocaleDateString() : '-'}</span>
                    <span className="text-[13px] text-gray-400 ml-1">({rec.created_at ? new Date(rec.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'})</span>
                  </div>
                  <span className={`text-[12px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-md border border-green-100`}>
                    Completed
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[13px]">
                  <div className="col-span-2"><p className="text-gray-400 text-[11px] uppercase mb-1">Drugs/additives</p><p className="font-medium text-gray-700">{rec.additives?.length ? rec.additives.join(', ') : '-'}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Cannula loc</p><p className="font-medium text-gray-700">{formatLabel(rec.cannula_location)}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Solution</p><p className="font-medium text-gray-700">{formatLabel(rec.solution_type)}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Vol / bag</p><p className="font-medium text-gray-700">{rec.volume_per_bag || '-'}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Infusion rate</p><p className="font-medium text-gray-700">{rec.infusion_rate ? `${rec.infusion_rate} mL/hr` : '-'}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Total plan</p><p className="font-medium text-gray-700">{rec.total_plan || '-'}</p></div>
                  <div><p className="text-gray-400 text-[11px] uppercase mb-1">Site condition</p><p className="font-medium text-gray-700">{formatLabel(rec.site_condition)}</p></div>
                </div>
              </div>
            ))}
          </div>

          <Pagination2 count={chartTotalCount} currentPage={ivFluidCurrentPage} totalPages={Math.ceil(chartTotalCount / 10) || 1} setCurrentPage={setIvFluidCurrentPage} />
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
            {tasks?.map((task, index) => {
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
                      <p className="text-sm font-medium text-gray-800">{new Date(task.scheduled_for).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-md">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">Ordering Doctor</p>
                      <p className="text-sm font-medium text-gray-800">{(task.instructions || "No instructions")}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between relative flex-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-md">
                        <FileText className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Task</p>
                        <p className="text-sm font-medium text-gray-800 truncate max-w-[150px]">{task.task_type.replace(/_/g, " ")}</p>
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
                        <div className="hidden lg:block lg:absolute top-0 lg:top-10 right-0 mt-2 bg-white border shadow-[0px_4px_20px_rgba(0,0,0,0.08)] rounded-lg p-1.5 w-56 z-40">
                          {taskStatus === "history" ? null : taskStatus === "pending" ? (
                            <button 
                              className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap"
                              onClick={() => { setModalPopover(null); handleTaskAction("claim", task.sqid); }}
                            >
                              Claim task
                            </button>
                          ) : (
                            <>
                              {task.task_type === 'glucose' ? (
                                <>
                                  <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setActiveTask(task); setGlucoseModalOpen(true); }}>Add new entry</button>
                                  <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setShowGlucoseRecord(true); }}>View glucose chart</button>
                                </>
                              ) : task.task_type === 'input_output' ? (
                                <>
                                  <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setActiveTask(task); setShowIOEntry(true); }}>Add new entry</button>
                                  <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setShowIORecord(true); }}>Input and Output chart</button>
                                </>
                              ) : task.task_type === 'vital_signs' ? (
                                <>
                                  <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setActiveTask(task); setVitalsInfoModalOpen(true); }}>Add new entry</button>
                                  <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setShowVitalsRecord(true); }}>Vital Signs Chart</button>
                                </>
                              ) : (task.task_type === 'seizure' || task.task_type === 'seizure_event') ? (
                                <>
                                  <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setActiveTask(task); setShowSeizureEntry(true); }}>Add new entry</button>
                                  <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setShowSeizureRecord(true); }}>View seizure charts</button>
                                </>
                              ) : task.task_type === 'procedure' ? (
                                <>
                                  <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setActiveTask(task); setShowProcedureEntry(true); }}>Add new entry</button>
                                  <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setShowProcedureRecord(true); }}>Procedure chart</button>
                                </>
                              ) : task.task_type === 'iv_fluid' ? (
                                <>
                                  <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setActiveTask(task); setShowIVFluidEntry(true); }}>Add new entry</button>
                                  <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setShowIVFluidRecord(true); }}>IV Fluid chart</button>
                                </>
                              ) : (task.task_type === 'discharge_summary' || task.task_type === 'nurse_in_patient_discharge') ? (
                                <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setActiveTask(task); setShowDischargeSummary(true); }}>Add entry</button>
                              ) : (
                                <>
                                  <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); handleTaskAction("confirm-medication", task.sqid); }}>Confirm medication</button>
                                  <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setShowMedicationRecord(true); }}>View medication chart</button>
                                </>
                              )}
                              
                              <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); handleTaskAction("release", task.sqid); }}>Release task</button>
                              <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); handleTaskAction("mark-missed", task.sqid); }}>Mark as missed</button>
                              <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => setModalPopover(null)}>Mark as in-progress</button>
                              <button className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); handleTaskAction("escalate", task.sqid); }}>Mark as escalated</button>
                            </>
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
            {tasks?.map((task, index) => {
              const colors = getStatusColor(task.status);
              return (
                <div key={task.id} className={`bg-white border border-gray-200 rounded-lg p-4 relative ${modalPopover === index ? 'z-50' : 'z-10'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Task date/time</p>
                      <p className="text-[13px] font-semibold text-slate-700">{new Date(task.scheduled_for).toLocaleString()}</p>
                    </div>
                    <div className="relative" ref={modalPopover === index ? modalDropdownRef : null}>
                      <button onClick={() => setModalPopover(modalPopover === index ? null : index)} className={`h-9 w-9 flex items-center justify-center rounded-full ${modalPopover === index ? "bg-slate-200" : "bg-gray-50"}`}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 8C14 7.45 13.55 7 13 7C12.45 7 12 7.45 12 8C12 8.55 12.45 9 13 9C13.55 9 14 8.55 14 8ZM4 8C4 7.45 3.55 7 3 7C2.45 7 2 7.45 2 8C2 8.55 2.45 9 3 9C3.55 9 4 8.55 4 8ZM9 8C9 7.45 8.55 7 8 7C7.45 7 7 7.45 7 8C7 8.55 7.45 9 8 9C8.55 9 9 8.55 9 8Z" fill="#1A263E"/></svg>
                      </button>
                      {modalPopover === index && (
                        <div className="absolute right-0 top-10 w-56 bg-white border border-slate-100 shadow-[0px_8px_30px_rgba(0,0,0,0.12)] rounded-lg p-1.5 z-50">
                          {taskStatus === "history" ? null : taskStatus === "pending" ? (
                            <button 
                              className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap"
                              onClick={() => { setModalPopover(null); handleTaskAction("claim", task.sqid); }}
                            >
                              Claim task
                            </button>
                          ) : (
                            <>
                              {task.task_type === 'glucose' ? (
                                <>
                                  <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setActiveTask(task); setGlucoseModalOpen(true); }}>Add new entry</button>
                                  <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setShowGlucoseRecord(true); }}>View glucose chart</button>
                                </>
                              ) : task.task_type === 'input_output' ? (
                                <>
                                  <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setActiveTask(task); setShowIOEntry(true); }}>Add new entry</button>
                                  <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setShowIORecord(true); }}>Input and Output chart</button>
                                </>
                              ) : task.task_type === 'vital_signs' ? (
                                <>
                                  <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setActiveTask(task); setVitalsInfoModalOpen(true); }}>Add new entry</button>
                                  <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setShowVitalsRecord(true); }}>Vital Signs Chart</button>
                                </>
                              ) : (task.task_type === 'seizure' || task.task_type === 'seizure_event') ? (
                                <>
                                  <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setActiveTask(task); setShowSeizureEntry(true); }}>Add new entry</button>
                                  <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setShowSeizureRecord(true); }}>View seizure charts</button>
                                </>
                              ) : task.task_type === 'procedure' ? (
                                <>
                                  <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setActiveTask(task); setShowProcedureEntry(true); }}>Add new entry</button>
                                  <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setShowProcedureRecord(true); }}>Procedure chart</button>
                                </>
                              ) : task.task_type === 'iv_fluid' ? (
                                <>
                                  <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setActiveTask(task); setShowIVFluidEntry(true); }}>Add new entry</button>
                                  <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setShowIVFluidRecord(true); }}>IV Fluid chart</button>
                                </>
                              ) : (task.task_type === 'discharge_summary' || task.task_type === 'nurse_in_patient_discharge') ? (
                                <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setActiveTask(task); setShowDischargeSummary(true); }}>Add entry</button>
                              ) : (
                                <>
                                  <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); handleTaskAction("confirm-medication", task.sqid); }}>Confirm medication</button>
                                  <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); setShowMedicationRecord(true); }}>View medication chart</button>
                                </>
                              )}
                              
                              <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); handleTaskAction("release", task.sqid); }}>Release task</button>
                              <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); handleTaskAction("mark-missed", task.sqid); }}>Mark as missed</button>
                              <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => setModalPopover(null)}>Mark as in-progress</button>
                              <button className="w-full text-left font-medium text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-lg transition-colors whitespace-nowrap" onClick={() => { setModalPopover(null); handleTaskAction("escalate", task.sqid); }}>Mark as escalated</button>
                            </>
                          )}
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
                        <p className="text-[13px] text-slate-600">{(task.instructions || "No instructions")}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-medium">Task</p>
                        <p className="text-[13px] text-slate-600 truncate italic">"{task.task_type.replace(/_/g, " ")}"</p>
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
                  type="number"
                  value={glucoseForm.value}
                  onChange={(e) => setGlucoseForm({...glucoseForm, value: e.target.value})}
                  className="flex-1 px-4 py-3 text-sm outline-none text-slate-700 placeholder:text-slate-400" 
                  placeholder="16.6" 
                />
                <div className="absolute right-2 top-2 bottom-2">
                  <div className="relative h-full flex items-center bg-blue-50 rounded px-3 pr-8 cursor-pointer">
                    <select value={glucoseForm.unit} onChange={(e) => setGlucoseForm({...glucoseForm, unit: e.target.value})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                      <option value="mg_dl">mg/dL</option>
                      <option value="mmol_l">mmol/L</option>
                    </select>
                    <span className="text-blue-900 text-sm font-medium select-none">{glucoseForm.unit === 'mg_dl' ? 'mg/dL' : 'mmol/L'}</span>
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
                <select value={glucoseForm.context} onChange={(e) => setGlucoseForm({...glucoseForm, context: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2/20 focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary transition-all appearance-none cursor-pointer bg-white">
                  <option value="fasting">Fasting</option>
                  <option value="pre_meal">Pre-meal</option>
                  <option value="post_meal">Post-meal</option>
                  <option value="bedtime">Bedtime</option>
                  <option value="random">Random</option>
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
                checked={glucoseForm.insulin_administered}
                onChange={(e) => setGlucoseForm({...glucoseForm, insulin_administered: e.target.checked})}
                className="w-4 h-4 text-docuhealth-primary bg-gray-100 border-gray-300 rounded cursor-pointer accent-docuhealth-primary"
              />
              <label htmlFor="insulin_check" className="text-sm font-medium text-slate-400 cursor-pointer">
                I have administered insulin
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button 
                onClick={async () => { const ok = await handleExecuteTask('glucose'); if (ok) { setGlucoseModalOpen(false); setGlucoseSubmitSuccessModalOpen(true); } }} disabled={isSubmittingTaskAction === activeTask?.sqid}
                className="w-full bg-docuhealth-primary text-white font-medium text-sm py-4 rounded-full transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingTaskAction === activeTask?.sqid ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Update"}
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

      {/* Seizure Success Modal */}
      <Modal isOpen={seizureSubmitSuccessModalOpen} onClose={() => setSeizureSubmitSuccessModalOpen(false)}>
        <div className="py-3 text-center max-w-sm mx-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Success!</h2>
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            You have successfully updated the seizure events task!
          </p>
          <button
            onClick={() => setSeizureSubmitSuccessModalOpen(false)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-full transition-colors mb-3"
          >
            Go to my tasks
          </button>
          <button
            onClick={() => {
              setSeizureSubmitSuccessModalOpen(false);
              if (setAdvanceCheckUp) setAdvanceCheckUp(false);
            }}
            className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-full transition-colors"
          >
            Go back to patient's management
          </button>
        </div>
      </Modal>

      {/* Procedure Success Modal */}
      <Modal isOpen={procedureSubmitSuccessModalOpen} onClose={() => setProcedureSubmitSuccessModalOpen(false)}>
        <div className="py-3 text-center max-w-sm mx-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Success!</h2>
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            You have successfully updated the procedure monitoring task!
          </p>
          <button
            onClick={() => setProcedureSubmitSuccessModalOpen(false)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-full transition-colors mb-3"
          >
            Go to my tasks
          </button>
          <button
            onClick={() => {
              setProcedureSubmitSuccessModalOpen(false);
              if (setAdvanceCheckUp) setAdvanceCheckUp(false);
            }}
            className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-full transition-colors"
          >
            Go back to patient's management
          </button>
        </div>
      </Modal>

      {/* IV Fluid Success Modal */}
      <Modal isOpen={ivFluidSubmitSuccessModalOpen} onClose={() => setIvFluidSubmitSuccessModalOpen(false)}>
        <div className="py-3 text-center max-w-sm mx-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Success!</h2>
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            You have successfully updated the IV fluid task!
          </p>
          <button
            onClick={() => setIvFluidSubmitSuccessModalOpen(false)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-full transition-colors mb-3"
          >
            Go to my tasks
          </button>
          <button
            onClick={() => {
              setIvFluidSubmitSuccessModalOpen(false);
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
            {fluidBalanceData?.total_intake || 0} ml - {fluidBalanceData?.total_output || 0} ml = <span className="text-docuhealth-primary font-bold">{fluidBalanceData?.fluid_balance || 0} ML fluid</span>
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

      {/* Vitals Info Modal */}
      <Modal isOpen={vitalsInfoModalOpen} onClose={() => setVitalsInfoModalOpen(false)}>
        <div className=" text-center max-w-sm mx-auto flex flex-col items-center relative">
          <button 
            onClick={() => setVitalsInfoModalOpen(false)}
            className="absolute top-0 right-0 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="w-14 h-14 flex items-center justify-center mb-4 mt-2">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#1E293B" strokeWidth="1.5" />
              <path d="M12 16V12M12 8H12.01" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Additional information</h2>
          <div className="border border-slate-100 rounded-2xl p-5 mb-6 text-sm text-slate-600 text-left leading-relaxed">
            Check for the vitals signs of the this patient, make sure she is very much stable and do well to check for the heartbeat rate as well, thanks.
          </div>
          <button
            onClick={() => {
              setVitalsInfoModalOpen(false);
              setShowVitalsEntry(true);
            }}
            className="w-full bg-docuhealth-primary text-white font-medium py-3.5 rounded-full text-[15px]"
          >
            Proceed to making entry
          </button>
        </div>
      </Modal>

      {/* Vitals Success Modal */}
      <Modal isOpen={vitalsSubmitSuccessModalOpen} onClose={() => setVitalsSubmitSuccessModalOpen(false)}>
        <div className="py-3 text-center max-w-sm mx-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Success!</h2>
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            You have successfully updated the vitals of this patient
          </p>
          <button
            onClick={() => setVitalsSubmitSuccessModalOpen(false)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-full transition-colors mb-3"
          >
            Go to my tasks
          </button>
          <button
            onClick={() => {
              setVitalsSubmitSuccessModalOpen(false);
              if (setAdvanceCheckUp) setAdvanceCheckUp(false);
            }}
            className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-full transition-colors"
          >
            Go back to patient's management
          </button>
        </div>
      </Modal>
    </div>
  );
};
export default NursingTasksQueue;
