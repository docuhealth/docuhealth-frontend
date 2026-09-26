import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import toast from "react-hot-toast";
import { Loader2, Calendar, Clock, User, Building, FileText, ChevronRight, Bed } from "lucide-react";
import AdmissionNoteDetail from "./AdmissionNoteDetail";

const AdmissionNotesHistory = ({ patient, patientFullInfo }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [view, setView] = useState("list"); // 'list', 'detail'
  const [selectedNote, setSelectedNote] = useState(null);

  const patientHin = patient?.hin || patientFullInfo?.hin || patientFullInfo?.patient?.hin || patientFullInfo?.patient_info?.hin;

  const { data, isLoading: loading } = useQuery({
    queryKey: ["patient-admission-notes", patientHin],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(`api/records/patients/${patientHin}/admission-notes`);
      return res.data?.results || res.data || [];
    },
    enabled: !!patientHin,
    staleTime: 5 * 60 * 1000,
  });

  const notes = data || [];

  const toggleDropdown = (index) => {
    if (openDropdown === index) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(index);
    }
  };

  const handleViewDetail = (note) => {
    setSelectedNote(note);
    setView("detail");
    setOpenDropdown(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
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

  if (view === "detail" && selectedNote) {
    return (
      <AdmissionNoteDetail
        note={{
          ...selectedNote,
          patientName: patient ? `${patient.firstname || ""} ${patient.lastname || ""}`.trim() : "Patient",
          hin: patientHin,
          nurseName: selectedNote?.written_by_info
            ? `Nurse ${selectedNote.written_by_info.firstname} ${selectedNote.written_by_info.lastname}`
            : (selectedNote?.staff_info ? `Nurse ${selectedNote.staff_info.firstname} ${selectedNote.staff_info.lastname}` : "Nurse"),
        }}
        onBack={() => setView("list")}
      />
    );
  }

  return (
    <div className="bg-white">


      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-docuhealth-primary" />
          </div>
        ) : notes.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm bg-gray-50/50 rounded-xl border border-gray-100">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="font-medium text-gray-700">No admission notes found</p>
            <p className="text-xs text-gray-400 mt-1">This patient does not have any recorded admission notes at this hospital.</p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden lg:block space-y-3">
              {notes.map((item, idx) => {
                const nurseName = item.written_by_info
                  ? `${item.written_by_info.firstname} ${item.written_by_info.lastname}`
                  : (item.staff_info ? `${item.staff_info.firstname} ${item.staff_info.lastname}` : "Nurse");
                const wardName = item.admission_info?.ward_name || (item.admission_info?.ward_info?.name ? `${item.admission_info.ward_info.name} Ward` : "Ward N/A");
                const bedNumber = item.admission_info?.bed_number ? `Bed ${item.admission_info.bed_number}` : (item.admission_info?.bed_info?.bed_number ? `Bed ${item.admission_info.bed_info.bed_number}` : null);

                return (
                  <div
                    key={item.sqid || idx}
                    className="p-4 border border-gray-200 rounded-xl flex items-center justify-between gap-6 hover:border-docuhealth-primary/40 hover:bg-slate-50/30 transition-colors"
                  >
                    <div className="flex items-center gap-8">
                      {/* Date & Time */}
                      <div className="flex items-center gap-3 min-w-[170px]">
                        <div className="p-2.5 bg-blue-50 text-docuhealth-primary rounded-lg">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Date Recorded</p>
                          <p className="text-sm font-semibold text-gray-800">{formatDate(item.created_at)}</p>
                          <p className="text-xs text-gray-500">{formatTime(item.created_at)}</p>
                        </div>
                      </div>

                      {/* Nurse */}
                      <div className="flex items-center gap-3 min-w-[150px]">
                        <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Recorded by</p>
                          <p className="text-sm font-medium text-gray-800">{nurseName}</p>
                        </div>
                      </div>

                      {/* Ward & Bed */}
                      <div className="flex items-center gap-3 min-w-[150px]">
                        <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg">
                          <Bed className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Location</p>
                          <p className="text-sm font-medium text-gray-800">{wardName}</p>
                          {bedNumber && <p className="text-xs text-gray-500">{bedNumber}</p>}
                        </div>
                      </div>

                      {/* Mobility & Nutrition status badges */}
                      <div className="flex items-center gap-2">
                        {item.mobility_assessment_label && (
                          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                            {item.mobility_assessment_label}
                          </span>
                        )}
                        {item.nutritional_assessment_label && (
                          <span className="text-xs bg-blue-50 text-docuhealth-primary border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                            {item.nutritional_assessment_label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleViewDetail(item)}
                      className="px-5 py-2 text-xs font-semibold text-docuhealth-primary border border-docuhealth-primary rounded-full hover:bg-docuhealth-primary hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      View full details
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Mobile View */}
            <div className="block lg:hidden space-y-4">
              {notes.map((item, idx) => {
                const nurseName = item.written_by_info
                  ? `${item.written_by_info.firstname} ${item.written_by_info.lastname}`
                  : (item.staff_info ? `${item.staff_info.firstname} ${item.staff_info.lastname}` : "Nurse");
                const wardName = item.admission_info?.ward_name || (item.admission_info?.ward_info?.name ? `${item.admission_info.ward_info.name} Ward` : "Ward N/A");

                return (
                  <div
                    key={item.sqid || idx}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-docuhealth-primary" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800">
                            {formatDate(item.created_at)} at {formatTime(item.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Recorded By</span>
                        <p className="font-medium text-gray-700 mt-0.5">{nurseName}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Ward</span>
                        <p className="font-medium text-gray-700 mt-0.5">{wardName}</p>
                      </div>
                    </div>

                    <button
                      className="w-full bg-white border border-docuhealth-primary text-docuhealth-primary rounded-full py-2.5 text-xs font-semibold hover:bg-blue-50 transition-colors"
                      onClick={() => handleViewDetail(item)}
                    >
                      View full details
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdmissionNotesHistory;
