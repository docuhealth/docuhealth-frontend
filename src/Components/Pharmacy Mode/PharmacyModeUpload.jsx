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
  const [loading, setLoading] = useState(false);
  const [pharmacyName, setPharmacyName] = useState("");
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const payload = {
    pharma_code: formData.pharmacyCode,
    patient_HIN : formData.patient_HIN
  };

  const handleFetchPharmacyName = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.pharmacyCode === "") {
      toast.error("Please enter your pharmacy code");
      setLoading(false);
      return;
    }

    try {
      const pharma_code = formData.pharmacyCode; // Replace with your actual value

      const response = await fetch(
        `https://docuhealth-backend-h03u.onrender.com/api/pharmarcy/get_pharmacy_name?pharma_code=${encodeURIComponent(
          pharma_code
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json(); // Wait for the JSON to be parsed
        console.log(data); // Now this will log the actual JSON object
        setLoading(false);
        setPharmacyName(data.name); // Assuming the API returns a pharmacy_name field
        setStep(2);
      } else {
        console.log();
        const errorData = await response.json();
        console.error("Failed to create pharmacy", errorData);
        toast.error(errorData.message);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      toast.error(error.response.message);
      //  setLoading('Send Otp')
    } finally {
      setLoading(false);

    }
  };

  const handleSubmit = async (e) => {
    setLoading(true)
    if(formData.patient_HIN === ''){
      toast.error('Please enter patient hin')
    }
    try {
   

      const response = await fetch(
        `https://docuhealth-backend-h03u.onrender.com/api/pharmarcy/get_patient_name`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json(); // Wait for the JSON to be parsed
        console.log(data); // Now this will log the actual JSON object
        setLoading(false)
        
        sessionStorage.setItem("pharmacyCode", formData.pharmacyCode);
        sessionStorage.setItem("patient_HIN", formData.patient_HIN);
        sessionStorage.setItem('pharmacyName', pharmacyName)
        sessionStorage.setItem('patient_name', data.name)
        setIsPharmacyUploadCode(true);
        setPharmacyModeProceed(false);
        setFormData({
          pharmacyCode: "",
          patient_HIN : ""
        })
      } else {
        console.log();
        const errorData = await response.json();
        console.error("Failed to fetch hin", errorData);
        toast.error(errorData.message);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      toast.error(error.response.message);
      //  setLoading('Send Otp')
    } finally {
      setLoading(false);

    }

  
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
                <p> You can generate one from the previous tab</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleFetchPharmacyName}
            className="mt-4 w-full bg-[#0000FF] text-white py-2 rounded-full transition text-sm"
          >
            {loading ? "Proceeding" : "Proceed"}
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="bg-white  max-w-96 relative w-full p-5 mx-3">
          <div className="flex flex-row-reverse pb-5 ">
            <button
              onClick={() => setPharmacyModeProceed("")}
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
                  Input Patient's HIN
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

              <div className="text-sm text-gray-500 text-center py-1"></div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="mt-4 w-full bg-[#0000FF] text-white py-2 rounded-full transition text-sm"
          >
            {loading ? "Proceeding" : `Proceed`}
          </button>
        </div>
      )}
    </div>
  );
};

export default PharmacyModeUpload;
