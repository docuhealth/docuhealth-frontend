import React, { useState } from 'react';

const NoteSection = ({ title, field, placeholder, caseNoteData, inputs, setInputs, handleAddListItem, handleRemoveItem, activeInput, setActiveInput }) => (
    <div className="border rounded-md p-4 mt-3 bg-gray-50/30">
        <p className="font-medium text-[#1B2B40] mb-2">{title}</p>

        <div className="space-y-2 max-h-[200px] overflow-y-auto mb-2">
            {caseNoteData[field].map((item, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded p-2 text-[12px] flex justify-between items-center">
                    <span>{item}</span>
                    <button type="button" className="text-red-500 font-bold ml-2" onClick={() => handleRemoveItem(field, idx)}>&times;</button>
                </div>
            ))}
        </div>

        {activeInput === field ? (
            <div className="flex gap-2">
                <input
                    autoFocus // Added autoFocus for better UX
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


const AddNewCaseNote = ({ setNewCaseNote }) => {
    // 1. STATE MANAGEMENT
    const [caseNoteData, setCaseNoteData] = useState({
        observations: [],
        nursingCare: [],
        patientResponse: [],
        concerns: [],
        followUp: []
    });

    // Temporary states for the input fields
    const [inputs, setInputs] = useState({
        observations: "",
        nursingCare: "",
        patientResponse: "",
        concerns: "",
        followUp: ""
    });

    // Visibility states for inputs
    const [activeInput, setActiveInput] = useState(null);

    // 2. HANDLERS
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

    // 3. PAYLOAD GENERATION
    const handleSubmit = () => {
        const payload = {
            patient_condition_observations: caseNoteData.observations,
            nursing_care_given: caseNoteData.nursingCare,
            patient_response_to_care: caseNoteData.patientResponse,
            abnormalities_concerns: caseNoteData.concerns,
            plan_follow_up_actions: caseNoteData.followUp,
            created_at: new Date().toISOString(),
        };

        console.log("Final Payload:", payload);

        setCaseNoteData({
            observations: [],
            nursingCare: [],
            patientResponse: [],
            concerns: [],
            followUp: []
        })
        setNewCaseNote(false)
        // axiosInstance.post('/api/case-notes', payload)...
    };




    return (
        <div className="bg-white my-5 border rounded-2xl pt-8 px-6 pb-8 text-sm ">
            {/* Header */}
            <div className='flex items-center justify-between border-b pb-3'>
                <div className='flex items-center gap-2 cursor-pointer' onClick={() => setNewCaseNote(false)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4.56528 6.41685H11.6654V7.58352H4.56528L7.69426 10.7125L6.86932 11.5374L2.33203 7.00019L6.86932 2.46289L7.69426 3.28785L4.56528 6.41685Z" fill="#1B2B40" /></svg>
                    <p className="font-medium">New Case Note</p>
                </div>
            </div>

            <div className='my-5 space-y-4'>
                <NoteSection title="1. Patient’s Condition & Observations" field="observations" placeholder="e.g. Patient is stable but reports mild headache" caseNoteData={caseNoteData}
                    inputs={inputs}
                    setInputs={setInputs}
                    handleAddListItem={handleAddListItem}
                    handleRemoveItem={handleRemoveItem}
                    activeInput={activeInput}
                    setActiveInput={setActiveInput} />
                <NoteSection title="2. Nursing Care Given" field="nursingCare" placeholder="e.g. Administered prescribed painkillers" caseNoteData={caseNoteData}
                    inputs={inputs}
                    setInputs={setInputs}
                    handleAddListItem={handleAddListItem}
                    handleRemoveItem={handleRemoveItem}
                    activeInput={activeInput}
                    setActiveInput={setActiveInput} />
                <NoteSection title="3. Patient’s Response to Care" field="patientResponse" placeholder="e.g. Pain level reduced from 7 to 3" caseNoteData={caseNoteData}
                    inputs={inputs}
                    setInputs={setInputs}
                    handleAddListItem={handleAddListItem}
                    handleRemoveItem={handleRemoveItem}
                    activeInput={activeInput}
                    setActiveInput={setActiveInput} />
                <NoteSection title="4. Abnormalities / Concerns" field="concerns" placeholder="e.g. Slight swelling noted on left ankle" caseNoteData={caseNoteData}
                    inputs={inputs}
                    setInputs={setInputs}
                    handleAddListItem={handleAddListItem}
                    handleRemoveItem={handleRemoveItem}
                    activeInput={activeInput}
                    setActiveInput={setActiveInput} />
                <NoteSection title="5. Plan / Follow-up Actions" field="followUp" placeholder="e.g. Monitor BP every 4 hours" caseNoteData={caseNoteData}
                    inputs={inputs}
                    setInputs={setInputs}
                    handleAddListItem={handleAddListItem}
                    handleRemoveItem={handleRemoveItem}
                    activeInput={activeInput}
                    setActiveInput={setActiveInput} />
            </div>
            <div className='flex justify-end'>
            <button
                onClick={handleSubmit}
                className="w-full lg:w-auto bg-[#3E4095] text-white py-2.5 px-20 rounded-full  mt-5 text-sm "
            >
                Upload Case Note
            </button>
            </div>

           
        </div>
    );
}

export default AddNewCaseNote;

