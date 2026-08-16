import React from "react";
import formatRecordDate from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { formatFullDateTime, getAge } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { renderDrugRecords, renderLabTests } from "../../../../../utils/soapNoteHelpers";
import { Image, FileText, Eye, ArrowDownToLine } from "lucide-react";
import PatientInfoCard from "../../../../ui/PatientInfoCard";
import VitalSignsCard from "../../../../ui/VitalSignsCard";

const PatientMedicalRecordDetail = ({
  selectedMedicalRecord,
  setViewDetailMedicalRecord,
}) => {
  if (!selectedMedicalRecord)
    return <p className="text-sm text-center py-14">No record selected.</p>;

  return (
    <>
      <div className="bg-white my-5 border rounded-lg py-5 px-5  text-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 sm:gap-0  border-b pb-4 w-full">
          <div
            className="flex justify-start items-center gap-1 cursor-pointer"
            onClick={() => setViewDetailMedicalRecord(false)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.56528 6.41685H11.6654V7.58352H4.56528L7.69426 10.7125L6.86932 11.5374L2.33203 7.00019L6.86932 2.46289L7.69426 3.28785L4.56528 6.41685Z"
                fill="var(--color-docuhealth-dark)"
              />
            </svg>

            <h2 className=" text-sm">Medical Record Detail</h2>
          </div>
        </div>
        <PatientInfoCard
          className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg"
          selectedMedicalRecord={selectedMedicalRecord}
        />

        {/* Chief Complaint */}
        <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
          <p className="font-medium mb-4 text-docuhealth-dark">Chief Complaint</p>
          <p className="text-[12px] text-gray-700 leading-relaxed">
            {selectedMedicalRecord?.chief_complaint || "NIL"}
          </p>
        </div>



        {/* Vital Signs*/}
        <VitalSignsCard
          className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg"
          vitalSigns={selectedMedicalRecord?.vital_signs_info}
        />

        <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
          <p className="font-medium mb-4">Diagnosis & Investigation</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="text-[12px]">
              <h4 className="text-gray-400 font-normal mb-1">
                Primary Diagnosis:
              </h4>
              <p className="font-medium text-docuhealth-primary">
                {selectedMedicalRecord?.primary_diagnosis || "NIL"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
          <p className="font-medium mb-4 text-docuhealth-dark">
            Uploaded Documents / Images
          </p>
          <div>
            {selectedMedicalRecord?.investigation_docs?.length > 0 ? (
              selectedMedicalRecord.investigation_docs.map(
                (attachment, index) => {
                  // Correctly mapping your payload fields
                  const fileName =
                    attachment.filename || `Document_${index + 1}`;
                  const fileUrl = attachment.file || attachment.url; // Supporting both common keys
                  const fileSizeMB = attachment.size
                    ? (attachment.size / (1024 * 1024)).toFixed(1) + " MB"
                    : "0.5 MB"; // Fallback placeholder if size is missing
                  const fileDate = formatFullDateTime(
                    selectedMedicalRecord.created_at,
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
                        <div className="p-2 bg-docuhealth-primary/10 rounded-md">
                          <Icon className="text-docuhealth-primary" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {fileName}
                          </p>
                          <p className="text-gray-500">
                            {fileDate}{fileDate && fileSizeMB ? " • " : ""}{fileSizeMB}
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
                },
              )
            ) : (
              <p className="text-[12px] text-gray-500">NIL</p>
            )}
          </div>
        </div>

        {/* Drug Records */}
        <div className="mb-5">
          {renderDrugRecords(selectedMedicalRecord?.drug_orders_info || selectedMedicalRecord?.drug_records)}
        </div>
        
        {/* Lab Tests */}
        <div className="mb-5">
          {renderLabTests(selectedMedicalRecord?.lab_tests_info || selectedMedicalRecord?.lab_tests)}
        </div>

        {/* Care Instructions */}
        <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
          <p className="font-medium mb-4 text-docuhealth-dark">Care Instructions</p>
          <div className="text-[12px] text-gray-700">
            {selectedMedicalRecord?.care_instructions?.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {selectedMedicalRecord.care_instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            ) : (
              <p>NIL</p>
            )}
          </div>
        </div>

        {/* Treatment Plan */}
        <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
          <p className="font-medium mb-4 text-docuhealth-dark">Treatment Plan</p>
          <div className="text-[12px] text-gray-700">
            {selectedMedicalRecord?.treatment_plan?.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {selectedMedicalRecord.treatment_plan.map((plan, index) => (
                  <li key={index}>{plan}</li>
                ))}
              </ul>
            ) : (
              <p>NIL</p>
            )}
          </div>
        </div>

        <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
          <p className="font-medium mb-4 text-docuhealth-dark">
            Follow Up / Appointment
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <p className="text-[12px] text-gray-500">
              Type:{" "}
              <span className="font-medium text-gray-900 capitalize">
                {selectedMedicalRecord?.appointment?.type || "NIL"}
              </span>
            </p>
            <p className="text-[12px] text-gray-500">
              Scheduled:{" "}
              <span className="font-medium text-gray-900">
                {selectedMedicalRecord?.appointment?.scheduled_time
                  ? formatFullDateTime(
                    selectedMedicalRecord.appointment.scheduled_time,
                  )
                  : "NIL"}
              </span>
            </p>
            {selectedMedicalRecord?.appointment?.note && (
              <p className="text-[12px] text-gray-500 col-span-2 mt-1">
                Note:{" "}
                <span className="font-medium text-gray-900 italic">
                  &quot;{selectedMedicalRecord.appointment.note}&quot;
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientMedicalRecordDetail;
