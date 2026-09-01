import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HosWardContext } from "../../../../../context/HospitalContext/HosWardContext";
import { transferAdmission } from "../../../../../queries/Hospital/doctor/admissions";
import { extractApiErrorMessage } from "../../../../../utils/apiError";
import Modal from "../../../../ui/Modal";
import Button from "../../../../ui/Button";
import Select from "../../../../ui/Select";

const TransferToAnotherWard = ({ setRequestAdmission, selectedPatientDetails }) => {
  const queryClient = useQueryClient();
  const { wards } = useContext(HosWardContext);

  const [wardOptions, setWardOptions] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [form, setForm] = useState({ new_ward: "", new_bed: "" });

  // The doctor inpatient list row (api/hospitals/patients?status=inpatient)
  // carries the admission SQID as `sqid` — there's no numeric id on it — and
  // the patient HIN under `patient_info`.
  const admissionSqid = selectedPatientDetails?.sqid || "";
  const patientHin =
    selectedPatientDetails?.patient_info?.hin ||
    selectedPatientDetails?.patient?.hin ||
    "";

  useEffect(() => {
    if (Array.isArray(wards)) setWardOptions(wards);
  }, [wards]);

  const handleChange = (field, value) => {
    if (field === "new_ward") {
      const selected = wardOptions.find((w) => String(w.sqid) === value);
      setAvailableBeds(
        selected ? selected.beds.filter((b) => b.status === "available") : [],
      );
      // Clear the bed whenever the ward changes so a stale bed can't be sent.
      setForm((prev) => ({ ...prev, new_ward: value, new_bed: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const { mutate, isPending } = useMutation({
    mutationFn: transferAdmission,
    onSuccess: () => {
      toast.success("Transfer successful");
      if (patientHin) {
        queryClient.invalidateQueries({ queryKey: ["patient-info", patientHin] });
      }
      queryClient.invalidateQueries({ queryKey: ["hospital-patients-doctor"] });
      setRequestAdmission(false);
    },
    onError: (err) => {
      console.error("Error submitting transfer request:", err);
      toast.error(extractApiErrorMessage(err, "Error submitting transfer request."));
    },
  });

  const handleSubmit = () => {
    if (!admissionSqid) {
      toast.error("This admission is missing its reference. Reopen the patient and try again.");
      return;
    }
    if (!form.new_ward || !form.new_bed) {
      toast.error("Pick a destination ward and bed.");
      return;
    }
    mutate({
      admission: admissionSqid,
      new_ward: form.new_ward,
      new_bed: form.new_bed,
    });
  };

  return (
    <Modal isOpen={true} onClose={() => setRequestAdmission(false)} title="">
      <button
        type="button"
        aria-label="Close"
        onClick={() => setRequestAdmission(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
      >
        <i className="bx bx-x text-2xl"></i>
      </button>
      <div className="flex flex-col justify-center items-center pb-5 pt-2">
        <p className="pt-0.5 font-medium">Request for patient transfer</p>
        <p className="pt-1 text-[12px]">
          Select the most suitable ward for the patient
        </p>
      </div>

      <Select
        value={form.new_ward}
        onChange={(value) => handleChange("new_ward", value)}
        options={wardOptions.map((w) => ({ value: String(w.sqid), label: `${w.name} ward` }))}
        placeholder="Assign to ward"
      />

      {form.new_ward && (
        <Select
          value={form.new_bed}
          onChange={(value) => handleChange("new_bed", value)}
          options={availableBeds.map((b) => ({ value: String(b.sqid), label: `Bed ${b.bed_number}` }))}
          placeholder={availableBeds.length > 0 ? "Select available bed" : "No available beds"}
          disabled={availableBeds.length === 0}
          className="mt-3"
        />
      )}

      <div className="mt-6">
        <Button
          onClick={handleSubmit}
          disabled={isPending || !form.new_ward || !form.new_bed}
          loading={isPending}
          loadingText="Transferring patient..."
          fullWidth
        >
          Proceed
        </Button>
      </div>
    </Modal>
  );
};

export default TransferToAnotherWard;
