import React, { useState, useEffect, useContext } from "react";
import { DoctorAppContext } from "../../../../../../context/HospitalContext/Doctors/DoctorAppContext";
import { HosWardContext } from "../../../../../../context/HospitalContext/HosWardContext";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import Modal from "../../../../../ui/Modal";
import Button from "../../../../../ui/Button";

const RequestAdmission = ({ setRequestAdmission, selectedPatientDetails }) => {
  const { profile } = useContext(DoctorAppContext);
  const { wards } = useContext(HosWardContext);

  const [wardOptions, setWardOptions] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);

  const [form, setForm] = useState({
    ward: "",
    bed: "",
    patient_hin: selectedPatientDetails
      ? selectedPatientDetails?.patient?.hin
      : "",
    staff_id: profile ? profile.staff_id : "",
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
      const selected = wardOptions.find((w) => w.id === Number(value));

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
      <div className="flex flex-col justify-center items-center pb-5 pt-2">
        <p className="pt-0.5 font-medium">Request for patient admission</p>
        <p className="pt-1 text-[12px]">
          Select the most suitable ward for the patient
        </p>
      </div>

      <select
        value={form.ward}
        onChange={(e) => handleChange("ward", e.target.value)}
        className="border p-2 rounded-lg outline-none text-sm w-full"
      >
        <option value="">Assign to ward</option>
        {wardOptions.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name} ward
          </option>
        ))}
      </select>

      {form.ward && (
        <select
          value={form.bed}
          onChange={(e) => handleChange("bed", e.target.value)}
          className="border p-2 rounded-lg outline-none text-sm w-full mt-3"
        >
          <option value="">Select available bed</option>
          {availableBeds.length > 0 ? (
            availableBeds.map((b) => (
              <option key={b.id} value={b.id}>
                Bed {b.bed_number}
              </option>
            ))
          ) : (
            <option disabled>No available beds</option>
          )}
        </select>
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
