import React, { useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  ArrowLeft,
  ChevronRight,
  FileText,
  Pill,
  ClipboardList,
  HeartPulse,
  FlaskConical,
  ScanLine,
  BedDouble,
  CalendarDays,
} from "lucide-react";
import Modal from "../../../../ui/Modal";
import Spinner from "../../../../ui/Spinner";
import SoapNoteDetailView from "../../../../ui/SoapNoteDetailView";
import VitalSignsCard from "../../../../ui/VitalSignsCard";
import NursingAssessmentDetailView from "../../../../ui/NursingAssessmentDetailView";
import AdmissionDetailView from "../../../../ui/AdmissionDetailView";
import { renderLabTests, renderScans } from "../../../../../utils/soapNoteHelpers";
import {
  fetchRecentCareActivities,
  fetchMedicalRecordDetail,
} from "../../../../../queries/Hospital/doctor/activities";

// Record types with a real detail view wired up. Orders and requests
// (LabTestOrder, AdmissionRequest, ...) are no longer in the feed.
const VIEWABLE_RECORD_TYPES = new Set([
  "SoapNote",
  "VitalSigns",
  "NursingAssessment",
  "Admission",
  "LabTestResult",
  "ScanResult",
]);

const RECORD_ICONS = {
  SoapNote: { Icon: FileText, tone: "text-blue-600 bg-blue-50" },
  DrugRecord: { Icon: Pill, tone: "text-violet-600 bg-violet-50" },
  NursingAssessment: { Icon: ClipboardList, tone: "text-emerald-600 bg-emerald-50" },
  VitalSigns: { Icon: HeartPulse, tone: "text-rose-600 bg-rose-50" },
  LabTestResult: { Icon: FlaskConical, tone: "text-amber-600 bg-amber-50" },
  ScanResult: { Icon: ScanLine, tone: "text-cyan-600 bg-cyan-50" },
  Admission: { Icon: BedDouble, tone: "text-indigo-600 bg-indigo-50" },
  Appointment: { Icon: CalendarDays, tone: "text-sky-600 bg-sky-50" },
};
const DEFAULT_RECORD_ICON = { Icon: FileText, tone: "text-gray-600 bg-gray-100" };

const ROLE_STYLES = {
  doctor: { avatar: "bg-docuhealth-primary text-white", badge: "bg-blue-50 text-docuhealth-primary" },
  nurse: { avatar: "bg-emerald-500 text-white", badge: "bg-emerald-50 text-emerald-700" },
};
const DEFAULT_ROLE_STYLE = { avatar: "bg-orange-400 text-white", badge: "bg-orange-50 text-orange-700" };

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "");

// "NurseInpatientDischargeForm" -> "Nurse inpatient discharge form"; acronyms like "IV" stay uppercase.
const humanizeType = (type) => {
  if (!type) return "Record";
  const words = String(type)
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim()
    .split(/\s+/);
  return words
    .map((w, i) => {
      if (w.length > 1 && w === w.toUpperCase()) return w;
      const lower = w.toLowerCase();
      return i === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
    })
    .join(" ");
};

const getRecordLabel = (type, action) => {
  switch (type) {
    case "SoapNote":
      return "Encounter note";
    case "LabTestResult":
      return "Lab result";
    case "ScanResult":
      return "Scan result";
    case "DrugRecord":
      return "Medication";
    case "Admission":
      // Requesting an admission doesn't admit the patient; the receptionist still has to accept it.
      return action === "requested" ? "Admission request" : "Admission";
    case "EncounterCard":
      return "Encounter card";
    case "VitalSigns":
      return "Vital signs";
    case "NursingAssessment":
      return "Nursing assessment";
    case "CaseNote":
      return "Case note";
    case "CarePlan":
      return "Care plan";
    default:
      return humanizeType(type);
  }
};

const getActionText = (type, action) => {
  switch (type) {
    case "SoapNote":
      return "created an encounter note";
    case "LabTestResult":
      return "recorded a lab result";
    case "ScanResult":
      return "recorded a scan result";
    case "CarePlan":
      return "created a care plan";
    case "CaseNote":
      return "wrote a case note";
    case "DrugRecord":
      return action === "task_completed" ? "gave a medication" : "recorded a medication";
    case "Admission":
      return action === "requested" ? "requested to admit the patient" : "admitted the patient";
    case "Appointment":
      return "scheduled an appointment";
    case "EncounterCard":
      return "created an encounter card";
    case "VitalSigns":
      return "recorded vital signs";
    case "NursingAssessment":
      return "recorded a nursing assessment";
    default:
      return `recorded ${getRecordLabel(type, action).toLowerCase()}`;
  }
};

const formatDayHeading = (day) => {
  if (day.isSame(moment(), "day")) return "Today";
  if (day.isSame(moment().subtract(1, "day"), "day")) return "Yesterday";
  return day.format("ddd, D MMM YYYY");
};

const PatientField = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3 min-w-0">
    <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-800 break-words">{children}</p>
    </div>
  </div>
);

const RecentCareActivitiesModal = ({ isOpen, onClose, encounter }) => {
  const patientData = encounter?.patient_info || {};
  const hin = patientData.hin;

  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ["recent-care-activities", hin],
    queryFn: fetchRecentCareActivities,
    enabled: !!hin && isOpen,
  });

  const activities = useMemo(() => activitiesData?.results || [], [activitiesData]);

  // Newest-first feed split into day groups for the timeline headings
  const activityGroups = useMemo(() => {
    const groups = [];
    activities.forEach((activity) => {
      const day = moment(activity.created_at);
      const key = day.format("YYYY-MM-DD");
      const last = groups[groups.length - 1];
      if (last?.key === key) last.items.push(activity);
      else groups.push({ key, day, items: [activity] });
    });
    return groups;
  }, [activities]);

  // Set when a viewable record's "View X" link is clicked; `eventSqid` is
  // the activity's own top-level sqid (see fetchMedicalRecordDetail), not
  // the record's sqid.
  const [viewingRecord, setViewingRecord] = useState(null); // { type, eventSqid } | null

  // This modal is a single long-lived instance the parent just toggles
  // `isOpen`/`encounter` on, so reset back to the timeline on close (and on
  // patient change) or the next patient would inherit the previous detail view.
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

  // Below lg the patient card and timeline share one scroll, so bring the opened record (or the timeline) to the top
  const bodyRef = useRef(null);
  const sectionRef = useRef(null);
  useEffect(() => {
    const body = bodyRef.current;
    const section = sectionRef.current;
    if (!body || !section || window.matchMedia("(min-width: 1024px)").matches) return;
    if (viewingRecord || body.scrollTop > section.offsetTop) body.scrollTop = section.offsetTop;
    // Re-run once the record loads: while the spinner shows, the body is too short to scroll
  }, [viewingRecord, isLoadingRecordDetail]);

  const firstName = patientData.firstname || patientData.first_name || "";
  const lastName = patientData.lastname || patientData.last_name || "";
  const patientName = `${firstName} ${lastName}`.trim() || "N/A";
  const patientInitials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "P";

  const paymentType = patientData.payment_provider?.type || patientData.payment_category || patientData.patient_category;
  const paymentLabel = paymentType
    ? `${paymentType.toLowerCase() === "hmo" ? "HMO" : capitalize(paymentType)} patient`
    : "N/A";

  const renderRecordDetail = () => {
    if (isLoadingRecordDetail) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spinner className="w-8 h-8 text-docuhealth-primary" />
        </div>
      );
    }
    if (!viewingRecordData) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500">Can&apos;t find this record.</p>
        </div>
      );
    }
    switch (viewingRecord.type) {
      case "SoapNote":
        return <SoapNoteDetailView soapNote={viewingRecordData} />;
      case "VitalSigns":
        return (
          <VitalSignsCard
            vitalSigns={viewingRecordData}
            title={`Vital signs, recorded ${moment(viewingRecordData.created_at).format("Do MMMM, YYYY, h:mmA")}`}
          />
        );
      case "NursingAssessment":
        return <NursingAssessmentDetailView nursingAssessment={viewingRecordData} />;
      case "Admission":
        return <AdmissionDetailView admission={viewingRecordData} />;
      case "LabTestResult":
        // The event returns the lab result itself (`item` is only the order item's sqid); like on SOAP notes, only an accepted result is shown.
        return renderLabTests([{
          sqid: viewingRecordData.item,
          test_info: { name: "Lab result" },
          status: viewingRecordData.status === "accepted" ? "completed"
            : viewingRecordData.status?.includes("rejected") ? "rejected" : "result_ready",
          result_info: viewingRecordData.status === "accepted" ? viewingRecordData : null,
        }]);
      case "ScanResult":
        // The event returns the scan result itself; like on SOAP notes, only an approved result is shown.
        return renderScans([{
          items_info: [{
            sqid: viewingRecordData.sqid,
            scan_info: { name: "Scan result" },
            status: viewingRecordData.status === "approved" ? "completed" : viewingRecordData.status,
            rejection_reason: viewingRecordData.rejection_reason,
            result_info: viewingRecordData.status === "approved" ? viewingRecordData : null,
          }],
        }]);
      default:
        return null;
    }
  };

  const renderActivity = (activity, isLastInGroup) => {
    const staff = activity.staff_info || {};
    const role = (staff.role || "").toLowerCase();
    const roleStyle = ROLE_STYLES[role] || DEFAULT_ROLE_STYLE;
    const fullName = `${staff.firstname || ""} ${staff.lastname || ""}`.trim();
    const staffName = fullName ? `${role === "doctor" ? "Dr. " : ""}${fullName}` : "A staff member";
    const staffInitials = `${staff.firstname?.[0] || ""}${staff.lastname?.[0] || ""}`.toUpperCase() || "S";
    const roleLabel = [capitalize(staff.role), capitalize(staff.specialization)].filter(Boolean).join(" · ");

    const record = activity.record || {};
    const label = getRecordLabel(record.type, activity.action);
    const { Icon, tone } = RECORD_ICONS[record.type] || DEFAULT_RECORD_ICON;
    const canView = VIEWABLE_RECORD_TYPES.has(record.type) && !!activity.sqid;
    const time = moment(activity.created_at);

    return (
      <li key={activity.sqid || activity.created_at} className={`relative pl-11 sm:pl-12 ${isLastInGroup ? "" : "pb-6"}`}>
        {!isLastInGroup && <span aria-hidden className="absolute left-4 top-9 bottom-0 w-px bg-gray-200" />}
        <span
          className={`absolute left-0 top-0 flex items-center justify-center w-8 h-8 rounded-full text-[11px] font-semibold ring-4 ring-white ${roleStyle.avatar}`}
        >
          {staffInitials}
        </span>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-h-8">
          <span className="font-semibold text-gray-900 text-sm">{staffName}</span>
          {roleLabel && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${roleStyle.badge}`}>{roleLabel}</span>
          )}
          <span className="text-sm text-gray-500">{getActionText(record.type, activity.action)}</span>
          <time
            dateTime={activity.created_at}
            title={time.format("Do MMMM YYYY, h:mm A")}
            className="ml-auto text-xs text-gray-400 whitespace-nowrap"
          >
            {time.format("h:mm A")}
          </time>
        </div>

        <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/70 p-3 sm:p-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${tone}`}>
              <Icon className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-500">Recorded {time.format("D MMM YYYY, h:mm A")}</p>
            </div>
          </div>
          {canView ? (
            <button
              type="button"
              onClick={() => setViewingRecord({ type: record.type, eventSqid: activity.sqid })}
              className="sm:ml-auto inline-flex items-center justify-center gap-1 w-full sm:w-auto rounded-full border border-docuhealth-primary/30 px-4 py-2 sm:py-1.5 text-sm font-medium text-docuhealth-primary hover:bg-docuhealth-primary/5 transition-colors whitespace-nowrap"
            >
              View {label.toLowerCase()}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="sm:ml-auto text-xs text-gray-400">Details not viewable here yet</span>
          )}
        </div>
      </li>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="6xl"
      className="overflow-hidden"
    >
      {/* -m-5 cancels Modal's built-in body padding so the panes reach the edges */}
      <div className="-m-5 flex flex-col h-[min(88dvh,860px)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 shrink-0">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Recent care activities</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              All recent care activities performed by you and other care providers.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:bg-gray-100 p-2 -mr-2 rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Below lg everything scrolls as one column; from lg the two panes scroll on their own */}
        <div ref={bodyRef} className="relative flex-1 min-h-0 overflow-y-auto lg:overflow-hidden lg:grid lg:grid-cols-[300px_1fr]">
          <aside className="bg-gray-50/60 border-b lg:border-b-0 lg:border-r border-gray-100 p-4 sm:p-6 lg:overflow-y-auto">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-11 h-11 rounded-full bg-docuhealth-primary/10 text-docuhealth-primary font-semibold shrink-0">
                {patientInitials}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{patientName}</p>
                {hin && <p className="text-xs text-gray-500">HIN {hin}</p>}
              </div>
            </div>

            <div className="mt-4 sm:mt-5 grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-3 sm:gap-y-4">
              <PatientField icon={Phone} label="Phone">
                {patientData.phone_number || patientData.phone_num || "N/A"}
              </PatientField>
              <div className="col-span-2 sm:col-span-1 order-first sm:order-none">
                <PatientField icon={Mail} label="Email">
                  <span className="break-all">{patientData.email || "N/A"}</span>
                </PatientField>
              </div>
              <PatientField icon={Calendar} label="First encounter">
                {encounter?.created_at ? moment(encounter.created_at).format("D MMM YYYY, h:mm A") : "N/A"}
              </PatientField>
              <PatientField icon={CreditCard} label="Payment category">
                {paymentLabel}
              </PatientField>
            </div>
          </aside>

          <section ref={sectionRef} className="p-4 sm:p-6 lg:overflow-y-auto">
            {viewingRecord ? (
              <div>
                <div className="sticky -top-4 sm:-top-6 z-10 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-4 px-4 sm:px-6 py-3 bg-white border-b border-gray-100">
                  <button
                    type="button"
                    onClick={() => setViewingRecord(null)}
                    className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-docuhealth-primary"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to timeline
                  </button>
                </div>
                {renderRecordDetail()}
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner className="w-8 h-8 text-docuhealth-primary" />
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-8">
                {activityGroups.map((group) => (
                  <div key={group.key}>
                    <div className="flex items-baseline justify-between gap-3 mb-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {formatDayHeading(group.day)}
                      </h4>
                      <span className="text-xs text-gray-400">{group.day.fromNow()}</span>
                    </div>
                    <ol>
                      {group.items.map((activity, i) => renderActivity(activity, i === group.items.length - 1))}
                    </ol>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ClipboardList className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No recent care activities found.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </Modal>
  );
};

export default RecentCareActivitiesModal;
