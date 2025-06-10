import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from 'react-hot-toast';
import axios from "axios";

const PharmacyModeUploadNext = ({ setIsPharmacyUploadCode , setIsPharmacyUploadSuccessful }) => {
  const [formData, setFormData] = useState({
    pharmacistName: "",
    drugName: "",
    dosage: "",
    summary: "",
  });
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    const name = sessionStorage.getItem('patient_name');
    if (name) {
      setPatientName(name);
    }
  }, []);
  

  const [loading, setLoading] = useState(false);

  const pharmacyName = sessionStorage.getItem("pharmacyName") || "";

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
      : formData.drugName?.split(",").map((drug) => drug.trim()) || [],
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
        setIsPharmacyUploadCode(false); // Close the modal on success
        toast.success("Your upload was successful!"); // Show success message
        setIsPharmacyUploadSuccessful(true); // Set the upload successful state
       
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

          <div className="flex gap-1 items-center px-3">
            <h2 className=" font-semibold text-center flex-1">
              Welcome Back {pharmacyName}
            </h2>
            <svg
              width="16"
              height="17"
              viewBox="0 0 16 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.67101 1.90219C5.73663 1.59971 4.72088 2.02045 4.27405 2.89505L3.73686 3.94649C3.67303 4.07143 3.57143 4.17303 3.44649 4.23686L2.39505 4.77405C1.52045 5.22088 1.09971 6.23663 1.40219 7.17101L1.76583 8.29434C1.80903 8.42781 1.80903 8.57154 1.76583 8.70501L1.40219 9.82834C1.09971 10.7627 1.52045 11.7785 2.39505 12.2253L3.44649 12.7625C3.57143 12.8263 3.67303 12.9279 3.73686 13.0529L4.27405 14.1043C4.72088 14.9789 5.73663 15.3997 6.67101 15.0972L7.79434 14.7335C7.92781 14.6903 8.07154 14.6903 8.20501 14.7335L9.32834 15.0972C10.2627 15.3997 11.2785 14.9789 11.7253 14.1043L12.2625 13.0529C12.3263 12.9279 12.4279 12.8263 12.5529 12.7625L13.6043 12.2253C14.4789 11.7785 14.8997 10.7627 14.5972 9.82834L14.2335 8.70501C14.1903 8.57154 14.1903 8.42781 14.2335 8.29434L14.5972 7.17101C14.8997 6.23663 14.4789 5.22088 13.6043 4.77405L12.5529 4.23686C12.4279 4.17303 12.3263 4.07143 12.2625 3.94649L11.7253 2.89505C11.2785 2.02045 10.2627 1.59971 9.32834 1.90219L8.20501 2.26583C8.07154 2.30903 7.92781 2.30903 7.79434 2.26583L6.67101 1.90219ZM4.50619 8.33787L5.449 7.39501L7.33461 9.28067L11.1059 5.50944L12.0487 6.45225L7.33461 11.1663L4.50619 8.33787Z"
                fill="#0B6011"
              />
            </svg>
          </div>
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
                value={formData.drugName}
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
          {loading ? "Uploading for " : "Upload for "} {patientName}
        </button>
      </div>
    </div>
  );
};

export default PharmacyModeUploadNext;
