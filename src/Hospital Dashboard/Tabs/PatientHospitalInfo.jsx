import React, { useState, useEffect } from "react";
import TabComponents from "./TabComponent";
import profilepic from "../../assets/profile.png";
import axios from "axios";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const PatientHospitalInfo = ({ patientData, hin }) => {
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [upload, setUploading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(null);
  const [name, setName] = useState("fetching...");

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    patient_HIN: hin,
    pulse_rate: 0,
    blood_pressure: "",
    temperature: 0,
    diagnosis: "",
    respiratory_rate: 0,
    weight: 0,
    summary: "",
    medical_personnel: "",
  });

  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  const handleFileChange = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const newFiles = [...files, ...uploadedFiles];
    setFiles(newFiles);
    console.log(newFiles);

    // Generate preview URLs for images
    const newPreviews = uploadedFiles.map((file) =>
      file.type.startsWith("image/") ? URL.createObjectURL(file) : null
    );
    setFilePreviews([...filePreviews, ...newPreviews]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateStepOne = () => {
    const {
      pulse_rate,
      temperature,
      respiratory_rate,
      blood_pressure,
      weight,
      diagnosis,
    } = formData;
    return (
      pulse_rate &&
      temperature &&
      respiratory_rate &&
      blood_pressure &&
      weight &&
      diagnosis
    );
  };

  const handleNext = () => {
    if (step === 1 && !validateStepOne()) {
      toast.warning("Please fill in all fields before proceeding!");
      return;
    }
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const patientHIN = hin; // Replace with dynamic patient HIN if necessary
  const itemsPerPage = 10;

  const exportToPDF = () => {
    console.log(records);
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#1E90FF"); // Blue color
    doc.text(`Medical Record Summary Details`, 105, 15, { align: "center" });

    doc.setLineWidth(0.5);
    doc.setDrawColor("#1E90FF"); // Blue color
    doc.line(20, 20, 190, 20); // Horizontal line below the header

    // Add Sub-header for Record Details
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#333333"); // Gray color
    doc.text(`${name} Hospital`, 20, 30);

    // Add Patient and Record Information
    doc.setFontSize(12);
    doc.text(
      `Date: ${new Date(selectedRecord.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,
      20,
      40
    );

    doc.text(
      `Time: ${(() => {
        const time = new Date(selectedRecord.created_at);
        const hours = time.getHours();
        const minutes = time.getMinutes().toString().padStart(2, "0");
        const period = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes} ${period}`;
      })()}`,
      20,
      45
    );

    doc.text(
      `Name of Patient: ${selectedRecord.patient_info.fullname}`,
      20,
      55
    );
    doc.text(`Gender: ${selectedRecord.patient_info.sex}`, 20, 60);

    // Add Medical Details Section
    doc.setFontSize(14);
    doc.setTextColor("#1E90FF");
    doc.text("Medical Details", 20, 70);

    doc.setDrawColor("#1E90FF");
    doc.line(20, 72, 190, 72);

    doc.setFontSize(12);
    doc.setTextColor("#333333");
    doc.text(`Pulse Rate: ${selectedRecord.basic_info.pulse_rate}`, 20, 80);
    doc.text(`Temperature: ${selectedRecord.basic_info.temperature}`, 20, 85);
    doc.text(
      `Respiratory Rate: ${selectedRecord.basic_info.respiratory_rate}`,
      20,
      90
    );
    doc.text(`Weight: ${selectedRecord.basic_info.weight}`, 20, 95);
    doc.text(
      `Blood Pressure: ${selectedRecord.basic_info.blood_pressure} MM HG`,
      20,
      100
    );
    doc.text(`Diagnosis: ${selectedRecord.basic_info.diagnosis}`, 20, 105);

    // Add Summary Section
    doc.setFontSize(14);
    doc.setTextColor("#1E90FF");
    doc.text("Summary of Diagnosis/Treatment", 20, 115);
    doc.setDrawColor("#1E90FF");
    doc.line(20, 117, 190, 117);

    doc.setFontSize(12);
    doc.setTextColor("#333333");

    // Dynamically adjust vertical spacing for summary
    const summaryLines = doc.splitTextToSize(selectedRecord.summary, 170);
    const summaryYStart = 125;
    doc.text(summaryLines, 20, summaryYStart);

    // Add Doctor and Hospital Details below the summary
    const afterSummaryY = summaryYStart + summaryLines.length * 6;
    doc.text(
      `Attended to by: ${selectedRecord.hospital_info.medical_personnel}`,
      20,
      afterSummaryY + 10
    );
    doc.text(`Hospital: ${name} Hospital`, 20, afterSummaryY + 20);
    doc.text(
      `Hospital Address: ${selectedRecord.hospital_info.address}`,
      20,
      afterSummaryY + 30
    );

    // Add Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor("#808080");
    doc.text(
      "Generated by DocuHealth Records System. Confidential and for authorized use only.",
      105,
      290,
      { align: "center" }
    );

    // Save the PDF
    doc.save(`${name}-hospital-record.pdf`);
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("jwtToken"); // Retrieve token from localStorage
      console.log("Token:", token);

      if (!token) {
        console.log("Token not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching data...");
        const response = await axios.get(
          "https://docuhealth-backend.onrender.com/api/hospital/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
              "Content-Type": "application/json",
            },
          }
        );

        console.log("API Response Here:", response.data);

        setName(response.data.hospital.name);
      } catch (err) {
        console.error("Error fetching data:", err);
        console.log(err.response?.data?.message || "Error fetching data");

        setName("Error, refresh");
      }
    };

    fetchData();
  }, []);

  const fetchPatientMedicalRecords = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        toast.error("Token not found. Please log in again.");
        setLoading(false);
        return;
      }

      console.log(patientHIN);

      const response = await axios.post(
        "https://docuhealth-backend.onrender.com/api/hospital/patients/get_patient_medical_records",
        { patient_HIN: hin },
        {
          params: {
            page: currentPage,
            size: itemsPerPage,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRecords(response.data.records);
      setTotalPages(response.data.total_pages);
      console.log(response.data.records);
      toast.success("Patient medical records retrieved successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch patient medical records."
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePopover = (recordId) => {
    setPopoverVisible((prev) => (prev === recordId ? null : recordId));
    setSelectedRecord(records.find((r) => r._id === recordId) || null);
  };

  useEffect(() => {
    fetchPatientMedicalRecords();
  }, [currentPage]);

  const createMedicalRecords = new FormData();
  createMedicalRecords.append("info", JSON.stringify(formData));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading("Uploading");

    // Validate that all fields are filled
    for (const [key, value] of Object.entries(formData)) {
      if (!value) {
        toast.error(`Please fill in the ${key.replace("_", " ")}`);
        setUploading("Upload");
        return;
      }
    }

    if (files.length > 0) {
      files.forEach((file) => createMedicalRecords.append("files", file));
      
    } 

    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        toast.error("Authentication error. Please log in again.");
        setUploading("Upload");
        return;
      }
      console.log(createMedicalRecords);
      const response = await axios.post(
        "https://docuhealth-backend.onrender.com/api/hospital/patients/create_medical_record",
        createMedicalRecords,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        toast.success(
          "Medical record created successfully, refresh to see changes !"
        );
        setUploading("Upload");
        setFormData({
          patient_HIN: "",
          pulse_rate: 0,
          blood_pressure: "",
          temperature: 0,
          diagnosis: "",
          respiratory_rate: 0,
          weight: 0,
          summary: "",
          medical_personnel: "",
        });
        setFiles([]);
        setFilePreviews([]);
      } else {
        toast.error("Failed to create medical record. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while creating the medical record."
      );
    } finally {
      setUploading("Upload");
      setFiles([]);
      setFilePreviews([]);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Set title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Medical Records Report", 14, 15);

    // Define table columns
    const columns = [
      "Date",
      "Time",
      "Patient Name",
      "Diagnosis",
      "Hospital",
      "Medical Personnel",
      "Summary",
    ];

    // Populate table rows from records
    const rows = records.map((record) => {
      const formattedDate = new Date(record.created_at)
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
        .replace(/^\d{2}/, (day) => day.padStart(2, "0"));

      const time = new Date(record.created_at);
      const hours = time.getHours();
      const minutes = time.getMinutes().toString().padStart(2, "0");
      const period = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      const formattedTime = `${formattedHours}:${minutes} ${period}`;

      return [
        formattedDate,
        formattedTime,
        record.patient_info?.fullname || "N/A",
        record.basic_info?.diagnosis || "N/A",
        name || "N/A", // Assuming `name` is the hospital name
        record.hospital_info?.medical_personnel || "N/A",
        record.summary || "N/A",
      ];
    });

    // Generate table
    autoTable(doc, {
      startY: 25, // Position after title
      head: [columns],
      body: rows,
      styles: { fontSize: 10 },
      theme: "grid",
      margin: { top: 20 },
    });

    // Add Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor("#808080");
    doc.text(
      "Generated by DocuHealth Records System. Confidential and for authorized use only.",
      105,
      290,
      { align: "center" }
    );

    // Save the PDF
    doc.save("Medical_Records.pdf");
  };

  const tabs = [
    {
      title: "Accounts Setting",
      content: (
        <div className="space-y-4">
          <div className="w-full  mx-auto ">
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <p className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100">
                    {patientData.info.fullname || "NIL"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sex
                  </label>
                  <p className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100">
                    {patientData.info.sex || "NIL"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Date Of Birth
                  </label>
                  <p className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100">
                    {patientData.info.DOB || "NIL"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <p className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100">
                    {patientData.info.phone_num || "NIL"}
                  </p>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <p className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100">
                    {patientData.info.state || "NIL"}
                  </p>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100">
                    {patientData.info.email || "NIL"}
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      ),
    },
    {
      title: "Patient Medical Record",
      content: (
        <div className="space-y-4 text-sm">
          <div>
            <div className="hidden lg:block overflow-x-auto mx-3">
              {loading ? (
                <p className="text-center py-4">Loading...</p>
              ) : records.length === 0 ? (
                <p className="text-center py-4">No medical records found.</p>
              ) : (
                <div className="space-y-4">
                  <button
                    className="bg-[#0000FF] py-2 px-3 text-white rounded-full "
                    onClick={handleDownloadPDF}
                  >
                    Download Document
                  </button>
                  {records.map((record) => (
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

                      {/* Vertical Divider */}
                      <div className="border-l h-12 border-gray-300"></div>

                      {/* Diagnosis */}
                      <div className="text-gray-700  truncate">
                        <span className="font-medium">Diagnosis:</span>
                        <p>{record.basic_info.diagnosis}</p>
                      </div>

                      {/* Vertical Divider */}
                      <div className="border-l h-12 border-gray-300"></div>

                      {/* Hospital Name */}
                      <div className="text-gray-700  truncate">
                        <span className="font-medium">Name of Hospital:</span>
                        <p>{name}</p>
                      </div>

                      {/* Vertical Divider */}
                      <div className="border-l h-12 border-gray-300"></div>

                      {/* Medical Personnel */}
                      <div className="text-gray-700  truncate">
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
                      {/* Vertical Divider */}
                      <div className="border-l h-12 border-gray-300"></div>

                      {/* Summary */}
                      <div
                        className="text-gray-700  max-w-xs"
                        onClick={() => togglePopover(record._id)}
                      >
                        <p>
                          <i class="bx bx-dots-vertical-rounded cursor-pointer"></i>
                        </p>
                      </div>

                      {popoverVisible === record._id && (
                        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50">
                          <div className="bg-white shadow-lg rounded-lg p-5 relative max-h-[80vh] overflow-y-auto  ">
                            <div className="flex justify-between items-center">
                              <div className="flex justify-start items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center p-1">
                                  {patientData?.info.fullname
                                    ? patientData.info.fullname
                                        .split(" ")
                                        .map((word) =>
                                          word ? word[0].toUpperCase() : ""
                                        ) // Add safeguard for empty strings
                                        .join("")
                                    : ""}
                                </div>

                                <div>
                                  <p className="font-semibold text-md">
                                    {name} Hospital
                                  </p>
                                  <div className="text-[12px] flex items-center gap-1 text-gray-400">
                                    <p>
                                      <span className="">
                                        {new Date(record.created_at)
                                          .toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                          })
                                          .replace(/^\d{2}/, (day) =>
                                            day.padStart(2, "0")
                                          )}
                                      </span>
                                    </p>
                                    <p className=" text-gray-500">
                                      {(() => {
                                        const time = new Date(
                                          `${record.created_at}`
                                        ); // Combine date and time
                                        const hours = time.getHours(); // Extract hours
                                        const minutes = time
                                          .getMinutes()
                                          .toString()
                                          .padStart(2, "0"); // Extract and format minutes
                                        const period =
                                          hours >= 12 ? "PM" : "AM"; // Determine AM or PM
                                        const formattedHours = hours % 12 || 12; // Convert to 12-hour format (midnight = 12)
                                        return `${formattedHours}:${minutes} ${period}`; // Return formatted time
                                      })()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  className="bg-[#0000FF] py-1 px-3 text-white rounded-full cursor-pointer"
                                  onClick={exportToPDF}
                                >
                                  Export as pdf
                                </button>
                                <p onClick={() => setPopoverVisible(null)}>
                                  <i className="bx bx-x text-2xl text-black cursor-pointer"></i>
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 p-4">
                              {/* Pulse Rate */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Pulse Rate
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.basic_info.pulse_rate}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Temperature */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Temperature
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.basic_info.temperature}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Respiratory Rate */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Respiratory Rate (RR)
                                </label>
                                <input
                                  type="text"
                                  value={
                                    selectedRecord.basic_info.respiratory_rate
                                  }
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Weight */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Weight
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.basic_info.weight}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Blood Pressure */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Blood Pressure
                                </label>
                                <input
                                  type="text"
                                  value={
                                    selectedRecord.basic_info.blood_pressure +
                                    "MM HG"
                                  }
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Diagnosis */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Diagnosis
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.basic_info.diagnosis}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Summary/Treatment Plan */}
                              <div className="col-span-2">
                                <label className="block text-gray-600 text-sm font-medium">
                                  Summary/Treatment Plan
                                </label>
                                <textarea
                                  value={selectedRecord.summary}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 h-24 focus:outline-none"
                                ></textarea>
                              </div>

                              {/* Name of Patient */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Name of Patient
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.patient_info.fullname}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Gender */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Gender
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.patient_info.sex}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Name of Medical Personnel */}
                              <div className="col-span-2">
                                <label className="block text-gray-600 text-sm font-medium">
                                  Name of Medical Personnel
                                </label>
                                <input
                                  type="text"
                                  value={
                                    selectedRecord.hospital_info
                                      .medical_personnel
                                  }
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Attachment */}
                              <div className="col-span-2">
                                <label className="block text-gray-600 text-sm font-medium">
                                  Attachment
                                </label>
                                <input
                                  type="text"
                                  value="NIL"
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="block lg:hidden space-y-4">
              {loading ? (
                <p className="text-gray-500 text-center">
                  Loading medical records...
                </p>
              ) : records.length > 0 ? (
                <div>
                  <button
                    className="bg-[#0000FF] py-2 px-3 text-white rounded-full "
                    onClick={handleDownloadPDF}
                  >
                    Download Document
                  </button>
                  {records.map((record) => (
                    <div
                      key={record._id}
                      className="bg-white shadow-md rounded-lg p-4 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4"
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

                        <div className="text-gray-700  max-w-xs">
                          <p>
                            <i
                              class="bx bx-dots-vertical-rounded cursor-pointer"
                              onClick={() => {
                                togglePopover(record._id);
                              }}
                            ></i>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-y-2 sm:flex sm:space-x-4 sm:items-center">
                        {/* Name of Hospital */}
                        <div>
                          <span className="text-gray-500 block text-sm">
                            Name of Hospital
                          </span>
                          <p className="text-gray-700 font-medium">
                            {name + " Hospital"}
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
                      {popoverVisible === record._id && (
                        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50">
                          <div className="bg-white shadow-lg rounded-lg p-5 relative max-h-[80vh] overflow-y-auto w-[90%] sm:w-[60%]">
                            <div className="flex justify-between items-center">
                              <div className="">
                            <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center p-1">
                                  {patientData?.info.fullname
                                    ? patientData.info.fullname
                                        .split(" ")
                                        .map((word) =>
                                          word ? word[0].toUpperCase() : ""
                                        ) // Add safeguard for empty strings
                                        .join("")
                                    : ""}
                                </div>
                              <div>
                                <p className="font-semibold text-md">
                                  {name} Hospital
                                </p>
                                <div className="text-[12px] flex items-center gap-1 text-gray-400">
                                  <p>
                                    <span className="font-medium"></span>{" "}
                                    {new Date(selectedRecord.created_at)
                                      .toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                      })
                                      .replace(/^\d{2}/, (day) =>
                                        day.padStart(2, "0")
                                      )}
                                  </p>
                                  <p>
                                    <span className="font-medium"></span>{" "}
                                    {(() => {
                                      const time = new Date(
                                        `${record.created_at}`
                                      ); // Combine date and time
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
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  className="bg-[#0000FF] py-1 px-3 text-white rounded-full cursor-pointer"
                                  onClick={exportToPDF}
                                >
                                  Export as pdf
                                </button>
                                <p onClick={() => setPopoverVisible(null)}>
                                  <i className="bx bx-x text-2xl text-black cursor-pointer"></i>
                                </p>
                              </div>
                            </div>
                            {/* Responsive Grid Layout */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                              {/* Pulse Rate */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Pulse Rate
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.basic_info.pulse_rate}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Temperature */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Temperature
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.basic_info.temperature}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Respiratory Rate */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Respiratory Rate (RR)
                                </label>
                                <input
                                  type="text"
                                  value={
                                    selectedRecord.basic_info.respiratory_rate
                                  }
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Weight */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Weight
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.basic_info.weight}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Blood Pressure */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Blood Pressure
                                </label>
                                <input
                                  type="text"
                                  value={
                                    selectedRecord.basic_info.blood_pressure +
                                    "MM HG"
                                  }
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Diagnosis */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Diagnosis
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.basic_info.diagnosis}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Summary/Treatment Plan */}
                              <div className="col-span-1 sm:col-span-2">
                                <label className="block text-gray-600 text-sm font-medium">
                                  Summary/Treatment Plan
                                </label>
                                <textarea
                                  value={selectedRecord.summary}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 h-24 focus:outline-none"
                                ></textarea>
                              </div>

                              {/* Name of Patient */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Name of Patient
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.patient_info.fullname}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Gender */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Gender
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.patient_info.sex}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Name of Medical Personnel */}
                              <div className="col-span-1 sm:col-span-2">
                                <label className="block text-gray-600 text-sm font-medium">
                                  Name of Medical Personnel
                                </label>
                                <input
                                  type="text"
                                  value={
                                    selectedRecord.hospital_info
                                      .medical_personnel
                                  }
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Attachment */}
                              <div className="col-span-1 sm:col-span-2">
                                <label className="block text-gray-600 text-sm font-medium">
                                  Attachment
                                </label>
                                <input
                                  type="text"
                                  value="NIL"
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">
                  Medical records not found.
                </p>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row gap-3 justify-between items-center my-4">
                {/* Pagination Info */}
                <span className="text-gray-500 text-sm">
                  Showing page {currentPage} of {totalPages} entries
                </span>

                {/* Pagination Buttons */}
                <div className="flex items-center">
                  {/* Previous Button */}
                  <button
                    className={`px-3 py-1 mx-1 rounded-full ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    &lt;
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`px-3 py-1 mx-1 rounded-full ${
                        currentPage === i + 1
                          ? "bg-[#0000FF] text-white"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    className={`px-3 py-1 mx-1 rounded-full ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Diagnosis & Treatment",
      content: (
        <div className="">
          <div className="p-3">
            {step === 1 && (
              <form className=" grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Pulse Rate */}
                <div>
                  <label className="block text-gray-700 pb-1">Pulse Rate</label>
                  <input
                    type="text"
                    name="pulse_rate"
                    value={formData.pulse_rate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000FF]"
                  />
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-gray-700 pb-1">
                    Temperature
                  </label>
                  <input
                    type="text"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000FF]"
                  />
                </div>

                {/* Respiratory Rate */}
                <div>
                  <label className="block text-gray-700 pb-1">
                    Respiratory Rate (RR)
                  </label>
                  <input
                    type="text"
                    name="respiratory_rate"
                    value={formData.respiratory_rate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000FF]"
                  />
                </div>

                {/* Blood Pressure */}
                <div>
                  <label className="block text-gray-700 pb-1">
                    Blood Pressure
                  </label>
                  <input
                    type="text"
                    name="blood_pressure"
                    value={formData.blood_pressure}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000FF]"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-gray-700 pb-1">Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000FF]"
                  />
                </div>

                {/* Diagnosis */}
                <div>
                  <label className="block text-gray-700 pb-1">Diagnosis</label>
                  <input
                    type="text"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000FF]"
                  />
                </div>

                {/* Button */}
                <div className="col-span-full flex justify-start space-x-4">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-[#0000FF] hover:bg-blue-600 text-white px-6 py-2 rounded-full transition duration-200"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form className="space-y-4">
                <div>
                  <label className="block text-gray-700 pb-1">
                    Summary of Diagnosis / Treatment
                  </label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    className="w-full px-4 py-5 h-[200px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000FF]"
                  ></textarea>
                </div>
                {/* <div>
                  <label className="block text-gray-700">
                    Add Photo/PDF (Optional)
                  </label>
                  <input
                    type="file"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div> */}

                <label className="block mb-2 text-lg font-medium">
                  Add Photo/PDF (optional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-dashed border-2 flex justify-center items-center cursor-pointer">
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      id="file-input"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="file-input"
                      className="text-blue-500 font-bold text-2xl"
                    >
                      +
                    </label>
                  </div>

                  <div className="flex gap-2 overflow-x-auto">
                    {filePreviews.map((preview, index) =>
                      preview ? (
                        <div key={index} className="w-20 h-20">
                          <img
                            src={preview}
                            alt={`file-preview-${index}`}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div
                          key={index}
                          className="w-20 h-20 flex justify-center items-center bg-gray-200 rounded"
                        >
                          PDF
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="max-w-[600px]">
                  <label className="block text-gray-700 pb-1">
                    Name of Medical Personnel
                  </label>
                  <input
                    type="text"
                    name="medical_personnel"
                    value={formData.medical_personnel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000FF]"
                  />
                  <p className="text-sm text-gray-500 py-2">
                    Info: We prioritize the privacy and security of patient's
                    information. Every diagnosis and treatment record is end to
                    end encrypted. No third party can view or tamper with.
                  </p>
                </div>

                <div className="flex justify-start space-x-4">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="border border-[#0000FF] text-[#0000FF] px-4 py-2 rounded-full"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0000FF] text-white px-4 py-2 rounded-full"
                    onClick={handleSubmit}
                  >
                    {upload ? upload : "Upload"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* <p>{patientData.info.fullname}</p> */}
      <div className=" sm:border my-5 px-2 py-5 sm:rounded-3xl bg-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center p-1">
            {patientData?.info.fullname
              ? patientData.info.fullname
                  .split(" ")
                  .map((word) => (word ? word[0].toUpperCase() : "")) // Add safeguard for empty strings
                  .join("")
              : ""}
          </div>
          <div>
            <p>{patientData.info.fullname}</p>
            <p className="text-gray-500 text-sm">Patient</p>
          </div>
        </div>
        <div>
          <TabComponents tabs={tabs} />
        </div>
      </div>
    </div>
  );
};

export default PatientHospitalInfo;
