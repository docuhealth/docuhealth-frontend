import React, { useContext, useEffect, useState } from "react";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import toast from "react-hot-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";

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

const ProcessVitals = ({ selectedPatient, setProcessVitals }) => {
  const queryClient = useQueryClient();

  const [bloodPressure, setBloodPressure] = useState("");
  const [temperature, setTemperature] = useState("");
  const [respRate, setRespRate] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [spo2, setSpo2] = useState("");
  const [painScore, setPainScore] = useState("0 (No pain)");
  const [notes, setNotes] = useState("");

  const calculateBmi = (w, h) => {
    const weightNum = parseFloat(w);
    let heightNum = parseFloat(h);
    if (!weightNum || !heightNum || heightNum <= 0) return "";
    if (heightNum > 3) heightNum = heightNum / 100;
    const val = (weightNum / (heightNum * heightNum)).toFixed(1);
    return isNaN(val) ? "" : val;
  };

  const bmi = calculateBmi(weight, height);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload) =>
      axiosInstanceHos.post("api/nurses/vital-signs/process", payload),
    onSuccess: () => {
      toast.success("Vitals processed successfully!");
      queryClient.invalidateQueries({ queryKey: ["assigned-for-vitals"] });
      resetForm();
      setProcessVitals(false);
    },
    onError: (err) => {
      console.error("Error processing vitals:", err);
      toast.error(err.response?.data?.message || "Failed to process vitals.");
    },
  });

  const resetForm = () => {
    setBloodPressure("");
    setTemperature("");
    setRespRate("");
    setHeight("");
    setWeight("");
    setHeartRate("");
    setSpo2("");
    setPainScore("0 (No pain)");
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
      request: selectedPatient.id,
      blood_pressure: bloodPressure || undefined,
      temp: temperature ? parseFloat(temperature) : undefined,
      resp_rate: respRate ? parseFloat(respRate) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      heart_rate: heartRate ? parseFloat(heartRate) : undefined,
      ...(height && { height: parseFloat(height) }),
      ...(bmi && { bmi: parseFloat(bmi) }),
      ...(spo2 && { spo2: parseInt(spo2, 10) }),
      ...(painScore && { pain_score: parseInt(painScore.split(" ")[0], 10) }),
      ...(notes && { notes }),
    };

    mutate(payload);
  };

  return (
    <div className="bg-white my-5 border rounded-lg pt-5 lg:pt-8 px-4 lg:px-6 text-sm ">
      <div
        className="flex justify-start items-center gap-1 cursor-pointer border-b pb-3"
        onClick={() => setProcessVitals(false)}
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

        <h2 className=" text-sm">Process Vitals</h2>
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
            <p className="pb-1">Body mass index</p>
            <div className="relative">
              <input
                type="text"
                id="bmi"
                readOnly
                className="w-full text-sm border px-3 py-2 rounded-sm pr-14 focus:outline-none bg-gray-50 text-gray-700 cursor-not-allowed"
                placeholder="Auto-calculated"
                value={bmi ? `${bmi}` : ""}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                Kg/m²
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
    </div>
  );
};

export default ProcessVitals;
