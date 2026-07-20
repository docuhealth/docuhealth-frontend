import React, { useState, useContext } from "react";
import { ArrowLeft, X, Plus } from "lucide-react";
import toast from "react-hot-toast";
import MedicationSection from "./MedicationSection";
import axiosInstanceHos from "../../../../../../utils/axiosInstanceHos";
import { DoctorAppContext } from "../../../../../../context/HospitalContext/Doctors/DoctorAppContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const NoteSection = ({
  title,
  field,
  placeholder,
  data,
  inputs,
  setInputs,
  handleAddListItem,
  handleRemoveItem,
  activeInput,
  setActiveInput,
}) => (
  <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3 bg-white">
    <p className="font-medium text-[#1B2B40] mb-2">{title}</p>

    <div className="space-y-2 max-h-[200px] overflow-y-auto mb-2">
      {data[field].map((item, idx) => (
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
      <div className="flex gap-2 mt-4">
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
          className="bg-[#3E4095] text-white px-3 py-1 rounded text-[12px] cursor-pointer"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setActiveInput(null)}
          className="text-gray-500 text-[12px] cursor-pointer"
        >
          Cancel
        </button>
      </div>
    ) : (
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setActiveInput(field)}
          className="flex items-center gap-1 text-[#3E4095] font-medium text-[12px] cursor-pointer"
        >
          <Plus size={14} /> Add note
        </button>
      </div>
    )}
  </div>
);

const PrescribeMedication = ({
  setPrescribeMedication,
  selectedPatientDetails,
  setSeePatientDetails,
  isFromPatientMgt = false,
}) => {
  const { profile } = useContext(DoctorAppContext);
  const queryClient = useQueryClient();

  const [medications, setMedications] = useState([
    {
      drug: "",
      dosage: "",
      dosageUnit: "mg",
      route: "Oral",
      frequency: "od_qd",
      duration: "",
      durationUnit: "Day",
    },
  ]);

  const [allergiesData, setAllergiesData] = useState({
    allergies: [],
  });

  const [inputs, setInputs] = useState({
    allergies: "",
  });

  const [activeInput, setActiveInput] = useState(null);

  const handleAddListItem = (field) => {
    if (!inputs[field].trim()) return;
    setAllergiesData((prev) => ({
      ...prev,
      [field]: [...prev[field], inputs[field]],
    }));
    setInputs((prev) => ({ ...prev, [field]: "" }));
    setActiveInput(null);
  };

  const handleRemoveItem = (field, index) => {
    setAllergiesData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (payload) =>
      axiosInstanceHos.post("api/pharmacy/orders/create", payload),
    onSuccess: () => {
      toast.success("Prescription sent to pharmacist successfully!");
      setPrescribeMedication(false);
      setSeePatientDetails(true);
      queryClient.invalidateQueries({
        queryKey: ["patient-med-records"],
      });
      queryClient.invalidateQueries({
        queryKey: ["patient-prescriptions"],
      });
    },
    onError: (error) => {
      console.error("Prescription error:", error);
      toast.error(
        error.response?.data?.message || "Failed to prescribe medication",
      );
    },
  });

  const handleSubmit = () => {
    // Basic validation
    const validMedications = medications.filter(
      (m) => m.drug.trim() !== "" && m.dosage !== "" && m.duration !== ""
    );

    if (validMedications.length === 0) {
      toast.error("Please add at least one valid medication");
      return;
    }

    const payload = {
      patient: selectedPatientDetails?.patient?.hin,
      order_source: isFromPatientMgt ? "staff_admission_order" : "staff_appointment_order",
      drugs: validMedications.map(med => ({
        catalog_drug: null,
        manual_drug: {
          name: med.drug,
          strength: null,
          route: med.route,
          dose_form: "", // Not explicitly captured in UI
          quantity: Number(med.dosage) || 0,
          unit: med.dosageUnit,
          frequency: med.frequency,
          duration: {
            value: Number(med.duration) || 0,
            rate: med.durationUnit
          },
          allergies: allergiesData.allergies
        }
      }))
    };

    if (!isFromPatientMgt && selectedPatientDetails?.sqid) {
      payload.appointment = selectedPatientDetails.sqid;
    }

    mutate(payload);
  };

  return (
    <div className="bg-white my-5 rounded-lg border p-4 lg:p-6 text-sm mb-20">
      <div className="flex items-center gap-2 cursor-pointer border-b pb-4 mb-4">
        <div
          onClick={() => {
            setPrescribeMedication(false);
            setSeePatientDetails(true);
          }}
          className="text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </div>
        <p className="font-medium text-gray-800">Prescribe medication</p>
      </div>

      <div className="my-5">
        <MedicationSection
          medications={medications}
          setMedications={setMedications}
        />
        
        <NoteSection
          title="Add allergy if there is any (optional)"
          field="allergies"
          placeholder="e.g. Patient is allergic to Penicillin"
          data={allergiesData}
          inputs={inputs}
          setInputs={setInputs}
          handleAddListItem={handleAddListItem}
          handleRemoveItem={handleRemoveItem}
          activeInput={activeInput}
          setActiveInput={setActiveInput}
        />
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className={`py-3 px-8 rounded-full text-white bg-[#3E4095] cursor-pointer ${
            isPending ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Upload/send to pharmacist"
          )}
        </button>
      </div>
    </div>
  );
};

export default PrescribeMedication;
