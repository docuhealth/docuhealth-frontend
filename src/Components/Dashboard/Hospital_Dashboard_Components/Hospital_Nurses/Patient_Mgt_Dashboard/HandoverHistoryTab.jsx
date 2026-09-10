import React, { useState, useEffect } from "react";
import { User, Loader2 } from "lucide-react";
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
          ? `/api/nurses/in-patient-handovers-received?page=${currentPage}&size=10`
          : `/api/nurses/in-patient-handovers-sent?page=${currentPage}&size=10`;
          
        const response = await axiosInstanceHos.get(endpoint);
        
        // Map the API results to the format expected by the UI
        const mappedNotes = (response.data.results || []).map(item => {
          const nurseInfo = type === 'received' ? (item.from_nurse_info || item.to_nurse_info) : (item.to_nurse_info || item.from_nurse_info);
          
          return {
            id: item.sqid,
            sqid: item.sqid,
            type: type,
            patientName: item.patient_info ? `${item.patient_info.firstname} ${item.patient_info.lastname}` : 'Unknown',
            hin: item.patient_info?.hin,
            gender: item.patient_info?.gender,
            dob: item.patient_info?.dob,
            age: item.patient_info?.dob ? `${new Date().getFullYear() - new Date(item.patient_info.dob).getFullYear()} years` : null,
            
            nurseName: nurseInfo ? `${nurseInfo.firstname} ${nurseInfo.lastname}` : 'Unknown',
            nurseRole: nurseInfo?.role || 'Nurse',
            nurseSpecialization: nurseInfo?.specialization,
            nurseStaffId: nurseInfo?.staff_id,
            
            generalCondition: item.general_patient_condition,
            significantEvent: item.significant_events,
            medicationsDue: item.medications_due,
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note.id} className="border border-gray-200 rounded-xl bg-white relative flex flex-col p-5">
                
                {/* Centered Notebook Icon */}
                <div className="flex justify-center items-center py-6 mb-2">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-docuhealth-primary">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 5h2M4 9h2M4 13h2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Details Section */}
                <div className="flex flex-col flex-grow text-sm text-gray-500 space-y-2.5">
                  <div className="font-semibold text-gray-800 text-[15px] border-b border-gray-100 pb-3 mb-1">
                    Patient: {note.patientName}
                  </div>
                  
                  {note.hin && (
                    <div className="mt-2">
                      HIN: <span className="font-medium text-gray-700">{note.hin}</span>
                    </div>
                  )}

                  <div>
                    {type === 'received' ? 'From Nurse' : 'To Nurse'}:{" "}
                    <span className="font-medium text-gray-700">
                      {note.nurseName} {note.nurseSpecialization ? `(${note.nurseSpecialization})` : ''}
                    </span>
                  </div>

                  <div>
                    General condition: <span className="font-medium text-gray-700 truncate block">{note.generalCondition || "N/A"}</span>
                  </div>

                  {note.outstandingTask && (
                    <div>
                      Outstanding tasks: <span className="font-medium text-gray-700 truncate block">{note.outstandingTask}</span>
                    </div>
                  )}

                  <div className="mt-auto pt-5">
                    <button 
                      onClick={() => setSelectedNote(note)}
                      className="w-full border border-docuhealth-primary text-docuhealth-primary hover:bg-blue-50 font-medium py-2.5 rounded-full transition-colors text-sm cursor-pointer"
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
