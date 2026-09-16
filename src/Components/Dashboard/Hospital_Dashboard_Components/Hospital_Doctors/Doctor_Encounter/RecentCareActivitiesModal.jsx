import React, { useEffect, useState } from "react";
import moment from "moment";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import Modal from "../../../../ui/Modal";
import Spinner from "../../../../ui/Spinner";
import SoapNoteDetailView from "../../../../ui/SoapNoteDetailView";
import VitalSignsCard from "../../../../ui/VitalSignsCard";
import NursingAssessmentDetailView from "../../../../ui/NursingAssessmentDetailView";
import AdmissionDetailView from "../../../../ui/AdmissionDetailView";
import LabOrderDetailView from "../../../../ui/LabOrderDetailView";
import {
  fetchRecentCareActivities,
  fetchMedicalRecordDetail,
} from "../../../../../queries/Hospital/doctor/activities";

// Record types with a real detail view wired up — everything else still
// falls back to the "not available yet" toast.
const VIEWABLE_RECORD_TYPES = new Set([
  "SoapNote",
  "VitalSigns",
  "NursingAssessment",
  "Admission",
  "LabTestOrder",
]);

const RecentCareActivitiesModal = ({ isOpen, onClose, encounter }) => {
  const patientData = encounter?.patient_info || {};
  const hin = patientData.hin;

  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ["recent-care-activities", hin],
    queryFn: fetchRecentCareActivities,
    enabled: !!hin && isOpen,
  });

  const activities = activitiesData?.results || [];

  // Set when a viewable record's "View X" link is clicked — opens the full
  // record inline instead of the "not available yet" toast. `eventSqid` is
  // the activity's own top-level sqid (see fetchMedicalRecordDetail), not
  // the record's sqid.
  const [viewingRecord, setViewingRecord] = useState(null); // { type, eventSqid } | null

  // This modal is a single long-lived instance the parent just toggles
  // `isOpen`/`encounter` on, rather than mounting fresh per patient — so
  // reset back to the timeline on close (and defensively on patient change)
  // or the next patient opened would inherit the previous one's detail view.
  useEffect(() => {
    setViewingRecord(null);
  }, [isOpen, hin]);

  const { data: viewingRecordData, isLoading: isLoadingRecordDetail } = useQuery({
    queryKey: [
      "medical-record-detail",
      viewingRecord?.type,
      viewingRecord?.eventSqid,
    ],
    queryFn: fetchMedicalRecordDetail,
    enabled: !!hin && isOpen && !!viewingRecord?.eventSqid,
  });

  const patientName =
    `${patientData.firstname || patientData.first_name || ""} ${patientData.lastname || patientData.last_name || ""}`.trim() ||
    "N/A";

  // Custom header to match the mockup
  const renderHeader = () => (
    <div className="flex items-start justify-between p-6 border-b border-gray-100">
      <div>
        <h3 className="text-xl font-bold text-gray-900">
          Recent care activities
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          View all recent care activities performed by you and other care
          providers.
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );

  const getRecordTitle = (type, action) => {
    switch (type) {
      case "LabTestOrder":
        return "Lab test ordered for this patient!";
      case "SoapNote":
        return "SOAP note recorded for this patient!";
      case "CheckIn":
        return "Patient checked in!";
      case "Admission":
        // Requesting an admission doesn't admit the patient — the
        // receptionist still has to confirm it before a bed is assigned.
        return action === "requested"
          ? "Admission requested for this patient!"
          : "Patient admitted!";
      case "Appointment":
        return "Appointment scheduled!";
      case "EncounterCard":
        return "Encounter card created for this patient!";
      case "VitalSigns":
        return "Vital signs recorded for this patient!";
      case "NursingAssessment":
        return "Nursing Assessment recorded for this patient!";
      default:
        return `${type} recorded for this patient!`;
    }
  };

  const getRecordLinkText = (type, action) => {
    switch (type) {
      case "LabTestOrder":
        return "View Lab order";
      case "SoapNote":
        return "View SOAP note";
      case "CheckIn":
        return "View Check-in";
      case "Admission":
        return action === "requested" ? "View Admission request" : "View Admission";
      case "Appointment":
        return "View Appointment";
      case "EncounterCard":
        return "View Encounter card";
      case "VitalSigns":
        return "View Vital signs";
      case "NursingAssessment":
        return "View Nursing Assessment";
      default:
        return `View ${type}`;
    }
  };

  const getActionPhrase = (staff, action, recordType) => {
    const staffName =
      `${staff.firstname || ""} ${staff.lastname || ""}`.trim() ||
      "A staff member";
    let actionText = action || "created";

    // Customize text based on record type
    if (recordType === "LabTestOrder") {
      actionText = "made a lab order";
    } else if (recordType === "SoapNote") {
      actionText = "created a SOAP note";
    } else if (recordType === "CheckIn") {
      actionText = "checked in the patient";
    } else if (recordType === "Admission") {
      // "requested" means the doctor asked for an admission; the patient
      // isn't actually admitted until the receptionist confirms it.
      actionText = action === "requested" ? "requested to admit the patient" : "admitted the patient";
    } else if (recordType === "Appointment") {
      actionText = "scheduled an appointment";
    } else if (recordType === "EncounterCard") {
      actionText = "created an encounter card";
    } else if (recordType === "VitalSigns") {
      actionText = "recorded vital signs";
    }

    return (
      <>
        <span className="font-semibold text-gray-800">{staffName}</span>{" "}
        <span className="text-gray-500 text-sm">{actionText}</span>
      </>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="7xl"
      className="!p-0 overflow-hidden"
    >
      {renderHeader()}

      <div className="flex flex-col md:flex-row h-[75vh]">
        {/* Left Sidebar: Patient Info */}
        <div className="w-full md:w-[30%] bg-gray-50/50 border-r border-gray-100 p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <User className="w-4 h-4" />
              <span className="text-sm font-semibold">Full name</span>
            </div>
            <p className="text-sm text-gray-800 ml-6">{patientName}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-semibold">Phone</span>
            </div>
            <p className="text-sm text-gray-800 ml-6">
              {patientData.phone_number || patientData.phone_num || "N/A"}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-semibold">Email</span>
            </div>
            <p className="text-sm text-gray-800 ml-6">
              {patientData.email || "N/A"}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-semibold">First encounter</span>
            </div>
            <p className="text-sm text-gray-800 ml-6">
              {encounter?.created_at
                ? moment(encounter.created_at).format("M/D/YYYY, h:mmA")
                : "N/A"}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm font-semibold">Payment category</span>
            </div>
            <p className="text-sm text-gray-800 ml-6 capitalize">
              {(patientData.payment_provider?.type ||
                patientData.payment_category ||
                patientData.patient_category ||
                "HMO") + " patient"}
            </p>
          </div>
        </div>

        {/* Right Sidebar: Timeline (or the record detail, once opened) */}
        <div className="w-full md:w-[70%] p-6 overflow-y-auto bg-white">
          {viewingRecord ? (
            <div>
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-docuhealth-primary mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to timeline
              </button>

              {isLoadingRecordDetail ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner className="w-8 h-8 text-docuhealth-primary" />
                </div>
              ) : !viewingRecordData ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-gray-500">Can&apos;t find this record.</p>
                </div>
              ) : viewingRecord.type === "SoapNote" ? (
                <SoapNoteDetailView soapNote={viewingRecordData} />
              ) : viewingRecord.type === "VitalSigns" ? (
                <VitalSignsCard
                  vitalSigns={viewingRecordData}
                  title={`Vital signs — recorded ${moment(viewingRecordData.created_at).format("Do MMMM, YYYY, h:mmA")}`}
                />
              ) : viewingRecord.type === "NursingAssessment" ? (
                <NursingAssessmentDetailView
                  nursingAssessment={viewingRecordData}
                />
              ) : viewingRecord.type === "Admission" ? (
                <AdmissionDetailView admission={viewingRecordData} />
              ) : viewingRecord.type === "LabTestOrder" ? (
                <LabOrderDetailView labOrder={viewingRecordData} />
              ) : null}
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner className="w-8 h-8 text-docuhealth-primary" />
            </div>
          ) : activities.length > 0 ? (
            <div className="flex flex-col gap-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {activities.map((activity, index) => {
                const staff = activity.staff_info || {};
                const staffInitials =
                  `${staff.firstname?.[0] || ""}${staff.lastname?.[0] || ""}`.toUpperCase() ||
                  "S";
                const record = activity.record || {};

                return (
                  <div
                    key={activity.sqid || index}
                    className="relative flex items-start gap-4"
                  >
                    {/* Timeline dot/avatar */}
                    <div className="z-10 flex items-center justify-center w-8 h-8 rounded-full bg-orange-400 text-white font-bold text-xs ring-4 ring-white shrink-0 mt-0.5">
                      {staffInitials}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        {getActionPhrase(staff, activity.action, record.type)}
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-gray-400 text-xs">
                          {moment(activity.created_at).fromNow()}
                        </span>
                      </div>

                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                        <p className="text-sm text-gray-800 mb-3">
                          {getRecordTitle(record.type, activity.action)} Time of order:{" "}
                          {moment(activity.created_at).format(
                            "Do MMMM, YYYY [at] h:mm A",
                          )}
                        </p>
                        <button
                          className="text-docuhealth-primary font-medium text-sm hover:underline"
                          onClick={() => {
                            if (
                              VIEWABLE_RECORD_TYPES.has(record.type) &&
                              activity.sqid
                            ) {
                              setViewingRecord({
                                type: record.type,
                                eventSqid: activity.sqid,
                              });
                            } else {
                              toast(
                                "Opening the full record from here isn't available yet.",
                                { icon: "🛠️" },
                              );
                            }
                          }}
                        >
                          {getRecordLinkText(record.type, activity.action)}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-gray-500">No recent care activities found.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RecentCareActivitiesModal;
