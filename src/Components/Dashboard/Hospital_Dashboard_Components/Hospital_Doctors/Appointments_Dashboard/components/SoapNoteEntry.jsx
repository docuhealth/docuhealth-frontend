import React, { useState, useEffect, useContext } from "react";
import { ArrowLeft, X, Plus, UploadCloud, FileText, AlertTriangle } from "lucide-react";
import { truncateWords } from "../../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import toast from "react-hot-toast";
import { DoctorAppContext } from "../../../../../../context/HospitalContext/Doctors/DoctorAppContext";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../../../../../ui/Modal";
import Button from "../../../../../ui/Button";
import VitalSignsCard from "../../../../../ui/VitalSignsCard";


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
    <p className="font-medium text-docuhealth-dark mb-2">{title}</p>

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
          className="flex-1 border rounded p-2 text-[12px] focus:ring-1 focus:ring-docuhealth-primary outline-none"
        />
        <button
          type="button"
          onClick={() => handleAddListItem(field)}
          className="bg-docuhealth-primary text-white px-3 py-1 rounded text-[12px]"
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
        className="flex items-center gap-1 text-docuhealth-primary font-medium text-[12px]"
      >
        <span className="text-lg">+</span> Add Entry
      </button>
    )}
  </div>
);

const SoapNoteEntry = ({ setSoapNoteEntry, selectedPatientDetails, source }) => {
  const { profile, hospitals } = useContext(DoctorAppContext);

  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);

  const [attachments, setAttachments] = useState([]);


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
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const [selectedDay, setSelectedDay] = useState(String(today.getDate()));
  const [selectedMonth, setSelectedMonth] = useState(monthNames[today.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));
  const [selectedTime, setSelectedTime] = useState("08:00");

  const [note, setNote] = useState("Nil");

  const [confirmationModal, setConfirmationModal] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [isShared, setIsShared] = useState(false);

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
    bedside_tests: [],
    investigations: [],
    problems_list: [],
    treatment_plan: [],
    care_instructions: [],
  });

  const [inputs, setInputs] = useState({
    drug_history_allergies: "",
    general_exam: "",
    systemic_exam: "",
    bedside_tests: "",
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

  const { data: selectedPatientFetchedInfo, isLoading } = useQuery({
    queryKey: ["patient-details-soap", selectedPatientDetails.patient.hin],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(
        `api/doctors/patient/info/${selectedPatientDetails.patient.hin}`,
      );
      return res.data;
    },
    enabled: !!selectedPatientDetails.patient.hin,
    keeepPreviousData: true,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (formData) =>
      axiosInstanceHos.post("api/medical-records/soap-note", formData),
    onSuccess: () => {
      toast.success("SOAP Note created successfully !");

      const hin = selectedPatientDetails.patient.hin
      
      sessionStorage.removeItem(`soap_draft_${selectedPatientDetails.patient.hin}`);
      setSoapNoteEntry(false);
      queryClient.invalidateQueries({
        queryKey: ["patient-med-records", hin],
      });
      queryClient.invalidateQueries({
        queryKey: ["patient-soap-notes", hin],
      });
      queryClient.invalidateQueries({
        queryKey: ["doctor-appointments"],
      });

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
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload soap note",
      );
    },
  });

  const handleSubmit = async () => {
    if (
      soapNoteData.care_instructions.length === 0 ||
      soapNoteData.treatment_plan.length === 0
    ) {
      toast.error("Care Instructions and Treatment Plan is required");
      return;
    }

    if (!note?.trim()) {
      toast.error("Follow up / Next appointment note is compulsory");
      return;
    }

    const selectedDate = new Date(
      `${selectedDay} ${selectedMonth} ${selectedYear} ${selectedTime}`,
    );

    const payload = {
      staff: profile?.staff_id || "",
      patient: selectedPatientDetails.patient.hin || "",
      ...(selectedPatientFetchedInfo?.latest_vitals?.id && { vital_signs: selectedPatientFetchedInfo.latest_vitals.id }),
      referred_docuhealth_hosp: soapNoteData.referred_docuhealth_hosp,
      referred_hosp: soapNoteData.referred_hosp,
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
      bedside_tests: soapNoteData.bedside_tests,
      primary_diagnosis: soapNoteData.primary_diagnosis,
      differential_diagnosis: soapNoteData.differential_diagnosis,
      treatment_plan: soapNoteData.treatment_plan,
      patient_education: soapNoteData.patient_education,
    };

    const formData = new FormData();

    const simpleFields = [
      "chief_complaint",
      "history_of_complain",
      "past_med_history",
      "family_history",
      "social_history",
      "other_history",
      "review",
      "patient_education",
      "primary_diagnosis",
      "differential_diagnosis",
      "referred_docuhealth_hosp",
      "referred_hosp",
    ];

    simpleFields.forEach((key) => {
      if (payload[key]) {
        formData.append(key, payload[key]);
      }
    });

    const appointment = {
      scheduled_time: selectedDate.toISOString(),
      note,
      type: "consultation",
    };

    formData.append("patient", selectedPatientDetails.patient.hin);
    formData.append("chief_complaint", soapNoteData.chief_complaint);
    formData.append("primary_diagnosis", soapNoteData.primary_diagnosis);

    if (selectedPatientFetchedInfo?.latest_vitals?.id) {
      formData.append(
        "vital_signs",
        selectedPatientFetchedInfo.latest_vitals.id,
      );
    }

    const arrayFields = [
      "investigations",
      "problems_list",
      "care_instructions",
      "drug_history_allergies",
      "general_exam",
      "systemic_exam",
      "bedside_tests",
      "treatment_plan",
    ];

    arrayFields.forEach((key) => {
      formData.append(key, JSON.stringify(soapNoteData[key] || []));
    });

    formData.append("next_appointment", JSON.stringify(appointment));

    if (source === "appointments" && selectedPatientDetails?.sqid) {
      formData.append("appointment", selectedPatientDetails.sqid);
    } else if (selectedPatientDetails?.sqid) {
      formData.append("check_in", selectedPatientDetails.sqid);
    }

    attachments.forEach((fileObj) => {
      formData.append("investigation_docs", fileObj.file);
    });

    if (isShared) {
      formData.append("is_shared", "true");
    }

    mutate(formData);
  };

  const [isRestored, setIsRestored] = useState(false);
  // Automatically save changes as the doctor types
useEffect(() => {

  if (!isRestored) return;

  const soapDraft = {
    step,
    soapNoteData,
    selectedDay,
    selectedMonth,
    selectedYear,
    selectedTime,
    note,
    inputs, // Saving current input field text too
    isShared
  };
  
  if (selectedPatientDetails?.patient?.hin) {
    sessionStorage.setItem(
      `soap_draft_${selectedPatientDetails.patient.hin}`, 
      JSON.stringify(soapDraft)
    );
  }
}, [isRestored,step, soapNoteData, selectedDay, selectedMonth, selectedYear, selectedTime, note, inputs, isShared, selectedPatientDetails.patient.hin]);


useEffect(() => {
  const hin = selectedPatientDetails?.patient?.hin;
  if (hin) {
    const savedDraft = sessionStorage.getItem(`soap_draft_${hin}`);
    if (savedDraft) {
      const data = JSON.parse(savedDraft);
      
      if (data.step) setStep(data.step);
      if (data.soapNoteData) setSoapNoteData(data.soapNoteData);
      if (data.selectedDay) setSelectedDay(data.selectedDay);
      if (data.selectedMonth) setSelectedMonth(data.selectedMonth);
      if (data.selectedYear) setSelectedYear(data.selectedYear);
      if (data.selectedTime) setSelectedTime(data.selectedTime);
      if (data.note) setNote(data.note);
      if (data.inputs) setInputs(data.inputs);
      if (data.isShared !== undefined) setIsShared(data.isShared);
    }
    setIsRestored(true);
  }
}, [selectedPatientDetails?.patient?.hin]);

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
                className="py-2.5 text-white bg-docuhealth-primary rounded-full text-sm px-20 mt-5 cursor-pointer w-full lg:w-auto"
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

            <VitalSignsCard
              title="Vital Signs (auto uploaded)"
              className="border rounded-md px-3 lg:px-5 py-4 lg:py-5"
              vitalSigns={selectedPatientFetchedInfo?.latest_vitals}
            />

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
              title="Relevant Bedside Tests"
              field="bedside_tests"
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
              title="Investigations (Scan and Test result images / documents)"
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
                <UploadCloud className="w-5 h-5 text-docuhealth-primary" />
                <span className="text-docuhealth-primary font-medium">
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
                  isPending
                    ? "border border-gray-400 text-gray-400 cursor-not-allowed"
                    : "text-docuhealth-primary border border-docuhealth-primary "
                } rounded-full text-sm px-16 sm:mt-5 w-full lg:w-auto`}
                disabled={isPending}
                onClick={() => {
                  setStep(step - 1);
                }}
              >
                Previous
              </button>

              <button
                className="py-2.5 text-white bg-docuhealth-primary rounded-full text-sm px-20  cursor-pointer lg:w-auto w-full sm:mt-5"
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
              <p className="font-medium text-docuhealth-dark">Primary diagnosis (compulsory)</p>
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
                  isPending
                    ? "border border-gray-400 text-gray-400 cursor-not-allowed"
                    : "text-docuhealth-primary border border-docuhealth-primary "
                } rounded-full text-sm px-16 sm:mt-5 w-full lg:w-auto`}
                disabled={isPending}
                onClick={() => {
                  setStep(step - 1);
                }}
              >
                Previous
              </button>

              <button
                className="py-2.5 text-white bg-docuhealth-primary rounded-full text-sm px-20  cursor-pointer lg:w-auto w-full sm:mt-5"
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
              <p className="font-medium text-docuhealth-dark">Follow up / Next appointment (compulsory)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-3 gap-3">
                <div className="">
                  <label className="block text-[12px] pb-1">Day</label>
                  <div className="relative">
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="w-full border rounded p-2 text-[12px] focus:outline-none appearance-none bg-white pr-8"
                    >
                      {[...Array(31)].map((_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
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
                <div className="">
                  <label className="block text-[12px] pb-1">Month</label>
                  <div className="relative">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full border rounded p-2 text-[12px] focus:outline-none appearance-none bg-white pr-8"
                    >
                      <option value="January">
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
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
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
                <div className="">
                  <label className="block text-[12px] pb-1">Year</label>
                  <div className="relative">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full border rounded p-2 text-[12px] focus:outline-none appearance-none bg-white pr-8"
                    >
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
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
                <div className="">
                  <label className="block text-[12px] pb-1">Select time</label>
                  <div className="relative">
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full border rounded p-2 text-[12px] focus:outline-none appearance-none bg-white pr-8"
                    >
                      <option value="08:00">
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
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
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
                <div className="relative col-span-1 sm:col-span-2 lg:col-span-4">
                  <label className="block text-[12px] ">Note</label>
                  <textarea
                    name="note"
                    id="note"
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                    }}
                    className="w-full my-2 rounded-sm border focus:outline-none p-3 text-[12px]  h-auto max-h-[300px] "
                    placeholder="Enter patient's education..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
              <p className="font-medium">Referral (optional) </p>
              <div className="mt-3">
                <label className="block text-[12px] pb-1">
                  Refer to (DocuHealth Hospital) :
                </label>
                <div className="relative">
                  <select
                    name="referred_docuhealth_hosp" // Matches key in state
                    value={soapNoteData.referred_docuhealth_hosp}
                    onChange={handleTextChange}
                    className="w-full border rounded p-2 text-[12px] focus:outline-none appearance-none bg-white pr-8"
                  >
                    {!soapNoteData.referred_docuhealth_hosp && (
                      <option value="">Select Hospital</option>
                    )}
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
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
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

            <div className="flex items-center justify-between border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
              <div>
                <p className="font-medium text-docuhealth-dark">Share SOAP Note (Optional)</p>
                <p className="text-[12px] text-gray-500 mt-1">Allow other healthcare personnel (e.g. NURSES) in this hospital to access this SOAP Note.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isShared} 
                  onChange={() => {
                    if (!isShared) {
                      setShareModal(true);
                    } else {
                      setIsShared(false);
                    }
                  }} 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-docuhealth-primary"></div>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center lg:justify-end cursor-pointer gap-4 mt-5 sm:mt-0">
              <button
                className={`py-2 ${
                  isPending
                    ? "border border-gray-400 text-gray-400 cursor-not-allowed"
                    : "text-docuhealth-primary border border-docuhealth-primary "
                } rounded-full text-sm px-16 sm:mt-5 w-full lg:w-auto`}
                disabled={isPending}
                onClick={() => {
                  setStep(step - 1);
                }}
              >
                Previous
              </button>
              <button
                disabled={
                  isPending ||
                  soapNoteData.care_instructions.length === 0 ||
                  soapNoteData.treatment_plan.length === 0
                }
                className={`py-2.5  rounded-full text-sm px-20 sm:mt-5 text-white lg:w-auto w-full ${
                  isPending ||
                  soapNoteData.care_instructions.length === 0 ||
                  soapNoteData.treatment_plan.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-docuhealth-primary cursor-pointer"
                }`}
                onClick={() => {
                  setConfirmationModal(true);
                }}
              >
                {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </div>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {
        // handleSubmit();
        confirmationModal && (
          <Modal isOpen={true} onClose={() => setConfirmationModal(false)} title="">
            <div className="flex flex-col items-center mb-6 pt-2">
              <svg
                width="50"
                height="50"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.0007 36.6654C10.7959 36.6654 3.33398 29.2034 3.33398 19.9987C3.33398 10.7939 10.7959 3.33203 20.0007 3.33203C29.2053 3.33203 36.6673 10.7939 36.6673 19.9987C36.6673 29.2034 29.2053 36.6654 20.0007 36.6654ZM20.0007 33.332C27.3645 33.332 33.334 27.3625 33.334 19.9987C33.334 12.6349 27.3645 6.66536 20.0007 6.66536C12.6369 6.66536 6.66732 12.6349 6.66732 19.9987C6.66732 27.3625 12.6369 33.332 20.0007 33.332ZM21.6673 17.4987V24.9987H23.334V28.332H16.6673V24.9987H18.334V20.832H16.6673V17.4987H21.6673ZM22.5007 13.332C22.5007 14.7127 21.3813 15.832 20.0007 15.832C18.62 15.832 17.5007 14.7127 17.5007 13.332C17.5007 11.9513 18.62 10.832 20.0007 10.832C21.3813 10.832 22.5007 11.9513 22.5007 13.332Z"
                  fill="var(--color-docuhealth-dark)"
                />
              </svg>

              <h2 className=" font-medium text-gray-800 mt-2">Take Note</h2>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-md p-6 mb-6">
              <p className="text-gray-500 text-center text-xs leading-relaxed">
                You're about to upload the SOAP Note and the After Visit
                Summary (AVS) for patients is generated for this. This SOAP
                Note can't be edited or deleted.
              </p>
            </div>

            <Button
              fullWidth
              onClick={() => {
                setConfirmationModal(false);
                handleSubmit();
              }}
            >
              Upload SOAP Note
            </Button>
            <button
              className="w-full mt-3 text-gray-500 text-[12px] hover:text-red-500 transition-colors cursor-pointer"
              onClick={() => {
                setConfirmationModal(false);
              }}
            >
              Cancel
            </button>
          </Modal>
        )
      }

      {shareModal && (
        <Modal isOpen={true} onClose={() => setShareModal(false)} title="">
          <div className="flex flex-col items-center mb-6 pt-2">
            <div className="bg-amber-100 p-3 rounded-full mb-3">
              <AlertTriangle className="w-6 h-6 text-docuhealth-amber-600" />
            </div>
            <h2 className="font-medium text-gray-800 text-lg">Share SOAP Note</h2>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-md p-6 mb-6">
            <p className="text-gray-600 text-center text-[13px] leading-relaxed">
              Other healthcare personnel ( NURSES ) in this hospital would have access to some part of the SOAP note of this patient.
            </p>
          </div>
          <Button
            fullWidth
            onClick={() => {
              setIsShared(true);
              setShareModal(false);
            }}
          >
            Continue
          </Button>
          <button
            className="w-full mt-3 py-3 text-red-500 bg-red-50 text-[12px] hover:bg-red-100 rounded-full transition-colors cursor-pointer font-medium"
            onClick={() => {
              setShareModal(false);
            }}
          >
            Cancel
          </button>
        </Modal>
      )}
    </>
  );
};

export default SoapNoteEntry;
