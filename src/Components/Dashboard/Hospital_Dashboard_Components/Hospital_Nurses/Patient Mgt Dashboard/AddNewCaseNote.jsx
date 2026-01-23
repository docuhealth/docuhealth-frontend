import React, { useState } from 'react';
import { X } from 'lucide-react';
import axiosInstanceHos from '../../../../../utils/axiosInstanceHos';
import toast from 'react-hot-toast'; // or your preferred toast library

const NoteSection = ({ title, field, placeholder, caseNoteData, inputs, setInputs, handleAddListItem, handleRemoveItem, activeInput, setActiveInput }) => (
    <div className="border rounded-md p-4 mt-3 bg-gray-50/30">
        <p className="font-medium text-[#1B2B40] mb-2">{title}</p>

        <div className="space-y-2 max-h-[200px] overflow-y-auto mb-2">
            {caseNoteData[field].map((item, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded p-2 text-[12px] flex justify-between items-center">
                    <span>{item}</span>
                    <button type="button" className="text-red-500 font-bold ml-2 cursor-pointer" onClick={() => handleRemoveItem(field, idx)}>
                        <X size={11}/>
                    </button>
                </div>
            ))}
        </div>

        {activeInput === field ? (
            <div className="flex gap-2">
                <input
                    autoFocus
                    type="text"
                    value={inputs[field]}
                    onChange={(e) => setInputs({ ...inputs, [field]: e.target.value })}
                    placeholder={placeholder}
                    className="flex-1 border rounded p-2 text-[12px] focus:ring-1 focus:ring-[#3E4095] outline-none"
                />
                <button type="button" onClick={() => handleAddListItem(field)} className="bg-[#3E4095] text-white px-3 py-1 rounded text-[12px]">Add</button>
                <button type="button" onClick={() => setActiveInput(null)} className="text-gray-500 text-[12px]">Cancel</button>
            </div>
        ) : (
            <button
                type="button"
                onClick={() => setActiveInput(field)}
                className="flex items-center gap-1 text-[#3E4095] font-medium text-[12px]"
            >
                <span className="text-lg">+</span> Add Entry
            </button>
        )}
    </div>
);

// Added patientId prop so we know which patient to save the note for
const AddNewCaseNote = ({ setNewCaseNote, selected }) => {
    const [loading, setLoading] = useState(false);
    const [caseNoteData, setCaseNoteData] = useState({
        observations: [],
        nursingCare: [],
        patientResponse: [],
        concerns: [],
        followUp: []
    });

    const [inputs, setInputs] = useState({
        observations: "",
        nursingCare: "",
        patientResponse: "",
        concerns: "",
        followUp: ""
    });

    const [activeInput, setActiveInput] = useState(null);

    const handleAddListItem = (field) => {
        if (!inputs[field].trim()) return;
        setCaseNoteData(prev => ({
            ...prev,
            [field]: [...prev[field], inputs[field]]
        }));
        setInputs(prev => ({ ...prev, [field]: "" }));
        setActiveInput(null);
    };

    const handleRemoveItem = (field, index) => {
        setCaseNoteData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
       
        const fullPayload = {
            patient: selected?.patient?.hin,
            observation: caseNoteData.observations,
            care: caseNoteData.nursingCare,
            response: caseNoteData.patientResponse,
            abnormalities: caseNoteData.concerns,
            follow_up: caseNoteData.followUp
        };

        const filteredPayload = Object.fromEntries(
            Object.entries(fullPayload).filter(([_, value]) => {
                if (Array.isArray(value)) return value.length > 0; // Keep non-empty arrays
                return value !== null && value !== undefined;    // Keep the patient ID
            })
        );

        if (Object.keys(filteredPayload).length <= 1) {
            toast.error("Please add at least one entry before uploading.");
            return;
        }
    
        // console.log("Sending filtered payload:", filteredPayload);

        setLoading(true);
        try {
            console.log(filteredPayload)
            // End-point from your image: /api/nurses/case-notes
            await axiosInstanceHos.post('/api/nurses/case-notes', filteredPayload);
            
            toast.success("Case note uploaded successfully!");
            
            // 3. RESET & CLOSE
            setCaseNoteData({
                observations: [], nursingCare: [], patientResponse: [], concerns: [], followUp: []
            });
            setNewCaseNote(false);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error.response?.data?.message || "Failed to upload case note");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white my-5 border rounded-lg pt-5 lg:pt-8 px-4 lg:px-6  pb-8 text-sm ">
            <div className='flex items-center justify-between border-b pb-3'>
                <div className='flex items-center gap-2 cursor-pointer' onClick={() => setNewCaseNote(false)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4.56528 6.41685H11.6654V7.58352H4.56528L7.69426 10.7125L6.86932 11.5374L2.33203 7.00019L6.86932 2.46289L7.69426 3.28785L4.56528 6.41685Z" fill="#1B2B40" /></svg>
                    <p className="font-medium">New Case Note</p>
                </div>
            </div>

            <div className='my-5 space-y-4'>
                <NoteSection title="1. Patient’s Condition & Observations" field="observations" placeholder="e.g. Patient is stable but reports mild headache" caseNoteData={caseNoteData} inputs={inputs} setInputs={setInputs} handleAddListItem={handleAddListItem} handleRemoveItem={handleRemoveItem} activeInput={activeInput} setActiveInput={setActiveInput} />
                <NoteSection title="2. Nursing Care Given" field="nursingCare" placeholder="e.g. Administered prescribed painkillers" caseNoteData={caseNoteData} inputs={inputs} setInputs={setInputs} handleAddListItem={handleAddListItem} handleRemoveItem={handleRemoveItem} activeInput={activeInput} setActiveInput={setActiveInput} />
                <NoteSection title="3. Patient’s Response to Care" field="patientResponse" placeholder="e.g. Pain level reduced from 7 to 3" caseNoteData={caseNoteData} inputs={inputs} setInputs={setInputs} handleAddListItem={handleAddListItem} handleRemoveItem={handleRemoveItem} activeInput={activeInput} setActiveInput={setActiveInput} />
                <NoteSection title="4. Abnormalities / Concerns" field="concerns" placeholder="e.g. Slight swelling noted on left ankle" caseNoteData={caseNoteData} inputs={inputs} setInputs={setInputs} handleAddListItem={handleAddListItem} handleRemoveItem={handleRemoveItem} activeInput={activeInput} setActiveInput={setActiveInput} />
                <NoteSection title="5. Plan / Follow-up Actions" field="followUp" placeholder="e.g. Monitor BP every 4 hours" caseNoteData={caseNoteData} inputs={inputs} setInputs={setInputs} handleAddListItem={handleAddListItem} handleRemoveItem={handleRemoveItem} activeInput={activeInput} setActiveInput={setActiveInput} />
            </div>

            <div className='flex justify-end'>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full lg:w-auto bg-[#3E4095] text-white py-2.5 px-20 rounded-full mt-5 text-sm cursor-pointer transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}
                >
                    {loading ? "Uploading..." : "Upload Case Note"}
                </button>
            </div>
        </div>
    );
}

export default AddNewCaseNote;