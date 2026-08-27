import React from "react";
import VitalSignsCard from "../../../../ui/VitalSignsCard";

const NursingDischargeSummaryView = ({ patient, admission, patientFullInfo, onCancel, safeFormatDate, formatDateTime }) => {
  const patientName = patientFullInfo?.patient_info?.firstname 
    ? `${patientFullInfo.patient_info.firstname} ${patientFullInfo.patient_info.lastname}`
    : patient?.firstname 
      ? `${patient.firstname} ${patient.lastname}`
      : "N/A";

  const hin = patientFullInfo?.patient_info?.hin || patient?.hin || "N/A";
  const maskedHin = hin !== "N/A" ? `${hin.slice(0, 5)}********` : "N/A";
  
  const dob = patientFullInfo?.patient_info?.dob || patient?.dob;
  const age = dob ? Math.floor((new Date() - new Date(dob)) / 31557600000) : "N/A";
  const gender = patientFullInfo?.patient_info?.gender || patient?.gender || "N/A";

  const primaryDoctor = admission?.staff_info 
    ? `Dr. ${admission.staff_info.firstname} ${admission.staff_info.lastname}` 
    : "N/A";
  
  const providerInfo = patientFullInfo?.patient_info?.payment_provider?.type || "N/A";
  const providerEmail = patientFullInfo?.patient_info?.email || patient?.email || "N/A";

  // Mocked for display as it is a summary view mockup
  const uploadDate = safeFormatDate ? safeFormatDate(admission?.discharge_date) : "N/A";

  const mockVitalSigns = {
    blood_pressure: "120/80",
    temp: "37.0",
    weight: "160",
    height: "1.68",
    heart_rate: "72",
    bmi: "24.5",
    pain_score: "2",
    sp02: "98"
  };

  return (
    <div className="mb-6">
      {/* Top Patient Info Banner */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{patientName}</h3>
            <p className="text-xs text-gray-500 mb-1">Patient HIN: {maskedHin}</p>
            <p className="text-xs text-gray-500 mb-1">Age: {age} years</p>
            <p className="text-xs text-gray-500">Gender: {gender}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Primary doctor</p>
            <p className="font-medium text-sm text-gray-800 mb-1">{primaryDoctor}</p>
            <p className="text-xs text-gray-500">Orthopedic surgeon</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Provider information:</p>
            <p className="font-medium text-sm text-gray-800 mb-1">{providerInfo}</p>
            <p className="text-xs text-gray-500">Email: {providerEmail}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Date/Time uploaded</p>
            <p className="font-medium text-sm text-gray-800">{uploadDate}</p>
          </div>
        </div>
      </div>

      {/* Final discharge vitals */}
      <VitalSignsCard
        title="Final discharge vitals"
        vitalSigns={mockVitalSigns}
        className="bg-gray-50 rounded-xl border border-gray-100 p-5 mb-6"
      />

      {/* Discharge summary details */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-6">Discharge summary</h3>
        <div className="space-y-5">
          <div>
            <p className="text-xs text-gray-500 mb-1">Line and device clearance checklist:</p>
            <p className="text-sm font-medium text-gray-800">Persistent lower back pain</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Condition at discharge:</p>
            <p className="text-sm font-medium text-gray-800">No visual changes</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Valuables handed:</p>
            <p className="text-sm font-medium text-gray-800">Lumbar Strain (M54.5)</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Accompanied by:</p>
            <p className="text-sm font-medium text-gray-800">Physical therapy, pain management</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Mobility status:</p>
            <p className="text-sm font-medium text-gray-800">Physical therapy, pain management</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">IV sites status:</p>
            <p className="text-sm font-medium text-gray-800">Physical therapy, pain management</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Wound status:</p>
            <p className="text-sm font-medium text-gray-800">Physical therapy, pain management</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Medication explained</p>
            <p className="text-sm font-medium text-gray-800">Physical therapy, pain management</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Education given</p>
            <p className="text-sm font-medium text-gray-800">Physical therapy, pain management</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Follow up instructions explained</p>
            <p className="text-sm font-medium text-gray-800">Physical therapy, pain management</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Education and handover</p>
            <ul className="text-sm font-medium text-gray-800 space-y-1 ml-4 list-decimal">
              <li>Drink at least 3 litres of fluids daily</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NursingDischargeSummaryView;
