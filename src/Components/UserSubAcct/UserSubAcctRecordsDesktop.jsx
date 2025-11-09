import React from "react";
import { Link } from "react-router-dom";
import toast from 'react-hot-toast';

const UserSubAcctRecordsDesktop = ({defaultRecords, subaccounts, togglePopover, fetchMedicalHistory, handleOpenForm, paymentStatus, isMedicalRecords, setIsMedicalRecords, setDefaultRecords, records, popoverVisible, exportToPDF, setPopoverVisible, selectedRecord, totalPages, currentPage, setCurrentPage, openPopover, togglePopoverr }) => {
  return (
    <div>
      {defaultRecords && (
        <div className="hidden sm:block py-8 px-6 border rounded-2xl bg-white">
          <h1 className="text-xl font-semibold mb-4">Sub-Accounts</h1>
          <div className="relative">
            <table className="min-w-full">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="px-4 py-2 font-normal">Name</th>
                  <th className="px-4 py-2 font-normal">HIN</th>
                  <th className="px-4 py-2 font-normal">Date of Birth</th>
                  <th className="px-4 py-2 font-normal">Sex</th>
                  <th className="px-4 py-2 font-normal">Date Created</th>
                </tr>
              </thead>

              <tbody>
                {subaccounts.map((subaccount, index) => (
                  <tr key={index} className="relative">
                    <td className="border-b border-gray-300 px-4 pb-3 pt-3">
                      {subaccount.firstname + " " + subaccount.lastname}
                    </td>
                    <td className="border-b border-gray-300 px-4 pb-3 pt-3">
                      {subaccount.HIN.slice(0, 4) +
                        "*".repeat(subaccount.HIN.length - 5)}
                    </td>
                    <td className="border-b border-gray-300 px-4 pb-3 pt-3">
                      {subaccount.DOB}
                    </td>
                    <td className="border-b border-gray-300 px-4 pb-3 pt-3">
                      {subaccount.sex}
                    </td>
                    <td className="border-b border-gray-300 px-4 pb-3 pt-3 relative">
                      {subaccount.date_created.split("T")[0]}
                      <i
                        className={`bx bx-dots-vertical-rounded ml-3  p-2 ${
                          openPopover === index
                            ? "bg-slate-300 p-2 rounded-full"
                            : ""
                        }`}
                        onClick={() => togglePopover(index)}
                      ></i>

                      {openPopover === index && (
                        <div className="absolute right-0 mt-2 bg-white border shadow-md rounded-lg p-2 w-52  z-30">
                          <Link to="">
                            <p
                              className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                              onClick={() =>
                                fetchMedicalHistory(subaccount.HIN)
                              }
                            >
                              Check Medical History
                            </p>
                          </Link>

                          <Link to="/user-sub-account-upgrade">
                            {" "}
                            <p className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer">
                              Upgrade Sub Account
                            </p>
                          </Link>

                          <p
                            className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                            onClick={() => {
                              if (paymentStatus) {
                                handleOpenForm(
                                  subaccount.firstname +
                                    " " +
                                    subaccount.lastname,
                                  subaccount.HIN,
                                  subaccount.DOB
                                );
                                return;
                              } else {
                                toast.success(
                                  "Kindly subscribe to a plan to access this feature"
                                );
                              }
                            }}
                          >
                            Generate ID Card
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isMedicalRecords && (
        <div className="hidden sm:block bg-white py-10 px-5 rounded-2xl ">
          <div className="flex justify-start items-center gap-2 pb-4 text-[#647284]">
            <div
              className="cursor-pointer"
              onClick={() => {
                setIsMedicalRecords(false);
                setDefaultRecords(true);
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.82843 10.9999H20V12.9999H7.82843L13.1924 18.3638L11.7782 19.778L4 11.9999L11.7782 4.22168L13.1924 5.63589L7.82843 10.9999Z"
                  fill="#1B2B40"
                />
              </svg>
            </div>
            <div>
              {records.map((record, index) => (
                <div
                  key={index}
                  className="flex justify-start items-center gap-2"
                >
                  <p>
                    Full Name:{" "}
                    {record.patient_info?.fullname || "No Name Available"}
                  </p>
                  <p>
                    (#{" "}
                    {record.patient_HIN.slice(0, 4) +
                      "*".repeat(record.patient_HIN.length - 5) ||
                      "No HIN Available"}{" "}
                    )
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="">
            {records.map((record) => (
              <div
                key={record._id}
                className="bg-white shadow-xs rounded-lg p-4 flex items-center justify-between space-x-2"
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
                  <p>{record.hospital_info.name}</p>
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
                  onClick={() => togglePopoverr(record._id)}
                >
                  <p>
                    <i class="bx bx-dots-vertical-rounded cursor-pointer"></i>
                  </p>
                </div>

                {popoverVisible === record._id && (
                  <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-xs z-50">
                    <div className="bg-white shadow-lg rounded-lg p-5 relative max-h-[80vh] overflow-y-auto  ">
                      <div className="flex justify-between items-center">
                        <div className="flex justify-start items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center p-1">
                            {record.patient_info.fullname
                              ? record.patient_info.fullname
                                  .split(" ")
                                  .map((word) =>
                                    word ? word[0].toUpperCase() : ""
                                  ) // Add safeguard for empty strings
                                  .join("")
                              : ""}
                          </div>

                          <div>
                            <p className="font-semibold text-md">
                              {record.hospital_info.name} Hospital
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
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            className="bg-[#0000FF] py-1 px-3 text-white rounded-full cursor-pointer"
                            onClick={() => {
                              if (paymentStatus) {
                                exportToPDF();
                                return;
                              } else {
                                toast.success(
                                  "Kindly subscribe to a plan to access this feature"
                                );
                              }
                            }}
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-hidden"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-hidden"
                          />
                        </div>

                        {/* Respiratory Rate */}
                        <div>
                          <label className="block text-gray-600 text-sm font-medium">
                            Respiratory Rate (RR)
                          </label>
                          <input
                            type="text"
                            value={selectedRecord.basic_info.respiratory_rate}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-hidden"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-hidden"
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
                              selectedRecord.basic_info.blood_pressure + "MM HG"
                            }
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-hidden"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-hidden"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 h-24 focus:outline-hidden"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-hidden"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-hidden"
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
                              selectedRecord.hospital_info.medical_personnel
                            }
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-hidden"
                          />
                        </div>

                        {/* Attachment */}
                        <div className="col-span-2">
                          <label className="block text-gray-600 text-sm font-medium">
                            Attachment
                          </label>

                          <div className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-gray-100">
                            {selectedRecord.attachments &&
                            selectedRecord.attachments.length > 0 ? (
                              selectedRecord.attachments.map(
                                (attachment, index) => (
                                  <a
                                    key={index}
                                    href={attachment.secure_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline mr-2"
                                  >
                                    Image {index + 1}
                                  </a>
                                )
                              )
                            ) : (
                              <span>NIL</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

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
      )}
    </div>
  );
};

export default UserSubAcctRecordsDesktop;
