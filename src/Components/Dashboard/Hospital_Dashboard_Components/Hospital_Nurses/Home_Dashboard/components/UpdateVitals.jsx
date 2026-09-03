import React, { useContext, useEffect, useState } from "react";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import toast from "react-hot-toast";
import { NursesAppContext } from "../../../../../../context/HospitalContext/Nurses/NursesAppContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import Modal from "../../../../../ui/Modal";

const painScoreOptions = [
  "0 (No pain)",
  "1 (Mild Pain)",
  "2 (Mild Pain)",
  "3 (Mild Pain)",
  "4 (Moderate Pain)",
  "5 (Moderate Pain)",
  "6 (Moderate Pain)",
  "7 (Severe Pain)",
  "8 (Severe Pain)",
  "9 (Severe Pain)",
  "10 (Severe Pain)",
];

const UpdateVitals = ({ selectedPatient, setUpdateVitals }) => {
  const queryClient = useQueryClient();
  const [bloodPressure, setBloodPressure] = useState("");
  const [temperature, setTemperature] = useState("");
  const [respRate, setRespRate] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [painScore, setPainScore] = useState("0 (No pain)");
  const [spo2, setSpo2] = useState("");
  const [notes, setNotes] = useState("");
  const [staffID, setStaffID] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const calculateBmi = (w, h) => {
    const weightNum = parseFloat(w);
    let heightNum = parseFloat(h);
    if (!weightNum || !heightNum || heightNum <= 0) return "";
    if (heightNum > 3) heightNum = heightNum / 100;
    const val = (weightNum / (heightNum * heightNum)).toFixed(1);
    return isNaN(val) ? "" : val;
  };

  const bmi = calculateBmi(weight, height);

  const { profile } = useContext(NursesAppContext);

  useEffect(() => {
    if (profile) {
      setStaffID(profile.staff_id);
    }
  }, [profile]);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload) =>
      axiosInstanceHos.post("api/nurses/vital-signs/update", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-info"] });
      resetForm();
      setIsSuccessModalOpen(true);
    },
    onError: (err) => {
      console.error("Error updating vitals:", err);
      toast.error(err.response?.data?.message || "Failed to update vitals.");
    },
  });

  const resetForm = () => {
    setBloodPressure("");
    setTemperature("");
    setRespRate("");
    setHeight("");
    setWeight("");
    setHeartRate("");
    setPainScore("0 (No pain)");
    setSpo2("");
    setNotes("");
  };

  const isFormIncomplete =
    !bloodPressure ||
    !temperature ||
    !respRate ||
    !weight ||
    !heartRate;

  const handleSubmit = () => {
    const payload = {
      patient: selectedPatient.patient_info?.hin,
      blood_pressure: bloodPressure || undefined,
      temp: temperature ? parseFloat(temperature) : undefined,
      resp_rate: respRate ? parseFloat(respRate) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      heart_rate: heartRate ? parseFloat(heartRate) : undefined,
      ...(height && { height: parseFloat(height) }),
      ...(bmi && { bmi: parseFloat(bmi) }),
      ...(painScore && { pain_score: parseInt(painScore.split(" ")[0], 10) }),
      ...(spo2 && { spo2: parseInt(spo2, 10) }),
      ...(notes && { notes }),
    };

    mutate(payload);
  };

  return (
    <div className="bg-white my-5 border rounded-lg pt-5 lg:pt-8 px-4 lg:px-6 text-sm ">
      <div
        className="flex justify-start items-center gap-1 cursor-pointer border-b pb-3"
        onClick={() => setUpdateVitals(false)}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.56528 6.41685H11.6654V7.58352H4.56528L7.69426 10.7125L6.86932 11.5374L2.33203 7.00019L6.86932 2.46289L7.69426 3.28785L4.56528 6.41685Z"
            fill="var(--color-docuhealth-dark)"
          />
        </svg>

        <h2 className=" text-sm">Update Vitals</h2>
      </div>
      <div className="border rounded-md p-5 my-5">
        <p className="font-medium">Vital signs</p>
        <div className="grid grid-cols-1  lg:grid-cols-3 my-5 gap-5">
          <div className="relative">
            <p className="pb-1">Blood pressure</p>
            <div className="relative">
              <input
                type="text"
                id="bloodPressure"
                className="w-full text-sm border px-3 py-2 rounded-sm pr-16 focus:outline-none"
                placeholder="Enter blood pressure"
                value={bloodPressure}
                onChange={(e) => setBloodPressure(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                mmHg
              </span>
            </div>
          </div>
          <div className="relative">
            <p className="pb-1">Temperature</p>
            <div className="relative">
              <input
                type="number"
                id="temperature"
                className="w-full text-sm border px-3 py-2 rounded-sm pr-8 focus:outline-none"
                placeholder="Enter temperature"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                °C
              </span>
            </div>
          </div>
          <div className="relative">
            <p className="pb-1">Respiratory Rate</p>
            <div className="relative">
              <input
                type="number"
                id="respRate"
                className="w-full text-sm border px-3 py-2 rounded-sm pr-14 focus:outline-none"
                placeholder="Enter respiratory rate"
                value={respRate}
                onChange={(e) => setRespRate(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                /Min
              </span>
            </div>
          </div>
          <div className="relative">
            <p className="pb-1">Height (optional)</p>
            <div className="relative">
              <input
                type="number"
                id="height"
                className="w-full text-sm border px-3 py-2 rounded-sm pr-10 focus:outline-none"
                placeholder="Enter height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                m
              </span>
            </div>
          </div>
          <div className="relative">
            <p className="pb-1">Heart Rate</p>
            <div className="relative">
              <input
                type="number"
                id="heartRate"
                className="w-full text-sm border px-3 py-2 rounded-sm pr-14 focus:outline-none"
                placeholder="Enter heart rate"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                Bpm
              </span>
            </div>
          </div>
          <div className="relative">
            <p className="pb-1">Weight</p>
            <div className="relative">
              <input
                type="number"
                id="weight"
                className="w-full text-sm border px-3 py-2 rounded-sm pr-10 focus:outline-none"
                placeholder="Enter weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                Kg
              </span>
            </div>
          </div>

          {/* Body mass index (Auto-calculated, read-only) */}
          <div className="relative">
            <p className="pb-1">BMI</p>
            <div className="relative">
              <input
                type="text"
                id="bmi"
                readOnly
                className="w-full text-sm border px-3 py-2 rounded-sm pr-10 focus:outline-none bg-gray-50 text-gray-700 cursor-not-allowed"
                placeholder="Auto-calculated"
                value={bmi ? `${bmi}` : ""}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                BMI
              </span>
            </div>
          </div>

          {/* Pain Score */}
          <div className="relative">
            <p className="pb-1">Pain Score</p>
            <div className="relative">
              <select
                id="painScore"
                value={painScore}
                onChange={(e) => setPainScore(e.target.value)}
                className="w-full text-sm border px-3 py-2 rounded-sm pr-8 focus:outline-none bg-white appearance-none text-gray-600"
              >
                {painScoreOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* SPO2 */}
          <div className="relative">
            <p className="pb-1">SPO2</p>
            <div className="relative">
              <input
                type="number"
                id="spo2"
                className="w-full text-sm border px-3 py-2 rounded-sm pr-10 focus:outline-none"
                placeholder="98"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Note */}
      <div className="border rounded-md p-5 my-5">
        <p className="font-medium pb-2">Additional note (optional)</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border rounded-md p-3 text-sm focus:outline-none focus:border-docuhealth-primary min-h-[100px] resize-none"
          placeholder="Type any additional notes here..."
        />
      </div>

      <div className="flex justify-end items-end">
        <button
          className={`py-2.5 px-10  rounded-full bg-docuhealth-primary text-white cursor-pointer mb-5 disabled:bg-docuhealth-primary/60 disabled:cursor-not-allowed ${isPending ? "bg-docuhealth-primary/60 cursor-not-allowed" : ""}  text-sm`}
          disabled={isPending || isFormIncomplete}
          onClick={() => {
            handleSubmit();
          }}
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
              Updating Vitals
            </span>
          ) : (
            "Update Vitals"
          )}{" "}
        </button>
      </div>

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          setUpdateVitals(false);
        }}
        title=""
        maxWidth="md"
      >
        <div className="flex flex-col justify-center items-center text-sm pt-4 pb-8">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.66634 20.0007C6.66634 12.6369 12.6359 6.66732 19.9997 6.66732C27.3635 6.66732 33.333 12.6369 33.333 20.0007C33.333 27.3645 27.3635 33.334 19.9997 33.334C12.6359 33.334 6.66634 27.3645 6.66634 20.0007ZM19.9997 3.33398C10.7949 3.33398 3.33301 10.7959 3.33301 20.0007C3.33301 29.2053 10.7949 36.6673 19.9997 36.6673C29.2043 36.6673 36.6663 29.2053 36.6663 20.0007C36.6663 10.7959 29.2043 3.33398 19.9997 3.33398ZM29.0948 15.7625L26.7378 13.4055L18.333 21.8103L13.6782 17.1555L11.3212 19.5125L18.333 26.5243L29.0948 15.7625Z"
              fill="var(--color-docuhealth-green-dark)"
            />
          </svg>
          <p className="pt-3 font-medium text-docuhealth-green-dark">Success!</p>
          <p className="mt-2 text-center text-gray-600 px-4">
            You have successfully updated the vitals of this patient ( these details respectively )
          </p>
          <div className="w-full px-6 mt-6">
            <button
              className="w-full bg-docuhealth-primary text-white py-2.5 rounded-full text-sm font-medium"
              onClick={() => {
                setIsSuccessModalOpen(false);
                setUpdateVitals(false);
              }}
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UpdateVitals;
