import React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const UserSubAcctRecordsMobile = ({defaultRecords, subaccounts, togglePopover, fetchMedicalHistory, handleOpenForm, paymentStatus, isMedicalRecords, setIsMedicalRecords, setDefaultRecords, records, popoverVisible, exportToPDF, setPopoverVisible, selectedRecord, totalPages, currentPage, setCurrentPage, openPopover, togglePopoverr }) => {
    return (
        <div>
           
           {defaultRecords && (
              <div className=" py-5 border-t-2 sm:hidden">
                <p className="font-semibold">Sub accounts</p>
                {subaccounts.map((subaccount, index) => (
                  <div key={index} className="bg-white shadow px-4 py-2 my-3">
                    <div className=" flex justify-between items-center py-3 relative ">
                      <p>
                        HIN :{" "}
                        {subaccount.HIN.slice(0, 4) +
                          "*".repeat(subaccount.HIN.length - 5)}
                      </p>
                      <p>
                        <i
                          className={`bx bx-dots-vertical-rounded ml-3  p-2 ${
                            openPopover === index
                              ? "bg-slate-300 p-2 rounded-full"
                              : ""
                          }`}
                          onClick={() => togglePopover(index)}
                        ></i>
                      </p>
                      {openPopover === index && (
                        <div className="absolute right-0 top-10  mt-2 bg-white border shadow-md rounded-lg p-2 w-52  z-30">
                          <Link
                            to=""
                            onClick={() => fetchMedicalHistory(subaccount.HIN)}
                          >
                            <p className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer">
                              Check Medical History
                            </p>
                          </Link>

                          <Link to="/user-sub-account-upgrade">
                            {" "}
                            <p className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer">
                              Upgrade Sub Account
                            </p>
                          </Link>

                          <p
                            className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer"
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
                    </div>
                    <div className="grid grid-cols-2 gap-5 py-3">
                      <div className="flex flex-col">
                        <p className="text-gray-500">Name</p>
                        <p>
                          {" "}
                          {subaccount.firstname + " " + subaccount.lastname}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-gray-500">Date Of Birth</p>
                        <p>{subaccount.DOB}</p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-gray-500">Sex</p>
                        <p>{subaccount.sex}</p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-gray-500">Date Created</p>
                        <p> {subaccount.date_created.split("T")[0]}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isMedicalRecords && (
              <div className="sm:hidden ">
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
                {records.map((record) => (
                  <div
                    key={record._id}
                    className="bg-white shadow-md rounded-lg p-4 flex flex-col my-4 "
                  >
                    <div className="flex justify-between py-3">
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
                            onClick={() => togglePopoverr(record._id)}
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
                    {popoverVisible === record._id && (
                      <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50">
                        <div className="bg-white shadow-lg rounded-lg p-5 relative max-h-[80vh] overflow-y-auto w-[90%] sm:w-[60%]">
                          <div className="flex flex-col gap-3 items-start">
                            <div className="">
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
                          {/* Responsive Grid Layout */}
                          <div className=" flex flex-col gap-3 p-4">
                            {/* Pulse Rate */}
                            <div>
                              <label className="block  text-gray-600 text-sm font-medium">
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
                                  selectedRecord.hospital_info.medical_personnel
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
              </div>
            )}
        </div>
    );
};

export default UserSubAcctRecordsMobile;