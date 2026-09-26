import React from "react";
import { ArrowLeft, User, Calendar, Clock, Building, Bed, AlertCircle, ShieldAlert } from "lucide-react";

const AdmissionNoteDetail = ({ note, onBack }) => {
  if (!note) return null;

  const patient = note.patient_info || {};
  const staff = note.written_by_info || note.staff_info || {};
  const admission = note.admission_info || {};
  const hospital = note.hospital_info || {};

  const patientName = `${patient.firstname || ""} ${patient.lastname || ""}`.trim() || note.patientName || "Patient";
  const staffName = `${staff.firstname || ""} ${staff.lastname || ""}`.trim() || note.nurseName || "Nurse";

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="text-sm bg-white animate-in fade-in duration-200">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 w-full border-b border-gray-100 my-6">
        <div
          className="flex justify-start items-center gap-2 cursor-pointer text-gray-700 hover:text-docuhealth-primary transition-colors"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          <h2 className="text-[15px] font-semibold text-docuhealth-dark">Nursing Admission Note Information</h2>
        </div>
      </div>

      {/* Patient and Provider Information Card */}
      <div className="p-5 mb-6 bg-docuhealth-light-gray border border-gray-100 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-[13px] space-y-1 text-gray-500">
            <h3 className="font-semibold text-docuhealth-dark text-[15px] mb-1">{patientName}</h3>
            <p>HIN: <span className="font-medium text-gray-700">{patient.hin || note.hin || "N/A"}</span></p>
            {patient.gender && <p className="capitalize">Gender: <span className="font-medium text-gray-700">{patient.gender}</span></p>}
          </div>

          <div className="text-[13px] space-y-1 text-gray-500">
            <p className="text-gray-400 font-medium">Recorded by</p>
            <p className="font-semibold text-docuhealth-dark">{staffName}</p>
            {staff.role && <p className="capitalize text-xs text-gray-500">{staff.role}</p>}
          </div>

          <div className="text-[13px] space-y-1 text-gray-500">
            <p className="text-gray-400 font-medium">Date recorded</p>
            <p className="font-semibold text-docuhealth-dark">{formatDate(note.created_at)}</p>
            <p className="text-xs text-gray-500">{formatTime(note.created_at)}</p>
          </div>

          <div className="text-[13px] space-y-1 text-gray-500">
            <p className="text-gray-400 font-medium">Ward & Bed</p>
            <p className="font-semibold text-docuhealth-dark">
              {admission.ward_name || (admission.ward_info?.name ? `${admission.ward_info.name} Ward` : "Ward N/A")}
            </p>
            <p className="text-xs text-gray-500">
              {admission.bed_number ? `Bed ${admission.bed_number}` : (admission.bed_info?.bed_number ? `Bed ${admission.bed_info.bed_number}` : "Bed N/A")}
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Assessments Card */}
      <div className="p-5 mb-6 bg-docuhealth-light-gray border border-gray-100 rounded-xl space-y-5">
        <h3 className="font-semibold text-docuhealth-dark text-[15px] border-b border-gray-200/60 pb-3">Clinical Assessments</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-4 rounded-lg border border-gray-200/70">
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Mobility Assessment</p>
            <p className="text-sm font-semibold text-gray-800">
              {note.mobility_assessment_label || note.mobility_assessment?.replace(/_/g, " ") || "Not recorded"}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200/70">
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Nutritional Assessment</p>
            <p className="text-sm font-semibold text-gray-800">
              {note.nutritional_assessment_label || note.nutritional_assessment?.replace(/_/g, " ") || "Not recorded"}
            </p>
          </div>
        </div>

        {/* Fall Risk and Skin Assessment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-4 rounded-lg border border-gray-200/70">
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Fall Risk Assessment</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {note.fall_risk_assessment || "No fall risk recorded"}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200/70">
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Skin Assessment</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {note.skin_assessment || "No skin concerns recorded"}
            </p>
          </div>
        </div>

        {/* Allergies */}
        <div className="bg-white p-4 rounded-lg border border-gray-200/70">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">Known Allergies</p>
          {Array.isArray(note.allergies) && note.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {note.allergies.map((allergy, idx) => (
                <span key={idx} className="bg-red-50 text-red-700 border border-red-200 text-xs px-2.5 py-1 rounded-full font-medium">
                  {allergy}
                </span>
              ))}
            </div>
          ) : typeof note.allergies === "string" && note.allergies.trim() ? (
            <p className="text-sm text-gray-700">{note.allergies}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No allergies documented</p>
          )}
        </div>

        {/* Initial Nursing Concerns / Remarks */}
        <div className="bg-white p-4 rounded-lg border border-gray-200/70">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Initial Nursing Concern</p>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
            {note.initial_nursing_concern || "No initial concerns recorded"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdmissionNoteDetail;
