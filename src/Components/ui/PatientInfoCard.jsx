import React from "react";
import PropTypes from "prop-types";
import formatRecordDate, {
  formatFullDateTime,
  getAge,
} from "../Dashboard/Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";

const PatientInfoCard = ({ selectedMedicalRecord, className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl" }) => {
  if (!selectedMedicalRecord) return null;

  return (
    <div className={className}>
      <p className="text-[12px] mb-4">
        Patient's name :{" "}
        <span className="font-medium text-sm">
          {selectedMedicalRecord?.patient_info?.firstname}{" "}
          {selectedMedicalRecord?.patient_info?.lastname}
        </span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <p className="text-[12px]">
            Patient's HIN :{" "}
            <span className="font-medium ">
              {selectedMedicalRecord?.patient_info?.hin ||
                selectedMedicalRecord?.subaccount ||
                "NIL"}
            </span>
          </p>
          <p className="text-[12px]">
            Patient's Age :{" "}
            <span className="font-medium ">
              {getAge(selectedMedicalRecord?.patient_info?.dob) || "NIL"}
            </span>
          </p>
          <p className="text-[12px]">
            Patient's Gender :{" "}
            <span className="font-medium capitalize">
              {selectedMedicalRecord?.patient_info?.gender || "NIL"}
            </span>
          </p>
        </div>
        
        <div className="space-y-2">
          <p className="text-[12px]">
            Patient's Doctor :{" "}
            <span className="font-medium ">
              {selectedMedicalRecord?.staff_info
                ? `Dr. ${selectedMedicalRecord.staff_info.firstname} ${selectedMedicalRecord.staff_info.lastname}`
                : selectedMedicalRecord?.doctor_info
                ? `Dr. ${selectedMedicalRecord.doctor_info.firstname} ${selectedMedicalRecord.doctor_info.lastname}`
                : "NIL"}
            </span>
          </p>
          <p className="text-[12px]">
            Specialisation :{" "}
            <span className="font-medium">
              {selectedMedicalRecord?.staff_info?.specialization ||
                selectedMedicalRecord?.doctor_info?.specialization ||
                "NIL"}
            </span>
          </p>
          {selectedMedicalRecord?.patient_info?.phone_num && (
            <p className="text-[12px]">
              Phone :{" "}
              <span className="font-medium">
                {selectedMedicalRecord.patient_info.phone_num}
              </span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-[12px]">
            Hospital :{" "}
            <span className="font-medium ">
              {selectedMedicalRecord?.hospital_info?.name || "NIL"}
            </span>
          </p>
          <p className="text-[12px]">
            Hospital's Email :{" "}
            <span className="font-medium ">
              {selectedMedicalRecord?.hospital_info?.email || "NIL"}
            </span>
          </p>
          {selectedMedicalRecord?.patient_info?.email && (
            <p className="text-[12px]">
              Patient's Email :{" "}
              <span className="font-medium">
                {selectedMedicalRecord.patient_info.email}
              </span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-[12px]">
            Status :{" "}
            <span className="font-medium capitalize">
              {selectedMedicalRecord?.status ||
               (selectedMedicalRecord?.created_at ? formatRecordDate(selectedMedicalRecord.created_at) : "NIL")}
            </span>
          </p>
          <p className="text-[12px]">
            Date / Time Uploaded :{" "}
            <span className="font-medium ">
              {formatFullDateTime(selectedMedicalRecord?.created_at) || "NIL"}
            </span>
          </p>
          {(selectedMedicalRecord?.patient_info?.street || selectedMedicalRecord?.patient_info?.city) && (
            <p className="text-[12px]">
              Address :{" "}
              <span className="font-medium">
                {[
                  selectedMedicalRecord.patient_info.street,
                  selectedMedicalRecord.patient_info.city,
                  selectedMedicalRecord.patient_info.state,
                  selectedMedicalRecord.patient_info.country
                ].filter(Boolean).join(", ")}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

PatientInfoCard.propTypes = {
  selectedMedicalRecord: PropTypes.object,
};

export default PatientInfoCard;
