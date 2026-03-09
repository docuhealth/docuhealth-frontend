import React, { useState } from "react";
import axios from "axios";
import toast from 'react-hot-toast';

const EmergencyModeForm = ({ emergencyFormToggle, name, medicalRecordToggle, records }) => {
  const [loadingForm, setLoadingForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    firstEmergency: "",
    hin: "",
  });
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNextStep = () => {
    if (step === 1 && formData.name && formData.firstEmergency) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    if (!formData.hin) {
      toast.warning("Please enter the HIN.");
      return;
    }
    try {
      const response = await axios.get(
        `https://docuhealth-backend-h03u.onrender.com/api/patient/emergency/get_medical_records`,
        {
          params: { patient_HIN: formData.hin, guest_name: formData.name },
        }
      );
      console.log("Medical Records:", response.data);
      name(response.data.records[0].patient_info.fullname);
      records(response.data.records);
      emergencyFormToggle(false);
      medicalRecordToggle(true);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50  ">
        <div className="bg-white  shadow-lg p-6 max-w-96 w-full relative max-h-[80vh] overflow-y-auto mx-5">
          <div className="flex justify-between items-center gap-2 pb-2">
            <div></div>
            <div className="flex justify-center items-center gap-2 ">
              <p className="font-semibold">Welcome to Guest Mode</p>
            </div>
            <div>
              <i
                class="bx bx-x text-2xl cursor-pointer"
                onClick={() => emergencyFormToggle(false)}
              ></i>
            </div>
          </div>
          <div className="max-w-96 mx-auto bg-white p-2">
            {step === 1 && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1 ">
                    What is your name ?
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md text-gray-500 text-sm"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Name of ID Card holder ?
                  </label>
                  <input
                    type="text"
                    name="firstEmergency"
                    value={formData.firstEmergency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Enter HIN
                </label>
                <input
                  type="text"
                  name="hin"
                  value={formData.hin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-gray-500 text-sm"
                />
              </div>
            )}

            <div
              className={`bg-[#0000FF] text-center text-sm text-white rounded-full py-2 cursor-pointer ${
                step === 1 && (!formData.name || !formData.firstEmergency)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={step === 1 ? handleNextStep : handleSubmit}
            >
              <p>
                {loadingForm
                  ? "Loading..."
                  : step === 1
                  ? "Enter HIN"
                  : "Proceed"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModeForm;
