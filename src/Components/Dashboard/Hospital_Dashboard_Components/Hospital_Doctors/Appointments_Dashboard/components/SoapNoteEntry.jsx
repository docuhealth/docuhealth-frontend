import React, { useState, useEffect, useContext, useRef } from "react";
import { ArrowLeft, X, Plus, UploadCloud, FileText, AlertTriangle } from "lucide-react";
import { truncateWords } from "../../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import toast from "react-hot-toast";
import { DoctorAppContext } from "../../../../../../context/HospitalContext/Doctors/DoctorAppContext";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../../../../../ui/Modal";
import Button from "../../../../../ui/Button";
import HospitalLoader from "../../../../../ui/HospitalLoader";
import VitalSignsCard from "../../../../../ui/VitalSignsCard";
import Input from "../../../../../ui/Input";
import Select from "../../../../../ui/Select";
import { extractApiErrorMessage } from "../../../../../../utils/apiError";
import { resolveOrderContext } from "../../../../../../utils/careOrderContext";
import { ACTIVE_CHECK_INS_KEY } from "../../../../../../queries/Hospital/doctor/checkIns";
import { invalidateSoapNote } from "../../../../../../lib/queryInvalidations";


const textareaClass =
  "w-full mt-1 rounded-sm border focus:outline-none focus:border-docuhealth-primary p-3 text-[12px] min-h-[64px] max-h-[300px]";

const TextField = ({ label, name, value, onChange, placeholder, required, className = "" }) => (
  <div className={className}>
    <p className="font-medium text-docuhealth-dark">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </p>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={2}
      className={textareaClass}
      placeholder={placeholder}
    />
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
    <p className="font-semibold text-docuhealth-dark mb-3">{title}</p>
    <div className="space-y-4">{children}</div>
  </div>
);

const STEPS = ["History & Examination", "Assessment & Plan"];

// List field: type and press Enter (or +) to add. Text left in the box is
// added automatically when the doctor moves on, so nothing typed is lost.
const NoteSection = ({
  title,
  field,
  placeholder,
  required,
  soapNoteData,
  inputs,
  setInputs,
  handleAddListItem,
  handleRemoveItem,
}) => {
  const items = soapNoteData[field];
  const listRef = useRef(null);
  const prevCount = useRef(items.length);
  const [moreBelow, setMoreBelow] = useState(false);

  const updateMoreBelow = () => {
    const el = listRef.current;
    if (!el) return;
    setMoreBelow(el.scrollHeight - el.scrollTop - el.clientHeight > 4);
  };

  // Bring a newly added item into view so the doctor sees it landed
  useEffect(() => {
    const el = listRef.current;
    if (el && items.length > prevCount.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
    prevCount.current = items.length;
    updateMoreBelow();
  }, [items.length]);

  const value = inputs[field] || "";

  return (
  <div>
    <p className="font-medium text-docuhealth-dark">
      {title}
      {required && <span className="text-red-500"> *</span>}
      {items.length > 0 && (
        <span className="ml-2 text-[11px] font-normal text-gray-500">
          ({items.length} {items.length === 1 ? "item" : "items"})
        </span>
      )}
    </p>

    {items.length > 0 && (
    <div className="relative mt-1">
    <div
      ref={listRef}
      onScroll={updateMoreBelow}
      className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-visible pr-1"
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-white border border-gray-200 rounded p-2 text-[12px] flex justify-between items-center"
        >
          <span>{item}</span>
          <button
            type="button"
            aria-label="Remove"
            className="text-red-500 font-bold ml-2 cursor-pointer"
            onClick={() => handleRemoveItem(field, idx)}
          >
            <X size={11} />
          </button>
        </div>
      ))}
    </div>
    {moreBelow && (
      <button
        type="button"
        onClick={() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })}
        className="absolute inset-x-0 bottom-0 flex items-end justify-center h-10 pb-1 bg-linear-to-t from-white via-white/90 to-transparent text-[11px] font-medium text-docuhealth-primary"
      >
        Scroll for more ↓
      </button>
    )}
    </div>
    )}

    <div className="flex gap-2 mt-2">
      <Input
        value={value}
        onChange={(e) => setInputs({ ...inputs, [field]: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAddListItem(field);
          }
        }}
        placeholder={placeholder}
        containerClassName="flex-1"
        className="text-[12px] py-2"
      />
      <button
        type="button"
        aria-label={`Add to ${title}`}
        title="Add (or press Enter)"
        disabled={!value.trim()}
        onClick={() => handleAddListItem(field)}
        className="shrink-0 w-10 rounded-lg flex items-center justify-center bg-docuhealth-primary text-white disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
      >
        <Plus size={16} />
      </button>
    </div>
  </div>
  );
};

const SoapNoteEntry = ({ setSoapNoteEntry, selectedPatientDetails, source, onBack, onSubmitted }) => {
  const { profile, hospitals } = useContext(DoctorAppContext);

  // Different dashboards pass the selected patient under different keys
  // (appointments flow uses `.patient`, patient-mgt flow uses `.patient_info`).
  const patientHin =
    selectedPatientDetails?.patient?.hin ||
    selectedPatientDetails?.patient_info?.hin ||
    "";

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
    if (!inputs[field]?.trim()) return;
    setSoapNoteData((prev) => ({
      ...prev,
      [field]: [...prev[field], inputs[field].trim()],
    }));
    setInputs((prev) => ({ ...prev, [field]: "" }));
  };

  // Commit text still sitting in any list box so the doctor doesn't have to hit + first
  const flushPendingInputs = () => {
    setSoapNoteData((prev) => {
      const next = { ...prev };
      Object.entries(inputs).forEach(([field, value]) => {
        if (value?.trim() && Array.isArray(next[field])) {
          next[field] = [...next[field], value.trim()];
        }
      });
      return next;
    });
    setInputs((prev) => Object.fromEntries(Object.keys(prev).map((key) => [key, ""])));
  };

  const hasEntries = (field) =>
    soapNoteData[field].length > 0 || !!inputs[field]?.trim();

  const handleRemoveItem = (field, index) => {
    setSoapNoteData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const topRef = useRef(null);

  const goToStep = (next) => {
    setStep(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNextStep = () => {
    if (!soapNoteData.chief_complaint?.trim()) {
      toast.error("Chief Complaint is compulsory before proceeding");
      return;
    }
    flushPendingInputs();
    goToStep(2);
  };

  const handleReview = () => {
    if (!soapNoteData.primary_diagnosis?.trim()) {
      toast.error("Primary Diagnosis is compulsory");
      return;
    }
    flushPendingInputs();
    setConfirmationModal(true);
  };

  const { data: selectedPatientFetchedInfo, isLoading } = useQuery({
    queryKey: ["patient-details-soap", patientHin],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(
        `api/doctors/patient/info/${patientHin}`,
      );
      return res.data;
    },
    enabled: !!patientHin,
    keeepPreviousData: true,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (formData) =>
      axiosInstanceHos.post("api/records/soap-note", formData),
    onSuccess: () => {
      // The confirm modal stays open while uploading so its loader shows; close it here.
      setConfirmationModal(false);
      toast.success("Encounter note created successfully!");

      const hin = patientHin

      sessionStorage.removeItem(`soap_draft_${patientHin}`);
      invalidateSoapNote(queryClient, { hin });
      queryClient.invalidateQueries({ queryKey: ACTIVE_CHECK_INS_KEY });

      setStep(1);
      // `onSubmitted` lets the parent decide where to land (e.g. reopen the
      // patient-details view on the "Encounter Notes" tab). Fall back to just
      // closing the form when no handler is passed.
      if (onSubmitted) {
        onSubmitted();
      } else {
        setSoapNoteEntry(false);
      }
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
        bedside_tests: [],
        investigations: [],
        problems_list: [],
        treatment_plan: [],
        care_instructions: [],
      });
      setInputs({
        drug_history_allergies: "",
        general_exam: "",
        systemic_exam: "",
        bedside_tests: "",
        investigations: "",
        problems_list: "",
        treatment_plan: "",
        care_instructions: "",
      });
    },
    onError: (error) => {
      setConfirmationModal(false);
      console.error("Upload error:", error);
      // The API rejects with DRF field-keyed errors, not `{ message }` —
      // e.g. `{ check_in: ["Check-in must be in doctor_active status to
      // create a SOAP note."] }` when the encounter hasn't been claimed.
      // Surface that instead of a generic "Failed to upload" string.
      toast.error(extractApiErrorMessage(error, "Failed to upload encounter note"));
    },
  });

  const canSubmit =
    !isPending && hasEntries("care_instructions") && hasEntries("treatment_plan");

  const handleSubmit = async () => {
    const orderContext = resolveOrderContext(selectedPatientDetails);
    if (!orderContext.checkIn) {
      setConfirmationModal(false);
      toast.error("An encounter note can only be saved for a checked-in patient during a consultation.");
      return;
    }
    // Only care_instructions is required by POST /api/records/soap-note
    // (alongside patient / chief_complaint / primary_diagnosis, already gated in
    // the step flow). treatment_plan and the follow-up appointment are optional.
    if (soapNoteData.care_instructions.length === 0) {
      toast.error("Care Instructions is required");
      setConfirmationModal(false);
      return;
    }

    const payload = {
      staff: profile?.staff_id || "",
      patient: patientHin || "",
      ...(selectedPatientFetchedInfo?.latest_vitals?.sqid && { vital_signs: selectedPatientFetchedInfo.latest_vitals.sqid }),
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

    formData.append("patient", patientHin);
    formData.append("chief_complaint", soapNoteData.chief_complaint);
    formData.append("primary_diagnosis", soapNoteData.primary_diagnosis);

    if (selectedPatientFetchedInfo?.latest_vitals?.sqid) {
      formData.append(
        "vital_signs",
        selectedPatientFetchedInfo.latest_vitals.sqid,
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

    // Follow-up appointment is optional — only send it when a date was picked.
    if (selectedDay && selectedMonth && selectedYear && selectedTime) {
      const selectedDate = new Date(
        `${selectedDay} ${selectedMonth} ${selectedYear} ${selectedTime}`,
      );
      if (!Number.isNaN(selectedDate.getTime())) {
        formData.append(
          "next_appointment",
          JSON.stringify({
            scheduled_time: selectedDate.toISOString(),
            note: note || "",
            type: "consultation",
          }),
        );
      }
    }

    // A SOAP note is saved against the check-in only (the API refuses admission and appointment).
    formData.append("check_in", orderContext.checkIn);

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
    page: step,
    soapNoteData,
    selectedDay,
    selectedMonth,
    selectedYear,
    selectedTime,
    note,
    inputs, // Saving current input field text too
    isShared
  };
  
  if (patientHin) {
    sessionStorage.setItem(
      `soap_draft_${patientHin}`,
      JSON.stringify(soapDraft)
    );
  }
}, [isRestored,step, soapNoteData, selectedDay, selectedMonth, selectedYear, selectedTime, note, inputs, isShared, patientHin]);


useEffect(() => {
  const hin = patientHin;
  if (hin) {
    const savedDraft = sessionStorage.getItem(`soap_draft_${hin}`);
    if (savedDraft) {
      const data = JSON.parse(savedDraft);
      
      // `step` is from the old 4-page form: Subjective/Objective -> 1, Assessment/Plan -> 2
      if (data.page) setStep(data.page);
      else if (data.step) setStep(data.step >= 3 ? 2 : 1);
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
}, [patientHin]);

  return (
    <>
      <div ref={topRef} className="bg-white rounded-lg border mt-3 px-3 lg:px-5 py-5 text-sm scroll-mt-4">
        <button
          type="button"
          className="flex items-center gap-1 cursor-pointer border-b pb-3 w-full"
          onClick={() => {
            // `onBack` lets the parent restore the screen the doctor came
            // from (e.g. the patient-details view). Without it, callers that
            // hid another view when opening this form would fall through to
            // their default list view instead of the previous screen.
            if (onBack) {
              onBack();
            } else {
              setSoapNoteEntry(false);
            }
          }}
        >
          <ArrowLeft className="w-4 h-4 text-gray-800" />
          <span>Encounter Note Entry</span>
        </button>

        <div className="flex items-center gap-2 mt-4 text-[12px]">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              {i > 0 && <div className="h-px w-6 sm:w-10 bg-gray-300" />}
              <div
                className={`flex items-center gap-2 ${
                  step === i + 1 ? "text-docuhealth-primary font-medium" : "text-gray-500"
                }`}
              >
                <span
                  className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[11px] ${
                    step >= i + 1 ? "bg-docuhealth-primary text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {i + 1}
                </span>
                {label}
              </div>
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="my-4">
            <SectionCard title="Subjective">
              <TextField
                label="Chief complaint"
                name="chief_complaint"
                required
                value={soapNoteData.chief_complaint}
                onChange={handleTextChange}
                placeholder="Enter chief complaint..."
              />
              <TextField
                label="History of Presenting Complain"
                name="history_of_presenting_complain"
                value={soapNoteData.history_of_presenting_complain}
                onChange={handleTextChange}
                placeholder="Enter history of presenting complaint..."
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TextField
                  label="Past Medical History"
                  name="past_med_history"
                  value={soapNoteData.past_med_history}
                  onChange={handleTextChange}
                  placeholder="Enter past medical history..."
                />
                <TextField
                  label="Family History"
                  name="family_history"
                  value={soapNoteData.family_history}
                  onChange={handleTextChange}
                  placeholder="Enter family history..."
                />
                <TextField
                  label="Social History"
                  name="social_history"
                  value={soapNoteData.social_history}
                  onChange={handleTextChange}
                  placeholder="Enter social history..."
                />
                <TextField
                  label="Other History"
                  name="other_history"
                  value={soapNoteData.other_history}
                  onChange={handleTextChange}
                  placeholder="Enter other history..."
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <NoteSection
                  title="Drug History / Allergies"
                  field="drug_history_allergies"
                  placeholder="e.g. Patient used Amoxicillin but developed rash"
                  soapNoteData={soapNoteData}
                  inputs={inputs}
                  setInputs={setInputs}
                  handleAddListItem={handleAddListItem}
                  handleRemoveItem={handleRemoveItem}
                />
                <TextField
                  label="Review of System"
                  name="review_of_system"
                  value={soapNoteData.review_of_system}
                  onChange={handleTextChange}
                  placeholder="Enter review of system..."
                />
              </div>
            </SectionCard>

            <SectionCard title="Objective">
              <VitalSignsCard
                title="Vital Signs (auto uploaded)"
                className="border rounded-md px-3 lg:px-4 py-3 bg-gray-50/40"
                vitalSigns={selectedPatientFetchedInfo?.latest_vitals}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <NoteSection
                  title="General Examinations"
                  field="general_exam"
                  placeholder="e.g. Patient is stable but reports mild headache"
                  soapNoteData={soapNoteData}
                  inputs={inputs}
                  setInputs={setInputs}
                  handleAddListItem={handleAddListItem}
                  handleRemoveItem={handleRemoveItem}
                />
                <NoteSection
                  title="Systemic Examinations"
                  field="systemic_exam"
                  placeholder="e.g. Chest clear, no added sounds"
                  soapNoteData={soapNoteData}
                  inputs={inputs}
                  setInputs={setInputs}
                  handleAddListItem={handleAddListItem}
                  handleRemoveItem={handleRemoveItem}
                />
                <NoteSection
                  title="Relevant Bedside Tests"
                  field="bedside_tests"
                  placeholder="e.g. RBS 6.2 mmol/L"
                  soapNoteData={soapNoteData}
                  inputs={inputs}
                  setInputs={setInputs}
                  handleAddListItem={handleAddListItem}
                  handleRemoveItem={handleRemoveItem}
                />
                <NoteSection
                  title="Investigations"
                  field="investigations"
                  placeholder="e.g. FBC, chest X-ray"
                  soapNoteData={soapNoteData}
                  inputs={inputs}
                  setInputs={setInputs}
                  handleAddListItem={handleAddListItem}
                  handleRemoveItem={handleRemoveItem}
                />
              </div>

              <div>
                <p className="font-medium text-docuhealth-dark">
                  Investigation results (scan and test images / documents)
                </p>
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-5 cursor-pointer hover:bg-gray-50 transition mt-2"
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
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => handleFiles(Array.from(e.target.files))}
                  className="hidden"
                />
                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
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
            </SectionCard>

            <div className="flex justify-end">
              <button
                type="button"
                className="py-2.5 text-white bg-docuhealth-primary rounded-full text-sm px-20 mt-5 cursor-pointer w-full lg:w-auto"
                onClick={handleNextStep}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="my-4">
            <SectionCard title="Assessment">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TextField
                  label="Primary diagnosis"
                  name="primary_diagnosis"
                  required
                  value={soapNoteData.primary_diagnosis}
                  onChange={handleTextChange}
                  placeholder="Enter primary diagnosis..."
                />
                <TextField
                  label="Differential diagnosis"
                  name="differential_diagnosis"
                  value={soapNoteData.differential_diagnosis}
                  onChange={handleTextChange}
                  placeholder="Enter differential diagnosis..."
                />
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
              />
            </SectionCard>

            <SectionCard title="Plan">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <NoteSection
                  title="Treatment Plan"
                  field="treatment_plan"
                  required
                  placeholder="e.g. Tab Paracetamol 1g 8 hourly x 3 days"
                  soapNoteData={soapNoteData}
                  inputs={inputs}
                  setInputs={setInputs}
                  handleAddListItem={handleAddListItem}
                  handleRemoveItem={handleRemoveItem}
                />
                <NoteSection
                  title="Care Instructions"
                  field="care_instructions"
                  required
                  placeholder="e.g. Patient to take prescribed medication"
                  soapNoteData={soapNoteData}
                  inputs={inputs}
                  setInputs={setInputs}
                  handleAddListItem={handleAddListItem}
                  handleRemoveItem={handleRemoveItem}
                />
              </div>

              <TextField
                label="Patient's Education"
                name="patient_education"
                value={soapNoteData.patient_education}
                onChange={handleTextChange}
                placeholder="Enter patient's education..."
              />

              <div>
                <p className="font-medium text-docuhealth-dark">Follow up / Next appointment</p>
                <div className="grid grid-cols-2 xl:grid-cols-4 mt-2 gap-3">
                  <Select
                    label="Day"
                    value={String(selectedDay)}
                    onChange={(value) => setSelectedDay(value)}
                    options={[...Array(31)].map((_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
                  />
                  <Select
                    label="Month"
                    value={selectedMonth}
                    onChange={(value) => setSelectedMonth(value)}
                    options={monthNames.map((month) => ({ value: month, label: month }))}
                  />
                  <Select
                    label="Year"
                    value={String(selectedYear)}
                    onChange={(value) => setSelectedYear(value)}
                    options={["2024", "2025", "2026", "2027"].map((year) => ({ value: year, label: year }))}
                  />
                  <Select
                    label="Select time"
                    value={selectedTime}
                    onChange={(value) => setSelectedTime(value)}
                    options={[
                      { value: "08:00", label: "08:00 AM" },
                      { value: "09:00", label: "09:00 AM" },
                      { value: "10:00", label: "10:00 AM" },
                      { value: "11:00", label: "11:00 AM" },
                      { value: "12:00", label: "12:00 PM" },
                      { value: "13:00", label: "01:00 PM" },
                      { value: "14:00", label: "02:00 PM" },
                      { value: "15:00", label: "03:00 PM" },
                      { value: "16:00", label: "04:00 PM" },
                      { value: "17:00", label: "05:00 PM" },
                    ]}
                  />
                </div>
                <label className="block text-[12px] mt-3">Note</label>
                <textarea
                  name="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className={textareaClass}
                  placeholder="Enter a note for the follow-up..."
                />
              </div>

              <div>
                <p className="font-medium text-docuhealth-dark">Referral (optional)</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-2">
                  <Select
                    label="Refer to (DocuHealth Hospital) :"
                    value={soapNoteData.referred_docuhealth_hosp}
                    onChange={(value) =>
                      setSoapNoteData((prev) => ({ ...prev, referred_docuhealth_hosp: value }))
                    }
                    options={(hospitals || [])
                      .filter((hospital) => hospital.name && hospital.name.trim() !== "")
                      .map((hospital) => ({ value: hospital.hin, label: hospital.name }))}
                    placeholder="Select Hospital"
                  />
                  <Input
                    label="Other hospitals outside Docuhealth"
                    name="referred_hosp"
                    placeholder="Hospital name and address..."
                    value={soapNoteData.referred_hosp}
                    onChange={handleTextChange}
                    className="text-[12px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t pt-4">
                <div>
                  <p className="font-medium text-docuhealth-dark">Share Encounter Note (Optional)</p>
                  <p className="text-[12px] text-gray-500 mt-1">Allow other healthcare personnel (e.g. NURSES) in this hospital to access this Encounter Note.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-docuhealth-primary"></div>
                </label>
              </div>
            </SectionCard>

            <div className="flex flex-col-reverse sm:flex-row items-center sm:justify-end gap-3 mt-5">
              <button
                type="button"
                className={`py-2 ${
                  isPending
                    ? "border border-gray-400 text-gray-400 cursor-not-allowed"
                    : "text-docuhealth-primary border border-docuhealth-primary cursor-pointer"
                } rounded-full text-sm px-16 w-full sm:w-auto`}
                disabled={isPending}
                onClick={() => goToStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                disabled={!canSubmit}
                title={canSubmit ? undefined : "Add a Treatment Plan and Care Instructions to submit"}
                className={`py-2.5 rounded-full text-sm px-20 text-white w-full sm:w-auto ${
                  canSubmit ? "bg-docuhealth-primary cursor-pointer" : "bg-gray-400 cursor-not-allowed"
                }`}
                onClick={handleReview}
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
            {isPending && <HospitalLoader variant="overlay" label="Uploading encounter note..." />}
            <button
              type="button"
              aria-label="Close"
              onClick={() => setConfirmationModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={20} />
            </button>
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
                You're about to upload the Encounter Note and the After Visit
                Summary (AVS) for patients is generated for this. This Encounter
                Note can't be edited or deleted.
              </p>
            </div>

            <Button
              fullWidth
              onClick={handleSubmit}
              disabled={isPending}
            >
              Upload Encounter Note
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
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShareModal(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
          <div className="flex flex-col items-center mb-6 pt-2">
            <div className="bg-amber-100 p-3 rounded-full mb-3">
              <AlertTriangle className="w-6 h-6 text-docuhealth-amber-600" />
            </div>
            <h2 className="font-medium text-gray-800 text-lg">Share Encounter Note</h2>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-md p-6 mb-6">
            <p className="text-gray-600 text-center text-[13px] leading-relaxed">
              Other healthcare personnel ( NURSES ) in this hospital would have access to some part of the encounter note of this patient.
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
