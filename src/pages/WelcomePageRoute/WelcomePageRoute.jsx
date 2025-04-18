import React, { useState } from "react";
import logo from "../../assets/img/logo.png";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import EmergencyModeForm from "../../Emergency Mode Feature/emergencymodeform";
import EmergencyModeRecords from "../../Emergency Mode Feature/EmergencyModeRecords";
import EmergencyModeRecordsMobile from "../../Emergency Mode Feature/EmergencyModeRecordsMobile";

const WelcomePageRoute = () => {
  const [accountType, setAccountType] = useState(""); // State to track dropdown value
  const [error, setError] = useState(""); // State to track error messages
  const [guestModeForm, setGuestModeForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [isMedicalRecord, setisMedicalRecord] = useState(false);
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
  return (
    <div
      style={{
        background: "linear-gradient(to bottom, #BCBCFF, #4C4CC9)",
      }}
      className="min-h-screen flex justify-center items-center"
    >
      <div className="bg-white py-6 px-8 rounded-xl z-50 mx-2 max-w-md">
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
          <p className="text-sm  text-gray-500 pb-2">
            Select your account type below to Login
          </p>
          <div className="w-full">
            {/* Dropdown */}
            <div className="relative w-full">
              <select
                className="border border-gray-300 px-4 py-2 rounded w-full focus:border-blue-600 outline-none appearance-none pr-10 text-sm"
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
              className={`mt-4 px-4 py-2 rounded-full w-full text-sm  ${
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
                className={`mt-2 px-4 py-2 text-sm rounded-full w-full text-[#0000FF] border border-[#0000FF]`}
              >
                Create an account
              </button>
            </Link>
            <Link to="/" state={{ isPharmacyMode: true }}>
            <button
                className={`mt-2 px-4 py-2 text-sm rounded-full w-full text-[#0000FF] border border-[#0000FF]`}
              >
                Pharmacy Mode
              </button>
              </Link>
          </div>
        

          <p className="mt-4 text-sm">
            You can login as a visitor too{" "}
            <Link
              className={`text-[#0000FF]  cursor-pointer`}
              onClick={() => setGuestModeForm(true)}
            >
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
        <EmergencyModeForm emergencyFormToggle = {setGuestModeForm}  name = {setName} medicalRecordToggle = {setisMedicalRecord} records = {setRecords}/>
      )}
      {isMedicalRecord && (
        <div className="hidden overflow-x-auto  fixed inset-0 bg-black bg-opacity-60 lg:flex items-start justify-center z-50">
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : records === "No medical records" ? (
            <p className="text-center py-4">No medical records found.</p>
          ) : (
         <div>
              <EmergencyModeRecords records={records} medicalRecordToggle = {setisMedicalRecord} />
         </div>
          )}
        </div>
      )}
      {isMedicalRecord && (
        <div className=" lg:hidden space-y-4 overflow-x-auto  fixed inset-0 bg-black bg-opacity-60 z-50 py-20">
          {loading ? (
            <p className="text-gray-500 text-center">
              Loading medical records...
            </p>
          ) : records === "No medical records" ? (
            <p className="text-center py-4">No medical records found.</p>
          ) : (
            <div>
            <EmergencyModeRecordsMobile records={records} medicalRecordToggle = {setisMedicalRecord} />
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WelcomePageRoute;
