import React, { useState, useEffect } from "react";
import logo from ".././assets/logo.png";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [guestModeForm, setGuestModeForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [isMedicalRecord, setisMedicalRecord] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(null);
  const [name, setName] = useState("...");

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScrollTop) {
        // User is scrolling down → hide navbar after a short delay
        setIsVisible(false);
      } else {
        // User is scrolling up → show navbar
        setIsVisible(true);
      }

      // If user scrolls past a certain threshold, make navbar fixed
      setIsScrolled(currentScroll > 50);
      setLastScrollTop(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollTop]);

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
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div className="text-[#0E0E31] ">
      <div
        className={`${
          isScrolled
            ? "fixed w-full z-50 bg-white shadow transition-transform"
            : "absolute w-full"
        } ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } hidden sm:flex justify-around items-center py-5`}
        style={{ transition: "transform 0.3s ease-in-out" }}
      >
        <div className="flex justify-center gap-1 items-center">
          <div>
            <img src={logo} alt="DocuHealth Logo" />
          </div>
          <div className="font-semibold text-xl">
            <h1>DocuHealth</h1>
          </div>
        </div>
        <div className="flex justify-center items-center gap-5 text-sm">
          <a href="#" className="font-semibold">
            Home
          </a>
          <a
            href="#OurServices"
            className="text-gray-500 transition-all hover:text-[#34345F] hover:scale-105"
          >
            Our Services
          </a>
          <a
            href="#OurBenefits"
            className="text-gray-500 transition-all hover:text-[#34345F] hover:scale-105"
          >
            Benefits
          </a>
          <a
            href="#OurFeatures"
            className="text-gray-500 transition-all hover:text-[#34345F] hover:scale-105"
          >
            Features
          </a>
          <button
            href=""
            className=" text-gray-500 transition-all hover:text-[#34345F] hover:scale-105 "
            onClick={() => setGuestModeForm(true)}
          >
            Guest Mode
          </button>
        </div>
        <div className="flex justify-center items-center gap-2 text-sm">
          <Link to="/welcome">
            <button className="border border-[#0E0E31]  transition-all hover:bg-[#0E0E31] hover:text-white rounded-full py-2 px-5">
              Sign Up
            </button>
          </Link>
          <Link to="/welcome">
            <button className="border rounded-full py-2 px-5  transition-all hover:bg-[#34345F] bg-[#0E0E31] text-white">
              Sign In
            </button>
          </Link>
        </div>
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
                  {loading
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
        <div className=" lg:hidden space-y-4 overflow-x-auto  fixed inset-0 bg-black bg-opacity-60 z-50 py-20">
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

      <div className="fixed w-full z-50">
        {/* Top Navigation Bar */}
        <div className="sm:hidden flex justify-between items-center px-3 py-4 bg-white shadow">
          <button onClick={() => setIsOpen(true)}>
            <i className="bx bx-menu-alt-left text-3xl"></i>
          </button>
          <img src={logo} alt="DocuHealth Logo" />
        </div>

        {/* Sidebar Menu */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform z-50 sm:hidden ${
            isOpen
              ? "translate-x-0 z-50 sm:hidden"
              : "-translate-x-full z-50 sm:hidden"
          } transition-transform duration-300 ease-in-out text-[#0E0E31]`}
        >
          {/* Close Button */}
          <div className="flex justify-between items-center px-4 py-4">
            <div className="flex justify-center items-center gap-1">
              <img src={logo} alt="DocuHealth Logo" className="h-8" />
              <h2 className="text-xl font-semibold">DocuHealth</h2>
            </div>

            <button onClick={() => setIsOpen(false)}>
              <i className="bx bx-x text-3xl"></i>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col px-6 mt-4 space-y-4 text-gray-700">
            <a
              href="#"
              className="text-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </a>
            <a
              href="#OurServices"
              className="text-lg text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              Our services
            </a>
            <a
              href="#OurBenefits"
              className="text-lg text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              Benefits
            </a>
            <a
              href="#OurFeatures"
              className="text-lg text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
            <p
              href=""
              className="text-lg text-gray-400"
              onClick={() => {
                setIsOpen(false);
                setGuestModeForm(true);
              }}
            >
              Guest Mode
            </p>
          </nav>

          {/* Sign In / Sign Up Buttons */}
          <div className="absolute bottom-8 left-0 w-full px-6">
            <Link to="/welcome">
              <button
                className="w-full bg-[#0E0E31] text-white py-2 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                Sign in
              </button>
            </Link>
            <Link to="/welcome">
              <button
                className="w-full mt-2 border border-[#0E0E31] text-[#0E0E31] py-2 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                {" "}
                Sign up
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
