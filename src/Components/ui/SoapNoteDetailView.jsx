import React from "react";
import PropTypes from "prop-types";
import { Image, FileText, Eye, ArrowDownToLine } from "lucide-react";
import PatientInfoCard from "./PatientInfoCard";
import VitalSignsCard from "./VitalSignsCard";
import SoapClinicalDetailsCard from "./SoapClinicalDetailsCard";
import {
  renderListOrString,
  renderLabTests,
  renderDrugRecords,
} from "../../utils/soapNoteHelpers";
import { formatFullDateTime } from "../Dashboard/Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";

// Full read-only rendering of one SOAP note — the same set of sections as
// the doctor's SOAP Note history tab (see TabDetails2.jsx's
// `PatientSOAPNotes`), factored out so other entry points (e.g. "View SOAP
// note" from Recent Care Activities) can show the same complete record
// instead of duplicating this ~200 lines a third time.
const SoapNoteDetailView = ({ soapNote }) => {
  if (!soapNote) return null;

  return (
    <div className="text-sm">
      <PatientInfoCard
        className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg"
        selectedMedicalRecord={soapNote}
      />

      <VitalSignsCard
        className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg"
        vitalSigns={soapNote?.vital_signs_info}
      />

      <SoapClinicalDetailsCard
        historyOfComplaint={soapNote?.history_of_complain}
        pastMedHistory={soapNote?.past_med_history}
        familyHistory={soapNote?.family_history}
        socialHistory={soapNote?.social_history}
        otherHistory={soapNote?.other_history}
        generalExam={soapNote?.general_exam}
        systemicExam={soapNote?.systemic_exam}
        reviewOfSystems={soapNote?.review}
        primaryDiagnosis={soapNote?.primary_diagnosis}
        differentialDiagnosis={soapNote?.differential_diagnosis}
        investigations={soapNote?.investigations}
        bedsideTests={soapNote?.bedside_tests}
        drugHistoryAllergies={soapNote?.drug_history_allergies}
        problemsList={soapNote?.problems_list}
        patientEducation={soapNote?.patient_education}
        additionalNotes={soapNote?.additional_notes}
      />

      {/* Uploaded Documents / Images */}
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-medium mb-4 text-docuhealth-dark">
          Uploaded Documents / Images
        </p>
        <div>
          {soapNote?.investigation_docs?.length > 0 ? (
            soapNote.investigation_docs.map((attachment, index) => {
              const fileName = attachment.filename || `Document_${index + 1}`;
              const fileUrl = attachment.file || attachment.url;
              const fileSizeMB = attachment.size
                ? (attachment.size / (1024 * 1024)).toFixed(1) + " MB"
                : "0.5 MB";
              const fileDate = formatFullDateTime(soapNote.created_at);
              const isImage =
                /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName) ||
                attachment.file_type?.includes("image");
              const isPdf =
                /\.pdf$/i.test(fileName) || attachment.file_type?.includes("pdf");
              const Icon = isImage ? Image : isPdf ? FileText : FileText;

              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row justify-between items-start gap-5 sm:gap-0 sm:items-center bg-white border rounded-lg px-4 py-3 mb-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-[12px]">
                    <div className="p-2 bg-docuhealth-primary/10 rounded-md">
                      <Icon className="text-docuhealth-primary" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{fileName}</p>
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

      {renderDrugRecords(soapNote?.drug_orders_info || soapNote?.drug_records)}

      {/* Care Instructions */}
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-medium mb-4 text-docuhealth-dark">Care Instructions</p>
        <div className="text-[12px] text-gray-700">
          {renderListOrString(soapNote?.care_instructions)}
        </div>
      </div>

      {/* Treatment Plan */}
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-medium mb-4 text-docuhealth-dark">Treatment Plan</p>
        <div className="text-[12px] text-gray-700">
          {renderListOrString(soapNote?.treatment_plan)}
        </div>
      </div>

      {renderLabTests(soapNote?.lab_tests_info)}

      {/* Follow Up / Next appointment — note the field is `next_appointment_info`
          on the current API, not `appointment_info` (TabDetails2.jsx /
          TabDetails.jsx still check the old name and so never render this
          block for current notes; flagged separately, not fixed here). */}
      {soapNote?.next_appointment_info && (
        <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
          <p className="font-medium mb-4 text-docuhealth-dark">
            Follow Up / Appointment
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <p className="text-[12px] text-gray-500">
              Type:{" "}
              <span className="font-medium text-gray-900 capitalize">
                {soapNote.next_appointment_info.type || "NIL"}
              </span>
            </p>
            <p className="text-[12px] text-gray-500">
              Scheduled:{" "}
              <span className="font-medium text-gray-900">
                {soapNote.next_appointment_info.scheduled_time
                  ? formatFullDateTime(soapNote.next_appointment_info.scheduled_time)
                  : "NIL"}
              </span>
            </p>
            {soapNote.next_appointment_info.note && (
              <p className="text-[12px] text-gray-500 col-span-2 mt-1">
                Note:{" "}
                <span className="font-medium text-gray-900 italic">
                  "{soapNote.next_appointment_info.note}"
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Referral Status */}
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-medium mb-4 text-docuhealth-dark">Referral Information</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-[12px] text-gray-500">Referral Status:</p>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                soapNote?.referred_hosp || soapNote?.referred_docuhealth_hosp
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {soapNote?.referred_hosp || soapNote?.referred_docuhealth_hosp
                ? "Active"
                : "None"}
            </span>
          </div>

          <p className="text-[12px] text-gray-500">
            Referred Hospital:{" "}
            <span className="font-medium text-gray-900">
              {soapNote?.referred_docuhealth_hosp
                ? `${soapNote.referred_docuhealth_hosp} (DocuHealth Provider)`
                : soapNote?.referred_hosp || "NIL"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

SoapNoteDetailView.propTypes = {
  soapNote: PropTypes.object,
};

export default SoapNoteDetailView;
