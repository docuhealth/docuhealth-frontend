import React, {useState} from 'react'
import { ArrowLeft } from 'lucide-react'

const AfterVisitSummary = ({ setAfterVisitSummary }) => {
    
    const [notes, setNotes] = useState([]); // store all notes
    const [newNote, setNewNote] = useState(""); // current note being typed
    const [showInput, setShowInput] = useState(false); // toggle input field
  
    const handleAddNote = () => {
      if (newNote.trim() === "") return;
      setNotes([...notes, newNote.trim()]);
      setNewNote("");
      setShowInput(false);
    };
  
    const handleRemoveNote = (index) => {
      const updatedNotes = notes.filter((_, idx) => idx !== index);
      setNotes(updatedNotes);
    };

    
    return (
        <>
            <div className='bg-white rounded-xl border mt-3 p-5 text-sm'>
                <div className='flex items-center gap-1 cursor-pointer border-b pb-3'>
                    <div
                        onClick={() => {
                            setAfterVisitSummary(false)
                        }}>
                        <ArrowLeft className='w-4 h-4 text-gray-800' />
                    </div>
                    <p>After visit summary</p>
                </div>
                <div className='my-5'>
                        <div className='border rounded-md p-5'>
                            <p className='font-medium'>Chief complaint</p>
                            <textarea name="" id="" className='w-full my-2 rounded-sm border focus:outline-none p-3 text-[12px]  h-auto max-h-[300px]' placeholder='Enter chief complaint...'>

                            </textarea>

                        </div>
                        <div className="border rounded-md p-5 mt-3">
      <p className="font-medium">History summary</p>

      {/* Existing notes */}
      <div className="my-2 space-y-2 max-h-[300px] overflow-y-auto">
        {notes.length === 0 && (
          <p className="text-gray-400 text-[12px]">No notes yet</p>
        )}
        {notes.map((note, idx) => (
          <div
            key={idx}
            className="bg-gray-100 rounded p-2 text-[12px] flex justify-between items-center"
          >
            <span>{note}</span>
            <button
              className="text-red-500 text-sm font-bold ml-2"
              onClick={() => handleRemoveNote(idx)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* Add note button */}
      {!showInput && (
        <button
          className="flex items-center gap-1 text-[#3E4095] font-medium text-sm mt-2"
          onClick={() => setShowInput(true)}
        >
          <span className="text-lg">+</span> Add note
        </button>
      )}

      {/* Input field for new note */}
      {showInput && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter note..."
            className="flex-1 border rounded p-2 text-[12px] focus:outline-none"
          />
          <button
            className="bg-[#3E4095] text-white px-4 rounded"
            onClick={handleAddNote}
          >
            Add
          </button>
        </div>
      )}
    </div>
                </div>
            </div>
        </>
    )
}

export default AfterVisitSummary