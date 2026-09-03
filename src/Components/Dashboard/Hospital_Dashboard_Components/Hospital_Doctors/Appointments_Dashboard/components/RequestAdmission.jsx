import React, { useState, useEffect, useContext } from "react";
import { DoctorAppContext } from "../../../../../../context/HospitalContext/Doctors/DoctorAppContext";
import { HosWardContext } from "../../../../../../context/HospitalContext/HosWardContext";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import Modal from "../../../../../ui/Modal";
import Button from "../../../../../ui/Button";
import Select from "../../../../../ui/Select";
import { resolveOrderContext } from "../../../../../../utils/careOrderContext";

const RequestAdmission = ({ setRequestAdmission, selectedPatientDetails }) => {
  const { profile } = useContext(DoctorAppContext);
  const { wards } = useContext(HosWardContext);

  const [wardOptions, setWardOptions] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);

  const admissionContext = resolveOrderContext(selectedPatientDetails);

  const [form, setForm] = useState({
    ward: "",
    bed: "",
    patient: admissionContext.hin,
    // Only a genuinely open check-in should be linked here — sending an
    // appointment's sqid (or an empty string) as `check_in` gets rejected
    // as "Check-in not found at this hospital."
    ...(admissionContext.checkIn ? { check_in: admissionContext.checkIn } : {}),
  });

  useEffect(() => {
    if (Array.isArray(wards)) {
      setWardOptions(wards);
      console.log(selectedPatientDetails);
    }
  }, [wards]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === "ward") {
      const selected = wardOptions.find((w) => w.sqid === value || w.id === Number(value));

      if (selected) {
        const beds = selected.beds.filter((b) => b.status === "available");
        setAvailableBeds(beds);
      } else {
        setAvailableBeds([]);
      }
    }
  };

    const { mutate, isPending } = useMutation({
    mutationFn: (post) => {
      return axiosInstanceHos.post("api/doctors/admissions/request", form);;
    },
    onSuccess: () => {
      toast.success("Admission request successful");
      setRequestAdmission(false);
    },
    onError: (err) => {
      console.error(
        "Error assigning patient to nurse for vitals checkup:",
        err,
      );
      toast.error(
        err.response?.data?.message || "Error submitting admission request.",
      );
    },
  });

  const handleSubmit = async () => {
    mutate(form)
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
        <p className="pt-0.5 font-medium">Request for patient admission</p>
        <p className="pt-1 text-[12px]">
          Select the most suitable ward for the patient
        </p>
      </div>

      <Select
        label="Ward"
        required
        value={form.ward}
        onChange={(value) => handleChange("ward", value)}
        options={wardOptions.map((w) => ({ value: String(w.sqid || w.id), label: `${w.name} ward` }))}
        placeholder="Assign to ward"
      />

      {form.ward && (
        <Select
          label="Bed"
          required
          value={form.bed}
          onChange={(value) => handleChange("bed", value)}
          options={availableBeds.map((b) => ({ value: String(b.sqid || b.id), label: `Bed ${b.bed_number}` }))}
          placeholder={availableBeds.length > 0 ? "Select available bed" : "No available beds"}
          disabled={availableBeds.length === 0}
          className="mt-3"
        />
      )}

      <div className="mt-6">
        <Button
          onClick={handleSubmit}
          disabled={isPending || !form.ward || !form.bed}
          loading={isPending}
          loadingText="Requesting admission..."
          fullWidth
        >
          Proceed
        </Button>
      </div>
    </Modal>
  );
};

export default RequestAdmission;
