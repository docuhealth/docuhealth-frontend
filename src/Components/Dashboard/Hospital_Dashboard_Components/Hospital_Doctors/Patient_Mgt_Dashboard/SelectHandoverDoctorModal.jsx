import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { User, X } from "lucide-react";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import { DoctorAppContext } from "../../../../../context/HospitalContext/Doctors/DoctorAppContext";

/**
 * "Select a doctor you'll handover to" — opened from the Handover tab's
 * "Add new handover note" button, before the note form itself. Same
 * fetch-a-real-staff-list-then-pick pattern as RequestVitalsModal.jsx
 * (opened from the Vitals quick-service item), adapted to this mockup's
 * radio-card grid instead of per-row "Assign" buttons.
 */
const SelectHandoverDoctorModal = ({ onClose, onProceed }) => {
  const { profile } = useContext(DoctorAppContext);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctors, setDoctors] = useState([]);
  // `sqid` is what POST /api/doctors/handover wants as `to_doctor_id` — the
  // staff-list responses now carry it (staff_id is not accepted there).
  const [selectedSqid, setSelectedSqid] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axiosInstanceHos.get("api/receptionists/staff/doctor");
        // Drop rows with no sqid and the logged-in doctor — the backend
        // rejects a self-handover with "Cannot handover to yourself."
        const list = (res.data || []).filter(
          (d) => d?.sqid && d.sqid !== profile?.sqid,
        );

        if (list.length === 0) {
          toast.error("No other doctors available to hand over to.");
          onClose();
          return;
        }

        setDoctors(list);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        toast.error(err.response?.data?.message || "Error fetching medical personnel.");
        onClose();
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedDoctor = doctors.find((d) => d.sqid === selectedSqid);

  const handleProceed = () => {
    if (!selectedDoctor) return;
    onProceed(selectedDoctor);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full relative text-sm max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="font-semibold text-gray-900">Select a doctor you&apos;ll handover to:</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X size={20} className="cursor-pointer" />
          </button>
        </div>

        {loadingDoctors ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin h-6 w-6 text-docuhealth-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-5">
              {doctors.map((doctor) => {
                const isSelected = doctor.sqid === selectedSqid;
                return (
                  <button
                    key={doctor.sqid}
                    type="button"
                    onClick={() => setSelectedSqid(doctor.sqid)}
                    className={`relative text-left border rounded-xl p-4 flex items-center gap-3 transition-colors ${
                      isSelected ? "border-docuhealth-primary bg-docuhealth-primary/5" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-docuhealth-primary" : "border-gray-300"
                      }`}
                    >
                      {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-docuhealth-primary" />}
                    </span>
                    <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                      <User size={26} className="text-docuhealth-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {doctor.firstname} {doctor.lastname}
                      </p>
                      <p className="text-gray-400 text-[13px]">Doctor</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleProceed}
              disabled={!selectedDoctor}
              className={`w-full py-3.5 rounded-full text-white font-medium transition-colors ${
                selectedDoctor ? "bg-docuhealth-primary hover:bg-docuhealth-primary/90 cursor-pointer" : "bg-docuhealth-primary/40 cursor-not-allowed"
              }`}
            >
              Proceed
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SelectHandoverDoctorModal;
