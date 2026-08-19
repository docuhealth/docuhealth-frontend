import React, { useContext, useState } from "react";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import toast from "react-hot-toast";
import moment from "moment";
import { User, X, ClipboardList, ChevronDown } from "lucide-react";
import { NursingEncounterContext } from "../../../../../context/HospitalContext/Nurses/NursingEncounterContext";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../../ui/Table";
import EmptyState from "../../../../ui/EmptyState";
import Spinner from "../../../../ui/Spinner";
import Modal from "../../../../ui/Modal";
import Input from "../../../../ui/Input";
import GeneralPatientInfoForm from "../../../../ui/GeneralPatientInfoForm";
import VitalSignsCard from "../../../../ui/VitalSignsCard";

const getBadgeStyle = (status) => {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-600";
    case "in_progress":
      return "bg-blue-100 text-blue-600";
    case "recorded":
      return "bg-green-100 text-green-600";
    case "escalated":
      return "bg-purple-100 text-purple-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getTriageColor = (priority) => {
  const p = (priority || "routine").toLowerCase();
  if (p === "routine") return "text-green-500";
  if (p === "urgent") return "text-orange-500";
  if (p === "emergency") return "text-red-500";
  return "text-gray-600";
};

const getCallUpStatus = (status) => {
  if (status === "called_up") return { text: "Called-up", style: "bg-green-100 text-green-500" };
  return { text: "Awaiting", style: "bg-amber-50 text-amber-500" };
};

const NursingEncounterTable = () => {
  const { encounters, loading, activeTab, startEncounter } = useContext(NursingEncounterContext);
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState(null);
  const [selectedPatientForEncounter, setSelectedPatientForEncounter] = useState(null);
  const [viewEncounterDetails, setViewEncounterDetails] = useState(null);

  const [encounterFormData, setEncounterFormData] = useState({
    blood_pressure: "",
    temp: "",
    heart_rate: "",
    resp_rate: "",
    height: "",
    weight: "",
    bmi: "",
    pain_score: "0 (No pain)",
    sp02: "",
    triage_priority: "routine",
    notes: ""
  });
  const [submittingEncounter, setSubmittingEncounter] = useState(false);
  const [escalating, setEscalating] = useState(false);

  const handleInputChange = (field, value) => {
    setEncounterFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRecordEncounter = async () => {
    if (!selectedPatientForEncounter) return;
    setSubmittingEncounter(true);
    try {
      const payload = {
        triage_priority: encounterFormData.triage_priority,
        notes: encounterFormData.notes,
        vital_signs: {
          ...(encounterFormData.blood_pressure && { blood_pressure: encounterFormData.blood_pressure }),
          ...(encounterFormData.temp && { temp: parseFloat(encounterFormData.temp) }),
          ...(encounterFormData.heart_rate && { heart_rate: parseInt(encounterFormData.heart_rate) }),
          ...(encounterFormData.resp_rate && { resp_rate: parseInt(encounterFormData.resp_rate) }),
          ...(encounterFormData.height && { height: parseFloat(encounterFormData.height) }),
          ...(encounterFormData.weight && { weight: parseFloat(encounterFormData.weight) }),
          ...(encounterFormData.bmi && { bmi: parseFloat(encounterFormData.bmi) }),
          ...(encounterFormData.pain_score && { pain_score: encounterFormData.pain_score }),
          ...(encounterFormData.sp02 && { sp02: encounterFormData.sp02 })
        }
      };

      await axiosInstanceHos.post(`/api/nurses/check-ins/${selectedPatientForEncounter.sqid}/encounter-card`, payload);
      toast.success("Encounter recorded successfully!");
      // Don't close modal here, allow them to escalate if they want. Or maybe close it? The user said "Change the button from Update Vitals Only to Record Encounter, Then the endpoint to send patient to doctor's queue."
    } catch (error) {
      toast.error(error.response?.data?.check_in?.[0] || error.response?.data?.check_in || "Failed to record encounter.");
    } finally {
      setSubmittingEncounter(false);
    }
  };

  const handleEscalateToDoctor = async () => {
    if (!selectedPatientForEncounter) return;
    setEscalating(true);
    try {
      await axiosInstanceHos.post(`/api/nurses/check-ins/${selectedPatientForEncounter.sqid}/escalate`, {});
      toast.success("Patient sent to doctor's queue!");
      setSelectedPatientForEncounter(null); // Close modal
    } catch (error) {
      toast.error(error.response?.data?.check_in?.[0] || error.response?.data?.check_in || "Failed to escalate patient.");
    } finally {
      setEscalating(false);
    }
  };

  if (viewEncounterDetails) {
    const patientData = viewEncounterDetails.patient_info || {};
    const mappedPatient = {
      firstname: patientData.firstname || patientData.first_name || "N/A",
      lastname: patientData.lastname || patientData.last_name || "N/A",
      dob: patientData.dob || "N/A",
      email: patientData.email || "N/A",
      phone_num: patientData.phone_number || patientData.phone_num || "N/A",
      street: patientData.address || "N/A",
      city: patientData.city || "N/A",
      state: patientData.state || "N/A",
      country: patientData.country || "N/A"
    };

    const vitalsData = viewEncounterDetails.vital_signs || viewEncounterDetails.vitals || {};
    const mockVitals = {
      blood_pressure: vitalsData.blood_pressure || vitalsData.bp || "N/A",
      temp: vitalsData.temp || vitalsData.temperature || "N/A",
      heart_rate: vitalsData.heart_rate || vitalsData.pulse || "N/A",
      resp_rate: vitalsData.resp_rate || vitalsData.respiratory_rate || "N/A",
      height: vitalsData.height || "N/A",
      weight: vitalsData.weight || "N/A",
      bmi: vitalsData.bmi || "N/A",
      pain_score: vitalsData.pain_score || "N/A",
      sp02: vitalsData.sp02 || vitalsData.oxygen_saturation || "N/A"
    };

    return (
      <div className="w-full bg-white ">
        <div 
          className="flex items-center gap-2 cursor-pointer mb-6"
          onClick={() => setViewEncounterDetails(null)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          <h2 className="font-medium text-docuhealth-primary">Encounter details</h2>
        </div>
        
        <GeneralPatientInfoForm patient={mappedPatient} />
        <VitalSignsCard vitalSigns={mockVitals} title="Latest vital signs" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner className="w-8 h-8 text-docuhealth-primary" />
      </div>
    );
  }

  if (!encounters || encounters.length === 0) {
    return (
      <EmptyState 
        icon="calendar" 
        title="No nursing encounter!" 
        description="You currently don't have any nursing encounter." 
        className="py-10" 
      />
    );
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block w-full">
        <Table className="w-full [&_table]:border-separate [&_table]:border-spacing-0">
      <TableHeader className="!bg-transparent !border-none">
        {activeTab === "Doctor’s call-up/consultation" ? (
          <tr>
            <TableHead className="w-[20%] rounded-l-full border-y border-l border-gray-200 normal-case text-gray-700 pl-10">Patient</TableHead>
            <TableHead className="w-[15%] border-y border-gray-200 normal-case text-gray-700">Date and Time</TableHead>
            <TableHead className="w-[15%] border-y border-gray-200 normal-case text-gray-700">Triage Priority</TableHead>
            <TableHead className="w-[15%] border-y border-gray-200 normal-case text-gray-700">Call up status</TableHead>
            <TableHead className="w-[15%] border-y border-gray-200 normal-case text-gray-700">Doctor Involved</TableHead>
            <TableHead className="w-[20%] rounded-r-full border-y border-r border-gray-200 normal-case text-gray-700">Action</TableHead>
          </tr>
        ) : (
          <tr>
            <TableHead className="w-[25%] rounded-l-full border-y border-l border-gray-200 normal-case text-gray-700 pl-10">Patient</TableHead>
            <TableHead className="w-[15%] border-y border-gray-200 normal-case text-gray-700">{activeTab === "Closed" ? "Date and Time" : "Date"}</TableHead>
            <TableHead className="w-[15%] border-y border-gray-200 normal-case text-gray-700">{activeTab === "Closed" ? "Nurse Encountered" : "Wait time"}</TableHead>
            <TableHead className="w-[15%] border-y border-gray-200 normal-case text-gray-700">{activeTab === "Closed" ? "Triage Priority" : "Status"}</TableHead>
            <TableHead className="w-[30%] rounded-r-full border-y border-r border-gray-200 normal-case text-gray-700">Nursing actions</TableHead>
          </tr>
        )}
      </TableHeader>
      <TableBody>
        {encounters.map((encounter) => {
          const patientName = encounter.patient_info
            ? `${encounter.patient_info.firstname} ${encounter.patient_info.lastname}`
            : "Unknown Patient";
          
          // Calculate Wait time
          const waitTime = moment().diff(moment(encounter.created_at), 'minutes');
          const formattedWaitTime = waitTime > 60 
            ? `${Math.floor(waitTime / 60)} hrs ${waitTime % 60} mins` 
            : `${waitTime} mins`;

          return (
            <TableRow key={encounter.sqid || encounter.id} className="hover:bg-gray-50">
              <TableCell className="border-b border-gray-200 pl-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-docuhealth-primary flex items-center justify-center font-bold text-xs">
                    {patientName.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-900">{patientName}</span>
                </div>
              </TableCell>
              {activeTab === "Doctor’s call-up/consultation" ? (
                <>
                  <TableCell className="text-gray-600 border-b border-gray-200">
                    {moment(encounter.escalated_at || encounter.created_at).format("MMM DD, YYYY / hh:mm A")}
                  </TableCell>
                  <TableCell className="border-b border-gray-200">
                    <span className={`text-sm font-medium capitalize ${getTriageColor(encounter.triage_priority)}`}>
                      {encounter.triage_priority || "Routine"}
                    </span>
                  </TableCell>
                  <TableCell className="border-b border-gray-200">
                    <span className={`px-3 py-1 rounded-md text-xs font-medium capitalize ${getCallUpStatus(encounter.status).style}`}>
                      {getCallUpStatus(encounter.status).text}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600 border-b border-gray-200">
                    N/A
                  </TableCell>
                  <TableCell className="border-b border-gray-200">
                    <button 
                      onClick={() => setSelectedPatientForDetails(encounter)}
                      className="bg-blue-50 text-docuhealth-primary hover:bg-blue-100 px-7 py-3 rounded-full font-medium text-xs whitespace-nowrap transition-colors"
                    >
                      View patient details
                    </button>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="text-gray-600 border-b border-gray-200">
                    {activeTab === "Closed" 
                      ? moment(encounter.created_at).format("MMM DD, YYYY / hh:mm A")
                      : moment(encounter.created_at).format("MMM DD, YYYY")}
                  </TableCell>
                  <TableCell className="text-gray-600 border-b border-gray-200">
                    {activeTab === "Closed" 
                      ? encounter.claimed_by_info 
                        ? `Nurse ${encounter.claimed_by_info.firstname || encounter.claimed_by_info.first_name || ""} ${encounter.claimed_by_info.lastname || encounter.claimed_by_info.last_name || ""}`
                        : "Unknown"
                      : formattedWaitTime}
                  </TableCell>
                  <TableCell className="border-b border-gray-200">
                    {activeTab === "Closed" ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-green-100 text-green-600">
                        {encounter.triage_priority || "Routine"}
                      </span>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getBadgeStyle(encounter.status)}`}>
                        {encounter.status === "in_progress" ? "In Progress" : encounter.status || "Pending"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="border-b border-gray-200">
                    <div className="flex items-center gap-2">
                         <button 
                        onClick={() => {
                          startEncounter(encounter.sqid);
                          setSelectedPatientForEncounter(encounter);
                        }}
                        className="bg-docuhealth-primary text-white hover:bg-docuhealth-primary/90 px-7 py-3 rounded-full font-medium text-xs whitespace-nowrap transition-colors"
                      >
                        Start clinical encounter
                      </button>
                      <button 
                        onClick={() => {
                          if (activeTab === "Closed") {
                            setViewEncounterDetails(encounter);
                          } else {
                            setSelectedPatientForDetails(encounter);
                          }
                        }}
                        className="bg-blue-50 text-docuhealth-primary hover:bg-blue-100 px-7 py-3 rounded-full font-medium text-xs whitespace-nowrap transition-colors"
                      >
                        {activeTab === "Closed" ? "Encounter details" : "View patient details"}
                      </button>
                   
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
          );
        })}
        </TableBody>
      </Table>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden flex flex-col gap-4 mt-2">
        {encounters.map((encounter) => {
          const patientName = encounter.patient_info
            ? `${encounter.patient_info.firstname} ${encounter.patient_info.lastname}`
            : "Unknown Patient";
          
          const waitTime = moment().diff(moment(encounter.created_at), 'minutes');
          const formattedWaitTime = waitTime > 60 
            ? `${Math.floor(waitTime / 60)} hrs ${waitTime % 60} mins` 
            : `${waitTime} mins`;

          return (
            <div key={encounter.sqid || encounter.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 shadow-xs">
              
              {/* Header: Avatar, Name & Date */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-docuhealth-primary flex items-center justify-center font-bold text-sm">
                    {patientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-[14px] leading-tight mb-0.5">{patientName}</h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {activeTab === "Closed" 
                        ? moment(encounter.created_at).format("MMM DD, YYYY / hh:mm A")
                        : activeTab === "Doctor’s call-up/consultation"
                        ? moment(encounter.escalated_at || encounter.created_at).format("MMM DD, YYYY / hh:mm A")
                        : moment(encounter.created_at).format("MMM DD, YYYY")}
                    </p>
                  </div>
                </div>
                {activeTab === "Closed" ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium capitalize border bg-green-100 text-green-600 border-green-200">
                    {encounter.triage_priority || "Routine"}
                  </span>
                ) : activeTab === "Doctor’s call-up/consultation" ? (
                  <span className={`text-[11px] font-medium capitalize ${getTriageColor(encounter.triage_priority)}`}>
                    {encounter.triage_priority || "Routine"}
                  </span>
                ) : (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium capitalize border ${getBadgeStyle(encounter.status)}`}>
                    {encounter.status === "in_progress" ? "In Progress" : encounter.status || "Pending"}
                  </span>
                )}
              </div>

              {/* Dynamic Info Badges */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                {activeTab === "Doctor’s call-up/consultation" ? (
                  <>
                    <div className="flex flex-col bg-gray-50 rounded-lg p-2 border border-gray-100">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Call Up Status</span>
                      <span className={`self-start px-2 py-1 rounded-md text-[10px] font-medium capitalize ${getCallUpStatus(encounter.status).style}`}>
                        {getCallUpStatus(encounter.status).text}
                      </span>
                    </div>
                    <div className="flex flex-col bg-gray-50 rounded-lg p-2 border border-gray-100">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Doctor Involved</span>
                      <span className="text-xs font-bold text-gray-700">N/A</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3 border border-gray-100 col-span-2">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      {activeTab === "Closed" ? "Nurse Encountered" : "Wait Time"}
                    </span>
                    <span className="text-sm font-bold text-gray-700">
                      {activeTab === "Closed"
                        ? encounter.claimed_by_info ? `Nurse ${encounter.claimed_by_info.firstname || encounter.claimed_by_info.first_name || ""} ${encounter.claimed_by_info.lastname || encounter.claimed_by_info.last_name || ""}` : "Unknown"
                        : formattedWaitTime}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 mt-2">
                {activeTab === "Doctor’s call-up/consultation" ? (
                  <button 
                    onClick={() => setSelectedPatientForDetails(encounter)}
                    className="w-full bg-blue-50 text-docuhealth-primary hover:bg-blue-100 py-2.5 rounded-full font-medium text-xs transition-colors"
                  >
                    View patient details
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        startEncounter(encounter.sqid);
                        setSelectedPatientForEncounter(encounter);
                      }}
                      className="w-full bg-docuhealth-primary text-white hover:bg-docuhealth-primary/90 py-2.5 rounded-full font-medium text-xs transition-colors"
                    >
                      Start clinical encounter
                    </button>
                    <button 
                      onClick={() => {
                        if (activeTab === "Closed") {
                          setViewEncounterDetails(encounter);
                        } else {
                          setSelectedPatientForDetails(encounter);
                        }
                      }}
                      className="w-full bg-blue-50 text-docuhealth-primary hover:bg-blue-100 py-2.5 rounded-full font-medium text-xs transition-colors"
                    >
                      {activeTab === "Closed" ? "Encounter details" : "View patient details"}
                    </button>
                  </>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Patient Details Modal */}
      <Modal
        isOpen={!!selectedPatientForDetails}
        onClose={() => setSelectedPatientForDetails(null)}
        maxWidth="5xl"
      >
        {selectedPatientForDetails && (
          <div className="flex flex-col items-center relative">
            <button
              onClick={() => setSelectedPatientForDetails(null)}
              className="absolute top-0 right-0 text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
            
            {/* Header Icon */}
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-docuhealth-primary mb-4">
              <User size={28} />
            </div>
            
            {/* Titles */}
            <h2 className="text-xl font-bold text-gray-900 mb-1">Patient's full details</h2>
            <p className="text-sm text-gray-500 mb-8">Below are the general details of this patient!</p>

            {/* Form Fields */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 p-5 border rounded-md">
              <Input
                label="First Name"
                value={selectedPatientForDetails.patient_info?.firstname || selectedPatientForDetails.patient_info?.first_name || ""}
                readOnly
                className="bg-gray-50 text-gray-500 border-gray-200"
              />
              <Input
                label="Last name"
                value={selectedPatientForDetails.patient_info?.lastname || selectedPatientForDetails.patient_info?.last_name || ""}
                readOnly
                className="bg-gray-50 text-gray-500 border-gray-200"
              />
              <Input
                label="Date of birth"
                value={selectedPatientForDetails.patient_info?.dob || "N/A"}
                readOnly
                className="bg-gray-50 text-gray-500 border-gray-200"
              />
              <Input
                label="Email address"
                value={selectedPatientForDetails.patient_info?.email || "N/A"}
                readOnly
                className="bg-gray-50 text-gray-500 border-gray-200"
              />
              <Input
                label="Phone number"
                value={selectedPatientForDetails.patient_info?.phone_number || selectedPatientForDetails.patient_info?.phone_num || "N/A"}
                readOnly
                className="bg-gray-50 text-gray-500 border-gray-200"
              />
              <Input
                label="Home address"
                value={selectedPatientForDetails.patient_info?.address || "N/A"}
                readOnly
                className="bg-gray-50 text-gray-500 border-gray-200"
              />
            </div>

            {/* Action Button */}
            <div className="w-full flex justify-end mt-8">
              <button 
                onClick={() => {
                  setSelectedPatientForDetails(null);
                  startEncounter(selectedPatientForDetails.sqid);
                  setSelectedPatientForEncounter(selectedPatientForDetails);
                }}
                className="bg-docuhealth-primary text-white hover:bg-docuhealth-primary/90 px-8 py-3 rounded-full font-medium text-sm transition-colors"
              >
                Start clinical encounter
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Clinical Encounter Modal */}
      <Modal
        isOpen={!!selectedPatientForEncounter}
        onClose={() => setSelectedPatientForEncounter(null)}
        maxWidth="7xl"
      >
        {selectedPatientForEncounter && (
          <div className="flex flex-col relative max-h-[85vh] overflow-y-auto hide-scrollbar pb-4">
            <button
              onClick={() => setSelectedPatientForEncounter(null)}
              className="absolute top-0 right-0 text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center">
              {/* Header Icon */}
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-docuhealth-primary mb-4 mt-2">
                <ClipboardList size={28} />
              </div>
              
              {/* Titles */}
              <h2 className="text-xl font-bold text-gray-900 mb-1">Nursing Clinical Encounter</h2>
              <p className="text-sm text-gray-500 mb-8">Add and update patient vitals to complete encounter!</p>
            </div>

            {/* Vital Signs Section */}
            <div className="w-full mb-6 p-5 border rounded-md">
              <h3 className="font-semibold text-gray-800 mb-5">Vital signs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
                <Input label="Blood pressure" value={encounterFormData.blood_pressure} onChange={(e) => handleInputChange("blood_pressure", e.target.value)} placeholder="Enter blood pressure" trailingIcon={<span className="text-gray-400 text-xs whitespace-nowrap">mmHg</span>} />
                <Input label="Temperature" value={encounterFormData.temp} onChange={(e) => handleInputChange("temp", e.target.value)} placeholder="Enter temperature" trailingIcon={<span className="text-gray-400 text-xs whitespace-nowrap">°C</span>} />
                <Input label="Respiratory rate" value={encounterFormData.resp_rate} onChange={(e) => handleInputChange("resp_rate", e.target.value)} placeholder="Enter respiratory rate" trailingIcon={<span className="text-gray-400 text-xs whitespace-nowrap">/Min</span>} />
                <Input label="Height" value={encounterFormData.height} onChange={(e) => handleInputChange("height", e.target.value)} placeholder="Enter height" trailingIcon={<span className="text-gray-400 text-xs whitespace-nowrap">Cm</span>} />
                <Input label="Heart rate" value={encounterFormData.heart_rate} onChange={(e) => handleInputChange("heart_rate", e.target.value)} placeholder="Enter heart rate" trailingIcon={<span className="text-gray-400 text-xs whitespace-nowrap">Bpm</span>} />
                <Input label="Weight" value={encounterFormData.weight} onChange={(e) => handleInputChange("weight", e.target.value)} placeholder="Enter weight" trailingIcon={<span className="text-gray-400 text-xs whitespace-nowrap">Kg</span>} />
                <Input label="BMI" value={encounterFormData.bmi} onChange={(e) => handleInputChange("bmi", e.target.value)} placeholder="Enter BMI" trailingIcon={<span className="text-gray-400 text-xs whitespace-nowrap">BMI</span>} />
                
                {/* Pain Score */}
                <div className="w-full">
                  <p className="font-semibold pb-1 whitespace-nowrap">Pain score</p>
                  <div className="relative">
                    <select 
                      value={encounterFormData.pain_score} 
                      onChange={(e) => handleInputChange("pain_score", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-hidden focus:border-docuhealth-primary transition-colors text-gray-600 bg-white appearance-none pr-10"
                    >
                      <option value="0 (No pain)">0 (No pain)</option>
                      <option value="1–3 (Mild Pain)">1–3 (Mild Pain)</option>
                      <option value="4–6 (Moderate Pain)">4–6 (Moderate Pain)</option>
                      <option value="7–10 (Severe Pain)">7–10 (Severe Pain)</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                <Input label="SP02" value={encounterFormData.sp02} onChange={(e) => handleInputChange("sp02", e.target.value)} placeholder="98" trailingIcon={<span className="text-gray-400 text-xs whitespace-nowrap">%</span>} />
              </div>
            </div>

            {/* Triage Priority Section */}
            <div className="w-full mb-6 p-5 border rounded-md">
              <h3 className="font-semibold text-gray-800 mb-5 text-docuhealth-primary">Assign Triage Priority</h3>
              <div className="relative">
                <select 
                  value={encounterFormData.triage_priority} 
                  onChange={(e) => handleInputChange("triage_priority", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-hidden focus:border-docuhealth-primary transition-colors text-gray-600 bg-white appearance-none pr-10"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="w-full mb-8 p-5 border rounded-md">
              <h3 className="font-semibold text-gray-800 mb-5 text-docuhealth-primary">Add additional information (optional)</h3>
              <textarea 
                value={encounterFormData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Add comment..." 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-hidden focus:border-docuhealth-primary transition-colors text-gray-600 bg-white min-h-[120px] resize-y"
              />
            </div>

            {/* Footer Buttons */}
            <div className="w-full flex justify-end mt-4">
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 w-full sm:w-[560px]">
                <button 
                  onClick={handleRecordEncounter}
                  disabled={submittingEncounter}
                  className="border-2 border-docuhealth-primary text-docuhealth-primary hover:bg-blue-50 py-3 rounded-full font-medium text-sm transition-colors w-full disabled:opacity-50"
                >
                  {submittingEncounter ? "Updating..." : "Update vitals only"}
                </button>
                <button 
                  onClick={handleEscalateToDoctor}
                  disabled={escalating}
                  className="bg-docuhealth-primary text-white hover:bg-docuhealth-primary/90 py-3 rounded-full font-medium text-sm transition-colors w-full disabled:opacity-50"
                >
                  {escalating ? "Sending..." : "Send patient to doctor's queue"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default NursingEncounterTable;
