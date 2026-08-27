import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Modal from "../../../../ui/Modal";

const NursingDischargeSummaryForm = ({ admission, patientFullInfo, onCancel, setAdvanceCheckUp }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

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
                  <input type="text" placeholder="Enter blood pressure" className="w-full border border-gray-200 rounded-md pl-3 pr-12 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary" />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">mmHg</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Temperature</label>
                <div className="relative">
                  <input type="text" placeholder="Enter temperature" className="w-full border border-gray-200 rounded-md pl-3 pr-8 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary" />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">°C</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Respiratory rate</label>
                <div className="relative">
                  <input type="text" placeholder="Enter respiratory rate" className="w-full border border-gray-200 rounded-md pl-3 pr-10 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary" />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">/Min</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
                <div className="relative">
                  <input type="text" placeholder="Enter height" className="w-full border border-gray-200 rounded-md pl-3 pr-8 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary" />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">Cm</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Heart rate</label>
                <div className="relative">
                  <input type="text" placeholder="Enter heart rate" className="w-full border border-gray-200 rounded-md pl-3 pr-10 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary" />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">Bpm</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Weight</label>
                <div className="relative">
                  <input type="text" placeholder="Enter weight" className="w-full border border-gray-200 rounded-md pl-3 pr-8 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary" />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">Kg</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">BMI</label>
                <div className="relative">
                  <input type="text" placeholder="Enter BMI" className="w-full border border-gray-200 rounded-md pl-3 pr-10 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary" />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">BMI</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pain score</label>
                <div className="relative">
                  <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary appearance-none bg-white cursor-pointer">
                    <option value="">Select pain score</option>
                    <option value="0-3 (Mild pain)">0-3 (Mild pain)</option>
                    <option value="4-6 (Moderate pain)">4-6 (Moderate pain)</option>
                    <option value="7-10 (Severe pain)">7-10 (Severe pain)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">SP02</label>
                <div className="relative">
                  <input type="text" placeholder="Enter SP02" className="w-full border border-gray-200 rounded-md pl-3 pr-8 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary" />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line and device clearance checklist */}
          <div>
            <h3 className="text-sm font-semibold text-docuhealth-primary mb-3">Line and device clearance checklist</h3>
            <div className="space-y-3">
              {[
                "Peripheral IV Cannula Removed",
                "Surgical Dressing Clean & Intact",
                "Urinary Catheter Removed / N/A",
                "Surgical Drains Removed / N/A"
              ].map((item, index) => (
                <label key={index} className="flex items-center gap-3 cursor-pointer w-fit">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-docuhealth-primary focus:ring-docuhealth-primary" />
                  <span className="text-xs text-gray-500">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-5">
              <label className="block text-sm font-semibold text-docuhealth-primary mb-3">Condition at discharge:</label>
              <div className="relative">
                <select className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary appearance-none bg-white cursor-pointer">
                  <option value="Stable condition">Stable condition</option>
                  <option value="Critical condition">Critical condition</option>
                  <option value="Deceased">Deceased</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-5">
              <label className="block text-sm font-semibold text-docuhealth-primary mb-3">Accompanied by:</label>
              <div className="relative">
                <select className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary appearance-none bg-white cursor-pointer">
                  <option value="Relative/family">Relative/family</option>
                  <option value="Solo">Solo</option>
                  <option value="Escort staff">Escort staff</option>
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
              <select className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary appearance-none bg-white cursor-pointer">
                <option value="Yes, all personal items returned">Yes, all personal items returned</option>
                <option value="N/A - No valuables stored">N/A - No valuables stored</option>
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
                <select className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary appearance-none bg-white cursor-pointer">
                  <option value="Fully mobile">Fully mobile</option>
                  <option value="Assisted Ambulation">Assisted Ambulation</option>
                  <option value="Bedridden / Immobile">Bedridden / Immobile</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-5">
              <label className="block text-sm font-semibold text-docuhealth-primary mb-3">IV sites status:</label>
              <div className="relative">
                <select className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary appearance-none bg-white cursor-pointer">
                  <option value="Clean, Intact & Dry">Clean, Intact & Dry</option>
                  <option value="No Signs of Phlebitis / Infiltration">No Signs of Phlebitis / Infiltration</option>
                  <option value="Mild Redness / Monitoring Required">Mild Redness / Monitoring Required</option>
                  <option value="Dressing Applied & Secured">Dressing Applied & Secured</option>
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
              <select className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary appearance-none bg-white cursor-pointer">
                <option value="N/A - No Wounds / Intact Skin">N/A - No Wounds / Intact Skin</option>
                <option value="Dressing Clean & Dry">Dressing Clean & Dry</option>
                <option value="Slight Serous Oozing">Slight Serous Oozing</option>
                <option value="Infected / Purulent Discharge">Infected / Purulent Discharge</option>
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
              placeholder="Add notes..."
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary resize-none"
            ></textarea>
          </div>

          <div className="border border-gray-200 rounded-lg p-5">
            <label className="block text-sm font-semibold text-docuhealth-primary mb-3">Follow up instructions explained</label>
            <textarea 
              rows="3" 
              placeholder="Add notes..."
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-docuhealth-primary resize-none"
            ></textarea>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-docuhealth-primary mb-3">Education and Handover</h3>
            <div className="space-y-3">
              {[
                "Reviewed Discharge Meds & Schedule with Patient/Relative",
                "Warning Signs for Readmission Explained",
                "Medication explained"
              ].map((item, index) => (
                <label key={index} className="flex items-center gap-3 cursor-pointer w-fit">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-docuhealth-primary focus:ring-docuhealth-primary" />
                  <span className="text-xs text-gray-500">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-4 mt-8 pt-4">
            <button 
              onClick={() => setCurrentStep(1)}
              className="border border-docuhealth-primary text-docuhealth-primary bg-white hover:bg-gray-50 font-medium py-2.5 px-10 rounded-full transition-colors text-sm"
            >
              Previous
            </button>
            <button 
              onClick={() => setSuccessModalOpen(true)}
              className="bg-docuhealth-primary hover:bg-docuhealth-primary-hover text-white font-medium py-2.5 px-10 rounded-full transition-colors text-sm"
            >
              Complete nursing discharge and release bed
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
