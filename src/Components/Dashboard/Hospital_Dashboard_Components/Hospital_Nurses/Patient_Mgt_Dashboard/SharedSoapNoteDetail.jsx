import React from "react";
import {
  formatFullDateTime,
  getAge,
} from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import formatRecordDate from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { FileText, Eye, ArrowDownToLine, Image, ArrowLeft } from "lucide-react";

const SharedSoapNoteDetail = ({ sharedSoapNoteDetail, setSharedSoapNoteDetail }) => {
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
      <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
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
              <span className="font-medium ">
                {" "}
                {sharedSoapNoteDetail?.patient_info?.gender || "Male"}
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

      {/* 1. Extended Clinical History */}
      <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
        <p className="font-medium mb-4 text-[#1B2B40]">
          Clinical History Details
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-[12px] pb-2">
            <h4 className="text-gray-400 font-normal mb-1">
              History of Complaint:
            </h4>
            <p className="font-medium">
              {sharedSoapNoteDetail?.history_of_complain || "NIL"}
            </p>
          </div>

          <div className="text-[12px] pb-2">
            <h4 className="text-gray-400 font-normal mb-1">
              Past Medical History:
            </h4>
            <p className="font-medium">
              {sharedSoapNoteDetail?.past_med_history || "NIL"}
            </p>
          </div>

          <div className="text-[12px] pb-2">
            <h4 className="text-gray-400 font-normal mb-1">
              Family History:
            </h4>
            <p className="font-medium">
              {sharedSoapNoteDetail?.family_history || "NIL"}
            </p>
          </div>

          <div className="text-[12px] pb-2">
            <h4 className="text-gray-400 font-normal mb-1">
              Social History:
            </h4>
            <p className="font-medium">
              {sharedSoapNoteDetail?.social_history || "NIL"}
            </p>
          </div>
        </div>

        <div className="text-[12px] pt-2 border-t mt-2">
          <h4 className="text-gray-400 font-normal mb-1">
            Other Relevant History:
          </h4>
          <p className="font-medium">
            {sharedSoapNoteDetail?.other_history || "NIL"}
          </p>
        </div>
      </div>

      {/* 2. Physical Examinations & Review */}
      <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
        <p className="font-medium mb-4">Examination Findings</p>

        <div className="text-[12px] pb-3">
          <h4 className="text-gray-400 font-normal mb-1">
            General Examination:
          </h4>
          <ul className="list-disc list-outside pl-5 font-medium">
            {sharedSoapNoteDetail?.general_exam?.map((item, index) => (
              <li key={index}>
                {typeof item === 'object' ? item.note : item}
              </li>
            )) || <li>NIL</li>}
          </ul>
        </div>

        <div className="text-[12px] pb-3">
          <h4 className="text-gray-400 font-normal mb-1">
            Systemic Examination:
          </h4>
          <ul className="list-disc list-outside pl-5 font-medium">
            {sharedSoapNoteDetail?.systemic_exam?.map((item, index) => (
              <li key={index}>
                {typeof item === 'object' ? item.note : item}
              </li>
            )) || <li>NIL</li>}
          </ul>
        </div>

        <div className="text-[12px]">
          <h4 className="text-gray-400 font-normal mb-1">
            Review of Systems:
          </h4>
          <p className="font-medium">
            {sharedSoapNoteDetail?.review || "NIL"}
          </p>
        </div>
      </div>

      {/* 3. Diagnosis & Testing */}
      <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
        <p className="font-medium mb-4">Diagnosis & Investigations</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="text-[12px]">
            <h4 className="text-gray-400 font-normal mb-1">
              Primary Diagnosis:
            </h4>
            <p className="font-medium text-[#3E4095]">
              {sharedSoapNoteDetail?.primary_diagnosis || "NIL"}
            </p>
          </div>
          <div className="text-[12px]">
            <h4 className="text-gray-400 font-normal mb-1">
              Differential Diagnosis:
            </h4>
            <p className="font-medium">
              {sharedSoapNoteDetail?.differential_diagnosis || "NIL"}
            </p>
          </div>
        </div>

        <div className="text-[12px] pb-3">
          <h4 className="text-gray-400 font-normal mb-1">
            Investigations Required:
          </h4>
          <ul className="list-disc list-outside pl-5 font-medium">
            {sharedSoapNoteDetail?.investigations?.map((item, index) => (
              <li key={index}>
                {typeof item === 'object' ? item.note : item}
              </li>
            )) || <li>NIL</li>}
          </ul>
        </div>

        <div className="text-[12px]">
          <h4 className="text-gray-400 font-normal mb-1">Bedside Tests:</h4>
          <ul className="list-disc list-outside pl-5 font-medium">
            {sharedSoapNoteDetail?.bedside_tests?.map((item, index) => (
              <li key={index}>
                {typeof item === 'object' ? item.note : item}
              </li>
            )) || <li>NIL</li>}
          </ul>
        </div>
      </div>

      {/* 4. Drug History & Allergies */}
      <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
        <p className="font-medium mb-4">Drug History / Allergies</p>
        <div className="text-[12px]">
          <h4 className="text-gray-400 font-normal mb-1">
            Known Allergies & Sensitivities:
          </h4>
          <p className="font-medium text-red-600 italic">
            {Array.isArray(sharedSoapNoteDetail?.drug_history_allergies)
              ? sharedSoapNoteDetail.drug_history_allergies
                .join("")
                .replace(/['\[\]]/g, "")
              : "NIL"}
          </p>
        </div>
      </div>

      {/* 5. Patient Education & Problems List */}
      <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
        <div className="text-[12px] pb-3">
          <h4 className="text-gray-400 font-normal mb-1">
            Active Problems List:
          </h4>
          <ul className="list-disc list-outside pl-5 font-medium">
            {sharedSoapNoteDetail?.problems_list?.map((item, index) => (
              <li key={index}>
                {typeof item === 'object' ? item.note : item}
              </li>
            )) || <li>NIL</li>}
          </ul>
        </div>

        <div className="text-[12px] pt-3 border-t">
          <h4 className="text-gray-400 font-normal mb-1">
            Patient Education/Counselling:
          </h4>
          <p className="font-medium">
            {sharedSoapNoteDetail?.patient_education || "NIL"}
          </p>
        </div>

        {sharedSoapNoteDetail?.additional_notes?.length > 0 ? (
          <div className="text-[12px] pt-3 mt-3 border-t">
            <h4 className="text-gray-400 font-normal mb-1">
              Additional Notes:
            </h4>
            <ul className="list-disc list-outside pl-5 font-medium">
              {sharedSoapNoteDetail.additional_notes.map(
                (note, index) => (
                  <li key={index}>
                    {typeof note === 'object' ? note.note : note}
                  </li>
                ),
              )}
            </ul>
          </div>
        ) : (
          <>
            <p className="text-sm pt-4 font-medium">
              No additional notes...
            </p>
          </>
        )}
      </div>

      {/* 6. Uploaded Documents / Images */}
      <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
        <p className="font-medium mb-4 text-[#1B2B40]">
          Uploaded Documents / Images
        </p>
        <div>
          {sharedSoapNoteDetail?.investigation_docs?.length > 0 ? (
            sharedSoapNoteDetail.investigation_docs.map(
              (attachment, index) => {
                const fileName =
                  attachment.filename || `Document_${index + 1}`;
                const fileUrl = attachment.file || attachment.url;
                const fileSizeMB = attachment.size
                  ? (attachment.size / (1024 * 1024)).toFixed(1) + " MB"
                  : "0.5 MB";
                const fileDate = formatFullDateTime(
                  sharedSoapNoteDetail.created_at,
                );

                const isImage =
                  /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName) ||
                  attachment.file_type?.includes("image");
                const isPdf =
                  /\.pdf$/i.test(fileName) ||
                  attachment.file_type?.includes("pdf");
                const Icon = isImage ? Image : isPdf ? FileText : FileText;

                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row justify-between items-start gap-5 sm:gap-0 sm:items-center bg-white border rounded-lg px-4 py-3 mb-3 "
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-[12px]">
                      <div className="p-2 bg-[#3E4095]/10 rounded-md">
                        <Icon className="text-[#3E4095]" size={20} />
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
                        className="flex items-center justify-center gap-1 border border-[#3E4095] text-[#3E4095] rounded-full font-medium hover:bg-blue-50 transition py-1 px-3 w-full sm:w-28"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </a>
                      <a
                        href={fileUrl}
                        download
                        className="flex items-center justify-center gap-1 bg-[#3E4095] text-white rounded-full font-medium hover:bg-[#2e3070] transition py-1 px-3 w-full sm:w-28"
                      >
                        <ArrowDownToLine className="w-3 h-3" />
                        Download
                      </a>
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

      {/* Drug Records */}
      <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
        <div className=" mb-4">    <p className="font-medium text-[#1B2B40]">Medication / Drug Records</p>
        </div>

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
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {sharedSoapNoteDetail.drug_records.map((drug, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 font-medium text-[#3E4095]">
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
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-[12px] text-gray-500 italic">No medication records available.</p>
          )}
        </div>
      </div>

      {/* Care Instructions */}
      <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
        <p className="font-medium mb-4 text-[#1B2B40]">Care Instructions</p>
        <div className="text-[12px] text-gray-700">
          {sharedSoapNoteDetail?.care_instructions?.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {sharedSoapNoteDetail.care_instructions.map((instruction, index) => (
                <li key={index}>
                  {typeof instruction === 'object' ? instruction.note : instruction}
                </li>
              ))}
            </ul>
          ) : (
            <p>NIL</p>
          )}
        </div>
      </div>

      {/* Treatment Plan */}
      <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
        <p className="font-medium mb-4 text-[#1B2B40]">Treatment Plan</p>
        <div className="text-[12px] text-gray-700">
          {sharedSoapNoteDetail?.treatment_plan?.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {sharedSoapNoteDetail.treatment_plan.map((plan, index) => (
                <li key={index}>
                  {typeof plan === 'object' ? plan.note : plan}
                </li>
              ))}
            </ul>
          ) : (
            <p>NIL</p>
          )}
        </div>
      </div>

      {/* 7. Follow Up / Appointment */}
      <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
        <p className="font-medium mb-4 text-[#1B2B40]">
          Follow Up / Appointment
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <p className="text-[12px] text-gray-500">
            Type:{" "}
            <span className="font-medium text-gray-900 capitalize">
              {sharedSoapNoteDetail?.appointment?.type || "NIL"}
            </span>
          </p>
          <p className="text-[12px] text-gray-500">
            Scheduled:{" "}
            <span className="font-medium text-gray-900">
              {sharedSoapNoteDetail?.appointment?.scheduled_time
                ? formatFullDateTime(
                  sharedSoapNoteDetail.appointment.scheduled_time,
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

      {/* 8. Referral Status */}
      <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
        <p className="font-medium mb-4 text-[#1B2B40]">
          Referral Information
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-[12px] text-gray-500">Referral Status:</p>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${sharedSoapNoteDetail?.referred_hosp ||
                sharedSoapNoteDetail?.referred_docuhealth_hosp
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
                }`}
            >
              {sharedSoapNoteDetail?.referred_hosp ||
                sharedSoapNoteDetail?.referred_docuhealth_hosp
                ? "Active"
                : "None"}
            </span>
          </div>

          <p className="text-[12px] text-gray-500">
            Referred Hospital:{" "}
            <span className="font-medium text-gray-900">
              {sharedSoapNoteDetail?.referred_docuhealth_hosp
                ? `${sharedSoapNoteDetail.referred_docuhealth_hosp} (DocuHealth Provider)`
                : sharedSoapNoteDetail?.referred_hosp || "NIL"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedSoapNoteDetail;
