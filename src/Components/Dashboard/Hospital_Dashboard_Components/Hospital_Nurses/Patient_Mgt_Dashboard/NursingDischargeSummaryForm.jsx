import React, { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Modal from "../../../../ui/Modal";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import { toast } from "react-toastify";

const initialFormState = {
  final_vital_signs: {
    blood_pressure: "",
    temp: "",
    resp_rate: "",
    height: "",
    weight: "",
    heart_rate: "",
    spo2: "",
    bmi: "",
    pain_score: ""
  },
  peripheral_iv_cannula_removed: false,
  surgical_dressing_clean: false,
  urinary_catheter_removed: false,
  surgical_drains_removed: false,
  condition_on_discharge: "stable",
  accompanied_by: "relative",
  valuables_handed: true,
  mobility_status: "mobile",
  iv_sites_status: "clean_intact_dry",
  wound_status: "na_no_wounds",
  education_given: "",
  follow_up_instructions: "",
  reviewed_discharge_meds: false,
  warning_signs_explained: false,
  medication_explained: false,
  will_continue_followup: false
};

const NursingDischargeSummaryForm = ({ admission, patientFullInfo, activeTask, tasks = [], onCancel, setAdvanceCheckUp }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    setCurrentStep(1);
  };

  const updateVitals = (field, value) => {
    setFormData(prev => ({
      ...prev,
      final_vital_signs: {
        ...prev.final_vital_signs,
        [field]: value
      }
    }));
  };

  // Helper for dates
  const safeFormatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: 'numeric', hour12: true
    });
  };

  const calculateDays = (dateString) => {
    if (!dateString) return "N/A";
    const start = new Date(dateString);
    const end = new Date();
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return `${diffDays} days`;
  };

  const patientName = patientFullInfo?.patient_info?.firstname 
    ? `${patientFullInfo.patient_info.firstname} ${patientFullInfo.patient_info.lastname}`
    : admission?.patient?.firstname 
      ? `${admission.patient.firstname} ${admission.patient.lastname}`
      : "";

  const admittingDoctorName = admission?.staff_info 
    ? `Dr. ${admission.staff_info.firstname} ${admission.staff_info.lastname}` 
    : "";

  const handleSubmit = async () => {
    const admissionSqid = admission?.sqid;
    const patientHin = patientFullInfo?.patient_info?.hin || admission?.patient?.hin;

    // 1. Check activeTask
    let taskSqid = activeTask?.sqid;

    // 2. Check tasks prop
    if (!taskSqid && Array.isArray(tasks)) {
      const dischargeTask = tasks.find(t => t.task_type === 'nurse_in_patient_discharge' || t.task_type === 'discharge_summary');
      if (dischargeTask?.sqid) {
        taskSqid = dischargeTask.sqid;
      }
    }

    // 3. Fallback: Fetch tasks directly from admission
    if (!taskSqid && admissionSqid) {
      try {
        const res = await axiosInstanceHos.get(`/api/inpatients/admissions/${admissionSqid}/task-occurrences`);
        const results = res.data?.results || (Array.isArray(res.data) ? res.data : []);
        const found = results.find(t => t.task_type === 'nurse_in_patient_discharge' || t.task_type === 'discharge_summary');
        if (found?.sqid) {
          taskSqid = found.sqid;
        }
      } catch (e) {
        console.error("Could not fetch discharge task automatically:", e);
      }
    }

    if (!taskSqid) {
      toast.error("No active discharge task found for this patient.");
      return;
    }

    if (!formData.education_given.trim() || !formData.follow_up_instructions.trim()) {
      toast.error("Please fill in both 'Education given' and 'Follow up instructions'.");
      return;
    }

    const payload = {
      admission_id: admissionSqid,
      patient: patientHin,
      final_vital_signs: {
        blood_pressure: formData.final_vital_signs.blood_pressure || "",
        temp: Number(formData.final_vital_signs.temp) || 0,
        resp_rate: Number(formData.final_vital_signs.resp_rate) || 0,
        height: Number(formData.final_vital_signs.height) || 0,
        weight: Number(formData.final_vital_signs.weight) || 0,
        heart_rate: Number(formData.final_vital_signs.heart_rate) || 0,
        bmi: Number(formData.final_vital_signs.bmi) || 0,
        spo2: Number(formData.final_vital_signs.spo2) || 0,
        pain_score: formData.final_vital_signs.pain_score ? parseInt(formData.final_vital_signs.pain_score, 10) : null
      },
      peripheral_iv_cannula_removed: Boolean(formData.peripheral_iv_cannula_removed),
      surgical_dressing_clean: Boolean(formData.surgical_dressing_clean),
      urinary_catheter_removed: Boolean(formData.urinary_catheter_removed),
      surgical_drains_removed: Boolean(formData.surgical_drains_removed),
      condition_on_discharge: formData.condition_on_discharge || "stable",
      accompanied_by: formData.accompanied_by || "relative",
      valuables_handed: Boolean(formData.valuables_handed),
      mobility_status: formData.mobility_status || "mobile",
      iv_sites_status: formData.iv_sites_status || "clean_intact_dry",
      wound_status: formData.wound_status || "na_no_wounds",
      education_given: formData.education_given || "",
      follow_up_instructions: formData.follow_up_instructions || "",
      reviewed_discharge_meds: Boolean(formData.reviewed_discharge_meds),
      warning_signs_explained: Boolean(formData.warning_signs_explained),
      medication_explained: Boolean(formData.medication_explained),
      will_continue_followup: Boolean(formData.will_continue_followup)
    };

    try {
      setIsSubmitting(true);
      await axiosInstanceHos.post(`/api/inpatients/task-occurrences/${taskSqid}/execute`, payload);
      toast.success("Nursing discharge completed successfully!");
      
      resetForm();
      setSuccessModalOpen(true);
    } catch (err) {
      console.error("Error executing nursing discharge:", err);
      const errMsg = err.response?.data?.doctor || err.response?.data?.nurse || err.response?.data?.detail || "Failed to execute discharge task";
      toast.error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-6 mb-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onCancel}
            className="flex items-center gap-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors font-medium border border-slate-200 bg-white"
          >
            <ArrowLeft className="w-4 h-4" /> Discharge summary
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full">
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-docuhealth-primary transition-all duration-300"
              style={{ width: currentStep === 1 ? '50%' : '100%' }}
            ></div>
          </div>
          <p className="text-center text-xs font-semibold mt-2 text-gray-800">
            Step {currentStep} of 2
          </p>
        </div>
      </div>

      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Admission Summary */}
          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-docuhealth-primary mb-4">Admission Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full name</label>
                <input type="text" readOnly value={patientName} className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs bg-gray-50 text-gray-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ward placed</label>
                <input type="text" readOnly value={admission?.ward_info?.name ? `${admission.ward_info.name} ward` : ""} className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs bg-gray-50 text-gray-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date/time of admission</label>
                <input type="text" readOnly value={safeFormatDate(admission?.admission_date)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs bg-gray-50 text-gray-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Discharge date</label>
                <input type="text" readOnly value={safeFormatDate(new Date())} className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs bg-gray-50 text-gray-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Length of stay (Days)</label>
                <input type="text" readOnly value={calculateDays(admission?.admission_date)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs bg-gray-50 text-gray-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Admitting doctor</label>
                <input type="text" readOnly value={admittingDoctorName} className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs bg-gray-50 text-gray-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Consultant in-charge</label>
                <input type="text" readOnly value={admittingDoctorName} className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs bg-gray-50 text-gray-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Admission Diagnosis</label>
                <input type="text" readOnly value={admission?.diagnosis || ""} className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs bg-gray-50 text-gray-500 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Final discharge vitals */}
          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-docuhealth-primary mb-4">Final discharge vitals</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Blood pressure</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={formData.final_vital_signs.blood_pressure}
                    onChange={(e) => updateVitals('blood_pressure', e.target.value)}
                    placeholder="120/80" 
                    className="w-full border border-gray-200 rounded-md pl-3 pr-12 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary" 
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">mmHg</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Temperature</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={formData.final_vital_signs.temp}
                    onChange={(e) => updateVitals('temp', e.target.value)}
                    placeholder="37.0" 
                    className="w-full border border-gray-200 rounded-md pl-3 pr-8 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary" 
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">°C</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Respiratory rate</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={formData.final_vital_signs.resp_rate}
                    onChange={(e) => updateVitals('resp_rate', e.target.value)}
                    placeholder="20" 
                    className="w-full border border-gray-200 rounded-md pl-3 pr-10 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary" 
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">/Min</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={formData.final_vital_signs.height}
                    onChange={(e) => updateVitals('height', e.target.value)}
                    placeholder="170" 
                    className="w-full border border-gray-200 rounded-md pl-3 pr-8 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary" 
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">Cm</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Heart rate</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={formData.final_vital_signs.heart_rate}
                    onChange={(e) => updateVitals('heart_rate', e.target.value)}
                    placeholder="75" 
                    className="w-full border border-gray-200 rounded-md pl-3 pr-10 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary" 
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">Bpm</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Weight</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={formData.final_vital_signs.weight}
                    onChange={(e) => updateVitals('weight', e.target.value)}
                    placeholder="70" 
                    className="w-full border border-gray-200 rounded-md pl-3 pr-8 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary" 
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">Kg</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">BMI</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={formData.final_vital_signs.bmi}
                    onChange={(e) => updateVitals('bmi', e.target.value)}
                    placeholder="24.2" 
                    className="w-full border border-gray-200 rounded-md pl-3 pr-10 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary" 
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">BMI</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pain score</label>
                <div className="relative">
                  <select 
                    value={formData.final_vital_signs.pain_score}
                    onChange={(e) => updateVitals('pain_score', e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary appearance-none bg-white cursor-pointer"
                  >
                    <option value="">Select pain score</option>
                    <option value="0">0 (No pain)</option>
                    <option value="1">1 (Mild pain)</option>
                    <option value="2">2 (Mild pain)</option>
                    <option value="3">3 (Mild pain)</option>
                    <option value="4">4 (Moderate pain)</option>
                    <option value="5">5 (Moderate pain)</option>
                    <option value="6">6 (Moderate pain)</option>
                    <option value="7">7 (Severe pain)</option>
                    <option value="8">8 (Severe pain)</option>
                    <option value="9">9 (Severe pain)</option>
                    <option value="10">10 (Severe pain)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">SPO2</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={formData.final_vital_signs.spo2}
                    onChange={(e) => updateVitals('spo2', e.target.value)}
                    placeholder="98" 
                    className="w-full border border-gray-200 rounded-md pl-3 pr-8 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary" 
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line and device clearance checklist */}
          <div>
            <h3 className="text-sm font-semibold text-docuhealth-primary mb-3">Line and device clearance checklist</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer w-fit">
                <input 
                  type="checkbox" 
                  checked={formData.peripheral_iv_cannula_removed}
                  onChange={(e) => setFormData({...formData, peripheral_iv_cannula_removed: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-docuhealth-primary" 
                />
                <span className="text-xs text-gray-500">Peripheral IV Cannula Removed</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer w-fit">
                <input 
                  type="checkbox" 
                  checked={formData.surgical_dressing_clean}
                  onChange={(e) => setFormData({...formData, surgical_dressing_clean: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-docuhealth-primary" 
                />
                <span className="text-xs text-gray-500">Surgical Dressing Clean & Intact</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer w-fit">
                <input 
                  type="checkbox" 
                  checked={formData.urinary_catheter_removed}
                  onChange={(e) => setFormData({...formData, urinary_catheter_removed: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-docuhealth-primary" 
                />
                <span className="text-xs text-gray-500">Urinary Catheter Removed / N/A</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer w-fit">
                <input 
                  type="checkbox" 
                  checked={formData.surgical_drains_removed}
                  onChange={(e) => setFormData({...formData, surgical_drains_removed: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-docuhealth-primary" 
                />
                <span className="text-xs text-gray-500">Surgical Drains Removed / N/A</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-5">
              <label className="block text-sm font-semibold text-docuhealth-primary mb-3">Condition at discharge:</label>
              <div className="relative">
                <select 
                  value={formData.condition_on_discharge}
                  onChange={(e) => setFormData({...formData, condition_on_discharge: e.target.value})}
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary appearance-none bg-white cursor-pointer"
                >
                  <option value="stable">Stable condition</option>
                  <option value="critical">Critical condition</option>
                  <option value="deceased">Deceased</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-5">
              <label className="block text-sm font-semibold text-docuhealth-primary mb-3">Accompanied by:</label>
              <div className="relative">
                <select 
                  value={formData.accompanied_by}
                  onChange={(e) => setFormData({...formData, accompanied_by: e.target.value})}
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary appearance-none bg-white cursor-pointer"
                >
                  <option value="relative">Relative/family</option>
                  <option value="solo">Solo</option>
                  <option value="escort">Escort staff</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-5">
            <label className="block text-sm font-semibold text-docuhealth-primary mb-3">Valuables handed:</label>
            <div className="relative">
              <select 
                value={formData.valuables_handed ? "true" : "false"}
                onChange={(e) => setFormData({...formData, valuables_handed: e.target.value === "true"})}
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary appearance-none bg-white cursor-pointer"
              >
                <option value="true">Yes, all personal items returned</option>
                <option value="false">N/A - No valuables stored</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button 
              onClick={() => setCurrentStep(2)}
              className="bg-docuhealth-primary hover:bg-docuhealth-primary-hover text-white font-medium py-2.5 px-10 rounded-full transition-colors text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-5">
              <label className="block text-sm font-semibold text-docuhealth-primary mb-3">Mobility status:</label>
              <div className="relative">
                <select 
                  value={formData.mobility_status}
                  onChange={(e) => setFormData({...formData, mobility_status: e.target.value})}
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary appearance-none bg-white cursor-pointer"
                >
                  <option value="mobile">Fully mobile</option>
                  <option value="assisted">Assisted Ambulation</option>
                  <option value="bedridden">Bedridden / Immobile</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-5">
              <label className="block text-sm font-semibold text-docuhealth-primary mb-3">IV sites status:</label>
              <div className="relative">
                <select 
                  value={formData.iv_sites_status}
                  onChange={(e) => setFormData({...formData, iv_sites_status: e.target.value})}
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary appearance-none bg-white cursor-pointer"
                >
                  <option value="clean_intact_dry">Clean, Intact & Dry</option>
                  <option value="no_signs_phlebitis">No Signs of Phlebitis / Infiltration</option>
                  <option value="mild_redness">Mild Redness / Monitoring Required</option>
                  <option value="dressing_applied">Dressing Applied & Secured</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-5">
            <label className="block text-sm font-semibold text-docuhealth-primary mb-3">Wound status (optional, if wound history exist)</label>
            <div className="relative">
              <select 
                value={formData.wound_status}
                onChange={(e) => setFormData({...formData, wound_status: e.target.value})}
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary appearance-none bg-white cursor-pointer"
              >
                <option value="na_no_wounds">N/A - No Wounds / Intact Skin</option>
                <option value="dressing_clean_dry">Dressing Clean & Dry</option>
                <option value="slight_serous_oozing">Slight Serous Oozing</option>
                <option value="infected_purulent">Infected / Purulent Discharge</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-5">
            <label className="block text-sm font-semibold text-docuhealth-primary mb-3">Education given</label>
            <textarea 
              rows="3" 
              value={formData.education_given}
              onChange={(e) => setFormData({...formData, education_given: e.target.value})}
              placeholder="Add notes..."
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary resize-none"
            ></textarea>
          </div>

          <div className="border border-gray-200 rounded-lg p-5">
            <label className="block text-sm font-semibold text-docuhealth-primary mb-3">Follow up instructions explained</label>
            <textarea 
              rows="3" 
              value={formData.follow_up_instructions}
              onChange={(e) => setFormData({...formData, follow_up_instructions: e.target.value})}
              placeholder="Add notes..."
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary focus:ring-1 focus:ring-docuhealth-primary resize-none"
            ></textarea>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-docuhealth-primary mb-3">Education and Handover</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer w-fit">
                <input 
                  type="checkbox" 
                  checked={formData.reviewed_discharge_meds}
                  onChange={(e) => setFormData({...formData, reviewed_discharge_meds: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-docuhealth-primary" 
                />
                <span className="text-xs text-gray-500">Reviewed Discharge Meds & Schedule with Patient/Relative</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer w-fit">
                <input 
                  type="checkbox" 
                  checked={formData.warning_signs_explained}
                  onChange={(e) => setFormData({...formData, warning_signs_explained: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-docuhealth-primary" 
                />
                <span className="text-xs text-gray-500">Warning Signs for Readmission Explained</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer w-fit">
                <input 
                  type="checkbox" 
                  checked={formData.medication_explained}
                  onChange={(e) => setFormData({...formData, medication_explained: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-docuhealth-primary" 
                />
                <span className="text-xs text-gray-500">Medication explained</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-4 mt-8 pt-4">
            <button 
              onClick={() => setCurrentStep(1)}
              disabled={isSubmitting}
              className="border border-docuhealth-primary text-docuhealth-primary bg-white hover:bg-gray-50 font-medium py-2.5 px-10 rounded-full transition-colors text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-docuhealth-primary hover:bg-docuhealth-primary-hover text-white font-medium py-2.5 px-10 rounded-full transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                "Complete nursing discharge and release bed"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <Modal isOpen={successModalOpen} onClose={() => setSuccessModalOpen(false)}>
        <div className="py-6 text-center max-w-sm mx-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Success!</h2>
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            Nursing discharge note completed, Bed space will be marked as empty and patient discharged
          </p>
          <button
            onClick={() => {
              setSuccessModalOpen(false);
              onCancel();
              if (setAdvanceCheckUp) setAdvanceCheckUp(false);
            }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3.5 rounded-full transition-colors"
          >
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default NursingDischargeSummaryForm;
