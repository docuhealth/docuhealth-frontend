import React, { useState, useEffect, useContext } from "react";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import { toast } from "react-hot-toast";
import { HosWardContext } from "../../../../../context/HospitalContext/HosWardContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../../../../ui/Modal";
import Button from "../../../../ui/Button";
import Select from "../../../../ui/Select";

const TransferToAnotherWard = ({ setRequestAdmission, selectedPatientDetails }) => {

  const queryClient = useQueryClient();
  const { wards } = useContext(HosWardContext);

  const [wardOptions, setWardOptions] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);

  const [form, setForm] = useState({
    new_ward: "",
    new_bed: "",
    admission: selectedPatientDetails
      ? selectedPatientDetails?.id
      : "",
  });

  useEffect(() => {
    if (Array.isArray(wards)) {
      setWardOptions(wards);
      console.log(selectedPatientDetails);
    }
  }, [wards]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === "new_ward") {
      const selected = wardOptions.find((w) => w.sqid === value || w.id === Number(value));

      if (selected) {
        const beds = selected.beds.filter((b) => b.status === "available");
        setAvailableBeds(beds);
      } else {
        setAvailableBeds([]);
      }
    }
  };

  const mutation = useMutation({
    mutationFn: (formData) => {
      return axiosInstanceHos.post("api/doctors/admissions/transfer", formData);
    },
    onSuccess: () => {
      toast.success("Transfer successful");
      queryClient.invalidateQueries({ queryKey: ["patient-info",selectedPatientDetails.patient.hin] });

      setRequestAdmission(false);
    },
    onError: (err) => {
      console.error("Error submitting transfer request:", err);
      toast.error("Error submitting transfer request");
    },
  });

  useEffect(() => {
    if (Array.isArray(wards)) {
      setWardOptions(wards);
    }
  }, [wards]);

  const handleSubmit = () => {
    mutation.mutate(form);
  };

  return (
    <Modal isOpen={true} onClose={() => setRequestAdmission(false)} title="">
      <div className="flex flex-col justify-center items-center pb-5 pt-2">
        <p className="pt-0.5 font-medium">Request for patient transfer</p>
        <p className="pt-1 text-[12px]">
          Select the most suitable ward for the patient
        </p>
      </div>

      <Select
        value={form.new_ward}
        onChange={(value) => handleChange("new_ward", value)}
        options={wardOptions.map((w) => ({ value: String(w.sqid || w.id), label: `${w.name} ward` }))}
        placeholder="Assign to ward"
      />

      {form.new_ward && (
        <Select
          value={form.new_bed}
          onChange={(value) => handleChange("new_bed", value)}
          options={availableBeds.map((b) => ({ value: String(b.sqid || b.id), label: `Bed ${b.bed_number}` }))}
          placeholder={availableBeds.length > 0 ? "Select available bed" : "No available beds"}
          disabled={availableBeds.length === 0}
          className="mt-3"
        />
      )}

      <div className="mt-6">
        <Button
          onClick={handleSubmit}
          disabled={mutation.isPending || !form.new_ward || !form.new_bed}
          loading={mutation.isPending}
          loadingText="Transferring patient..."
          fullWidth
        >
          Proceed
        </Button>
      </div>
    </Modal>
  )
}

export default TransferToAnotherWard