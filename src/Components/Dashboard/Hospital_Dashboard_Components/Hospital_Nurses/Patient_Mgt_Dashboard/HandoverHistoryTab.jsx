import React, { useState } from "react";
import { User, Bed, Calendar, Stethoscope } from "lucide-react";
import HandoverNoteDetail from "./HandoverNoteDetail";

const demoHandoverNotes = [
  {
    id: 1,
    type: "received",
    patientName: "Amiefa Obed",
    bed: "Bed 4",
    ward: "Emergency ward",
    date: "July 15, 2025/12:45 pm",
    timeAgo: "3 minutes ago"
  },
  {
    id: 2,
    type: "received",
    patientName: "Amiefa Obed",
    bed: "Bed 4",
    ward: "Emergency ward",
    date: "July 15, 2025/12:45 pm",
    timeAgo: "3 minutes ago"
  },
  {
    id: 3,
    type: "received",
    patientName: "Amiefa Obed",
    bed: "Bed 4",
    ward: "Emergency ward",
    date: "July 15, 2025/12:45 pm",
    timeAgo: "3 minutes ago"
  },
  {
    id: 4,
    type: "sent",
    patientName: "John Doe",
    bed: "Bed 2",
    ward: "General ward",
    date: "July 15, 2025/12:45 pm",
    timeAgo: "1 hour ago"
  },
];

const HandoverHistoryTab = ({ type }) => {
  const [selectedNote, setSelectedNote] = useState(null);

  // Filter based on type ('received' or 'sent')
  const displayedNotes = demoHandoverNotes.filter(note => note.type === type);

  if (selectedNote) {
    return <HandoverNoteDetail note={selectedNote} onBack={() => setSelectedNote(null)} />;
  }

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
      {displayedNotes.map((note) => (
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
      
      {displayedNotes.length === 0 && (
        <div className="col-span-full py-12 text-center text-gray-500">
          No {type} handover notes found.
        </div>
      )}
    </div>
  );
};

export default HandoverHistoryTab;
