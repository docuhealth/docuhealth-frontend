import React, { useState, useEffect, useContext } from "react";
import { DoctorAppContext } from "../../../../../../context/HospitalContext/Doctors/DoctorAppContext";
import { HosWardContext } from "../../../../../../context/HospitalContext/HosWardContext";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../../../../../ui/Modal";
import Button from "../../../../../ui/Button";
import Select from "../../../../../ui/Select";
import { resolveOrderContext } from "../../../../../../utils/careOrderContext";
import { extractApiErrorMessage } from "../../../../../../utils/apiError";

const RequestAdmission = ({
  setRequestAdmission,
  selectedPatientDetails,
  // Called after a request is accepted so the caller can flip its own
  // "Request for admission" affordance to "Admission requested" without
  // waiting for the outpatient list to refetch and be re-opened.
  onRequested,
}) => {
  const { profile } = useContext(DoctorAppContext);
  const { wards } = useContext(HosWardContext);
  const queryClient = useQueryClient();

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
    mutationFn: () => {
      return axiosInstanceHos.post("api/doctors/admissions/request", form);
    },
    onSuccess: () => {
      toast.success("Admission request successful");
      // The outpatient row now carries `admission_request_status: "pending"`
      // server-side; refetch so a later list render / re-open reflects it.
      queryClient.invalidateQueries({ queryKey: ["hospital-patients-doctor"] });
      onRequested?.();
      setRequestAdmission(false);
    },
    onError: (err) => {
      console.error("Error submitting admission request:", err);
      // The API returns the reason as `{ detail: ["Patient already has a
      // pending admission request"] }` (array), not `{ message }`, so read
      // through the shared extractor or the toast is just the generic fallback.
      toast.error(
        extractApiErrorMessage(err, "Error submitting admission request."),
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
