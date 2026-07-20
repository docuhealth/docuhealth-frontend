import React from "react";
import {
  formatFullDateTime,
  getAge,
} from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import formatRecordDate from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { FileText, Eye, ArrowDownToLine, Image, ArrowLeft } from "lucide-react";
import { renderListOrString, renderLabTests } from "../../../../../utils/soapNoteHelpers";

const SharedSoapNoteDetail = ({ sharedSoapNoteDetail, setSharedSoapNoteDetail }) => {

  const docsArray = typeof sharedSoapNoteDetail?.investigation_docs === 'string'
    ? [sharedSoapNoteDetail.investigation_docs]
    : (sharedSoapNoteDetail?.investigation_docs || []);

  const vitals = sharedSoapNoteDetail?.vital_signs_info;

  return (
    <div className="bg-white my-5 border rounded-lg pt-5 lg:pt-8 px-4 lg:px-6 text-sm ">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap sm:gap-0  border-b pb-4 w-full">
        <div
          className="flex justify-start items-center gap-1 cursor-pointer"
          onClick={() => setSharedSoapNoteDetail(null)}
        >
          <ArrowLeft size={16} />
          <h2 className=" text-sm">Detailed Shared SOAP Note</h2>
        </div>
      </div>
      
      {/* Basic Info */}
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="text-[12px] mb-4">
          {" "}
          Patient's name :{" "}
          <span className="font-medium text-sm">
            {" "}
            {sharedSoapNoteDetail?.patient_info?.firstname}{" "}
            {sharedSoapNoteDetail?.patient_info?.lastname}
          </span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="">
            <p className="text-[12px]">
              {" "}
              Patient's HIN :{" "}
              <span className="font-medium ">
                {" "}
                {sharedSoapNoteDetail?.patient_info?.hin ||
                  sharedSoapNoteDetail?.subaccount}
              </span>
            </p>
            <p className="text-[12px]">
              {" "}
              Patient's Age :{" "}
              <span className="font-medium ">
                {" "}
                {getAge(sharedSoapNoteDetail?.patient_info?.dob) || "NIL"}
              </span>
            </p>
            <p className="text-[12px]">
              {" "}
              Patient's Gender :{" "}
              <span className="font-medium capitalize">
                {" "}
                {sharedSoapNoteDetail?.patient_info?.gender || "NIL"}
              </span>
            </p>
          </div>
          <div className="">
            <p className="text-[12px]">
              {" "}
              Appointed Doctor :{" "}
              <span className="font-medium ">
                {" "}
                {sharedSoapNoteDetail?.staff_info?.firstname}{" "}
                {sharedSoapNoteDetail?.staff_info?.lastname}
              </span>
            </p>
            <p className="text-[12px]">
              {" "}
              Specialisation :{" "}
              <span className="font-medium">
                {" "}
                {sharedSoapNoteDetail?.staff_info?.specialization || "NIL"}
              </span>
            </p>
          </div>
          <div className="">
            <p className="text-[12px]">
              {" "}
              Hospital :{" "}
              <span className="font-medium ">
                {" "}
                {sharedSoapNoteDetail?.hospital_info?.name || "NIL"}
              </span>
            </p>
            <p className="text-[12px]">
              {" "}
              Hospital's Email :{" "}
              <span className="font-medium ">
                {" "}
                {sharedSoapNoteDetail?.hospital_info?.email || "NIL"}
              </span>
            </p>
          </div>
          <div className="">
            <p className="text-[12px]">
              {" "}
              Status :{" "}
              <span className="font-medium ">
                {" "}
                {sharedSoapNoteDetail?.created_at ? formatRecordDate(sharedSoapNoteDetail.created_at) : "NIL"}
              </span>
            </p>
            <p className="text-[12px]">
              {" "}
              Date / Time Uploaded :{" "}
              <span className="font-medium ">
                {" "}
                {sharedSoapNoteDetail?.created_at ? formatFullDateTime(sharedSoapNoteDetail.created_at) : "NIL"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Vital Signs */}
      {vitals && (
        <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
          <p className="font-medium mb-4 text-docuhealth-dark">Vital Signs</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-[12px]">
              <h4 className="text-gray-400 font-normal mb-1">Blood Pressure:</h4>
              <p className="font-medium">{vitals.blood_pressure || "NIL"}</p>
            </div>
            <div className="text-[12px]">
              <h4 className="text-gray-400 font-normal mb-1">Temperature:</h4>
              <p className="font-medium">{vitals.temp ? `${vitals.temp} °C` : "NIL"}</p>
            </div>
            <div className="text-[12px]">
              <h4 className="text-gray-400 font-normal mb-1">Heart Rate:</h4>
              <p className="font-medium">{vitals.heart_rate ? `${vitals.heart_rate} bpm` : "NIL"}</p>
            </div>
            <div className="text-[12px]">
              <h4 className="text-gray-400 font-normal mb-1">Resp. Rate:</h4>
              <p className="font-medium">{vitals.resp_rate ? `${vitals.resp_rate} bpm` : "NIL"}</p>
            </div>
            <div className="text-[12px]">
              <h4 className="text-gray-400 font-normal mb-1">Weight:</h4>
              <p className="font-medium">{vitals.weight ? `${vitals.weight} kg` : "NIL"}</p>
            </div>
            <div className="text-[12px]">
              <h4 className="text-gray-400 font-normal mb-1">Height:</h4>
              <p className="font-medium">{vitals.height ? `${vitals.height} cm` : "NIL"}</p>
            </div>
          </div>
        </div>
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

      {/* Drug Records */}
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-medium mb-4 text-docuhealth-dark">Medication / Drug Records</p>
        
        <div className="overflow-x-auto">
          {sharedSoapNoteDetail?.drug_records?.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[12px] text-gray-400 border-b">
                  <th className="pb-2 font-normal">Drug Name</th>
                  <th className="pb-2 font-normal">Route</th>
                  <th className="pb-2 font-normal">Qty</th>
                  <th className="pb-2 font-normal">Frequency</th>
                  <th className="pb-2 font-normal">Duration</th>
                  <th className="pb-2 font-normal">Allergies</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {sharedSoapNoteDetail.drug_records.map((drug, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 font-medium text-docuhealth-primary">
                      {drug.name}
                    </td>
                    <td className="py-3 text-gray-600">{drug.route || "Oral"}</td>
                    <td className="py-3 text-gray-600">{drug.quantity}</td>
                    <td className="py-3 text-gray-600">
                      {typeof drug.frequency === 'object'
                        ? `${drug.frequency.value || ''} ( ${drug.frequency.rate || ''} )`
                        : drug.frequency || "N/A"}
                    </td>
                    <td className="py-3 text-gray-600">
                      {typeof drug.duration === 'object'
                        ? `${drug.duration.value || ''} ( ${drug.duration.rate || ''} )`
                        : drug.duration || "N/A"}
                    </td>
                    <td className="py-3 text-red-500 italic">
                      {drug.allergies?.length > 0 ? drug.allergies.join(", ") : "None"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-[12px] text-gray-500 italic">No medication records available.</p>
          )}
        </div>
      </div>

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
