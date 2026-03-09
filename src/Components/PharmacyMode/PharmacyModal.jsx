import React, { useState } from "react";
import { X } from "lucide-react";

const PharmacyModal = ({ setPharmacyMode, setPharmacyModeProceed }) => {
  const [selectedOption, setSelectedOption] = useState("");

  const handleProceed = () => {
    setPharmacyModeProceed(selectedOption);
    setPharmacyMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 ">
      <div className="bg-white  max-w-96 relative w-full p-5 mx-3">
        <div className="flex flex-row-reverse pb-5 ">
          <button
            onClick={() => setPharmacyMode(false)}
            className=" text-gray-800 "
          >
            <X size={20} />
          </button>

          <h2 className=" font-semibold text-center flex-1">
            Welcome to pharmacy mode
          </h2>
          
        </div>

        <div className="flex flex-col gap-2">
          <label
            className={`flex items-center p-3 border rounded-lg cursor-pointer text-sm ${
              selectedOption === "generate"
                ? "border-[#0000FF]"
                : "border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="pharm-mode"
              value="generate"
                checked={selectedOption === 'generate'}
                onChange={(e) => setSelectedOption(e.target.value)}
              className="form-radio text-blue-600 mr-2 "
            />
            Generate your personal pharm-code
          </label>

          <label
            className={`flex items-center p-3 border rounded-lg cursor-pointer text-sm ${
              selectedOption === "upload"
                ? "border-[#0000FF]"
                : "border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="pharm-mode"
              value="upload"
                checked={selectedOption === 'upload'}
                onChange={(e) => setSelectedOption(e.target.value)}
              className="form-radio text-blue-600 mr-2"
            />
            Upload drugs bought by a customer
          </label>

          <label
            className={`flex items-center p-3 border rounded-lg cursor-pointer text-sm ${
              selectedOption === "reset" ? "border-[#0000FF]" : "border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="pharm-mode"
              value="reset"
                checked={selectedOption === 'reset'}
                onChange={(e) => setSelectedOption(e.target.value)}
              className="form-radio text-blue-600 mr-2"
            />
            Reset your pharm-code
          </label>
        </div>

        <button
            onClick={handleProceed}
          className=" mt-5 w-full bg-[#0000FF] text-white py-2 rounded-full transition"
        >
          Proceed
        </button>
      </div>
    </div>
  );
};

export default PharmacyModal;
