import React, { useState, useEffect, useContext } from "react";
import { ArrowLeft } from "lucide-react";
import { X, UploadCloud, FileText } from "lucide-react";
import { truncateWords } from "../../../../Patient_Dashboard_Components/Home Dashboard/Components/formatRecordDate";
import toast from "react-hot-toast";
import { DoctorAppContext } from "../../../../../../context/Hospital Context/Doctors/DoctorAppContext";
import axiosInstance from "../../../../../../utils/axiosInstance";

const AfterVisitSummary = ({
  setAfterVisitSummary,
  selectedPatientDetails,
}) => {
  const [notes, setNotes] = useState([]); // store all notes
  const [newNote, setNewNote] = useState(""); // current note being typed
  const [showInput, setShowInput] = useState(false); // toggle input field

  const { profile, hospitals } = useContext(DoctorAppContext);

  console.log(hospitals);

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

  const [findings, setFindings] = useState([]);
  const [newFinding, setNewFinding] = useState("");
  const [showFindingInput, setShowFindingInput] = useState(false);

  const handleAddFinding = () => {
    if (newFinding.trim() === "") return;
    setFindings([...findings, newFinding.trim()]);
    setNewFinding("");
    setShowFindingInput(false);
  };

  const handleRemoveFinding = (index) => {
    const updated = findings.filter((_, idx) => idx !== index);
    setFindings(updated);
  };

  const [step, setStep] = useState(1);

  const [instructions, setInstructions] = useState([]);
  const [newInstruction, setNewInstruction] = useState("");
  const [showInstructionInput, setShowInstructionInput] = useState(false);

  const handleAddInstruction = () => {
    if (newInstruction.trim() === "") return;
    setInstructions([...instructions, newInstruction.trim()]);
    setNewInstruction("");
    setShowInstructionInput(false);
  };

  const handleRemoveInstruction = (index) => {
    const updated = instructions.filter((_, idx) => idx !== index);
    setInstructions(updated);
  };

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

  const [formData, setFormData] = useState({
    chief_complaint: "",
    history: [],
    vital_signs: {
      blood_pressure: "",
      temp: "",
      resp_rate: "",
      height: "",
      weight: "",
      heart_rate: "",
    },
    physical_exam: [],
    diagnosis: [],
    treatment_plan: [],
    care_instructions: [],
    drug_records: [
      {
        name: "",
        route: "",
        quantity: "",
        frequency: {
          value: "",
          rate: "",
        },
        duration: {
          value: "",
          rate: "",
        },
        status: "ongoing",
      },
    ],
    attachments: [],
    appointment: {
      staff_id: profile?.staff_id || "",
      scheduled_time: "2025-11-30T13:31:42.281Z",
    },
    doctor: profile?.staff_id || "",
    referred_docuhealth_hosp: "string",
    referred_hosp: "string",
    patient: selectedPatientDetails.patient.hin || "",
  });
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedTime, setSelectedTime] = useState("08:00");

  const [otherHospitalInput, setOtherHospitalInput] = useState("");
  const [selectedDocuHealthHospital, setSelectedDocuHealthHospital] =
    useState("");

  const handleNextStep = () => {
    // Gather textarea values
    const chiefComplaint = document
      .getElementById("chiefComplaint")
      ?.value.trim();
    const investigationInput = document
      .getElementById("diagnosis")
      ?.value.trim();
    const treatmentInput = document.getElementById("treatment")?.value.trim();

    const vitalSigns = {
      blood_pressure: document.getElementById("bloodPressure")?.value.trim(),
      temp: document.getElementById("temperature")?.value.trim(),
      resp_rate: document.getElementById("respRate")?.value.trim(),
      height: document.getElementById("height")?.value.trim(),
      weight: document.getElementById("weight")?.value.trim(),
      heart_rate: document.getElementById("heartRate")?.value.trim(),
    };

    // Check for empty fields
    if (
      !chiefComplaint ||
      notes.length === 0 ||
      Object.values(vitalSigns).some((v) => !v) ||
      findings.length === 0 ||
      !investigationInput ||
      !treatmentInput
    ) {
      toast.error("Please fill in all required fields before proceeding");
      return; // stop execution
    }

    // Populate formData
    setFormData({
      chief_complaint: chiefComplaint,
      history: notes,
      vital_signs: vitalSigns,
      physical_exam: findings,
      diagnosis: investigationInput.split(",").map((item) => item.trim()),
      treatment_plan: treatmentInput.split(",").map((item) => item.trim()),
    });

    // Move to next step
    setStep(step + 1);
  };

  useEffect(() => {
    if (step === 2) {
      console.log("Form Data on Step 2:", formData);
    }
  }, [step, formData]);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const careInstructions = instructions; // already an array
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
    }));

    let uploadedAttachments = [];
    if (attachments.length > 0) {
      const formDataToUpload = new FormData();
      attachments.forEach((fileObj) => {
        formDataToUpload.append("files", fileObj.file);
      });
      try {
        const response = await axiosInstance.post(
          "api/medical-records/upload-attachments",
          formDataToUpload
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
      `${selectedDay} ${selectedMonth} ${selectedYear} ${selectedTime}`
    );
    const scheduled_time = selectedDate.toISOString();

    const referred_docuhealth_hosp = selectedDocuHealthHospital || "";
    const referred_hosp = otherHospitalInput || "";

    const payload = {
      ...formData,
      care_instructions: careInstructions,
      drug_records: drugRecords,
      attachments: uploadedAttachments,
      appointment: {
        staff_id: profile?.staff_id || "",
        scheduled_time,
      },
      referred_docuhealth_hosp,
      referred_hosp,
      doctor: profile?.staff_id || "",
      patient: selectedPatientDetails.patient.hin || "",
    };

    console.log("Final payload:", payload);

    try {
      const res = await axiosInstance.post("api/medical-records", payload);
      console.log(res);
      toast.success("After visit summary created successfully");
      setAfterVisitSummary(false);
    } catch (err) {
      console.error("Error uploading after visit summary:", err);
      toast.error("Error uploading after visit summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border mt-3 p-5 text-sm">
        <div className="flex items-center gap-1 cursor-pointer border-b pb-3">
          <div
            onClick={() => {
              setAfterVisitSummary(false);
            }}
          >
            <ArrowLeft className="w-4 h-4 text-gray-800" />
          </div>
          <p>After visit summary</p>
        </div>
        {step === 1 && (
          <div className="my-5">
            <div className="border rounded-md p-5">
              <p className="font-medium">Chief complaint</p>
              <textarea
                name=""
                id="chiefComplaint"
                className="w-full my-2 rounded-sm border focus:outline-none p-3 text-[12px]  h-auto max-h-[300px]"
                placeholder="Enter chief complaint..."
              ></textarea>
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
            <div className="border rounded-md p-5 mt-3">
              <p className="font-medium">Vital signs</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 my-5 gap-5">
                <div className="relative">
                  <p className="pb-1">Blood pressure</p>
                  <div className="relative">
                    <input
                      type="text"
                      id="bloodPressure"
                      className="w-full text-sm border px-3 py-2 rounded-sm pr-16 focus:outline-none" // add padding-right for the unit
                      placeholder="Enter blood pressure"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                      mmHg
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <p className="pb-1">Temperature</p>
                  <div className="relative">
                    <input
                      type="text"
                      id="temperature"
                      className="w-full text-sm border px-3 py-2 rounded-sm pr-8 focus:outline-none" // add padding-right for the unit
                      placeholder="Enter temperature"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                      °C
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <p className="pb-1">Respiratory Rate</p>
                  <div className="relative">
                    <input
                      type="text"
                      id="respRate"
                      className="w-full text-sm border px-3 py-2 rounded-sm pr-14 focus:outline-none" // add padding-right for the unit
                      placeholder="Enter respiratory rate"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                      /Min
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <p className="pb-1">Height</p>
                  <div className="relative">
                    <input
                      type="text"
                      id="height"
                      className="w-full text-sm border px-3 py-2 rounded-sm pr-10 focus:outline-none" // add padding-right for the unit
                      placeholder="Enter height"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                      m
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <p className="pb-1">Heart Rate</p>
                  <div className="relative">
                    <input
                      type="text"
                      id="heartRate"
                      className="w-full text-sm border px-3 py-2 rounded-sm pr-14 focus:outline-none" // add padding-right for the unit
                      placeholder="Enter heart rate"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                      Bpm
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <p className="pb-1">Weight</p>
                  <div className="relative">
                    <input
                      type="text"
                      id="weight"
                      className="w-full text-sm border px-3 py-2 rounded-sm pr-10 focus:outline-none" // add padding-right for the unit
                      placeholder="Enter weight"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                      Kg
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border rounded-md p-5 mt-3">
              <p className="font-medium">Physical examination findings</p>

              {/* Existing findings */}
              <div className="my-2 space-y-2 max-h-[300px] overflow-y-auto">
                {findings.length === 0 && (
                  <p className="text-gray-400 text-[12px]">No findings yet</p>
                )}
                {findings.map((finding, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-100 rounded p-2 text-[12px] flex justify-between items-center"
                  >
                    <span>{finding}</span>
                    <button
                      className="text-red-500 text-sm font-bold ml-2"
                      onClick={() => handleRemoveFinding(idx)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              {/* Add finding button */}
              {!showFindingInput && (
                <button
                  className="flex items-center gap-1 text-[#3E4095] font-medium text-sm mt-2"
                  onClick={() => setShowFindingInput(true)}
                >
                  <span className="text-lg">+</span> Add finding
                </button>
              )}

              {/* Input field for new finding */}
              {showFindingInput && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newFinding}
                    onChange={(e) => setNewFinding(e.target.value)}
                    placeholder="Enter finding..."
                    className="flex-1 border rounded p-2 text-[12px] focus:outline-none"
                  />
                  <button
                    className="bg-[#3E4095] text-white px-4 rounded"
                    onClick={handleAddFinding}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
            <div className="border rounded-md p-5 mt-3">
              <p className="font-medium">Investigation / Diagnosis</p>
              <textarea
                name=""
                id="diagnosis"
                className="w-full my-2 rounded-sm border focus:outline-none p-3 text-[12px]  h-auto max-h-[300px]"
                placeholder="Enter investigation / diagnosis (separate with a comma)..."
              ></textarea>
            </div>
            <div className="border rounded-md p-5 mt-3">
              <p className="font-medium">Treatment plan</p>
              <textarea
                name=""
                id="treatment"
                className="w-full my-2 rounded-sm border focus:outline-none p-3 text-[12px]  h-auto max-h-[300px]"
                placeholder="Enter treatment plan (separate with a comma)..."
              ></textarea>
            </div>
            <div className="flex justify-end cursor-pointer">
              <button
                className="py-2.5 text-white bg-[#3E4095] rounded-full text-sm px-20 mt-5 cursor-pointer"
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
            <div className="border rounded-md p-5 mt-3">
              <p className="font-medium">Care instruction</p>

              {/* Existing instructions */}
              <div className="my-2 space-y-2 max-h-[300px] overflow-y-auto">
                {instructions.length === 0 && (
                  <p className="text-gray-400 text-[12px]">
                    No instructions yet
                  </p>
                )}
                {instructions.map((instruction, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-100 rounded p-2 text-[12px] flex justify-between items-center"
                  >
                    <span>{instruction}</span>
                    <button
                      className="text-red-500 text-sm font-bold ml-2"
                      onClick={() => handleRemoveInstruction(idx)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              {/* Add instruction button */}
              {!showInstructionInput && (
                <button
                  className="flex items-center gap-1 text-[#3E4095] font-medium text-sm mt-2"
                  onClick={() => setShowInstructionInput(true)}
                >
                  <span className="text-lg">+</span> Add instruction
                </button>
              )}

              {/* Input field for new instruction */}
              {showInstructionInput && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newInstruction}
                    onChange={(e) => setNewInstruction(e.target.value)}
                    placeholder="Enter instruction..."
                    className="flex-1 border rounded p-2 text-[12px] focus:outline-none"
                  />
                  <button
                    className="bg-[#3E4095] text-white px-4 rounded"
                    onClick={handleAddInstruction}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
            <div className="border rounded-md p-5 mt-3">
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
                        placeholder="Medication name..."
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
                        &times;
                      </button>
                    )}
                  </div>
                  {/* Remove button */}
                </div>
              ))}

              {/* Add more drugs */}
              <button
                onClick={handleAddMedication}
                className="text-[#3E4095] font-medium text-sm mt-2 flex items-center gap-1"
              >
                + Add more drugs
              </button>
            </div>
            <div className="border rounded-md p-5 mt-3">
              <p className="font-medium">Attachment (optional)</p>

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
            <div className="border rounded-md p-5 mt-3">
              <p className="font-medium">Follow up / Next appointment</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-3 gap-3">
                <div className="relative">
                  <label className="block text-[12px] pb-1">Day</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full border rounded p-2 text-[12px] focus:outline-none appearance-none bg-white pr-6"
                  >
                    <option value="Monday" selected>
                      Monday
                    </option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
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
            <div className="border rounded-md p-5 mt-3">
              <p className="font-medium">Referral (optional) </p>
              <div className="relative mt-3">
                <label className="block text-[12px] pb-1">
                  Refer to (DocuHealth Hospital) :
                </label>
                <select
                  value={selectedDocuHealthHospital}
                  onChange={(e) =>
                    setSelectedDocuHealthHospital(e.target.value)
                  }
                  className="w-full border rounded p-2 text-[12px] focus:outline-none appearance-none bg-white pr-6"
                >
                  {hospitals &&
                    hospitals
                      .filter(
                        (hospital) =>
                          hospital.name && hospital.name.trim() !== ""
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
                  type="text"
                  placeholder="Enter the hospital details (including Name and Address of hospital) "
                  value={otherHospitalInput}
                  onChange={(e) => setOtherHospitalInput(e.target.value)}
                  className="w-full border rounded p-2 text-[12px] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end cursor-pointer gap-4">
              <button
                className={`py-2 ${
                  loading
                    ? "border border-gray-400 text-gray-400 cursor-not-allowed"
                    : "text-[#3E4095] border border-[#3E4095] "
                } rounded-full text-sm px-20 mt-5 `}
                disabled={loading}
                onClick={() => {
                  setStep(step - 1);
                }}
              >
                Previous
              </button>
              <button
                disabled={loading}
                className={`py-2.5  rounded-full text-sm px-20 mt-5 text-white  ${
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
                    Creating afer visit summary...
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

export default AfterVisitSummary;
