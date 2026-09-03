import React, { useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DoctorAppContext } from "../../../../../../context/HospitalContext/Doctors/DoctorAppContext";
import { createReferOut } from "../../../../../../queries/Hospital/doctor/referOut";
import { extractApiErrorMessage } from "../../../../../../utils/apiError";
import SearchableSelect from "../../../../../ui/SearchableSelect";

/**
 * "Refer Out" — opened from the row actions on the doctor's Appointments list.
 * Sends the appointment's patient to another DocuHealth hospital via
 * POST /api/doctors/refer-out. Destination hospitals come from the shared
 * DoctorAppContext list (api/hospitals/hospitals); we send the hospital `sqid`
 * as `hospital_to_id` (the `hin` is rejected) and the appointment `sqid` as
 * `appointment_id`.
 */
const ReferOutModal = ({ appointment, onClose }) => {
  const queryClient = useQueryClient();
  const { hospitals } = useContext(DoctorAppContext);

  const [hospitalTo, setHospitalTo] = useState(null); // { value: sqid, label: name, hin }
  const [reason, setReason] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const appointmentSqid = appointment?.sqid || "";
  const fromHospitalSqid = appointment?.hospital_info?.sqid;
  const patientName = [appointment?.patient?.firstname, appointment?.patient?.lastname]
    .filter(Boolean)
    .join(" ");

  // Named hospitals that have an sqid, minus the appointment's own hospital
  // (the backend rejects that with "Cannot refer to the same hospital.").
  const hospitalOptions = useMemo(
    () =>
      (hospitals || [])
        .filter((h) => h?.sqid && h?.name?.trim() && h.sqid !== fromHospitalSqid)
        .map((h) => ({ value: h.sqid, label: h.name, hin: h.hin })),
    [hospitals, fromHospitalSqid],
  );

  const { mutate, isPending } = useMutation({
    mutationFn: createReferOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      setShowSuccess(true);
    },
    onError: (err) => {
      console.error("Refer-out failed:", err);
      toast.error(extractApiErrorMessage(err, "Couldn't send the referral."));
    },
  });

  const canSubmit = !!(appointmentSqid && hospitalTo?.value && reason.trim() && !isPending);

  const handleSubmit = () => {
    if (!appointmentSqid) {
      toast.error("This appointment is missing an id — reopen the list and try again.");
      return;
    }
    if (!hospitalTo?.value || !reason.trim()) {
      toast.error("Pick a destination hospital and give a reason.");
      return;
    }
    mutate({
      appointment_id: appointmentSqid,
      hospital_to_id: hospitalTo.value,
      reason: reason.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative text-sm">
        {showSuccess ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <p className="text-base font-semibold text-gray-800 mb-6 leading-snug">
              Referral sent{hospitalTo?.label ? ` to ${hospitalTo.label}` : ""}.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3 rounded-full hover:opacity-90 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <button onClick={onClose} className="text-gray-500 hover:text-black">
                <i className="bx bx-x text-2xl cursor-pointer"></i>
              </button>
            </div>
            <h2 className="text-center font-semibold text-lg text-gray-800">Refer Out</h2>
            <p className="text-center text-gray-500 mb-4 text-sm">
              {patientName
                ? `Refer ${patientName} to another hospital`
                : "Refer this patient to another hospital"}
            </p>

            <div className="mb-4 text-[12px]">
              <p className="mb-1 text-gray-700 font-medium">Destination hospital<span className="text-red-500"> *</span></p>
              <SearchableSelect
                value={hospitalTo?.value}
                onChange={(_value, option) => setHospitalTo(option)}
                options={hospitalOptions}
                placeholder="Select a hospital"
                emptyText="No other hospitals available."
              />
            </div>

            <div className="mb-2 text-[12px]">
              <p className="mb-1 text-gray-700 font-medium">Reason<span className="text-red-500"> *</span></p>
              <textarea
                className="border rounded-lg w-full h-[100px] p-3 text-[12px] outline-none focus:border-docuhealth-primary"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why is this patient being referred out?"
              ></textarea>
            </div>

            <button
              disabled={!canSubmit}
              className={`mt-6 w-full cursor-pointer bg-docuhealth-primary text-white py-2 rounded-full disabled:bg-docuhealth-primary/60 ${
                isPending ? "cursor-not-allowed" : ""
              } text-sm`}
              onClick={handleSubmit}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Sending referral
                </span>
              ) : (
                "Send referral"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ReferOutModal;
