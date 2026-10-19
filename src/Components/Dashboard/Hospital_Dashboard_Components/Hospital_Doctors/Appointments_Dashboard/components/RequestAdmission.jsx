import React, { useState, useEffect, useContext, useMemo } from "react";
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
import { invalidatePatientAdmission } from "../../../../../../lib/queryInvalidations";

const RequestAdmission = ({
  setRequestAdmission,
  selectedPatientDetails,
  // Called after a request is accepted so the caller can flip its own
  // "Request for admission" affordance to "Admission requested" without
  // waiting for the outpatient list to refetch and be re-opened.
  onRequested,
}) => {
  const { profile } = useContext(DoctorAppContext);
  const { wards, wardsLoading, refetchWards } = useContext(HosWardContext);
  const queryClient = useQueryClient();

  const admissionContext = resolveOrderContext(selectedPatientDetails);

  // `ward` only filters the bed dropdown; the API derives the ward from the bed.
  const [form, setForm] = useState({ ward: "", bed: "" });

  const wardOptions = useMemo(() => (Array.isArray(wards) ? wards : []), [wards]);

  // Bed statuses change under other users (accepts, rejects), so load fresh ones on open.
  useEffect(() => {
    refetchWards?.();
  }, [refetchWards]);

  // Derived from the live ward list so a refetch drops beds that became occupied.
  // Several doctors may request the same bed; only occupied beds are refused.
  const availableBeds = useMemo(() => {
    const selected = wardOptions.find((w) => w.sqid === form.ward || w.id === Number(form.ward));
    return (selected?.beds || []).filter(
      (b) => b.status === "available" || b.status === "requested",
    );
  }, [wardOptions, form.ward]);

  // Clear a picked bed that a refetch shows is now occupied.
  useEffect(() => {
    if (form.bed && !availableBeds.some((b) => String(b.sqid || b.id) === form.bed)) {
      setForm((prev) => ({ ...prev, bed: "" }));
    }
  }, [availableBeds, form.bed]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      // A bed picked under the previous ward is no longer in the list.
      ...(field === "ward" ? { bed: "" } : {}),
    }));
  };

    const { mutate, isPending } = useMutation({
    mutationFn: () => {
      // A bed request always needs a check-in; appointments are no longer a visit.
      const payload = {
        patient: admissionContext.hin,
        bed: form.bed,
        check_in: admissionContext.checkIn,
      };
      return axiosInstanceHos.post("api/doctors/admissions/request", payload);
    },
    onSuccess: () => {
      toast.success("Admission request successful");
      invalidatePatientAdmission(queryClient);
      onRequested?.();
      setRequestAdmission(false);
    },
    onError: (err) => {
      console.error("Error submitting admission request:", err);
      invalidatePatientAdmission(queryClient);
      toast.error(
        extractApiErrorMessage(err, "Error submitting admission request."),
      );
    },
  });

  const handleSubmit = () => {
    if (!admissionContext.checkIn) {
      toast.error("A bed request needs a check-in. Check the patient in first.");
      return;
    }
    mutate();
  };

  return (
    <Modal isOpen={true} onClose={() => setRequestAdmission(false)} title="">
      <button
        type="button"
        aria-label="Close"
        onClick={() => setRequestAdmission(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
      >
        <i className="bx bx-x text-2xl"></i>
      </button>
      <div className="flex flex-col justify-center items-center pb-6 pt-6 text-center">
        <h2 className="text-base font-semibold text-gray-800 mb-1.5">
          Request for patient admission
        </h2>
        <p className="text-[13px] text-gray-500">
          Select the most suitable ward for the patient
        </p>
      </div>

      <Select
        label="Ward"
        required
        value={form.ward}
        onChange={(value) => handleChange("ward", value)}
        options={wardOptions.map((w) => ({ value: String(w.sqid || w.id), label: `${w.name} ward` }))}
        placeholder={wardsLoading ? "Loading wards..." : "Assign to ward"}
        disabled={wardsLoading}
      />

      {form.ward && (
        <Select
          label="Bed"
          required
          value={form.bed}
          onChange={(value) => handleChange("bed", value)}
          options={availableBeds.map((b) => ({ value: String(b.sqid || b.id), label: b.status === "requested" ? `Bed ${b.bed_number} (already requested)` : `Bed ${b.bed_number}` }))}
          placeholder={availableBeds.length > 0 ? "Select a bed" : "No free beds in this ward"}
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
