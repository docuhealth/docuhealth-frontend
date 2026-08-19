import React, { useState } from "react";
import {
  formatFullDateTime,
  getAge,
} from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import formatRecordDate from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { FileText, Eye, ArrowDownToLine, Image, ArrowLeft } from "lucide-react";
import { renderListOrString, renderLabTests, renderDrugRecords } from "../../../../../utils/soapNoteHelpers";
import PatientInfoCard from "../../../../ui/PatientInfoCard";
import VitalSignsCard from "../../../../ui/VitalSignsCard";

const SharedSoapNoteDetail = ({ sharedSoapNoteDetail, setSharedSoapNoteDetail }) => {

  const docsArray = typeof sharedSoapNoteDetail?.investigation_docs === 'string'
    ? [sharedSoapNoteDetail.investigation_docs]
    : (sharedSoapNoteDetail?.investigation_docs || []);

  const vitals = sharedSoapNoteDetail?.vital_signs_info;

  return (
    <div className="text-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap sm:gap-0  border-b pb-4 w-full">
        <div
          className="flex justify-start items-center gap-1 cursor-pointer"
          onClick={() => setSharedSoapNoteDetail(null)}
        >
          <ArrowLeft size={16} />
          <h2 className=" text-sm">Detailed Shared SOAP Note</h2>
        </div>
      </div>
      
      <PatientInfoCard
        className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg"
        selectedMedicalRecord={sharedSoapNoteDetail}
      />

      {/* Vital Signs */}
      {vitals && (
        <VitalSignsCard
          className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg"
          vitalSigns={vitals}
        />
      )}

      {/* Clinical Summary */}
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-medium mb-4 text-docuhealth-dark">Clinical Summary</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-[12px]">
            <h4 className="text-gray-400 font-normal mb-1">Chief Complaint:</h4>
            <p className="font-medium">
              {sharedSoapNoteDetail?.chief_complaint || "NIL"}
            </p>
          </div>
          <div className="text-[12px]">
            <h4 className="text-gray-400 font-normal mb-1">Primary Diagnosis:</h4>
            <p className="font-medium text-docuhealth-primary">
              {sharedSoapNoteDetail?.primary_diagnosis || "NIL"}
            </p>
          </div>
        </div>
      </div>

      {renderDrugRecords(sharedSoapNoteDetail?.drug_orders_info || sharedSoapNoteDetail?.drug_records)}

      {/* Care Instructions & Treatment Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
          <p className="font-medium mb-4 text-docuhealth-dark">Care Instructions</p>
          <div className="text-[12px] text-gray-700">
            {renderListOrString(sharedSoapNoteDetail?.care_instructions)}
          </div>
        </div>

        <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
          <p className="font-medium mb-4 text-docuhealth-dark">Treatment Plan</p>
          <div className="text-[12px] text-gray-700">
            {renderListOrString(sharedSoapNoteDetail?.treatment_plan)}
          </div>
        </div>
      </div>

      {/* Uploaded Documents */}
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-medium mb-4 text-docuhealth-dark">
          Uploaded Documents / Images
        </p>
        <div>
          {docsArray.length > 0 && docsArray[0] !== "" ? (
            docsArray.map((attachment, index) => {
              if (!attachment) return null;
              
              const fileUrl = typeof attachment === 'string' ? attachment : (attachment.file || attachment.url);
              if (!fileUrl) return null;

              const fileName = typeof attachment === 'string' ? `Document_${index + 1}` : (attachment.filename || `Document_${index + 1}`);
              const fileSizeMB = typeof attachment === 'object' && attachment.size
                ? (attachment.size / (1024 * 1024)).toFixed(1) + " MB"
                : "Unknown Size";
              const fileDate = formatFullDateTime(sharedSoapNoteDetail.created_at);

              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName) || (typeof attachment === 'object' && attachment.file_type?.includes("image"));
              const isPdf = /\.pdf$/i.test(fileName) || (typeof attachment === 'object' && attachment.file_type?.includes("pdf"));
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
                    <a
                      href={fileUrl}
                      download
                      className="flex items-center justify-center gap-1 bg-docuhealth-primary text-white rounded-full font-medium hover:bg-docuhealth-dark-primary transition py-1 px-3 w-full sm:w-28"
                    >
                      <ArrowDownToLine className="w-3 h-3" />
                      Download
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-[12px] text-gray-500">NIL</p>
          )}
        </div>
      </div>

      {/* Additional Notes */}
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-medium mb-4 text-docuhealth-dark">Additional Notes</p>
        <div className="text-[12px] text-gray-700">
          {sharedSoapNoteDetail?.additional_notes?.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {sharedSoapNoteDetail.additional_notes.map((noteObj, index) => (
                <li key={index}>
                  {noteObj.note}
                  <span className="text-gray-400 text-[10px] ml-2">({formatFullDateTime(noteObj.created_at)})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>NIL</p>
          )}
        </div>
      </div>

      {renderLabTests(sharedSoapNoteDetail?.lab_tests_info)}

      {/* Follow Up / Appointment */}
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-medium mb-4 text-docuhealth-dark">
          Follow Up / Appointment
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <p className="text-[12px] text-gray-500">
            Type:{" "}
            <span className="font-medium text-gray-900 capitalize">
              {sharedSoapNoteDetail?.appointment_info?.type || "NIL"}
            </span>
          </p>
          <p className="text-[12px] text-gray-500">
            Scheduled:{" "}
            <span className="font-medium text-gray-900">
              {sharedSoapNoteDetail?.appointment_info?.scheduled_time
                ? formatFullDateTime(
                  sharedSoapNoteDetail.appointment_info.scheduled_time,
                )
                : "NIL"}
            </span>
          </p>
          {sharedSoapNoteDetail?.appointment?.note && (
            <p className="text-[12px] text-gray-500 col-span-2 mt-1">
              Note:{" "}
              <span className="font-medium text-gray-900 italic">
                "{sharedSoapNoteDetail.appointment.note}"
              </span>
            </p>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default SharedSoapNoteDetail;
