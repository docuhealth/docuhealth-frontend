import React, { useState, useMemo, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import { createInpatientDischarge } from "../../../../../queries/Hospital/doctor/discharge";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import DischargeAdmissionSummaryStep from "./DischargeAdmissionSummaryStep";
import DischargeProceduresMedicationsStep from "./DischargeProceduresMedicationsStep";
import DischargeFollowUpStep from "./DischargeFollowUpStep";
import ConfirmDischargeModal from "./ConfirmDischargeModal";
import DischargeSuccessModal from "./DischargeSuccessModal";

const COMPLETED_LAB_STATUSES = ["completed", "accepted", "result_ready", "approved"];
const pageSize = 20;

// In-patient discharge, as a 3-step wizard (Admission Summary → Procedures &
// Medications → Follow-up). The read-only summary fields, investigation options,
// and seeded medications are wired to real data already fetched elsewhere in the
// doctor's dashboard; "Complete Discharge" submits the wizard to
// POST /api/medical-records/discharge (see queries/Hospital/doctor/discharge.js
// for the field mapping and the multipart quirks).
const InpatientDischargeSummary = ({ selectedDischargePatient, setDischargePatient }) => {
  const queryClient = useQueryClient();

  const hin =
    selectedDischargePatient?.patient_info?.hin ||
    selectedDischargePatient?.patient?.hin ||
    "";

  // For the in-patient list, the selected row's own sqid IS the admission sqid
  // (the outpatient list carries a check-in instead — that flow uses a
  // different discharge endpoint).
  const admissionSqid =
    selectedDischargePatient?.admission_sqid || selectedDischargePatient?.sqid || "";

  const { data: patientFullInfo } = useQuery({
    queryKey: ["patient-info", hin],
    queryFn: async () => (await axiosInstanceHos.get(`api/doctors/patient/info/${hin}`)).data,
    enabled: !!hin,
  });

  const { data: medRecordsData } = useQuery({
    queryKey: ["patient-med-records", hin, 1],
    queryFn: async () =>
      (await axiosInstanceHos.get(`api/doctors/patient/records/${hin}?page=1&size=6`)).data,
    enabled: !!hin,
  });

  const { data: soapNotesData, isFetching: soapNotesLoading } = useQuery({
    queryKey: ["patient-soap-notes", hin, 1],
    queryFn: async () =>
      (await axiosInstanceHos.get(`api/medical-records/soap-note/${hin}?page=1&size=6`)).data,
    enabled: !!hin,
  });

  const { data: labRecordsData } = useQuery({
    queryKey: ["patient-lab-records", hin, 1],
    queryFn: async () =>
      (await axiosInstanceHos.get(`api/lab/test-orders/patient/${hin}?page=1&size=${pageSize}`)).data,
    enabled: !!hin,
  });

  // ---- Step 1: read-only admission summary ----
  const admissionSummary = useMemo(() => {
    const firstname =
      patientFullInfo?.patient_info?.firstname || selectedDischargePatient?.patient_info?.firstname;
    const lastname =
      patientFullInfo?.patient_info?.lastname || selectedDischargePatient?.patient_info?.lastname;
    const fullName = [firstname, lastname].filter(Boolean).join(" ") || null;

    const wardPlaced = selectedDischargePatient?.ward_info?.name
      ? `${selectedDischargePatient.ward_info.name} ward`
      : null;

    const admissionDateTime = formatFullDateTime(selectedDischargePatient?.admission_date);
    const dischargeDateTime = formatFullDateTime(new Date());

    let lengthOfStay = null;
    if (selectedDischargePatient?.admission_date) {
      const admitted = new Date(selectedDischargePatient.admission_date);
      if (!isNaN(admitted.getTime())) {
        const days = Math.max(1, Math.round((Date.now() - admitted.getTime()) / 86400000));
        lengthOfStay = `${days} day${days !== 1 ? "s" : ""}`;
      }
    }

    const admittingDoctor = selectedDischargePatient?.staff_info
      ? `Dr. ${selectedDischargePatient.staff_info.firstname} ${selectedDischargePatient.staff_info.lastname}`
      : null;

    return {
      fullName,
      wardPlaced,
      admissionDateTime,
      dischargeDateTime: dischargeDateTime ? `${dischargeDateTime} (today)` : null,
      lengthOfStay,
      admittingDoctor,
      // No distinct "consultant in-charge" or "admission diagnosis" field
      // exists on the admission/patient-info records yet, so these stay
      // blank rather than guessing at a value.
      consultantInCharge: null,
      admissionDiagnosis: null,
    };
  }, [patientFullInfo, selectedDischargePatient]);

  // ---- Editable form state (steps 1 & 3) ----
  const [formData, setFormData] = useState({
    chief_complaint: "",
    primary_diagnosis: "",
    secondary_diagnosis: "",
    comorbidities: "",
    treatment_plan: "",
    hospital_course_note: "",
    completed_investigations: [],
    condition_at_discharge: "",
    will_continue_followup: true,
    follow_up_clinic: "",
    referral: "",
    follow_up_date: "",
    follow_up_time: "",
    pending_investigations: [],
    care_instructions: "",
    follow_up_instructions: "",
  });

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---- Generate hospital course note from the latest real progress note ----
  const handleGenerateSummary = () => {
    const notes = soapNotesData?.results || [];
    if (notes.length === 0) {
      toast.error("No progress notes found for this patient yet.");
      return;
    }
    const latest = [...notes].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];

    const lines = [
      latest.chief_complaint && `Chief complaint: ${latest.chief_complaint}`,
      latest.primary_diagnosis && `Assessment: ${latest.primary_diagnosis}`,
      latest.additional_notes && `Notes: ${latest.additional_notes}`,
    ].filter(Boolean);

    handleFieldChange(
      "hospital_course_note",
      lines.length > 0
        ? lines.join("\n")
        : "No further detail was recorded on the latest progress note.",
    );
  };

  // ---- Step 2: investigations (from real lab test orders) ----
  const flatLabItems = useMemo(() => {
    const orders = labRecordsData?.results || [];
    return orders.reduce((acc, order) => {
      if (Array.isArray(order.items_info)) return acc.concat(order.items_info);
      if (Array.isArray(order.items)) return acc.concat(order.items);
      return acc.concat([order]);
    }, []);
  }, [labRecordsData]);

  const toInvestigationOption = (item, idx) => ({
    value: `${item.id ?? item.test_info?.id ?? item.test_info?.name ?? "investigation"}-${idx}`,
    label: item.test_info?.name || "Investigation",
  });

  const completedInvestigationOptions = useMemo(
    () =>
      flatLabItems
        .filter((item) => COMPLETED_LAB_STATUSES.includes(item.status))
        .map(toInvestigationOption),
    [flatLabItems],
  );

  const pendingInvestigationOptions = useMemo(
    () =>
      flatLabItems
        .filter((item) => !COMPLETED_LAB_STATUSES.includes(item.status))
        .map(toInvestigationOption),
    [flatLabItems],
  );

  const toggleSelection = (field) => (item) => {
    setFormData((prev) => {
      const already = prev[field].some((s) => s.value === item.value);
      return {
        ...prev,
        [field]: already
          ? prev[field].filter((s) => s.value !== item.value)
          : [...prev[field], item],
      };
    });
  };

  // ---- Step 2: medications ----
  const [existingMedications, setExistingMedications] = useState([]);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [newMedications, setNewMedications] = useState([]);
  const seededMedicationsRef = useRef(false);

  useEffect(() => {
    if (seededMedicationsRef.current) return;
    const latestRecord = medRecordsData?.results?.[0];
    const drugOrdersInfo = latestRecord?.drug_orders_info || latestRecord?.drug_records;
    if (!drugOrdersInfo || drugOrdersInfo.length === 0) return;

    const flatDrugs = drugOrdersInfo[0]?.drugs
      ? drugOrdersInfo.flatMap((order) => order.drugs || [])
      : drugOrdersInfo;

    const seeded = flatDrugs.map((drugItem) => {
      const drug = drugItem.drug_record || drugItem;
      const frequency =
        typeof drug.frequency === "object"
          ? `${drug.frequency?.value ?? ""} ${drug.frequency?.rate ?? ""}`.trim()
          : drug.frequency;
      return {
        name: drug.name,
        dosage: drug.quantity ?? "",
        route: drug.route || "Oral",
        frequency: frequency || "",
        status: null,
      };
    });

    if (seeded.length > 0) {
      setExistingMedications(seeded);
      seededMedicationsRef.current = true;
    }
  }, [medRecordsData]);

  // ---- Step navigation ----
  const [currentStep, setCurrentStep] = useState(1);
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // ---- Complete discharge: validate → confirm → POST → success ----
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const toLines = (value) =>
    String(value || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  const buildDischargePayload = () => {
    const diagnosis = [
      formData.primary_diagnosis,
      formData.secondary_diagnosis,
      formData.comorbidities,
    ]
      .map((entry) => entry.trim())
      .filter(Boolean);

    const seededDrugs = existingMedications
      .filter((med) => med.status !== "stopped" && med.name)
      .map((med) => {
        // Seeded rows carry frequency as a display string ("1 od" or "od").
        const [lead, ...rest] = String(med.frequency || "").trim().split(" ");
        const hasNumericLead = rest.length > 0 && !Number.isNaN(Number(lead));
        return {
          name: med.name,
          route: med.route || "Oral",
          quantity: Number(med.dosage) || 1,
          unit: med.unit || null,
          frequency: hasNumericLead
            ? { value: Number(lead) || 1, rate: rest.join(" ") }
            : { value: 1, rate: String(med.frequency || "od").trim() || "od" },
          duration: { value: 1, rate: "days" },
          allergies: [],
        };
      });

    const addedDrugs = newMedications
      .filter((med) => med.drug && med.drug.trim())
      .map((med) => ({
        name: med.drug,
        route: med.route || "Oral",
        quantity: Number(med.dosage) || 1,
        unit: med.dosageUnit || null,
        frequency: { value: 1, rate: med.frequency },
        duration: {
          value: Number(med.duration) || 1,
          rate: med.durationUnit ? med.durationUnit.toLowerCase() : "days",
        },
        allergies: [],
      }));

    let follow_up_appointment = null;
    if (formData.follow_up_date && formData.follow_up_time) {
      follow_up_appointment = {
        type: "follow_up",
        note: formData.follow_up_instructions.trim() || "Follow up",
        scheduled_time: new Date(
          `${formData.follow_up_date}T${formData.follow_up_time}`,
        ).toISOString(),
      };
    }

    return {
      admission: admissionSqid,
      chief_complaint: formData.chief_complaint.trim(),
      condition_on_discharge: formData.condition_at_discharge.trim(),
      diagnosis,
      treatment_plan: toLines(formData.treatment_plan),
      care_instructions: toLines(formData.care_instructions),
      drug_records: [...seededDrugs, ...addedDrugs],
      follow_up_appointment,
    };
  };

  const dischargeMutation = useMutation({
    mutationFn: createInpatientDischarge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital-patients-doctor"] });
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    },
    onError: (err) => {
      setShowConfirmModal(false);
      const data = err.response?.data;
      const firstError =
        data && typeof data === "object" ? Object.values(data).flat()[0] : null;
      toast.error(
        (typeof firstError === "string" && firstError) ||
          data?.detail ||
          "Could not complete the discharge.",
      );
    },
  });

  const handleValidateAndConfirm = () => {
    const missing = [];
    if (!formData.chief_complaint.trim()) missing.push("Chief complaint");
    if (!formData.primary_diagnosis.trim()) missing.push("Primary diagnosis");
    if (!formData.treatment_plan.trim()) missing.push("Treatment plan");
    if (!formData.condition_at_discharge.trim()) missing.push("Condition at discharge");
    if (!formData.care_instructions.trim()) missing.push("Care instructions");

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(", ")}.`);
      return;
    }
    if (!admissionSqid) {
      toast.error("Missing admission reference for this patient — cannot discharge.");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmDischarge = () => {
    dischargeMutation.mutate(buildDischargePayload());
  };

  return (
    <>
    <div className="bg-white my-5 border rounded-lg pt-5 lg:pt-8 px-4 lg:px-6 pb-8 text-sm">
      {/* Header */}
      <button
        type="button"
        className="flex items-center gap-2 cursor-pointer border-b pb-3 mb-6 w-fit"
        onClick={() => setDischargePatient(false)}
      >
        <ArrowLeft size={16} className="text-docuhealth-primary" />
        <span className="font-medium text-docuhealth-primary">Discharge summary</span>
      </button>

      {/* Progress bar */}
      <div className="w-full mb-8">
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-docuhealth-primary transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
        <p className="text-center text-xs font-semibold text-gray-800 mt-2">
          Step {currentStep} of 3
        </p>
      </div>

      {currentStep === 1 && (
        <DischargeAdmissionSummaryStep
          admissionSummary={admissionSummary}
          formData={formData}
          onFieldChange={handleFieldChange}
          onGenerateSummary={handleGenerateSummary}
          isGeneratingSummary={soapNotesLoading}
        />
      )}

      {currentStep === 2 && (
        <DischargeProceduresMedicationsStep
          completedInvestigationOptions={completedInvestigationOptions}
          formData={formData}
          onFieldChange={handleFieldChange}
          onToggleCompletedInvestigation={toggleSelection("completed_investigations")}
          existingMedications={existingMedications}
          setExistingMedications={setExistingMedications}
          showAddMedication={showAddMedication}
          setShowAddMedication={setShowAddMedication}
          newMedications={newMedications}
          setNewMedications={setNewMedications}
        />
      )}

      {currentStep === 3 && (
        <DischargeFollowUpStep
          formData={formData}
          onFieldChange={handleFieldChange}
          pendingInvestigationOptions={pendingInvestigationOptions}
          onTogglePendingInvestigation={toggleSelection("pending_investigations")}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-10">
        <button
          type="button"
          onClick={currentStep === 1 ? () => setDischargePatient(false) : prevStep}
          className="text-docuhealth-primary hover:bg-gray-50 font-medium px-10 py-2.5 border border-docuhealth-primary rounded-full transition-colors"
        >
          {currentStep === 1 ? "Cancel" : "Previous"}
        </button>

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            className="bg-docuhealth-primary hover:bg-opacity-90 text-white font-medium px-10 py-2.5 rounded-full transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleValidateAndConfirm}
            className="bg-docuhealth-primary hover:bg-opacity-90 text-white font-medium px-10 py-2.5 rounded-full transition-colors"
          >
            Complete Discharge
          </button>
        )}
      </div>
    </div>

    <ConfirmDischargeModal
      isOpen={showConfirmModal}
      onCancel={() => setShowConfirmModal(false)}
      onConfirm={handleConfirmDischarge}
      isPending={dischargeMutation.isPending}
    />

    <DischargeSuccessModal
      isOpen={showSuccessModal}
      onDone={() => {
        setShowSuccessModal(false);
        setDischargePatient(false);
      }}
    />
    </>
  );
};

export default InpatientDischargeSummary;
