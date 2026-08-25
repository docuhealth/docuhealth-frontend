import React, { useMemo, useState } from "react";
import { BookOpen, Stethoscope, BedDouble, CalendarClock, UserCheck, Search, ChevronDown, X } from "lucide-react";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import Input from "../../../../ui/Input";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";
import AddHandoverNoteForm from "./AddHandoverNoteForm";
import HandoverNoteDetailPage from "./HandoverNoteDetailPage";
import SelectHandoverDoctorModal from "./SelectHandoverDoctorModal";

const PAGE_SIZE = 6;
const HANDOVER_NOTE_KEYS = [
  "handed_over_to",
  "working_diagnosis",
  "current_clinical_status",
  "critical_events",
  "outstanding_investigations",
  "pending_procedures",
  "pending_consult_reviews",
  "clinical_concerns",
  "management_plan",
];

// Placeholder content only — there's no backend endpoint yet for listing
// real handover notes (see the component note below), so the list opens
// pre-populated with dummy entries instead of an empty state.
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const DUMMY_NOTES_DATA = [
  {
    handed_over_to: "Dr. Heritech Ruach",
    working_diagnosis: "Community-acquired pneumonia",
    current_clinical_status: "Stable, on supplemental oxygen",
    critical_events: "None",
    outstanding_investigations: "Repeat chest X-ray",
    pending_procedures: "None",
    pending_consult_reviews: "Respiratory medicine",
    clinical_concerns: "Monitor SpO2 overnight",
    management_plan: "Continue IV antibiotics, wean oxygen as tolerated",
  },
  {
    handed_over_to: "Dr. Amaka Chukwu",
    working_diagnosis: "Persistent lower back pain",
    current_clinical_status: "Lumbar Strain (M54.5)",
    critical_events: "None",
    outstanding_investigations: "None",
    pending_procedures: "Physical therapy, pain management",
    pending_consult_reviews: "Physiotherapy",
    clinical_concerns: "Pain management",
    management_plan: "Physical therapy, pain management",
  },
  {
    handed_over_to: "Dr. Tunde Bakare",
    working_diagnosis: "Post-op appendectomy recovery",
    current_clinical_status: "Improving, afebrile",
    critical_events: "None",
    outstanding_investigations: "Full blood count",
    pending_procedures: "Wound dressing change",
    pending_consult_reviews: "Surgical team",
    clinical_concerns: "Watch surgical site for infection",
    management_plan: "Continue analgesia, mobilize as tolerated",
  },
  {
    handed_over_to: "Dr. Heritech Ruach",
    working_diagnosis: "Hypertension, uncontrolled",
    current_clinical_status: "BP trending down on current regimen",
    critical_events: "BP dropped below 100/60 at 2am, notified on-call",
    outstanding_investigations: "U&E, renal panel",
    pending_procedures: "None",
    pending_consult_reviews: "Cardiology",
    clinical_concerns: "Recheck BP every 2 hours",
    management_plan: "Hold antihypertensives pending cardiology review",
  },
  {
    handed_over_to: "Dr. Ifeoma Nwosu",
    working_diagnosis: "Type 2 diabetes, poorly controlled",
    current_clinical_status: "Blood glucose stabilizing",
    critical_events: "None",
    outstanding_investigations: "HbA1c",
    pending_procedures: "None",
    pending_consult_reviews: "Endocrinology, dietitian",
    clinical_concerns: "Continue glucose monitoring 4x daily",
    management_plan: "Adjust insulin sliding scale per readings",
  },
  {
    handed_over_to: "Dr. Amaka Chukwu",
    working_diagnosis: "Cellulitis, left leg",
    current_clinical_status: "Improving, erythema reducing",
    critical_events: "None",
    outstanding_investigations: "None",
    pending_procedures: "Dressing change due tomorrow",
    pending_consult_reviews: "None",
    clinical_concerns: "Watch for spreading redness or fever",
    management_plan: "Continue IV antibiotics, elevate leg",
  },
  {
    handed_over_to: "Dr. Tunde Bakare",
    working_diagnosis: "Seizure disorder, breakthrough episode",
    current_clinical_status: "Post-ictal, recovering",
    critical_events: "One witnessed seizure at 6am, self-resolved",
    outstanding_investigations: "EEG",
    pending_procedures: "None",
    pending_consult_reviews: "Neurology",
    clinical_concerns: "Fall risk — keep bed rails up",
    management_plan: "Continue anticonvulsant, neurology to review levels",
  },
  {
    handed_over_to: "Dr. Ifeoma Nwosu",
    working_diagnosis: "General ward observation",
    current_clinical_status: "No acute concerns overnight",
    critical_events: "None",
    outstanding_investigations: "None",
    pending_procedures: "None",
    pending_consult_reviews: "None",
    clinical_concerns: "None",
    management_plan: "Continue current management plan",
  },
];
const DUMMY_NOTE_AGES_MS = [3 * MINUTE, 45 * MINUTE, 2 * HOUR, 6 * HOUR, DAY, 1.5 * DAY, 2 * DAY, 3 * DAY];
const buildDummyNotes = () =>
  DUMMY_NOTES_DATA.map((fields, i) => ({
    id: `dummy-note-${i}`,
    ...fields,
    created_at: new Date(Date.now() - DUMMY_NOTE_AGES_MS[i]).toISOString(),
  }));

const formatMinutesAgo = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
};

/**
 * Per-patient shift handover notes. There's no backend endpoint yet for
 * listing/creating these (the only existing "handover" API is the nurse
 * end-of-shift summary posted on logout, which is a different feature), so
 * notes added here live only in this component's local state for the
 * current session — a working preview of the flow, not persisted yet.
 */
const PatientHandoverTab = ({ selected, patientFullInfo }) => {
  const [notes, setNotes] = useState(buildDummyNotes);
  const [showSelectDoctorModal, setShowSelectDoctorModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [handoverDoctor, setHandoverDoctor] = useState(null);
  const [detailNote, setDetailNote] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const patientLabel =
    [
      patientFullInfo?.patient_info?.firstname || selected?.patient_info?.firstname,
      patientFullInfo?.patient_info?.lastname || selected?.patient_info?.lastname,
    ]
      .filter(Boolean)
      .join(" ") || "—";
  const bedLabel = selected?.bed_info?.bed_number ? `Bed ${selected.bed_info.bed_number}` : "Bed —";
  const wardLabel = selected?.ward_info?.name ? `${selected.ward_info.name} ward` : "—";

  const handoverDoctorName = handoverDoctor
    ? `Dr. ${handoverDoctor.firstname} ${handoverDoctor.lastname}`
    : null;

  const handleDoctorSelected = (doctor) => {
    setHandoverDoctor(doctor);
    setShowSelectDoctorModal(false);
    setShowAddModal(true);
  };

  const handleAddNote = (form) => {
    setNotes((prev) => [
      {
        id: `note-${Date.now()}`,
        ...form,
        handed_over_to: handoverDoctorName,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    setShowAddModal(false);
    setHandoverDoctor(null);
    setCurrentPage(1);
  };

  const visibleNotes = useMemo(() => {
    let list = notes;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((n) => HANDOVER_NOTE_KEYS.some((key) => n[key]?.toLowerCase().includes(q)));
    }
    list = [...list].sort((a, b) => {
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sortOrder === "latest" ? diff : -diff;
    });
    return list;
  }, [notes, searchQuery, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(visibleNotes.length / PAGE_SIZE));
  const pageNotes = visibleNotes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (detailNote) {
    return (
      <HandoverNoteDetailPage
        note={detailNote}
        onBack={() => setDetailNote(null)}
        patientLabel={patientLabel}
        patientFullInfo={patientFullInfo}
        selected={selected}
      />
    );
  }

  if (showAddModal) {
    return (
      <AddHandoverNoteForm
        handoverDoctorName={handoverDoctorName}
        onBack={() => {
          setShowAddModal(false);
          setHandoverDoctor(null);
        }}
        onUpload={handleAddNote}
      />
    );
  }

  return (
    <div className="relative">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-end gap-3 mb-6">
        {showSearch ? (
          <Input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => !searchQuery && setShowSearch(false)}
            placeholder="Search handover notes..."
            leadingIcon={<Search size={16} />}
            trailingIcon={<X size={14} />}
            onTrailingIconClick={() => {
              setSearchQuery("");
              setShowSearch(false);
            }}
            containerClassName="w-full sm:w-64 order-first sm:order-none"
            className="text-sm"
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
            aria-label="Search handover notes"
          >
            <Search size={16} />
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowSelectDoctorModal(true)}
          className="border border-docuhealth-primary text-docuhealth-primary rounded-full px-5 py-2 text-sm font-medium hover:bg-docuhealth-primary/5 transition-colors whitespace-nowrap"
        >
          Add new handover note
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSortOpen((prev) => !prev)}
            className="flex items-center gap-1.5 border border-docuhealth-primary text-docuhealth-primary rounded-full px-5 py-2 text-sm font-medium hover:bg-docuhealth-primary/5 transition-colors whitespace-nowrap"
          >
            Sort by: {sortOrder === "latest" ? "Latest" : "Oldest"}
            <ChevronDown size={14} className={`transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
          </button>
          {isSortOpen && (
            <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden w-32">
              {[
                { value: "latest", label: "Latest" },
                { value: "oldest", label: "Oldest" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSortOrder(opt.value);
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    sortOrder === opt.value
                      ? "bg-docuhealth-primary/10 text-docuhealth-primary font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {pageNotes.length === 0 ? (
        <div className="flex flex-col justify-center items-center text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-300 mb-4" strokeWidth={1.5} />
          <h2 className="font-medium pb-1">
            {notes.length === 0 ? "No handover notes yet" : "No matching handover notes"}
          </h2>
          <p className="text-[12px] text-gray-500 max-w-xs">
            {notes.length === 0
              ? "Add a note to hand this patient over to the next doctor on shift."
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pageNotes.map((note) => (
            <div key={note.id} className="border rounded-2xl p-5">
              <div className="flex justify-end mb-2">
                <span className="bg-blue-50 text-docuhealth-primary text-[11px] font-medium px-3 py-1 rounded-full whitespace-nowrap">
                  {formatMinutesAgo(note.created_at)}
                </span>
              </div>
              <div className="flex justify-center py-4">
                <BookOpen className="w-14 h-14 text-slate-700" strokeWidth={1.5} />
              </div>
              <div className="border-t pt-3 space-y-2 text-[13px] text-gray-700">
                <div className="flex items-center gap-2">
                  <Stethoscope size={14} className="text-gray-400 shrink-0" /> Patient: {patientLabel}
                </div>
                <div className="flex items-center gap-2">
                  <BedDouble size={14} className="text-gray-400 shrink-0" /> {bedLabel}
                </div>
                <div className="flex items-center gap-2">
                  <BedDouble size={14} className="text-gray-400 shrink-0" /> Ward: {wardLabel}
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck size={14} className="text-gray-400 shrink-0" /> Handed over to: {note.handed_over_to || "—"}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarClock size={14} className="text-gray-400 shrink-0" /> {formatFullDateTime(note.created_at)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailNote(note)}
                className="mt-4 w-full border border-docuhealth-primary text-docuhealth-primary rounded-full py-2 text-sm font-medium hover:bg-docuhealth-primary/5 transition-colors"
              >
                Open details
              </button>
            </div>
          ))}
        </div>
      )}

      <Pagination2
        count={visibleNotes.length}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      {showSelectDoctorModal && (
        <SelectHandoverDoctorModal
          onClose={() => setShowSelectDoctorModal(false)}
          onProceed={handleDoctorSelected}
        />
      )}
    </div>
  );
};

export default PatientHandoverTab;
