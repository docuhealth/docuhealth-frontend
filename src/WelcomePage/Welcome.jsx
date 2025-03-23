import React, { useState } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Welcome = () => {
  const [accountType, setAccountType] = useState(""); // State to track dropdown value
  const [error, setError] = useState(""); // State to track error messages
  const [guestModeForm, setGuestModeForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
    const [loadingForm, setLoadingForm] = useState(false);
  const [isMedicalRecord, setisMedicalRecord] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(null);
  const [name, setName] = useState("...");
  const navigate = useNavigate();

  const handleProceed = () => {
    if (!accountType) {
      setError("Please select an account type before proceeding.");
    } else {
      setError("");
      if (accountType === "Individual") {
        navigate("/user-login ");
      } else if (accountType === "Hospital") {
        navigate("/hospital-login");
      }
    }
  };

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
        `https://docuhealth-backend.onrender.com/api/patient/emergency/get_medical_records`,
        {
          params: { patient_HIN: formData.hin },
        }
      );
      console.log("Medical Records:", response.data);
      setName(response.data.records[0].patient_info.fullname);
      setRecords(response.data.records);
      setGuestModeForm(false);
      setisMedicalRecord(true);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(to bottom, #BCBCFF, #4C4CC9)",
      }}
      className="min-h-screen flex justify-center items-center"
    >
      <div className="bg-white py-6 px-8 rounded-xl z-50 mx-2">
        <div className="flex justify-center items-center gap-1">
          <div>
            <img src={logo} alt="DocuHealth Logo" />
          </div>
          <h1 className="text-[#0000FF] text-3xl font-bold">DocuHealth</h1>
        </div>
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-xl font-semibold text-gray-950 py-2">
            Welcome to DocuHealth 👋
          </h2>
          <p className="text-sm sm:text-md text-gray-500 pb-2">
            Select your account type below to Login
          </p>
          <div className="w-full">
            {/* Dropdown */}
            <div className="relative w-full">
              <select
                className="border border-gray-300 px-4 py-2 rounded w-full focus:border-blue-600 outline-none appearance-none pr-10"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
              >
                <option value="">Select Account Type</option>
                <option value="Individual">Individual</option>
                <option value="Hospital">Hospital</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            {/* Proceed Button */}
            <button
              className={`mt-4 px-4 py-2 rounded-full w-full  ${
                accountType
                  ? "bg-[#0000FF]  text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              onClick={handleProceed}
              disabled={!accountType} // Disable button if no selection
            >
              Proceed to Login
            </button>
            <Link to="/confirm-account">
              <button
                className={`mt-2 px-4 py-2 rounded-full w-full text-[#0000FF] border border-[#0000FF]`}
              >
                Create an account
              </button>
            </Link>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </div>

          <p className="mt-4 text-sm">
            You can login as a visitor too{" "}
            <Link className={`text-[#0000FF]  cursor-pointer`} 
              onClick={() => setGuestModeForm(true)}>
              Use Guest Mode
            </Link>
          </p>
        </div>
      </div>
      <div className="absolute z-10 bottom-0 right-0 hidden lg:block">
        <svg
          width="1000"
          height="268"
          viewBox="0 0 1322 268"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 168.259C0.000161026 73.3496 887.159 7.57711 1322 0V288.946C894.697 297.226 -0.000197914 284.91 0 168.259Z"
            fill="#C8CAE7"
            fill-opacity="0.05"
          />
          <rect x="71.9761" y="110" width="147.548" height="135.07" />
        </svg>
      </div>
      <div className="text-center text-white  sm:py-3 fixed bottom-0 w-screen">
        <p className="hidden sm:block text-sm">
          {" "}
          &copy; {new Date().getFullYear()} Docuhealth Services Limited. All
          rights reserved. Designed and developed <br /> by Docuhealth Tech
          Team.
        </p>
        <p className="block sm:hidden p-3 text-[10px]">
          {" "}
          &copy; {new Date().getFullYear()} Docuhealth Services Limited. All
          rights reserved. Designed and developed by Docuhealth Tech Team.
        </p>
      </div>

      {guestModeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50  ">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative max-h-[80vh] overflow-y-auto mx-5">
            <div className="flex justify-between items-center gap-2 pb-2">
              <div></div>
              <div className="flex justify-center items-center gap-2 ">
                <p className="font-semibold">Welcome to Guest Mode</p>
              </div>
              <div>
                <i
                  class="bx bx-x text-2xl cursor-pointer"
                  onClick={() => setGuestModeForm(false)}
                ></i>
              </div>
            </div>
            <div className="max-w-96 mx-auto bg-white p-2">
              {step === 1 && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      What is your name ?
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md text-gray-500"
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
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border rounded-md text-gray-500"
                  />
                </div>
              )}

              <div
                className={`bg-[#0000FF] text-center text-white rounded-full py-2 cursor-pointer ${
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
      )}
      {isMedicalRecord && (
        <div className="hidden overflow-x-auto  fixed inset-0 bg-black bg-opacity-60 lg:flex items-start justify-center z-50">
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : records === "No medical records" ? (
            <p className="text-center py-4">No medical records found.</p>
          ) : (
            <div className="space-y-4 mt-20 bg-white p-4">
              <div className="flex justify-between items-center">
                <p className="pl-4 text-2xl font-semibold">{name}</p>
                <i
                  className="bx bx-x text-2xl text-black cursor-pointer pr-4"
                  onClick={() => setisMedicalRecord(false)}
                ></i>
              </div>
              {Array.isArray(records) && records.length > 0 ? (
                records.map((record) => (
                  <div
                    key={record._id}
                    className="bg-white shadow-sm rounded-lg p-4 flex items-center justify-between space-x-4"
                  >
                    {/* Date and Time */}
                    <div className="text-gray-700">
                      <span className="font-semibold">
                        {new Date(record.created_at)
                          .toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                          .replace(/^\d{2}/, (day) => day.padStart(2, "0"))}
                      </span>
                      <p className="text-sm text-gray-500">
                        {(() => {
                          const time = new Date(record.created_at);
                          const hours = time.getHours();
                          const minutes = time
                            .getMinutes()
                            .toString()
                            .padStart(2, "0");
                          const period = hours >= 12 ? "PM" : "AM";
                          const formattedHours = hours % 12 || 12;
                          return `${formattedHours}:${minutes} ${period}`;
                        })()}
                      </p>
                    </div>

                    {/* Vertical Divider */}
                    <div className="border-l h-12 border-gray-300"></div>

                    {/* Diagnosis */}
                    <div className="text-gray-700 truncate">
                      <span className="font-medium">Diagnosis:</span>
                      <p>{record.basic_info.diagnosis} </p>
                    </div>

                    {/* Vertical Divider */}
                    <div className="border-l h-12 border-gray-300"></div>

                    {/* Hospital Name */}
                    <div className="text-gray-700 truncate">
                      <span className="font-medium">Name of Hospital:</span>
                      <p>{record.hospital_info.name + " Hospital"}</p>
                    </div>

                    {/* Vertical Divider */}
                    <div className="border-l h-12 border-gray-300"></div>

                    {/* Medical Personnel */}
                    <div className="text-gray-700 truncate">
                      <span className="font-medium">Medical Personnel:</span>
                      <p>{record.hospital_info.medical_personnel}</p>
                    </div>

                    {/* Vertical Divider */}
                    <div className="border-l h-12 border-gray-300"></div>

                    {/* Summary */}
                    <div className="text-gray-700 truncate max-w-xs">
                      <span className="font-medium">Summary/Treatment:</span>
                      <p>{record.summary}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-4">
                  No medical records available.
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {isMedicalRecord && (
        <div className=" lg:hidden space-y-4 overflow-x-auto  fixed inset-0 bg-black bg-opacity-60 z-50 pt-20">
          {loading ? (
            <p className="text-gray-500 text-center">
              Loading medical records...
            </p>
          ) : records === "No medical records" ? (
            <p className="text-center py-4">No medical records found.</p>
          ) : (
            <div className="mx-3 z-50 bg-white p-3">
              <div className="flex justify-between items-center">
                <p className="pl-3 text-xl font-semibold">{name}</p>
                <i
                  className="bx bx-x text-2xl text-black cursor-pointer "
                  onClick={() => setisMedicalRecord(false)}
                ></i>
              </div>
              {records.map((record) => (
                <div
                  key={record._id}
                  className="bg-white shadow-md  p-4 flex flex-col mb-4 space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4"
                >
                  <div className="flex justify-between">
                    {/* Date and Time */}
                    <div className="text-gray-700">
                      <span className="font-semibold">
                        {new Date(record.created_at)
                          .toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                          .replace(/^\d{2}/, (day) => day.padStart(2, "0"))}
                      </span>
                      <p className="text-sm text-gray-500">
                        {(() => {
                          const time = new Date(`${record.created_at}`); // Combine date and time
                          const hours = time.getHours(); // Extract hours
                          const minutes = time
                            .getMinutes()
                            .toString()
                            .padStart(2, "0"); // Extract and format minutes
                          const period = hours >= 12 ? "PM" : "AM"; // Determine AM or PM
                          const formattedHours = hours % 12 || 12; // Convert to 12-hour format (midnight = 12)
                          return `${formattedHours}:${minutes} ${period}`; // Return formatted time
                        })()}
                      </p>
                    </div>

                  
                  </div>

                  <div className="grid grid-cols-1 gap-y-2 sm:flex sm:space-x-4 sm:items-center ">
                    {/* Name of Hospital */}
                    <div>
                      <span className="text-gray-500 block text-sm">
                        Name of Hospital
                      </span>
                      <p className="text-gray-700 font-medium">
                        {record.hospital_info.name + " Hospital"}
                      </p>
                    </div>

                    {/* Diagnosis */}
                    <div>
                      <span className="text-gray-500 block text-sm">
                        Diagnosis
                      </span>
                      <p className="text-gray-700 font-medium">
                        {record.basic_info.diagnosis}
                      </p>
                    </div>

                    {/* Medical Personnel */}
                    <div>
                      <span className="text-gray-500 block text-sm">
                        Medical Personnel
                      </span>
                      <p className="text-gray-700 font-medium">
                        {record.hospital_info.medical_personnel}
                      </p>
                    </div>

                    {/* Summary */}
                    <div>
                      <span className="text-gray-500 block text-sm">
                        Summary/Treatment
                      </span>
                      <p className="text-gray-700 font-medium truncate">
                        {record.summary}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Welcome;
