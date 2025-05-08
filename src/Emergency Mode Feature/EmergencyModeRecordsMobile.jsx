import React from "react";

const EmergencyModeRecordsMobile = ({ records, medicalRecordToggle, name }) => {
  return (
    <div className="mx-3 z-50 bg-white p-3">
      <div className="flex justify-between items-center">
        <p className="pl-3 text-xl font-semibold">{name}</p>
        <i
          className="bx bx-x text-2xl text-black cursor-pointer "
          onClick={() => medicalRecordToggle(false)}
        ></i>
      </div>
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
                              // onClick={() => {
                              //   togglePopover(record._id);
                              // }}
                            ></i>
                          </p>
                        </div>
                      </div>
                 
    
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
  );
};

export default EmergencyModeRecordsMobile;
