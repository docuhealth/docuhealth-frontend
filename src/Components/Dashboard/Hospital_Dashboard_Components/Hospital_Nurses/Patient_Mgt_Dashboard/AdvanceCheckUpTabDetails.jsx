import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPatientAdmissionNotes } from "../../../../../queries/Hospital/nurse/patientHistory";
import VitalSignsCard from "../../../../ui/VitalSignsCard";
import SharedSoapNotes from "./SharedSoapNotes";
import NursingTasksQueue from "./NursingTasksQueue";
import NursingTaskHistory from "./NursingTaskHistory";
import PatientVitalsAndMeds from "./PatientVitalsAndMeds";
import CarePlanHistory from "./CarePlanHistory";
import AdmissionNotesHistory from "./AdmissionNotesHistory";
import VitalSignsHistory from "./VitalSignsHistory";

const PatientInfoContent = ({ patient, admission, patientFullInfo, formatDate, formatDateTime, isOutPatient }) => {
    const isDischargedInpatient = !isOutPatient && (Boolean(admission?.discharge_date) || admission?.status === "inpatient_discharge");

    // Discharge rows don't carry the requesting doctor; this admission's nursing note does
    const { data: admissionNotes } = useQuery({
        queryKey: ["patient-admission-notes", patient?.hin],
        queryFn: () => fetchPatientAdmissionNotes(patient?.hin),
        enabled: isDischargedInpatient && !admission?.requested_by_info && !!patient?.hin,
        staleTime: 5 * 60 * 1000,
    });
    const doctorInCharge = admission?.requested_by_info
        || (admissionNotes || []).find((n) => n?.admission_info?.sqid === admission?.sqid)?.admission_info?.requested_by_info;

    return (
        <div className="space-y-6">
            {/* General Information */}
            <div className="bg-gray-50 rounded-xl border p-6">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-semibold text-gray-800">General information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-gray-600 font-medium">First Name</label>
                        <input type="text" readOnly value={patient?.firstname || ''} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-gray-600 font-medium">Last name</label>
                        <input type="text" readOnly value={patient?.lastname || ''} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-gray-600 font-medium">Date of birth</label>
                        <input type="text" readOnly value={formatDate(patient?.dob)} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-gray-600 font-medium">Email address</label>
                        <input type="text" readOnly value={patient?.email || 'N/A'} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-gray-600 font-medium">Phone number</label>
                        <input type="text" readOnly value={patient?.phone_num || ''} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-gray-600 font-medium">Home address</label>
                        <input type="text" readOnly value={patient?.street ? `${patient.street}, ${patient.state || ''}` : 'N/A'} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                    </div>
                    
                    {isDischargedInpatient && (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-600 font-medium">Date/time of admission</label>
                                <input type="text" readOnly value={formatDateTime(admission?.created_at)} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-600 font-medium">Discharge date/time</label>
                                <input type="text" readOnly value={formatDateTime(admission?.discharge_date)} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-600 font-medium">Ward placed</label>
                                <input type="text" readOnly value={admission?.ward_info?.name ? `${admission.ward_info.name} ward` : 'N/A'} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-600 font-medium">Assigned bed</label>
                                <input type="text" readOnly value={admission?.bed_info?.bed_number ? `Bed ${admission.bed_info.bed_number}` : 'N/A'} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-600 font-medium">Doctor in charge</label>
                                <input type="text" readOnly value={doctorInCharge ? `Dr. ${doctorInCharge.firstname} ${doctorInCharge.lastname}` : 'N/A'} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-600 font-medium">Gender</label>
                                <input type="text" readOnly value={patient?.gender || 'N/A'} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Admission Information for Active Patients */}
            {!isDischargedInpatient && (
                <div className="bg-gray-50 rounded-xl border p-6">
                    <h3 className="font-semibold text-gray-800 mb-5">Admission information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm text-gray-600 font-medium">Admitting doctor</label>
                            <input type="text" readOnly value={admission?.requested_by_info ? `Dr. ${admission.requested_by_info.firstname} ${admission.requested_by_info.lastname}` : 'N/A'} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm text-gray-600 font-medium">Date/Time of Admission</label>
                            <input type="text" readOnly value={formatDateTime(admission?.created_at)} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm text-gray-600 font-medium">Ward</label>
                            <input type="text" readOnly value={admission?.ward_info?.name ? `${admission.ward_info.name} ward` : 'N/A'} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm text-gray-600 font-medium">Bed</label>
                            <input type="text" readOnly value={admission?.bed_info?.bed_number ? `Bed ${admission.bed_info.bed_number}` : 'N/A'} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-sm text-gray-600 font-medium">Admission diagnosis</label>
                            <textarea readOnly value={admission?.diagnosis || 'N/A'} rows={2} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none resize-none" />
                        </div>
                    </div>
                </div>
            )}

            {/* Ongoing Medication for Discharged Patients */}
            {isDischargedInpatient && (
                <div className="bg-gray-50 rounded-xl border p-6">
                    <h3 className="font-semibold text-gray-800 mb-5">
                    Ongoing medication ({patientFullInfo?.ongoing_drugs?.length || 0})
                    </h3>
                    
                    {patientFullInfo?.ongoing_drugs?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {patientFullInfo.ongoing_drugs.map((drug, index) => (
                        <div key={index} className="border border-gray-100 p-4 rounded-lg bg-white shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.1861 2.81611C14.7481 4.3782 14.7481 6.91088 13.1861 8.47295L11.7713 9.88668L8.47199 13.187C6.90986 14.7491 4.37722 14.7491 2.81512 13.187C1.25303 11.6249 1.25303 9.09228 2.81512 7.53015L7.52919 2.81611C9.09126 1.25401 11.6239 1.25401 13.1861 2.81611ZM9.88619 9.88715L6.11496 6.11593L3.75794 8.47295C2.71654 9.51435 2.71654 11.2028 3.75794 12.2442C4.79933 13.2856 6.48777 13.2856 7.52919 12.2442L9.88619 9.88715Z" fill="#EE1414"/>
                                </svg>
                                <p className="font-medium text-gray-800 text-[13px]">{drug.name || "Unknown Drug"}</p>
                            </div>
                            <span className="bg-blue-50 text-docuhealth-primary px-3 py-0.5 rounded-full text-[11px] font-medium">
                                Ongoing
                            </span>
                            </div>

                            <div className="space-y-2 text-[12px] text-gray-500">
                            <div className="flex justify-between">
                                <p>Dosage:</p>
                                <p className="font-medium text-gray-800">{drug.quantity ? `${drug.quantity} ${drug.unit || ""}`.trim() : "N/A"}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Frequency:</p>
                                <p className="font-medium text-gray-800">
                                {drug.frequency ? `${drug.frequency.value}x ${drug.frequency.rate}` : "N/A"}
                                </p>
                            </div>
                            <div className="flex justify-between">
                                <p>Duration:</p>
                                <p className="font-medium text-gray-800">
                                {drug.duration ? `${drug.duration.value} ${drug.duration.rate}` : "N/A"}
                                </p>
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    ) : (
                    <div className="py-8 text-center text-gray-500 text-sm">
                        No ongoing medications.
                    </div>
                    )}
                </div>
            )}
        </div>
    );
};

const StayScopeSwitch = ({ historyScope, setHistoryScope, admission, formatDateTime }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 bg-gray-50 border rounded-lg px-4 py-3">
        <p className="text-xs text-gray-600">
            {historyScope === "stay"
                ? `Showing records from this admission: ${formatDateTime(admission?.created_at)} to ${formatDateTime(admission?.discharge_date)}`
                : "Showing this patient's full history at this hospital"}
        </p>
        <div className="flex bg-white border rounded-full p-0.5 text-xs font-medium shrink-0">
            {[["stay", "This admission"], ["all", "All history"]].map(([value, label]) => (
                <button
                    key={value}
                    onClick={() => setHistoryScope(value)}
                    className={`px-3 py-1.5 rounded-full cursor-pointer transition-colors ${historyScope === value ? "bg-docuhealth-primary text-white" : "text-gray-600 hover:text-gray-800"}`}
                >
                    {label}
                </button>
            ))}
        </div>
    </div>
);

export const getAdvanceCheckUpTabs = (patient, admission, patientFullInfo, formatDate, formatDateTime, setSharedSoapNoteDetail, isOutPatient = false, setAdvanceCheckUp = null, historyScope = "all", setHistoryScope = null) => {
    const isDischargedStay = !isOutPatient && Boolean(admission?.discharge_date && admission?.created_at);
    // Out-patient discharge rows have no start time, so only in-patient stays can be scoped
    const stayWindow = isDischargedStay && historyScope === "stay"
        ? { start: admission.created_at, end: admission.discharge_date }
        : null;
    const withScope = (content) => (isDischargedStay && setHistoryScope ? (
        <>
            <StayScopeSwitch historyScope={historyScope} setHistoryScope={setHistoryScope} admission={admission} formatDateTime={formatDateTime} />
            {content}
        </>
    ) : content);

    const tabs = [
        {
            title: "Patient's information",
            status: "info",
            content: (
                <PatientInfoContent 
                    patient={patient}
                    admission={admission}
                    patientFullInfo={patientFullInfo}
                    formatDate={formatDate}
                    formatDateTime={formatDateTime}
                    isOutPatient={isOutPatient}
                />
            )
        },
        {
            title: "Nursing tasks",
            status: "tasks",
            content: (
                <NursingTasksQueue setAdvanceCheckUp={setAdvanceCheckUp} admission={admission} patientFullInfo={patientFullInfo} taskStatus="pending" />
            )
        },
        {
            title: "In Progress tasks",
            status: "in_progress_tasks",
            content: (
                <NursingTasksQueue setAdvanceCheckUp={setAdvanceCheckUp} admission={admission} patientFullInfo={patientFullInfo} taskStatus="in_progress" />
            )
        },
        {
            title: "Task history",
            status: "task_history",
            content: (
                <NursingTasksQueue setAdvanceCheckUp={setAdvanceCheckUp} admission={admission} patientFullInfo={patientFullInfo} taskStatus="history" />
            )
        },
        {
            title: "Shared soap notes",
            status: "soap",
            content: withScope(
                <SharedSoapNotes 
                    key={stayWindow ? "stay" : "all"}
                    selected={admission}
                    setSharedSoapNoteHistory={() => {}}
                    setSharedSoapNoteDetail={setSharedSoapNoteDetail}
                    stayWindow={stayWindow}
                />
            )
        },
    
        {
            title: "Care plan history",
            status: "care_plan_history",
            content: (
                <CarePlanHistory patient={patient} patientFullInfo={patientFullInfo} />
            )
        },
        {
            title: "Admission notes history",
            status: "admission_notes_history",
            content: withScope(
                <AdmissionNotesHistory patient={patient} patientFullInfo={patientFullInfo} admissionSqid={stayWindow ? admission?.sqid : null} />
            )
        },
        {
            title: "Vital signs history",
            status: "vitals_history",
            content: withScope(
                <VitalSignsHistory key={stayWindow ? "stay" : "all"} selected={admission} setVitalSignsHistory={() => {}} embedded stayWindow={stayWindow} />
            )
        },
        {
            title: "View latest facility vitals / others",
            status: "latest_vitals",
            content: (
                <PatientVitalsAndMeds patientFullInfo={patientFullInfo} formatDateTime={formatDateTime} />
            )
        }
    ];

    // Discharged patients get read-only history; active ones reach vitals history via the header dropdown
    if (isOutPatient) {
        const isDischargedOutpatient = Boolean(admission?.closed_at || admission?.discharge_date);
        return tabs.filter(t => t.status === "info" || t.status === "soap" || (isDischargedOutpatient && t.status === "vitals_history"));
    }

    const isDischargedInpatient = Boolean(admission?.discharge_date) || admission?.status === "inpatient_discharge";
    if (isDischargedInpatient) {
        return tabs.filter(t => ["info", "soap", "vitals_history", "admission_notes_history"].includes(t.status));
    }

    return tabs.filter(t => t.status !== "vitals_history");
};
