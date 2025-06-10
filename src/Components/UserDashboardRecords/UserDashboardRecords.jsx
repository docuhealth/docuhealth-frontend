import React from "react";
import toast from 'react-hot-toast';

const UserDashboardRecords = ({
  loading,
  records,
  totalPages,
  currentPage,
  setCurrentPage,
  togglePopover,
  popoverVisible,
  datainfo,
  selectedRecord,
  exportToPDF,
  paymentStatus,
  setPopoverVisible,
}) => {
  return (
    <div className=" text-sm">
      <div>
        <div className="hidden lg:block overflow-x-auto ">
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : records === "No medical records" ? (
            <p className="text-center py-4">No medical records found.</p>
          ) : (
            <div className="space-y-4">
              {Array.isArray(records) && records.length > 0 ? (
                records.map((record) => (
                  <div
                    key={record._id}
                    className="bg-white shadow-sm rounded-lg p-4 flex items-center justify-between "
                  >
                    {/* Date and Time */}
                    <div className="text-gray-700 text-sm">
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
                    <div className="text-gray-700 truncate text-sm">
                      <span className="font-medium">Diagnosis:</span>
                      <p>{record?.basic_info?.diagnosis || "N/A"}</p>
                    </div>

                    {/* Vertical Divider */}
                    <div className="border-l h-12 border-gray-300"></div>

                    {/* Hospital Name */}
                    <div className="text-gray-700 truncate text-sm">
                      <span className="font-medium">
                        {" "}
                        {record?.pharmacy_info?.pharmacy_name
                          ? "Name of Pharmacy :"
                          : "Name of Hospital :"}
                      </span>
                      <p>
                        {record?.hospital_info?.name
                          ? record.hospital_info.name + " Hospital"
                          : record?.pharmacy_info?.pharmacy_name + " Pharmacy"}
                      </p>
                    </div>

                    {/* Vertical Divider */}
                    <div className="border-l h-12 border-gray-300 "></div>

                    {/* Medical Personnel */}
                    <div className="text-gray-700 truncate text-sm">
                      <span className="font-medium">
                        {record?.pharmacy_info?.pharmacist
                          ? "Pharmacy Attendant"
                          : "Medical Personnel:"}
                      </span>
                      <p>
                        {record?.hospital_info?.medical_personnel ||
                          record?.pharmacy_info?.pharmacist}
                      </p>
                    </div>

                    {/* Vertical Divider */}
                    <div className="border-l h-12 border-gray-300"></div>

                    {/* Summary */}
                    <div className="text-gray-700 truncate max-w-xs text-sm">
                      <span className="font-medium">Summary/Treatment:</span>
                      <p>{record?.summary || "N/A"}</p>
                    </div>

                    {/* Vertical Divider */}
                    <div className="border-l h-12 border-gray-300"></div>

                    {/* More Options */}
                    <div
                      className="text-gray-700 max-w-xs"
                      onClick={() => togglePopover(record._id)}
                    >
                      <p>
                        <i className="bx bx-dots-vertical-rounded cursor-pointer"></i>
                      </p>
                    </div>
                    {popoverVisible === record._id && (
                      <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50">
                        <div className="bg-white shadow-lg rounded-lg p-5 relative max-h-[80vh] overflow-y-auto  ">
                          <div className="flex justify-between items-center">
                            <div className="flex justify-start items-center gap-2">
                              <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center p-1">
                                {datainfo?.fullname
                                  ? datainfo.fullname
                                      .split(" ")
                                      .map((word) =>
                                        word ? word[0].toUpperCase() : ""
                                      ) // Add safeguard for empty strings
                                      .join("")
                                  : ""}
                              </div>

                              <div>
                                <p>
                                  {record?.hospital_info?.name
                                    ? record.hospital_info.name + " Hospital"
                                    : record?.pharmacy_info?.pharmacy_name +
                                      " Pharmacy"}
                                </p>

                                <div className="text-[12px] flex items-center gap-1 text-gray-400 text-sm">
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
                                className="bg-[#0000FF] py-1 px-3 text-white rounded-full cursor-pointer text-sm"
                                onClick={() => {
                                  if (paymentStatus) {
                                    exportToPDF;
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            {/* Pulse Rate */}
                            <div>
                              <label className="block text-gray-600 text-sm font-medium">
                                Pulse Rate
                              </label>
                              <input
                                type="text"
                                value={
                                  selectedRecord?.basic_info?.pulse_rate ||
                                  "N/A"
                                }
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none text-sm"
                              />
                            </div>

                            {/* Temperature */}
                            <div>
                              <label className="block text-gray-600 text-sm font-medium">
                                Temperature
                              </label>
                              <input
                                type="text"
                                value={
                                  selectedRecord?.basic_info?.temperature ||
                                  "N/A"
                                }
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none text-sm"
                              />
                            </div>

                            {/* Respiratory Rate */}
                            <div className="text-sm">
                              <label className="block text-gray-600 text-sm font-medium">
                                Respiratory Rate (RR)
                              </label>
                              <input
                                type="text"
                                value={
                                  selectedRecord?.basic_info
                                    ?.respiratory_rate || "N/A"
                                }
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                              />
                            </div>

                            {/* Weight */}
                            <div className="text-sm">
                              <label className="block text-gray-600 text-sm font-medium">
                                Weight
                              </label>
                              <input
                                type="text"
                                value={
                                  selectedRecord?.basic_info?.weight || "N/A"
                                }
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                              />
                            </div>

                            {/* Blood Pressure */}
                            <div className="text-sm">
                              <label className="block text-gray-600 text-sm font-medium">
                                Blood Pressure
                              </label>
                              <input
                                type="text"
                                value={
                                  selectedRecord?.basic_info?.blood_pressure
                                    ? selectedRecord.basic_info.blood_pressure +
                                        " MM HG" || "N/A"
                                    : "N/A"
                                }
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                              />
                            </div>

                            {/* Diagnosis */}
                            <div className="text-sm">
                              <label className="block text-gray-600 text-sm font-medium">
                                Diagnosis
                              </label>
                              <input
                                type="text"
                                value={
                                  selectedRecord?.basic_info?.diagnosis || "N/A"
                                }
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                              />
                            </div>

                            {/* Summary/Treatment Plan */}
                            <div className="col-span-2 text-sm">
                              <label className="block text-gray-600 text-sm font-medium">
                                Summary / Treatment Plan
                              </label>
                              <textarea
                                value={selectedRecord?.summary || "N/A"}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 h-24 focus:outline-none"
                              ></textarea>
                            </div>

                            {/* Name of Patient */}
                            <div className="text-sm">
                              <label className="block text-gray-600 text-sm font-medium">
                                Name of Patient
                              </label>
                              <input
                                type="text"
                                value={
                                  selectedRecord?.patient_info?.fullname ||
                                  datainfo?.fullname
                                }
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                              />
                            </div>

                            {/* Gender */}
                            <div className="text-sm">
                              <label className="block text-gray-600 text-sm font-medium">
                                Gender
                              </label>
                              <input
                                type="text"
                                value={
                                  selectedRecord?.patient_info?.sex || "N/A"
                                }
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                              />
                            </div>

                            {/* Name of Medical Personnel */}
                            <div className="col-span-2 text-sm">
                              <label className="block text-gray-600 text-sm font-medium">
                                {record?.pharmacy_info?.pharmacist
                                  ? "Pharmacy Attendant"
                                  : "Medical Personnel:"}
                              </label>
                              <input
                                type="text"
                                value={
                                  selectedRecord?.hospital_info
                                    ?.medical_personnel ||
                                  selectedRecord?.pharmacy_info.pharmacist
                                }
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                              />
                            </div>

                            {selectedRecord?.pharmacy_info?.pharmacy_address ? (
                              <div className="col-span-2 text-sm">
                                <label className="block text-gray-600 text-sm font-medium">
                                  Pharmacy address
                                </label>
                                <input
                                  type="text"
                                  value={
                                    selectedRecord?.pharmacy_info
                                      ?.pharmacy_address
                                  }
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>
                            ) : (
                              <div className="hidden"> </div>
                            )}

                            {selectedRecord?.drugs ? (
                              <div className="col-span-2 text-sm">
                                <label className="block text-gray-600 text-sm font-medium">
                                  Drugs Bought
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord?.drugs.map(
                                    (drug, index) => " " + drug + " "
                                  )}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>
                            ) : (
                              <div className="hidden"> </div>
                            )}

                            {selectedRecord?.dosage ? (
                              <div className="col-span-2 text-sm">
                                <label className="block text-gray-600 text-sm font-medium">
                                  Drug Usage Respectively
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord?.dosage}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>
                            ) : (
                              <div className="hidden"> </div>
                            )}

                            {/* Attachment */}
                            <div className="col-span-2">
                              <label className="block text-gray-600 text-sm font-medium">
                                Attachment
                              </label>
                              <div className="w-full  px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none">
                                {selectedRecord?.attachments &&
                                selectedRecord.attachments.length > 0 ? (
                                  <ul className="list-style-none pl-0 flex gap-2">
                                    {selectedRecord.attachments.map(
                                      (file, index) => (
                                        <li key={index}>
                                          <a
                                            href={file.secure_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                          >
                                            Image {index + 1}
                                          </a>
                                        </li>
                                      )
                                    )}
                                  </ul>
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
                ))
              ) : (
                <div className="text-gray-500 text-center py-4 text-sm">
                  No medical records available.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="block lg:hidden space-y-4">
          {loading ? (
            <p className="text-gray-500 text-center">
              Loading medical records...
            </p>
          ) : records === "No medical records" ? (
            <p className="text-center py-4">No medical records found.</p>
          ) : (
            <div>
              {records.map((record) => (
                <div
                  key={record._id}
                  className="bg-white shadow-md rounded-lg p-4 flex flex-col mb-4 space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4"
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
                  {popoverVisible === record._id && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50">
                      <div className="bg-white shadow-lg rounded-lg p-5 relative max-h-[80vh] overflow-y-auto w-[90%] sm:w-[60%]">
                        <div className="flex flex-col gap-3 items-start">
                          <div className="">
                            <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center p-1">
                              {datainfo?.fullname
                                ? datainfo.fullname
                                    .split(" ")
                                    .map((word) =>
                                      word ? word[0].toUpperCase() : ""
                                    ) // Add safeguard for empty strings
                                    .join("")
                                : ""}
                            </div>
                            <div>
                              <p>
                                {record?.hospital_info?.name
                                  ? record.hospital_info.name + " Hospital"
                                  : record?.pharmacy_info?.pharmacy_name +
                                    " Pharmacy"}
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
                                  exportToPDF;
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
                        <div className="flex flex-col gap-3 py-3">
                          {/* Pulse Rate */}
                          <div>
                            <label className="block text-gray-600 text-sm font-medium">
                              Pulse Rate
                            </label>
                            <input
                              type="text"
                              value={
                                selectedRecord?.basic_info?.pulse_rate || "N/A"
                              }
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
                              value={
                                selectedRecord?.basic_info?.temperature || "N/A"
                              }
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
                                selectedRecord?.basic_info?.respiratory_rate ||
                                "N/A"
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
                              value={
                                selectedRecord?.basic_info?.weight || "N/A"
                              }
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
                                selectedRecord?.basic_info?.blood_pressure
                                  ? selectedRecord.basic_info.blood_pressure +
                                      " MM HG" || "N/A"
                                  : "N/A"
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
                              value={
                                selectedRecord?.basic_info?.diagnosis || "N/A"
                              }
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
                              value={selectedRecord?.summary || "N/A"}
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
                              value={
                                selectedRecord?.patient_info?.fullname ||
                                datainfo?.fullname
                              }
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
                              value={selectedRecord?.patient_info?.sex || "N/A"}
                              readOnly
                              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                            />
                          </div>

                          {/* Name of Medical Personnel */}
                          <div className="col-span-1 sm:col-span-2">
                            <label className="block text-gray-600 text-sm font-medium">
                              {record?.pharmacy_info?.pharmacist
                                ? "Pharmacy Attendant"
                                : "Medical Personnel:"}
                            </label>
                            <input
                              type="text"
                              value={
                                selectedRecord?.hospital_info
                                  ?.medical_personnel ||
                                selectedRecord?.pharmacy_info?.pharmacist
                              }
                              readOnly
                              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                            />
                          </div>

                          {selectedRecord?.pharmacy_info?.pharmacy_address ? (
                            <div className="col-span-2 text-sm">
                              <label className="block text-gray-600 text-sm font-medium">
                                Pharmacy address
                              </label>
                              <input
                                type="text"
                                value={
                                  selectedRecord?.pharmacy_info
                                    ?.pharmacy_address
                                }
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                              />
                            </div>
                          ) : (
                            <div className="hidden"> </div>
                          )}

                          {selectedRecord?.drugs ? (
                            <div className="col-span-2 text-sm">
                              <label className="block text-gray-600 text-sm font-medium">
                                Drugs Bought
                              </label>
                              <input
                                type="text"
                                value={selectedRecord?.drugs.map(
                                  (drug, index) => " " + drug + " "
                                )}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                              />
                            </div>
                          ) : (
                            <div className="hidden"> </div>
                          )}

                          {selectedRecord?.dosage ? (
                            <div className="col-span-2 text-sm">
                              <label className="block text-gray-600 text-sm font-medium">
                                Drug Usage Respectively
                              </label>
                              <input
                                type="text"
                                value={selectedRecord?.dosage}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                              />
                            </div>
                          ) : (
                            <div className="hidden"> </div>
                          )}

                          {/* Attachment */}
                          <div className="">
                            <label className="block text-gray-600 text-sm font-medium">
                              Attachment
                            </label>
                            <div className="w-full  px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none">
                              {selectedRecord.attachments &&
                              selectedRecord.attachments.length > 0 ? (
                                <ul className="list-style-none pl-0 flex gap-2">
                                  {selectedRecord.attachments.map(
                                    (file, index) => (
                                      <li key={index}>
                                        <a
                                          href={file.secure_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline"
                                        >
                                          Image {index + 1}
                                        </a>
                                      </li>
                                    )
                                  )}
                                </ul>
                              ) : (
                                <span>NIL</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-y-2 sm:flex sm:space-x-4 sm:items-center ">
                    {/* Name of Hospital */}
                    <div>
                      <span className="font-medium">
                        {" "}
                        {record?.pharmacy_info?.pharmacy_name
                          ? "Name of Pharmacy :"
                          : "Name of Hospital :"}
                      </span>
                      <p>
                        {record?.hospital_info?.name
                          ? record.hospital_info.name + " Hospital"
                          : record?.pharmacy_info?.pharmacy_name}
                      </p>
                    </div>

                    {/* Diagnosis */}
                    <div>
                      <span className="text-gray-500 block text-sm">
                        Diagnosis
                      </span>
                      <p className="text-gray-700 font-medium">
                        <p>{record?.basic_info?.diagnosis || "Nil"}</p>
                      </p>
                    </div>

                    {/* Medical Personnel */}
                    <div>
                      <span className="text-gray-500 block text-sm">
                        {record?.pharmacy_info?.pharmacist
                          ? "Pharmacy Attendant"
                          : "Medical Personnel:"}
                      </span>
                      <p className="text-gray-700 font-medium">
                        {record?.hospital_info?.medical_personnel ||
                          record?.pharmacy_info?.pharmacist}
                      </p>
                    </div>

                    {/* Summary */}
                    <div>
                      <span className="text-gray-500 block text-sm">
                        Summary/Treatment
                      </span>
                      <p className="text-gray-700 font-medium truncate">
                        {record?.summary || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
  );
};

export default UserDashboardRecords;


