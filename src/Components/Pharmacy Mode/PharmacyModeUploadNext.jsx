import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const PharmacyModeUploadNext = ({ setIsPharmacyUploadCode }) => {
  const [formData, setFormData] = useState({
    pharmacistName: "",
    drugName: "",
    dosage: "",
    summary: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const payload = {
    pharma_code: String(sessionStorage.getItem("pharmacyCode") || ""),
    patient_HIN: String(sessionStorage.getItem("patient_HIN") || ""),
    pharmacist: formData.pharmacistName,
    drugs: Array.isArray(formData.drugName)
      ? formData.drugName
      : formData.drugName?.split(",").map(drug => drug.trim()) || [],
    dosage: formData.dosage,
    summary: formData.summary,
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate form data here if needed
    if (
      !formData.pharmacistName ||
      !formData.drugName ||
      !formData.dosage ||
      !formData.summary
    ) {
      toast.error("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://docuhealth-backend-h03u.onrender.com/api/pharmarcy/upload_drug",
        payload, // no need to stringify with axios
        {
          headers: {
            "Content-Type": "application/json", // important to set header
          },
        }
      );

      if (response.status === 200) {
        setLoading(false);
        console.log(response.data);
    
      } else {
        console.error("Failed to upload by pharmacy", response.data);
      }
    } catch (error) {
      if (error.response) {
        console.error("Server responded with an error:", error.response.data);
        toast.error(error.response.data.message); // move it here
      } else {
        console.error(`Error: ${error.message}`);
        toast.error("An unexpected error occurred. Please try again."); // fallback error
      }
    } finally {
      setLoading(false);
      setFormData({
        pharmacistName: "",
        drugName: "",
        dosage: "",
        summary: "",
      });

    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 text-[#1B2B40]">
      <div className="bg-white  max-w-96 relative w-full p-5 mx-3">
        <div className="flex flex-row-reverse pb-5 ">
          <button
            onClick={() => setIsPharmacyUploadCode(false)}
            className=" text-gray-800 "
          >
            <X size={20} />
          </button>

          <h2 className=" font-semibold text-center flex-1">
            Welcome to pharmacy mode
          </h2>
        </div>

        <div>
          <div className="bg-white ">
            <div className="mb-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Name of pharmacist on duty
              </label>
              <input
                type="text"
                name="pharmacistName"
                value={formData.pharmacistName}
                onChange={handleChange}
                placeholder="Enter name of pharmacist on duty"
                className="w-full px-3 py-2 border rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0000FF]  text-sm"
              />
            </div>

            <div className="mb-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Name of drug(s)
              </label>
              <input
                type="text"
                name="drugName" 
                value = {formData.drugName}
                onChange={handleChange}
                placeholder="Enter drugs e.g Paracetamol, Ibuprofen"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0000FF]  text-sm"
              />
            </div>

            <div className="mb-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Dosage
              </label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="Enter the dosage e.g 500mg , 1g respectively"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0000FF]  text-sm"
              />
            </div>

            <div className="mb-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Summary of diagnosis
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                placeholder="Enter a summary of diagnosis"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0000FF]  h-24 resize-none text-sm"
              ></textarea>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 w-full bg-[#0000FF] text-white py-2 rounded-full transition text-sm"
        >
          {loading ? "Uploading" : "Upload "}
        </button>
      </div>
    </div>
  );
};

export default PharmacyModeUploadNext;
