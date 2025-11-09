import React from "react";

const EmergencyModeRecords = ({ records, medicalRecordToggle, name }) => {
  return (
    <div className="space-y-4 space-x-5 my-5 bg-white p-4">
      <div className="flex justify-between items-center">
        <p className="pl-4 text-xl font-semibold">{name}</p>
        <i
          className="bx bx-x text-2xl text-black cursor-pointer pr-4"
          onClick={() => medicalRecordToggle(false)}
        ></i>
      </div>
       {Array.isArray(records) && records.length > 0 ? (
                  records.map((record) => (
                    <div
                      key={record._id}
                      className="bg-white shadow-xs rounded-lg p-4 flex items-center justify-between gap-5"
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
                        // onClick={() => togglePopover(record._id)}
                      >
                        <p>
                          <i className="bx bx-dots-vertical-rounded cursor-pointer"></i>
                        </p>
                      </div>
               
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4 text-sm">
                    No medical records available.
                  </div>
                )}
    </div>
  );
};

export default EmergencyModeRecords;
