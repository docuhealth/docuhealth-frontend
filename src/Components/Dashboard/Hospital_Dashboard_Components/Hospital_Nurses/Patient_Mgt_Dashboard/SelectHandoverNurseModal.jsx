import React, { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";
import { User, X } from "lucide-react";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import { NursesAppContext } from "../../../../../context/HospitalContext/Nurses/NursesAppContext";
import Skeleton, { SkeletonText, SkeletonBox } from "../../../../ui/Skeleton";

// Mirrors the nurse picker (radio cards + Proceed) while the list loads.
const NursePickerSkeleton = () => (
  <div role="status" aria-label="Loading nurses">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-5">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="relative border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <span className="absolute top-3 right-3 w-5 h-5 rounded-full border-2 border-gray-200" />
          <Skeleton className="w-14 h-14 rounded-full shrink-0" />
          <div>
            <SkeletonText className="h-3.5 w-28" />
            <SkeletonText textClassName="text-[13px]" className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
    <SkeletonBox className="w-full py-3.5 rounded-full font-medium" />
  </div>
);

const SelectHandoverNurseModal = ({ onClose, onProceed }) => {
  const { profile } = useContext(NursesAppContext);
  const [loadingNurses, setLoadingNurses] = useState(true);
  const [nurses, setNurses] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  useEffect(() => {
    const fetchNurses = async () => {
      try {
        const res = await axiosInstanceHos.get("api/receptionists/staff/nurse");
        const data = res.data;
        
        // Exclude the currently logged-in nurse
        const availableNurses = data.filter(n => String(n.staff_id) !== String(profile?.staff_id));

        if (!availableNurses || availableNurses.length === 0) {
          toast.error("No other nurses currently available.");
          onClose();
          return;
        }

        setNurses(availableNurses);
      } catch (err) {
        console.error("Error fetching nurses:", err);
        toast.error(err.response?.data?.message || "Error fetching medical personnel.");
        onClose();
      } finally {
        setLoadingNurses(false);
      }
    };

    fetchNurses();
  }, [onClose]);

  const selectedNurse = nurses.find((d) => d.staff_id === selectedStaffId);

  const handleProceed = () => {
    if (!selectedNurse) return;
    onProceed(selectedNurse);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full relative text-sm max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="font-semibold text-gray-900">Select a nurse you'll handover to:</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X size={20} className="cursor-pointer" />
          </button>
        </div>

        {loadingNurses ? (
          <NursePickerSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-5">
              {nurses.map((nurse) => {
                const isSelected = nurse.staff_id === selectedStaffId;
                return (
                  <button
                    key={nurse.staff_id}
                    type="button"
                    onClick={() => setSelectedStaffId(nurse.staff_id)}
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
                        {nurse.firstname} {nurse.lastname}
                      </p>
                      <p className="text-gray-400 text-[13px]">Nurse</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleProceed}
              disabled={!selectedNurse}
              className={`w-full py-3.5 rounded-full text-white font-medium transition-colors ${
                selectedNurse ? "bg-docuhealth-primary hover:bg-docuhealth-primary/90 cursor-pointer" : "bg-docuhealth-primary/40 cursor-not-allowed"
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

export default SelectHandoverNurseModal;
