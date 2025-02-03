import React, { useState, useEffect } from "react";
import TabComponents from "./TabComponent";
import profilepic from "../../assets/profile.png";
import axios from "axios";
import { toast } from "react-toastify";

const PatientHospitalInfo = ({ patientData, hin }) => {
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(null);

  const patientHIN = "1144132965389"; // Replace with dynamic patient HIN if necessary
  const itemsPerPage = 10;

  const fetchPatientMedicalRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        toast.error("Token not found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "https://docuhealth-backend.onrender.com/api/hospital/patients/get_patient_medical_records",
        { patient_HIN: patientHIN },
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
                  {records.map((record) => (
                    <div
                      key={record._id}
                      className="bg-white shadow-sm rounded-lg p-4 flex items-center justify-between space-x-4"
                    >
                      {/* Date and Time */}
                      <div className="text-gray-700">
                        <span className="font-semibold ">
                          {new Date(record.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <p className="text-sm text-gray-500">
                          {(() => {
                            const time = new Date(
                              `${record.date}T${record.time}`
                            ); // Combine date and time
                            const hours = time.getHours();
                            const minutes = time
                              .getMinutes()
                              .toString()
                              .padStart(2, "0");
                            const period = hours >= 12 ? "PM" : "AM";
                            const formattedHours = hours % 12 || 12; // Convert 24-hour time to 12-hour time
                            return `${formattedHours}:${minutes} ${period}`;
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
                        <p>{record.hospital_info.address}</p>
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
                          <i class="bx bx-dots-vertical-rounded"></i>
                        </p>
                      </div>

                      {popoverVisible === record._id && (
                        <div className="absolute right-0 top-10 bg-white shadow-lg rounded-lg p-3 w-72 z-10">
                          <p className="font-semibold text-lg">
                            Record Details {record._id}
                          </p>
                          <hr className="my-2" />

                          <p>
                            <span className="font-medium">Date:</span>{" "}
                            {new Date(selectedRecord.date).toLocaleDateString(
                              "en-GB"
                            )}
                          </p>
                          <p>
                            <span className="font-medium">Time:</span>{" "}
                            {(() => {
                              const time = new Date(
                                `${selectedRecord.date}T${selectedRecord.time}`
                              );
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
                          <p>
                            <span className="font-medium">Diagnosis:</span>{" "}
                            {selectedRecord.basic_info.diagnosis}
                          </p>
                          <p>
                            <span className="font-medium">Hospital:</span>{" "}
                            {selectedRecord.hospital_info.address}
                          </p>
                          <p>
                            <span className="font-medium">Doctor:</span>{" "}
                            {selectedRecord.hospital_info.medical_personnel}
                          </p>
                          <p>
                            <span className="font-medium">Summary:</span>{" "}
                            {selectedRecord.summary}
                          </p>

                          {/* Close Popover Button */}
                          <button
                            onClick={() => setPopoverVisible(null)}
                            className="mt-3 text-sm text-red-600 hover:text-red-800"
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className=" block lg:hidden space-y-4">
              {records.map((record) => (
                <div
                  key={record._id}
                  className="bg-white shadow-md rounded-lg p-4 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4 "
                >
                  {/* Date and Time */}
                  <div className="text-gray-700">
                    <span className="font-semibold text-lg">
                      {new Date(record.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <p className="text-sm text-gray-500">
                      {(() => {
                        const time = new Date(`${record.date}T${record.time}`);
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

                  <div className="grid grid-cols-1 gap-y-2 sm:flex sm:space-x-4 sm:items-center">
                    {/* Name of Hospital */}
                    <div>
                      <span className="text-gray-500 block text-sm">
                        Name of Hospital
                      </span>
                      <p className="text-gray-700 font-medium">
                        {record.hospital_info.address}
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
      content: <div className="space-y-4"></div>,
    },
  ];

  return (
    <div>
      {/* <p>{patientData.info.fullname}</p> */}
      <div className=" sm:border my-5 px-2 py-5 sm:rounded-3xl bg-white">
        <div className="flex items-center gap-3">
          <img src={profilepic} alt="" className="w-14" />
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
