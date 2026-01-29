import React, { useState, useEffect, useContext } from "react";
import { ArrowLeft } from "lucide-react";
import { X, Plus, UploadCloud, FileText } from "lucide-react";
import { truncateWords } from "../../../../Patient_Dashboard_Components/Home Dashboard/Components/formatRecordDate";
import toast from "react-hot-toast";
import { DoctorAppContext } from "../../../../../../context/Hospital Context/Doctors/DoctorAppContext";
import axiosInstanceHos from "../../../../../../utils/axiosInstanceHos";

const NoteSection = ({
  title,
  field,
  placeholder,
  soapNoteData,
  inputs,
  setInputs,
  handleAddListItem,
  handleRemoveItem,
  activeInput,
  setActiveInput,
}) => (
  <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3 bg-gray-50/30">
    <p className="font-medium text-[#1B2B40] mb-2">{title}</p>

    <div className="space-y-2 max-h-[200px] overflow-y-auto mb-2">
      {soapNoteData[field].map((item, idx) => (
        <div
          key={idx}
          className="bg-white border border-gray-200 rounded p-2 text-[12px] flex justify-between items-center"
        >
          <span>{item}</span>
          <button
            type="button"
            className="text-red-500 font-bold ml-2 cursor-pointer"
            onClick={() => handleRemoveItem(field, idx)}
          >
            <X size={11} />
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
        <button
          type="button"
          onClick={() => handleAddListItem(field)}
          className="bg-[#3E4095] text-white px-3 py-1 rounded text-[12px]"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setActiveInput(null)}
          className="text-gray-500 text-[12px]"
        >
          Cancel
        </button>
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

const SoapNoteEntry = ({ setSoapNoteEntry, selectedPatientDetails }) => {
  const { profile, hospitals } = useContext(DoctorAppContext);

  // console.log(selectedPatientDetails);

  // console.log(hospitals);

  const [step, setStep] = useState(1);

  const [medications, setMedications] = useState([
    {
      drug: "",
      dosage: "",
      route: "Oral",
      frequency: 1,
      frequencyUnit: "Daily",
      duration: "",
      durationUnit: "Month",
    },
  ]);

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      {
        drug: "",
        dosage: "",
        route: "Oral",
        frequency: 1,
        frequencyUnit: "Daily",
        duration: "",
        durationUnit: "Month",
      },
    ]);
  };

  const handleRemoveMedication = (index) => {
    const updated = medications.filter((_, i) => i !== index);
    setMedications(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const [attachments, setAttachments] = useState([]);

  // New handler for both click & drop
  const handleFiles = (files) => {
    const newFiles = files.map((file) => ({
      file,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));
    setAttachments((prevDocs) => [...prevDocs, ...newFiles]);
  };

  const removeAttachments = (index) => {
    setAttachments((prevDocs) => prevDocs.filter((_, i) => i !== index));
  };

  const today = new Date();

  const [selectedDay, setSelectedDay] = useState(String(today.getDate()));
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));
  const [selectedTime, setSelectedTime] = useState("08:00");

  const [loading, setLoading] = useState(false);

  //   try {
  //     const res = await axiosInstanceHos.post("api/medical-records", payload);
  //     console.log(res);
  //     toast.success("After visit summary created successfully");
  //     setSoapNoteEntry(false);

  const [soapNoteData, setSoapNoteData] = useState({
    chief_complaint: "",
    history_of_presenting_complain: "",
    past_med_history: "",
    family_history: "",
    social_history: "",
    other_history: "",
    review_of_system: "",
    primary_diagnosis: "",
    differential_diagnosis: "",
    patient_education: "",
    referred_docuhealth_hosp: "",
    referred_hosp: "",
    drug_history_allergies: [],
    general_exam: [],
    systemic_exam: [],
    besides_tests: [],
    investigations: [],
    problems_list: [],
    treatment_plan: [],
    care_instructions: [],
  });

  const [inputs, setInputs] = useState({
    drug_history_allergies: "",
    general_exam: "",
    systemic_exam: "",
    besides_tests: "",
    investigations: "",
    problems_list: "",
    treatment_plan: "",
    care_instructions: "",
  });

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setSoapNoteData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddListItem = (field) => {
    if (!inputs[field].trim()) return;
    setSoapNoteData((prev) => ({
      ...prev,
      [field]: [...prev[field], inputs[field]],
    }));
    setInputs((prev) => ({ ...prev, [field]: "" }));
    setActiveInput(null);
  };

  const handleRemoveItem = (field, index) => {
    setSoapNoteData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const [activeInput, setActiveInput] = useState(null);

  const handleNextStep = () => {
    switch (step) {
      case 1:
        if (!soapNoteData.chief_complaint?.trim()) {
          toast.error("Chief Complaint is compulsory before proceeding");
          return;
        }

        break;

      case 2:
        break;

      case 3:
        // Compulsory: Primary Diagnosis
        // Note: primary_diagnosis is usually an array in the payload
        if (
          !soapNoteData.primary_diagnosis ||
          soapNoteData.primary_diagnosis.length === 0
        ) {
          toast.error("At least one Primary Diagnosis is compulsory");
          return;
        }
        break;

      default:
        break;
    }

    // If validation passes, move to the next step
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (
      soapNoteData.care_instructions.length === 0 ||
      soapNoteData.treatment_plan.length === 0
    ) {
      toast.error("Care Instructions and Treatment Plan is required");
      setLoading(false);
      return;
    }

    const drugRecords = medications.map((med) => ({
      name: med.drug,
      route: med.route,
      quantity: med.dosage,
      frequency: {
        value: med.frequency,
        rate: med.frequencyUnit,
      },
      duration: {
        value: med.duration,
        rate: med.durationUnit,
      },
      status: "ongoing",
      allergies: "",
      created_at: new Date().toISOString(),
    }));

    let uploadedAttachments = [];
    if (attachments.length > 0) {
      const formDataToUpload = new FormData();
      attachments.forEach((fileObj) => {
        formDataToUpload.append("files", fileObj.file);
      });
      try {
        const response = await axiosInstanceHos.post(
          "api/medical-records/upload-attachments",
          formDataToUpload,
        );
        console.log(response.data);
        uploadedAttachments = response.data; // depends on API response
      } catch (error) {
        console.error("Attachment upload failed:", error);
        toast.error("Failed to upload attachments");
        return;
      }
    }

    const selectedDate = new Date(
      `${selectedDay} ${selectedMonth} ${selectedYear} ${selectedTime}`,
    );
    const scheduled_time = selectedDate.toISOString();

    const payload = {
      staff: profile?.staff_id || "",
      patient: selectedPatientDetails.patient.hin || "",
      investigations_docs: uploadedAttachments,
      vital_signs: "",
      referred_docuhealhosp: soapNoteData.referred_docuhealth_hosp,
      referred_hosp: soapNoteData.referred_hosp,
      drug_records: drugRecords,
      appointment: {
        staff_id: profile?.staff_id || "",
        patient: selectedPatientDetails.patient.hin || "",
        scheduled_time: scheduled_time,
      },
      investigations: soapNoteData.investigations,
      problems_list: soapNoteData.problems_list,
      care_instructions: soapNoteData.care_instructions,
      drug_history_allergies: soapNoteData.drug_history_allergies,
      chief_complaint: soapNoteData.chief_complaint,
      history_of_complain: soapNoteData.history_of_presenting_complain,
      past_med_history: soapNoteData.past_med_history,
      family_history: soapNoteData.family_history,
      social_history: soapNoteData.social_history,
      other_history: soapNoteData.other_history,
      review: soapNoteData.review_of_system,
      general_exam: soapNoteData.general_exam,
      systemic_exam: soapNoteData.systemic_exam,
      besides_tests: soapNoteData.besides_tests,
      primary_diagnosis: soapNoteData.primary_diagnosis,
      differential_diagnosis: soapNoteData.differential_diagnosis,
      treatment_plan: soapNoteData.treatment_plan,
      patient_education: soapNoteData.patient_education,
    };

    try {
      console.log("Submitting SOAP Note with payload:", payload);
    } catch (err) {
      console.error("Error uploading SOAP Note:", err);
      toast.error("Error uploading SOAP Note");
    } finally {
      setLoading(false);
      setStep(1);
      setSoapNoteEntry(false);
      setSoapNoteData({
        chief_complaint: "",
        history_of_presenting_complain: "",
        past_med_history: "",
        family_history: "",
        social_history: "",
        other_history: "",
        review_of_system: "",
        primary_diagnosis: "",
        differential_diagnosis: "",
        patient_education: "",
        referred_docuhealth_hosp: "",
        referred_hosp: "",
        drug_history_allergies: [],
        general_exam: [],
        systemic_exam: [],
        besides_tests: [],
        investigations: [],
        problems_list: [],
        treatment_plan: [],
        care_instructions: [],
      });
      setInputs({
        drug_history_allergies: "",
        general_exam: "",
        systemic_exam: "",
        besides_tests: "",
        investigations: "",
        problems_list: "",
        treatment_plan: "",
        care_instructions: "",
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border mt-3 px-3 lg:px-5 py-5 text-sm">
        <div className="flex items-center gap-1 cursor-pointer border-b pb-3">
          <div
            onClick={() => {
              setSoapNoteEntry(false);
            }}
          >
            <ArrowLeft className="w-4 h-4 text-gray-800" />
          </div>
          <p>SOAP Note Entry</p>
        </div>
        {step === 1 && (
          <div className="my-5">
            <div className="mb-2 font-medium">
              <p>Subjective</p>
            </div>
            <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5">
              <p className="font-medium">Chief complaint (compulsory)</p>
              <textarea
                name="chief_complaint"
                value={soapNoteData.chief_complaint}
                onChange={handleTextChange}
                className="w-full my-2 rounded-sm border focus:outline-none p-3 text-[12px]  h-auto max-h-[300px]"
                placeholder="Enter chief complaint..."
              ></textarea>
            </div>
            <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
              <p className="font-medium">History of Presenting Complain</p>
              <textarea
                name="history_of_presenting_complain"
                value={soapNoteData.history_of_presenting_complain}
                onChange={handleTextChange}
                className="w-full my-2 rounded-sm border focus:outline-none p-3 text-[12px]  h-auto max-h-[300px]"
                placeholder="Enter history of presenting complaint..."
              ></textarea>
            </div>
            <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
              <p className="font-medium">Past Medical History</p>
              <textarea
                name="past_med_history"
                value={soapNoteData.past_med_history}
                onChange={handleTextChange}
                className="w-full my-2 rounded-sm border focus:outline-none p-3 text-[12px]  h-auto max-h-[300px]"
                placeholder="Enter past medical history..."
              ></textarea>
            </div>
            <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
              <p className="font-medium">Family History</p>
              <textarea
                name="family_history"
                value={soapNoteData.family_history}
                onChange={handleTextChange}
                className="w-full my-2 rounded-sm border focus:outline-none p-3 text-[12px]  h-auto max-h-[300px]"
                placeholder="Enter family history..."
              ></textarea>
            </div>
            <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
              <p className="font-medium">Social History</p>
              <textarea
                name="social_history"
                value={soapNoteData.social_history}
                onChange={handleTextChange}
                className="w-full my-2 rounded-sm border focus:outline-none p-3 text-[12px]  h-auto max-h-[300px]"
                placeholder="Enter social history..."
              ></textarea>
            </div>
            <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
              <p className="font-medium">Other History</p>
              <textarea
                name="other_history"
                value={soapNoteData.other_history}
                onChange={handleTextChange}
                className="w-full my-2 rounded-sm border focus:outline-none p-3 text-[12px]  h-auto max-h-[300px]"
                placeholder="Enter other history..."
              ></textarea>
            </div>

            <NoteSection
              title="Drug History / Allergies"
              field="drug_history_allergies"
              placeholder="e.g. Patient used Amoxicillin but developed rash"
              soapNoteData={soapNoteData}
              inputs={inputs}
              setInputs={setInputs}
              handleAddListItem={handleAddListItem}
              handleRemoveItem={handleRemoveItem}
              activeInput={activeInput}
              setActiveInput={setActiveInput}
            />

            <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
              <p className="font-medium">Review of System</p>
              <textarea
                name="review_of_system"
                value={soapNoteData.review_of_system}
                onChange={handleTextChange}
                className="w-full my-2 rounded-sm border focus:outline-none p-3 text-[12px]  h-auto max-h-[300px]"
                placeholder="Enter review of system..."
              ></textarea>
            </div>

            <div className="flex justify-end cursor-pointer">
              <button
                className="py-2.5 text-white bg-[#3E4095] rounded-full text-sm px-20 mt-5 cursor-pointer w-full lg:w-auto"
                onClick={() => {
                  handleNextStep();
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="my-5">
            <div className="mb-2 font-medium">
              <p>Subjective</p>
            </div>

            <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5">
              <p className="font-medium">Vital Signs (auto uploaded)</p>
            </div>

            <NoteSection
              title="General Examinations"
              field="general_exam"
              placeholder="e.g. Patient is stable but reports mild headache"
              soapNoteData={soapNoteData}
              inputs={inputs}
              setInputs={setInputs}
              handleAddListItem={handleAddListItem}
              handleRemoveItem={handleRemoveItem}
              activeInput={activeInput}
              setActiveInput={setActiveInput}
            />

            <NoteSection
              title="Systemic Examinations"
              field="systemic_exam"
              placeholder="e.g. Patient is stable but reports mild headache"
              soapNoteData={soapNoteData}
              inputs={inputs}
              setInputs={setInputs}
              handleAddListItem={handleAddListItem}
              handleRemoveItem={handleRemoveItem}
              activeInput={activeInput}
              setActiveInput={setActiveInput}
            />

            <NoteSection
              title="Relevant Besides Tests"
              field="besides_tests"
              placeholder="e.g. Patient is stable but reports mild headache"
              soapNoteData={soapNoteData}
              inputs={inputs}
              setInputs={setInputs}
              handleAddListItem={handleAddListItem}
              handleRemoveItem={handleRemoveItem}
              activeInput={activeInput}
              setActiveInput={setActiveInput}
            />

            <NoteSection
              title="Investigations (Test / Scan results interpretation)"
              field="investigations"
              placeholder="e.g. Patient reports mild headache"
              soapNoteData={soapNoteData}
              inputs={inputs}
              setInputs={setInputs}
              handleAddListItem={handleAddListItem}
              handleRemoveItem={handleRemoveItem}
              activeInput={activeInput}
              setActiveInput={setActiveInput}
            />

            <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
              <p className="font-medium">
                Investigation (Scan and Test result images / documents){" "}
              </p>

              {/* Click + Drag Area */}
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-400 rounded-lg p-16 cursor-pointer hover:bg-gray-50 transition my-3"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  handleFiles(files);
                }}
              >
                <UploadCloud className="w-5 h-5 text-[#3E4095]" />
                <span className="text-[#3E4095] font-medium">
                  Drag & drop or click to upload
                </span>
              </label>

              {/* Hidden Input */}
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => handleFiles(Array.from(e.target.files))}
                className="hidden"
              />

              {/* Preview Section */}
              {attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                  {attachments.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {doc.preview ? (
                          <img
                            src={doc.preview}
                            alt="Preview"
                            className="w-10 h-10 object-cover rounded-md border"
                          />
                        ) : (
                          <FileText className="w-8 h-8 text-gray-500" />
                        )}
                        <span className="truncate text-sm">
                          {truncateWords(doc.file.name, 10)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachments(index)}
                        className="text-gray-500 hover:text-red-600 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center lg:justify-end cursor-pointer gap-4 mt-5 sm:mt-0">
              <button
                className={`py-2 ${
                  loading
                    ? "border border-gray-400 text-gray-400 cursor-not-allowed"
                    : "text-[#3E4095] border border-[#3E4095] "
                } rounded-full text-sm px-16 sm:mt-5 w-full lg:w-auto`}
                disabled={loading}
                onClick={() => {
                  setStep(step - 1);
                }}
              >
                Previous
              </button>

              <button
                className="py-2.5 text-white bg-[#3E4095] rounded-full text-sm px-20  cursor-pointer lg:w-auto w-full sm:mt-5"
                onClick={() => {
                  handleNextStep();
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="my-5">
            <div className="mb-2 font-medium">
              <p>Assessment</p>
            </div>

            <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5">
              <p className="font-medium">Primary diagnosis (compulsory)</p>
              <textarea
                name="primary_diagnosis"
                value={soapNoteData.primary_diagnosis}
                onChange={handleTextChange}
                className="w-full my-2 rounded-sm border focus:outline-none p-3 text-[12px]  h-auto max-h-[300px]"
                placeholder="Enter primary diagnosis..."
              ></textarea>
            </div>

            <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
              <p className="font-medium">Differential diagnosis</p>
              <textarea
                name="differential_diagnosis"
                id="differentialDiagnosis"
                value={soapNoteData.differential_diagnosis}
                onChange={handleTextChange}
                className="w-full my-2 rounded-sm border focus:outline-none p-3 text-[12px]  h-auto max-h-[300px]"
                placeholder="Enter differential diagnosis..."
              ></textarea>
            </div>

            <NoteSection
              title="Problems List"
              field="problems_list"
              placeholder="e.g. Patient has mild headache"
              soapNoteData={soapNoteData}
              inputs={inputs}
              setInputs={setInputs}
              handleAddListItem={handleAddListItem}
              handleRemoveItem={handleRemoveItem}
              activeInput={activeInput}
              setActiveInput={setActiveInput}
            />

            <div className="flex flex-col sm:flex-row items-center lg:justify-end cursor-pointer gap-4 mt-5 sm:mt-0">
              <button
                className={`py-2 ${
                  loading
                    ? "border border-gray-400 text-gray-400 cursor-not-allowed"
                    : "text-[#3E4095] border border-[#3E4095] "
                } rounded-full text-sm px-16 sm:mt-5 w-full lg:w-auto`}
                disabled={loading}
                onClick={() => {
                  setStep(step - 1);
                }}
              >
                Previous
              </button>

              <button
                className="py-2.5 text-white bg-[#3E4095] rounded-full text-sm px-20  cursor-pointer lg:w-auto w-full sm:mt-5"
                onClick={() => {
                  handleNextStep();
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="my-5">
            <div className="mb-2 font-medium">
              <p>Plan</p>
            </div>

            <NoteSection
              title="Treatment Plan (compulsory)"
              field="treatment_plan"
              placeholder="e.g. Patient to take prescribed medication"
              soapNoteData={soapNoteData}
              inputs={inputs}
              setInputs={setInputs}
              handleAddListItem={handleAddListItem}
              handleRemoveItem={handleRemoveItem}
              activeInput={activeInput}
              setActiveInput={setActiveInput}
            />

            <NoteSection
              title="Care Instructions (compulsory)"
              field="care_instructions"
              placeholder="e.g. Patient to take prescribed medication"
              soapNoteData={soapNoteData}
              inputs={inputs}
              setInputs={setInputs}
              handleAddListItem={handleAddListItem}
              handleRemoveItem={handleRemoveItem}
              activeInput={activeInput}
              setActiveInput={setActiveInput}
            />

            <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
              <p className="font-medium mb-3">Medication</p>

              {medications.map((med, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end mt-3"
                >
                  <div>
                    <label className="block text-[12px] pb-1">Drug</label>
                    <input
                      type="text"
                      placeholder="Drug name..."
                      value={med.drug}
                      onChange={(e) =>
                        handleChange(index, "drug", e.target.value)
                      }
                      className="w-full border rounded p-2 text-[12px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] pb-1">Dosage</label>
                    <input
                      type="text"
                      placeholder="Enter dosage..."
                      value={med.dosage}
                      onChange={(e) =>
                        handleChange(index, "dosage", e.target.value)
                      }
                      className="w-full border rounded p-2 text-[12px] focus:outline-none"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-[12px] pb-1">Route</label>
                    <select
                      value={med.route}
                      onChange={(e) =>
                        handleChange(index, "route", e.target.value)
                      }
                      className="w-full border rounded p-2 text-[12px] focus:outline-none appearance-none bg-white pr-6"
                    >
                      <option value="Oral">Oral</option>
                      <option value="IV">IV</option>
                      <option value="IM">IM</option>
                    </select>
                    {/* Custom arrow */}
                    <div className="pointer-events-none absolute inset-y-10 right-0 flex items-center pr-2">
                      <svg
                        className="w-3 h-3 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[12px] pb-1">
                        Frequency
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={med.frequency}
                        onChange={(e) =>
                          handleChange(index, "frequency", e.target.value)
                        }
                        className="w-full border rounded p-2 text-[12px] focus:outline-none "
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-[12px] pb-1">&nbsp;</label>
                      <select
                        value={med.frequencyUnit}
                        onChange={(e) =>
                          handleChange(index, "frequencyUnit", e.target.value)
                        }
                        className="border rounded p-2 pr-5 text-[12px] appearance-none focus:outline-none"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-10 right-0 flex items-center pr-2">
                        <svg
                          className="w-3 h-3 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[12px] pb-1">Duration</label>
                      <input
                        type="text"
                        placeholder="duration..."
                        value={med.duration}
                        onChange={(e) =>
                          handleChange(index, "duration", e.target.value)
                        }
                        className="w-full border rounded p-2 text-[12px] focus:outline-none"
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-[12px] pb-1">&nbsp;</label>
                      <select
                        value={med.durationUnit}
                        onChange={(e) =>
                          handleChange(index, "durationUnit", e.target.value)
                        }
                        className="border rounded p-2 text-[12px] appearance-none pr-5 focus:outline-none"
                      >
                        <option value="Month">Months</option>
                        <option value="Week">Weeks</option>
                        <option value="Day">Days</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-10 right-0 flex items-center pr-2">
                        <svg
                          className="w-3 h-3 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                    {medications.length > 1 && (
                      <button
                        onClick={() => handleRemoveMedication(index)}
                        className="text-red-500 text-sm font-bold mt-5 cursor-pointer"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </div>
                  {/* Remove button */}
                </div>
              ))}

              <button
                onClick={handleAddMedication}
                className="text-[#3E4095] font-medium text-sm mt-3 flex items-center gap-1"
              >
                <Plus size={16} /> Add more drugs
              </button>
            </div>

            <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
              <p className="font-medium">Follow up / Next appointment</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-3 gap-3">
                <div className="relative">
                  <label className="block text-[12px] pb-1">Day</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full border rounded p-2 text-[12px] focus:outline-none appearance-none bg-white pr-6"
                  >
                    {[...Array(31)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-10 right-0 flex items-center pr-2">
                    <svg
                      className="w-3 h-3 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-[12px] pb-1">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full border rounded p-2 text-[12px] focus:outline-none appearance-none bg-white pr-6"
                  >
                    <option value="January" selected>
                      January
                    </option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-10 right-0 flex items-center pr-2">
                    <svg
                      className="w-3 h-3 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-[12px] pb-1">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full border rounded p-2 text-[12px] focus:outline-none appearance-none bg-white pr-6"
                  >
                    <option value="2025" selected>
                      2025
                    </option>
                    <option value="2026">2026</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-10 right-0 flex items-center pr-2">
                    <svg
                      className="w-3 h-3 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-[12px] pb-1">Select time</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full border rounded p-2 text-[12px] focus:outline-none appearance-none bg-white pr-6"
                  >
                    <option value="08:00" selected>
                      08:00 AM
                    </option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-10 right-0 flex items-center pr-2">
                    <svg
                      className="w-3 h-3 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
              <p className="font-medium">Referral (optional) </p>
              <div className="relative mt-3">
                <label className="block text-[12px] pb-1">
                  Refer to (DocuHealth Hospital) :
                </label>
                <select
                  name="referred_docuhealth_hosp" // Matches key in state
                  value={soapNoteData.referred_docuhealth_hosp}
                  onChange={handleTextChange}
                  className="w-full border rounded p-2 text-[12px] focus:outline-none appearance-none bg-white pr-6"
                >
                  {hospitals &&
                    hospitals
                      .filter(
                        (hospital) =>
                          hospital.name && hospital.name.trim() !== "",
                      )
                      .map((hospital, idx) => (
                        <option key={idx} value={hospital.hin}>
                          {hospital.name}
                        </option>
                      ))}
                </select>
                <div className="pointer-events-none absolute inset-y-10 right-0 flex items-center pr-2">
                  <svg
                    className="w-3 h-3 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <div className="relative mt-2">
                <label className="block text-[12px] pb-1">
                  Other hospitals outside Docuhealth
                </label>
                <input
                  name="referred_hosp" // Matches key in state
                  placeholder="Enter the hospital details (including Name and Address)..."
                  value={soapNoteData.referred_hosp}
                  onChange={handleTextChange}
                  className="w-full border rounded p-2 text-[12px] focus:outline-none"
                />
              </div>
            </div>

            <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
              <p className="font-medium">Patient's Education</p>
              <textarea
                name="patient_education"
                id="patientEducation"
                value={soapNoteData.patient_education}
                onChange={handleTextChange}
                className="w-full my-2 rounded-sm border focus:outline-none p-3 text-[12px]  h-auto max-h-[300px]"
                placeholder="Enter patient's education..."
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row items-center lg:justify-end cursor-pointer gap-4 mt-5 sm:mt-0">
              <button
                className={`py-2 ${
                  loading
                    ? "border border-gray-400 text-gray-400 cursor-not-allowed"
                    : "text-[#3E4095] border border-[#3E4095] "
                } rounded-full text-sm px-16 sm:mt-5 w-full lg:w-auto`}
                disabled={loading}
                onClick={() => {
                  setStep(step - 1);
                }}
              >
                Previous
              </button>
              <button
                disabled={loading}
                className={`py-2.5  rounded-full text-sm px-20 sm:mt-5 text-white lg:w-auto w-full ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#3E4095] cursor-pointer"
                }`}
                onClick={() => {
                  handleSubmit();
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading SOAP Note...
                  </div>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SoapNoteEntry;
