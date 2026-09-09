import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { BookOpen, Stethoscope, BedDouble, CalendarClock, UserCheck, Search, ChevronDown, X } from "lucide-react";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { fetchDoctorHandovers, createDoctorHandover } from "../../../../../queries/Hospital/doctor/handover";
import { extractApiErrorMessage } from "../../../../../utils/apiError";
import Input from "../../../../ui/Input";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";
import AddHandoverNoteForm, { HANDOVER_FIELDS } from "./AddHandoverNoteForm";
import HandoverNoteDetailPage from "./HandoverNoteDetailPage";
import SelectHandoverDoctorModal from "./SelectHandoverDoctorModal";

const PAGE_SIZE = 6;

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

const doctorName = (info) =>
  info ? `Dr. ${[info.firstname, info.lastname].filter(Boolean).join(" ")}`.trim() : "—";

/**
 * Per-patient doctor-to-doctor handover notes.
 *
 * Read side: `GET /api/doctors/handovers` (one combined sent + received list,
 * filtered here by the patient's HIN). Create side: `POST /api/doctors/handover`
 * with the 8 structured fields from AddHandoverNoteForm plus the recipient
 * doctor's SQID and the patient HIN.
 */
const PatientHandoverTab = ({ selected, patientFullInfo }) => {
  const queryClient = useQueryClient();

  const patientHin =
    patientFullInfo?.patient_info?.hin ||
    selected?.patient_info?.hin ||
    selected?.patient?.hin ||
    "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["doctor-handovers", 1, 100],
    queryFn: fetchDoctorHandovers,
    enabled: !!patientHin,
    // Another doctor can hand this patient over to us while this tab is
    // open — poll so the incoming note shows without a reload.
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

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

  const notes = useMemo(() => {
    const rows = data?.results || [];
    return rows
      .filter((n) => patientHin && n.patient_info?.hin === patientHin)
      .map((n) => ({
        id: n.sqid,
        handed_over_to: doctorName(n.to_doctor_info),
        handed_over_by: doctorName(n.from_doctor_info),
        created_at: n.created_at,
        ...HANDOVER_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: n[f.key] || "" }), {}),
      }));
  }, [data, patientHin]);

  const { mutate: submitHandover, isPending: isSubmittingHandover } = useMutation({
    mutationFn: createDoctorHandover,
    onSuccess: (res) => {
      toast.success(res?.detail || "Handover note sent.");
      queryClient.invalidateQueries({ queryKey: ["doctor-handovers"] });
      setShowAddModal(false);
      setHandoverDoctor(null);
    },
    onError: (err) => {
      console.error("Error creating handover:", err);
      toast.error(extractApiErrorMessage(err, "Couldn't save the handover note."));
    },
  });

  const handleDoctorSelected = (doctor) => {
    setHandoverDoctor(doctor);
    setShowSelectDoctorModal(false);
    setShowAddModal(true);
  };

  const handleAddNote = (form) => {
    if (!handoverDoctor?.sqid) {
      toast.error("Pick the doctor you're handing over to and try again.");
      return;
    }
    if (!patientHin) {
      toast.error("This patient is missing a HIN — reopen the record and try again.");
      return;
    }
    submitHandover({
      to_doctor_id: handoverDoctor.sqid,
      patient_hin: patientHin,
      ...form,
    });
  };

  const visibleNotes = useMemo(() => {
    let list = notes;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((n) =>
        [n.handed_over_to, n.handed_over_by, ...HANDOVER_FIELDS.map((f) => n[f.key])].some((v) =>
          v?.toLowerCase().includes(q),
        ),
      );
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
        isSubmitting={isSubmittingHandover}
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

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <svg className="animate-spin h-6 w-6 text-docuhealth-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
      ) : isError ? (
        <div className="py-16 text-center text-sm text-gray-500">
          <p className="font-medium">Couldn't load handover notes.</p>
          <p className="text-[12px] text-gray-400 mt-1">Try again in a moment.</p>
        </div>
      ) : pageNotes.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
