import React, { useState, useEffect } from "react";
import { User, Bed, Calendar, Stethoscope, Loader2 } from "lucide-react";
import HandoverNoteDetail from "./HandoverNoteDetail";
import EmptyState from "../../../../ui/EmptyState";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";
import axiosInstanceHos from "../../../../../lib/axios/hospital";

const HandoverHistoryTab = ({ type }) => {
  const [selectedNote, setSelectedNote] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const endpoint = type === 'received' 
          ? `/api/nurses/in-patient-handovers-recvd?page=${currentPage}&size=10`
          : `/api/nurses/in-patient-handovers-sent?page=${currentPage}&size=10`;
          
        const response = await axiosInstanceHos.get(endpoint);
        
        // Map the API results to the format expected by the UI
        const mappedNotes = (response.data.results || []).map(item => {
          const nurseInfo = type === 'received' ? item.from_nurse_info : item.to_nurse_info;
          
          return {
            id: item.sqid,
            sqid: item.sqid,
            type: type,
            patientName: item.patient_info ? `${item.patient_info.firstname} ${item.patient_info.lastname}` : 'Unknown',
            hin: item.patient_info?.hin,
            gender: item.patient_info?.gender,
            dob: item.patient_info?.dob,
            age: item.patient_info?.dob ? `${new Date().getFullYear() - new Date(item.patient_info.dob).getFullYear()} years` : null,
            bed: "Check Ward", // Backend does not provide bed directly here
            ward: "Check Ward", // Backend does not provide ward directly here
            date: item.created_at ? new Date(item.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
            timeAgo: "Recently", // Assuming we don't have a time-ago function handy
            uploadDateTime: item.created_at ? new Date(item.created_at).toLocaleString() : new Date().toLocaleString(),
            
            nurseName: nurseInfo ? `${nurseInfo.firstname} ${nurseInfo.lastname}` : 'Unknown',
            nurseRole: nurseInfo?.role || 'Nurse',
            
            generalCondition: item.general_patient_condition,
            significantEvent: item.significant_events,
            medicationDue: item.medications_due,
            outstandingTask: item.outstanding_nursing_tasks,
            pendingInvestigations: item.pending_investigations,
            escalations: item.escalations,
            recommendations: item.recommendations,
          };
        });
        
        setNotes(mappedNotes);
        setTotalCount(response.data.count || 0);
      } catch (error) {
        console.error("Failed to fetch handover notes", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotes();
  }, [type, currentPage]);

  if (selectedNote) {
    return <HandoverNoteDetail note={selectedNote} onBack={() => setSelectedNote(null)} />;
  }

  return (
    <div className="mt-6 ">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-docuhealth-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note.id} className="border border-gray-200 rounded-xl bg-white relative flex flex-col">
                
                {/* Top-right badge */}
                <div className="absolute top-4 right-4 bg-blue-100 text-blue-600 text-xs font-medium px-3 py-1 rounded-full">
                  {note.timeAgo}
                </div>

                {/* Centered Notebook Icon */}
                <div className="flex justify-center items-center py-10 mt-4">
                  <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-docuhealth-primary">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 5h2M4 9h2M4 13h2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Details Section */}
                <div className="px-5 pb-5 flex flex-col flex-grow">
                  <ul className="space-y-3 border-t border-gray-100 pt-5 text-sm text-gray-700">
                    <li className="flex items-center gap-3">
                      <User size={16} className="text-gray-500" />
                      <span className="font-medium">Patient: {note.patientName}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Bed size={16} className="text-gray-500" />
                      <span>{note.bed}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Stethoscope size={16} className="text-gray-500" />
                      <span>Ward: {note.ward}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Calendar size={16} className="text-gray-500" />
                      <span>{note.date}</span>
                    </li>
                  </ul>

                  <div className="mt-auto pt-6">
                    <button 
                      onClick={() => setSelectedNote(note)}
                      className="w-full border border-docuhealth-primary text-docuhealth-primary hover:bg-blue-50 font-medium py-2.5 rounded-full transition-colors text-sm"
                    >
                      Open details
                    </button>
                  </div>
                </div>
                
              </div>
            ))}
            
            {notes.length === 0 && (
              <div className="col-span-full">
                <EmptyState 
                  title={`No ${type} handover notes`}
                  description={`You have not ${type === 'received' ? 'received' : 'sent'} any handover notes yet.`}
                />
              </div>
            )}
          </div>
          
          {totalCount > 10 && (
            <div className="mt-8">
              <Pagination2 
                count={totalCount}
                currentPage={currentPage}
                totalPages={Math.ceil(totalCount / 10) || 1}
                setCurrentPage={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HandoverHistoryTab;
