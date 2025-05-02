import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const PharmacyModeUpload = ({
  setPharmacyModeProceed,
  setIsPharmacyUploadCode,
}) => {
  const [formData, setFormData] = useState({
    pharmacyCode: "",
    patient_HIN: "",
  });
  const[loading, setLoading] = useState(false)
  const[step, setStep] = useState(1)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    sessionStorage.setItem("pharmacyCode", formData.pharmacyCode);
    sessionStorage.setItem("patient_HIN", formData.patient_HIN);
    setIsPharmacyUploadCode(true);
    setPharmacyModeProceed(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 ">
      {step === 1 && (
      <div className="bg-white  max-w-96 relative w-full p-5 mx-3">
        <div className="flex flex-row-reverse pb-5 ">
          <button
            onClick={() => setPharmacyModeProceed("")}
            className=" text-gray-800 "
          >
            <X size={20} />
          </button>

          <h2 className=" font-semibold text-center flex-1">
            Login with your pharmacy code
          </h2>
        </div>

        <div>
          <div className="bg-white ">
            <div className="mb-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Input Pharmacy Code
              </label>
              <input
                type="text"
                name="pharmacyCode"
                value={formData.pharmacyCode}
                onChange={handleChange}
                placeholder="Enter your pharmacy code"
                className="w-full px-3 py-2 border rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0000FF]  text-sm"
              />
            </div>

            <div className="text-sm text-gray-500 text-center py-1">
              <p> You can generate one from the previos tab</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (formData.pharmacyCode === "") {
              toast.error("Please enter your pharmacy code");
              return;
            }
            setStep(2)
          }}
          className="mt-4 w-full bg-[#0000FF] text-white py-2 rounded-full transition text-sm"
        >
        Proceed
        </button>
      </div>) }
      {step === 2 && (
        <div className="bg-white  max-w-96 relative w-full p-5 mx-3">
        <div className="flex flex-row-reverse pb-5 ">
          <button
            onClick={() => setPharmacyModeProceed("")}
            className=" text-gray-800 "
          >
            <X size={20} />
          </button>

          <h2 className=" font-semibold text-center flex-1">
            Login with your pharmacy code
          </h2>
        </div>

        <div>
          <div className="bg-white ">
            <div className="mb-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Input Pharmacy Code
              </label>
              <input
                type="text"
                name="patient_HIN"
                value={formData.patient_HIN}
                onChange={handleChange}
                placeholder="Enter the patient's HIN"
                className="w-full px-3 py-2 border rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0000FF]  text-sm"
              />
            </div>

            <div className="text-sm text-gray-500 text-center py-1">
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 w-full bg-[#0000FF] text-white py-2 rounded-full transition text-sm"
        >
          {loading ? "Proceeding" : "Proceed"}
        </button>
      </div> )}
      
    </div>
  );
};

export default PharmacyModeUpload;
