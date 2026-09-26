import React, { useState, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import { fetchDoctorHandovers } from "../../../../../queries/Hospital/doctor/handover";
import { DoctorAppContext } from "../../../../../context/HospitalContext/Doctors/DoctorAppContext";
import HandoverNoteDetailPage from "../Patient_Mgt_Dashboard/HandoverNoteDetailPage";
import EmptyState from "../../../../ui/EmptyState";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";
import Input from "../../../../ui/Input";
import { HANDOVER_FIELDS } from "../Patient_Mgt_Dashboard/AddHandoverNoteForm";

const PAGE_SIZE = 9;

const doctorFullName = (info) => {
  if (!info) return "—";
  const name = [info.firstname, info.lastname].filter(Boolean).join(" ").trim();
  return name ? `Dr. ${name}` : "—";
};

const DoctorHandoverHistoryTab = ({ type = "received" }) => {
  const { profile } = useContext(DoctorAppContext);
  const [selectedNote, setSelectedNote] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["doctor-handovers", currentPage, 100],
    queryFn: fetchDoctorHandovers,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const loggedInDoctorSqid = profile?.sqid;

  const mappedNotes = useMemo(() => {
    const rows = data?.results || [];
    return rows
      .filter((item) => {
        if (!loggedInDoctorSqid) return true;
        if (type === "received") {
          // Handed over TO the logged-in doctor
          return item.to_doctor_info?.sqid === loggedInDoctorSqid || !item.from_doctor_info?.sqid;
        } else {
          // Handed over BY the logged-in doctor
          return item.from_doctor_info?.sqid === loggedInDoctorSqid;
        }
      })
      .map((item) => {
        const otherDoctor = type === "received" ? item.from_doctor_info : item.to_doctor_info;
        const patientName = item.patient_info
          ? `${item.patient_info.firstname || ""} ${item.patient_info.lastname || ""}`.trim()
          : "Unknown Patient";

        return {
          id: item.sqid,
          sqid: item.sqid,
          type,
          patientName: patientName || "Unknown Patient",
          patient_info: item.patient_info,
          hin: item.patient_info?.hin,
          gender: item.patient_info?.gender,
          dob: item.patient_info?.dob,
          doctorName: doctorFullName(otherDoctor),
          doctorSpecialization: otherDoctor?.specialization,
          doctorRole: otherDoctor?.role || "Doctor",
          handed_over_to: doctorFullName(item.to_doctor_info),
          handed_over_by: doctorFullName(item.from_doctor_info),
          created_at: item.created_at,
          working_diagnosis: item.working_diagnosis,
          current_clinical_status: item.current_clinical_status,
          critical_events: item.critical_events,
          outstanding_investigations: item.outstanding_investigations,
          pending_procedures: item.pending_procedures,
          pending_consult_reviews: item.pending_consult_reviews,
          clinical_concerns: item.clinical_concerns,
          management_plan: item.management_plan,
          ...HANDOVER_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: item[f.key] || "" }), {}),
        };
      });
  }, [data, type, loggedInDoctorSqid]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return mappedNotes;
    const q = searchQuery.trim().toLowerCase();
    return mappedNotes.filter(
      (n) =>
        n.patientName?.toLowerCase().includes(q) ||
        n.hin?.toLowerCase().includes(q) ||
        n.doctorName?.toLowerCase().includes(q) ||
        n.working_diagnosis?.toLowerCase().includes(q) ||
        n.current_clinical_status?.toLowerCase().includes(q)
    );
  }, [mappedNotes, searchQuery]);

  const totalCount = filteredNotes.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedNotes = filteredNotes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (selectedNote) {
    return (
      <HandoverNoteDetailPage
        note={selectedNote}
        onBack={() => setSelectedNote(null)}
        patientLabel={selectedNote.patientName}
        patientFullInfo={{ patient_info: selectedNote.patient_info }}
      />
    );
  }

  return (
    <div className="mt-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <p className="text-xs text-gray-500">
          Showing {paginatedNotes.length} of {totalCount} {type === "received" ? "received" : "sent"} handover notes
        </p>
        <div className="relative w-full sm:w-72">
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by patient, HIN, doctor, diagnosis..."
            leadingIcon={<Search size={16} />}
            trailingIcon={searchQuery ? <X size={14} /> : null}
            onTrailingIconClick={() => setSearchQuery("")}
            className="text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin h-8 w-8 text-docuhealth-primary" />
        </div>
      ) : isError ? (
        <div className="py-16 text-center text-sm text-gray-500">
          <p className="font-medium">Couldn't load handover notes.</p>
          <p className="text-xs text-gray-400 mt-1">Please try again in a moment.</p>
        </div>
      ) : paginatedNotes.length === 0 ? (
        <EmptyState
          title={`No ${type === "received" ? "received" : "sent"} handover notes`}
          description={
            searchQuery
              ? "No handover notes match your search criteria."
              : `You have not ${type === "received" ? "received" : "sent"} any handover notes yet.`
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedNotes.map((note) => (
              <div
                key={note.id}
                className="border border-gray-200 rounded-2xl bg-white relative flex flex-col p-5  hover:shadow-xs transition-all"
              >
                {/* Centered Notebook Icon */}
                <div className="flex justify-center items-center py-5 mb-2">
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-docuhealth-primary"
                  >
                    <path
                      d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 5h2M4 9h2M4 13h2"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Details Section */}
                <div className="flex flex-col flex-grow text-xs text-gray-500 space-y-2.5">
                  <div className="font-semibold text-gray-800 text-[15px] border-b border-gray-100 pb-2.5">
                    Patient: {note.patientName}
                  </div>

                  {note.hin && (
                    <div>
                      HIN: <span className="font-medium text-gray-700">{note.hin}</span>
                    </div>
                  )}

                  <div>
                    {type === "received" ? "From Doctor" : "To Doctor"}:{" "}
                    <span className="font-medium text-gray-800">
                      {note.doctorName}{" "}
                      {note.doctorSpecialization ? `(${note.doctorSpecialization})` : ""}
                    </span>
                  </div>

                  <div>
                    Working Diagnosis:{" "}
                    <span className="font-medium text-gray-800 block truncate mt-0.5">
                      {note.working_diagnosis || "N/A"}
                    </span>
                  </div>

                  <div>
                    Clinical Status:{" "}
                    <span className="font-medium text-gray-700 block truncate mt-0.5">
                      {note.current_clinical_status || "N/A"}
                    </span>
                  </div>

                  <div className="mt-auto pt-4">
                    <button
                      onClick={() => setSelectedNote(note)}
                      className="w-full border border-docuhealth-primary text-docuhealth-primary hover:bg-blue-50 font-medium py-2.5 rounded-full transition-colors text-xs cursor-pointer"
                    >
                      Open details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination2
                count={totalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorHandoverHistoryTab;
