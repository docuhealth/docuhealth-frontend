import React from "react";
import { Image, FileText, Eye, ArrowDownToLine, ArrowLeft } from "lucide-react";

const HospitalRequestDetail = ({
  selectedRequest,
  setViewDetailRequest,
  approveHospital,
  approving
}) => {
  if (!selectedRequest)
    return <p className="text-sm text-center py-14">No request selected.</p>;

  // A helper function to format date
  const formatFullDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="flex flex-col w-full text-sm">
      {/* Header with back button */}
      <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setViewDetailRequest(null)}>
        <ArrowLeft className="w-4 h-4 text-gray-700" />
        <h2 className="text-md font-medium text-gray-800">Hospital's details</h2>
      </div>

      {/* All details card */}
      <div className="p-5 mb-5 bg-docuhealth-light-gray border rounded-lg">
        <h3 className="text-md font-medium text-docuhealth-dark mb-6">All details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

          
          {/* Email address */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-500 font-medium">Email address</label>
            <div className="border border-gray-200 rounded-md p-2.5 bg-white text-gray-700">
              {selectedRequest?.official_email || "N/A"}
            </div>
          </div>

          {/* Approval status */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-500 font-medium">Approval status</label>
            <div className="border border-gray-200 rounded-md p-2.5 bg-white">
              <span className={`font-medium capitalize ${
                selectedRequest.status === "approved" ? "text-green-600" :
                selectedRequest.status === "rejected" ? "text-red-600" :
                "text-yellow-500"
              }`}>
                {selectedRequest.status === "pending" || !selectedRequest.status ? "Pending Approval" : selectedRequest.status}
              </span>
            </div>
          </div>
        </div>
      </div>

<div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
          <p className="font-medium mb-4 text-docuhealth-dark">
            Hospital's uploaded Documents/images
          </p>
          <div>
             {selectedRequest?.documents?.length > 0 ? (
            selectedRequest.documents.map(
                (doc, index) => {
                  // Correctly mapping your payload fields
                  const fileName =
                    doc.filename || `Document_${index + 1}`;
                  const fileUrl = doc.file || doc.url; // Supporting both common keys
                  const fileSizeMB = doc.size
                    ? (doc.size / (1024 * 1024)).toFixed(1) + " MB"
                    : "0.5 MB"; // Fallback placeholder if size is missing
                  const fileDate = formatFullDateTime(
                    selectedRequest.created_at,
                  );

                  const isImage =
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName) ||
                    doc.file_type?.includes("image");
                  const isPdf =
                    /\.pdf$/i.test(fileName) ||
                    doc.file_type?.includes("pdf");
                  const Icon = isImage ? Image : isPdf ? FileText : FileText;

                  return (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row justify-between items-start gap-5 sm:gap-0 sm:items-center bg-white border rounded-lg px-4 py-3 mb-3 "
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-[12px]">
                        <div className="p-2 bg-docuhealth-primary/10 rounded-md">
                          <Icon className="text-docuhealth-primary" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {fileName}
                          </p>
                          <p className="text-gray-500">
                            {fileDate} • {fileSizeMB}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 text-[12px] w-full sm:w-auto">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 border border-docuhealth-primary text-docuhealth-primary rounded-full font-medium hover:bg-blue-50 transition py-1 px-3 w-full sm:w-28"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </a>
                        {/* <a
                                    href={fileUrl}
                                    target="_blank"
                                    download
                                    className="flex items-center justify-center gap-1 bg-docuhealth-primary text-white rounded-full font-medium hover:bg-docuhealth-dark-primary transition py-1 px-3 w-full sm:w-28"
                                  >
                                    <ArrowDownToLine className="w-3 h-3" />
                                    Download
                                  </a> */}
                      </div>
                    </div>
                  );
                },
              )
            ) : (
              <p className="text-[12px] text-gray-500">NIL</p>
            )}
          </div>
        </div>


      <div className="flex justify-end gap-4 mt-2">
        <button 
          className="border border-gray-300 text-gray-700 px-6 py-2 text-xs rounded-full font-medium hover:bg-gray-50 transition"
          onClick={() => setViewDetailRequest(null)}
        >
          Go Back
        </button>
        {selectedRequest.status !== "approved" && (
          <button 
            className="bg-docuhealth-primary text-white px-6 py-2 text-xs rounded-full font-medium hover:bg-docuhealth-dark-primary transition flex justify-center items-center gap-2"
            onClick={() => approveHospital(selectedRequest.sqid)}
            disabled={approving === selectedRequest.sqid}
          >
            {approving === selectedRequest.sqid ? "Approving..." : "Approve Hospital"}
          </button>
        )}
      </div>
    </div>
  );
};

export default HospitalRequestDetail;
