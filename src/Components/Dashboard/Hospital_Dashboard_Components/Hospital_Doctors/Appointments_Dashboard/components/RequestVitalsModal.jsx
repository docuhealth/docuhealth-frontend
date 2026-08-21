import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import { useMutation } from "@tanstack/react-query";
import { resolveOrderContext } from "../../../../../../utils/careOrderContext";

/**
 * Standalone "Vitals" flow opened directly from the OtherMedicalServicesFab
 * quick-service menu: fetches available nurses, lets the doctor assign one,
 * then submits the vitals request note.
 */
const RequestVitalsModal = ({ selectedPatientDetails, onClose }) => {
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    staff_id: "",
    patient_hin: "",
    note: "",
  });

  useEffect(() => {
    const fetchNurses = async () => {
      try {
        const res = await axiosInstanceHos.get("api/receptionists/staff/nurse");
        const data = res.data;

        if (!data || data.length === 0) {
          toast.error("No nurse currently available.");
          onClose();
          return;
        }

        setStaffList(data);
      } catch (err) {
        console.error("Error fetching nurses:", err);
        toast.error(
          err.response?.data?.message || "Error fetching medical personnel.",
        );
        onClose();
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchNurses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAssign = (staffId) => {
    setSelectedStaffId(staffId);
    setFormData((prev) => ({
      ...prev,
      staff_id: staffId,
      patient_hin: resolveOrderContext(selectedPatientDetails).hin,
    }));
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (payload) =>
      axiosInstanceHos.post("api/doctors/vital-signs/request", payload),
    onSuccess: () => {
      setShowSuccess(true);
    },
    onError: (err) => {
      console.error(
        "Error assigning patient to nurse for vitals checkup:",
        err,
      );
      toast.error(
        err.response?.data?.message || "Nurse vitals checkUp failed.",
      );
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-3">
      {showSuccess ? (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative text-sm">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <p className="text-base font-semibold text-gray-800 mb-6 leading-snug">
              You have successfully assigned patient<br />to a nurse for vitals checkup!
            </p>
            <button
              onClick={onClose}
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3 rounded-full hover:opacity-90 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      ) : loadingStaff ? (
        <div className="bg-white rounded-lg shadow-lg p-10 max-w-md w-full flex items-center justify-center">
          <svg
            className="animate-spin h-6 w-6 text-docuhealth-primary"
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
        </div>
      ) : selectedStaffId ? (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative text-sm">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black"
            >
              <i className="bx bx-x text-2xl cursor-pointer"></i>
            </button>
          </div>
          <h2 className="text-center font-semibold text-lg text-gray-800">
            Request for Vitals
          </h2>
          <p className="text-center text-gray-500 mb-4 text-sm">
            Assign to a nurse for vitals checkup
          </p>
          <div className="mb-2 text-[12px]">
            <p className="mb-1 text-gray-700 font-medium">Add note :</p>
            <textarea
              className="border rounded-lg w-full  h-[100px] p-3 text-[12px] outline-none focus:border-docuhealth-primary"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              placeholder="Please do note that this account will be on read-only-mode. This will change once the account is upgraded once the owner is 18 years old."
            ></textarea>
          </div>
          <button
            disabled={isPending || !formData.note}
            className={`mt-6 w-full cursor-pointer bg-docuhealth-primary text-white py-2 rounded-full disabled:bg-docuhealth-primary/60 ${isPending ? "bg-docuhealth-primary/60 cursor-not-allowed" : ""}} text-sm `}
            onClick={() => mutate(formData)}
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
                Processing Request
              </span>
            ) : (
              "Proceed"
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl w-full relative text-sm max-h-3/5 overflow-scroll">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="font-medium">Choose a preferred nurse</h2>
            <div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black"
              >
                <i className="bx bx-x text-2xl cursor-pointer"></i>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 my-5 text-sm gap-3 w-full">
            {staffList.map((staff, index) => (
              <div key={index} className="border rounded-md p-3">
                <div>
                  <div className="flex justify-between items-center border-b pb-5">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-50 p-2 rounded-full">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"
                            fill="var(--color-docuhealth-primary)"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">
                          {staff.firstname + " " + staff.lastname}
                        </p>
                        <p className="text-xs">nurse</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{staff.staff_id}</p>
                    </div>
                  </div>

                  <div className="w-full pt-8">
                    <button
                      className="w-full rounded-full border py-2 border-docuhealth-primary text-docuhealth-primary cursor-pointer"
                      onClick={() => handleAssign(staff.staff_id)}
                    >
                      Assign patient
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestVitalsModal;
