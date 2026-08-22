import React, { useContext, useState } from "react";
import toast from "react-hot-toast";
import moment from "moment";
import { User, X, ClipboardList, ChevronDown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DoctorEncounterContext } from "../../../../../context/HospitalContext/Doctors/DoctorEncounterContext";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../../ui/Table";
import EmptyState from "../../../../ui/EmptyState";
import Spinner from "../../../../ui/Spinner";
import Modal from "../../../../ui/Modal";
import Button from "../../../../ui/Button";
import GeneralPatientInfoForm from "../../../../ui/GeneralPatientInfoForm";
import VitalSignsCard from "../../../../ui/VitalSignsCard";
import RecentCareActivitiesModal from "./RecentCareActivitiesModal";

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
  if (status === "doctor_active") return { text: "Active", style: "bg-green-100 text-green-600" };
  if (status === "closed") return { text: "Closed", style: "bg-gray-100 text-gray-500" };
  return { text: "Awaiting", style: "bg-amber-50 text-amber-500" };
};

const DoctorEncounterTable = () => {
  const { 
    encounters, 
    loading, 
    activeTab, 
    claimPatient,
    selectedPatientForWall,
    setSelectedPatientForWall,
    selectedPatientForActivities,
    setSelectedPatientForActivities
  } = useContext(DoctorEncounterContext);
  const navigate = useNavigate();
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // When patient wall is open
  if (selectedPatientForWall) {
    const encounter = selectedPatientForWall;
    const patientData = encounter.patient_info || {};
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

    const vitalsData = encounter.latest_vitals || encounter.vital_signs || encounter.vitals || {};
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

    const handleProceedToCall = async () => {
      setIsClaiming(true);
      const success = await claimPatient(encounter.sqid);
      setIsClaiming(false);
      if (success) {
        setShowClaimModal(false);
        setShowSuccessModal(true);
      }
    };

    const closeSuccessAndWall = () => {
      setShowSuccessModal(false);
      setSelectedPatientForWall(null);
      // Auto navigate to the outpatient dashboard and open this patient's details
      navigate("/hospital-doctors-patients-dashboard", { 
        state: { openOutpatient: encounter } 
      });
    };

    return (
      <div className="w-full bg-white ">
        <div 
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedPatientForWall(null)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            <h2 className="font-medium text-docuhealth-primary">Patient's Wall</h2>
          </div>
          
          {activeTab === "Pending" && (
            <button 
              onClick={() => setShowClaimModal(true)}
              className="bg-docuhealth-primary text-white hover:bg-docuhealth-primary/90 px-6 py-2 rounded-full font-medium text-sm transition-colors"
            >
              Call patient from queue
            </button>
          )}
        </div>
        
        <GeneralPatientInfoForm patient={mappedPatient} />
        <VitalSignsCard vitalSigns={mockVitals} title="Latest vital signs" />

        {/* Claim Confirmation Modal */}
        <Modal
          isOpen={showClaimModal}
          onClose={() => setShowClaimModal(false)}
          maxWidth="md"
        >
          <div className="flex flex-col items-center relative ">
            {/* Close Button */}
            <button
              onClick={() => setShowClaimModal(false)}
              disabled={isClaiming}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Info Icon */}
            <div className=" border-docuhealth-dark flex items-center justify-center text-docuhealth-dark mt-3 ">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.0026 36.6654C10.7979 36.6654 3.33594 29.2034 3.33594 19.9987C3.33594 10.7939 10.7979 3.33203 20.0026 3.33203C29.2073 3.33203 36.6693 10.7939 36.6693 19.9987C36.6693 29.2034 29.2073 36.6654 20.0026 36.6654ZM20.0026 33.332C27.3664 33.332 33.3359 27.3625 33.3359 19.9987C33.3359 12.6349 27.3664 6.66536 20.0026 6.66536C12.6388 6.66536 6.66927 12.6349 6.66927 19.9987C6.66927 27.3625 12.6388 33.332 20.0026 33.332ZM21.6693 17.4987V24.9987H23.3359V28.332H16.6693V24.9987H18.3359V20.832H16.6693V17.4987H21.6693ZM22.5026 13.332C22.5026 14.7127 21.3833 15.832 20.0026 15.832C18.6219 15.832 17.5026 14.7127 17.5026 13.332C17.5026 11.9513 18.6219 10.832 20.0026 10.832C21.3833 10.832 22.5026 11.9513 22.5026 13.332Z" fill="#1B2B40"/>
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-md font-medium text-gray-900 mb-6 text-center">
              Call this patient?
            </h3>

            {/* Notice Box */}
            <div className="w-full border border-gray-100 rounded-2xl p-5 mb-8 text-gray-700 text-[15px] leading-relaxed shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
              By proceeding to call this patient from the queue you agree that you’re ready to attend to and start an encounter with this patient. This will transfer patient to the out-patient management section!
            </div>

            {/* Action Button */}
            <button
              onClick={handleProceedToCall}
              disabled={isClaiming}
              className="w-full py-2.5 rounded-full bg-docuhealth-primary text-white font-medium hover:bg-docuhealth-primary/90 transition-colors flex items-center justify-center gap-2 text-[15px]"
            >
              {isClaiming && <Spinner className="w-4 h-4" />}
              Proceed to call patient
            </button>
          </div>
        </Modal>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={closeSuccessAndWall}
          maxWidth="md"
        >
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center">
                <Check size={28} className="text-white" strokeWidth={3} />
              </div>
            </div>

            <p className="text-base font-semibold text-gray-800 mb-6 leading-snug">
              Patient is coming.<br />The patient has been called from the queue!
            </p>

            <Button
              onClick={closeSuccessAndWall}
              fullWidth
            >
              Continue
            </Button>
          </div>
        </Modal>
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
        title="No encounters found!" 
        description={`There are currently no patients in the ${activeTab.toLowerCase()} list.`} 
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
            <tr>
              <TableHead className="w-[20%] rounded-l-full border-y border-l border-gray-200 normal-case text-gray-700 pl-10">Patient</TableHead>
              {activeTab === "Active" ? (
                <>
                  <TableHead className="w-[15%] border-y border-gray-200 normal-case text-gray-700">Last Encounter Time</TableHead>
                  <TableHead className="w-[20%] border-y border-gray-200 normal-case text-gray-700">Last Doctor Encountered</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="w-[15%] border-y border-gray-200 normal-case text-gray-700">Wait Time</TableHead>
                  <TableHead className="w-[20%] border-y border-gray-200 normal-case text-gray-700">Nurse Encountered</TableHead>
                  <TableHead className="w-[15%] border-y border-gray-200 normal-case text-gray-700">Triage Priority</TableHead>
                </>
              )}
              <TableHead className="w-[15%] border-y border-gray-200 normal-case text-gray-700">Encounter Status</TableHead>
              <TableHead className="w-[15%] rounded-r-full border-y border-r border-gray-200 normal-case text-gray-700">Doctor's Action</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {encounters.map((encounter) => {
              const patientName = encounter.patient_info
                ? `${encounter.patient_info.firstname} ${encounter.patient_info.lastname}`
                : "Unknown Patient";
              
              const waitTime = moment().diff(moment(encounter.escalated_at || encounter.created_at), 'minutes');
              const formattedWaitTime = waitTime > 60 
                ? `${Math.floor(waitTime / 60)} hrs ${waitTime % 60} mins` 
                : `${waitTime} mins`;
              
              const nurseName = encounter.escalated_by 
                ? `Nurse ${encounter.escalated_by.firstname || encounter.escalated_by.first_name || ""} ${encounter.escalated_by.lastname || encounter.escalated_by.last_name || ""}` 
                : "Unknown";

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
                  {activeTab === "Active" ? (
                    <>
                      <TableCell className="text-gray-600 border-b border-gray-200">
                        {moment(encounter.last_doctor_interaction?.created_at || encounter.claimed_at || encounter.created_at).format("MMM DD, YYYY / hh:mm A")}
                      </TableCell>
                      <TableCell className="text-gray-600 border-b border-gray-200">
                        {encounter.last_doctor_interaction?.staff 
                          ? `Dr. ${encounter.last_doctor_interaction.staff.firstname || encounter.last_doctor_interaction.staff.first_name || ""} ${encounter.last_doctor_interaction.staff.lastname || encounter.last_doctor_interaction.staff.last_name || ""}`
                          : "None"}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="text-gray-600 border-b border-gray-200">
                        {activeTab === "Closed" 
                          ? moment(encounter.created_at).format("MMM DD, YYYY / hh:mm A")
                          : formattedWaitTime}
                      </TableCell>
                      <TableCell className="text-gray-600 border-b border-gray-200">
                        {nurseName}
                      </TableCell>
                      <TableCell className="border-b border-gray-200">
                        <span className={`text-sm font-medium capitalize ${getTriageColor(encounter.triage_priority)}`}>
                          {encounter.triage_priority || "Routine"}
                        </span>
                      </TableCell>
                    </>
                  )}
                  <TableCell className="border-b border-gray-200">
                    <span className={`px-3 py-1 rounded-md text-xs font-medium capitalize ${getCallUpStatus(encounter.status).style}`}>
                      {getCallUpStatus(encounter.status).text}
                    </span>
                  </TableCell>
                  <TableCell className="border-b border-gray-200">
                    <button 
                      onClick={() => activeTab === "Active" ? setSelectedPatientForActivities(encounter) : setSelectedPatientForWall(encounter)}
                      className="bg-blue-50 text-docuhealth-primary hover:bg-blue-100 px-7 py-3 rounded-full font-medium text-xs whitespace-nowrap transition-colors"
                    >
                      {activeTab === "Pending" ? "Open Patient's wall" : 
                       activeTab === "Active" ? "View recent Care Activities" : "View Details"}
                    </button>
                  </TableCell>
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
          
          const waitTime = moment().diff(moment(encounter.escalated_at || encounter.created_at), 'minutes');
          const formattedWaitTime = waitTime > 60 
            ? `${Math.floor(waitTime / 60)} hrs ${waitTime % 60} mins` 
            : `${waitTime} mins`;
            
          const nurseName = encounter.escalated_by 
            ? `Nurse ${encounter.escalated_by.firstname || encounter.escalated_by.first_name || ""} ${encounter.escalated_by.lastname || encounter.escalated_by.last_name || ""}` 
            : "Unknown";

          return (
            <div key={encounter.sqid || encounter.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 shadow-xs">
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-docuhealth-primary flex items-center justify-center font-bold text-sm">
                    {patientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-[14px] leading-tight mb-0.5">{patientName}</h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {moment(encounter.created_at).format("MMM DD, YYYY / hh:mm A")}
                    </p>
                  </div>
                </div>
                <span className={`text-[11px] font-medium capitalize ${getTriageColor(encounter.triage_priority)}`}>
                  {encounter.triage_priority || "Routine"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="flex flex-col bg-gray-50 rounded-lg p-2 border border-gray-100">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Encounter Status</span>
                  <span className={`self-start px-2 py-1 rounded-md text-[10px] font-medium capitalize ${getCallUpStatus(encounter.status).style}`}>
                    {getCallUpStatus(encounter.status).text}
                  </span>
                </div>

                {activeTab === "Active" ? (
                  <>
                    <div className="flex flex-col bg-gray-50 rounded-lg p-2 border border-gray-100">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Encounter</span>
                      <span className="text-xs font-bold text-gray-700">{moment(encounter.last_doctor_interaction?.created_at || encounter.claimed_at || encounter.created_at).format("hh:mm A")}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3 border border-gray-100 col-span-2">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Doctor Encountered
                      </span>
                      <span className="text-sm font-bold text-gray-700">
                        {encounter.last_doctor_interaction?.staff 
                          ? `Dr. ${encounter.last_doctor_interaction.staff.firstname || encounter.last_doctor_interaction.staff.first_name || ""} ${encounter.last_doctor_interaction.staff.lastname || encounter.last_doctor_interaction.staff.last_name || ""}`
                          : "None"}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col bg-gray-50 rounded-lg p-2 border border-gray-100">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Wait Time</span>
                      <span className="text-xs font-bold text-gray-700">{formattedWaitTime}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3 border border-gray-100 col-span-2">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Nurse Encountered
                      </span>
                      <span className="text-sm font-bold text-gray-700">
                        {nurseName}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2.5 mt-2">
                <button 
                  onClick={() => activeTab === "Active" ? setSelectedPatientForActivities(encounter) : setSelectedPatientForWall(encounter)}
                  className="w-full bg-blue-50 text-docuhealth-primary hover:bg-blue-100 py-2.5 rounded-full font-medium text-xs transition-colors"
                >
                  {activeTab === "Pending" ? "Open Patient's wall" : 
                   activeTab === "Active" ? "View recent Care Activities" : "View Details"}
                </button>
              </div>

            </div>
          );
        })}
      </div>
      
      {/* Recent Care Activities Modal */}
      <RecentCareActivitiesModal 
        isOpen={!!selectedPatientForActivities} 
        onClose={() => setSelectedPatientForActivities(null)} 
        encounter={selectedPatientForActivities} 
      />
    </>
  );
};

export default DoctorEncounterTable;
