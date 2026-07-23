import React from "react";
import { ArrowLeft } from "lucide-react";
import LabTabComponent from "../Hospital_Lab/PatientInfoComponents/LabTabComponent";
import getTabs from "../Hospital_Lab/PatientInfoComponents/LabTabDetails";

const PharmacistPatientInfo = ({ selectedPatientDetails, setSeePatientDetails, setCreateOrder, hideCreateOrder }) => {
  const p = selectedPatientDetails?.patient ?? {};

  return (
    <div className="bg-white rounded-xl border mt-3 p-5 text-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 gap-4 sm:gap-0">
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => setSeePatientDetails(false)}
        >
          <ArrowLeft className="w-4 h-4 text-gray-800" />
          <p>Patient details</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          {!hideCreateOrder && (
            <button
              onClick={() => {
                setSeePatientDetails(false);
                setCreateOrder(true);
              }}
              className="w-full sm:w-auto border border-docuhealth-primary text-docuhealth-primary text-sm rounded-full px-5 py-1.5 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Create a drug order
            </button>
          )}
        </div>
      </div>

      <div className="py-5 border-b">
        <div className="flex items-center">
          <div className="w-14 h-14 rounded-full bg-docuhealth-border-light flex items-center justify-center text-xl text-black shrink-0">
            {`${p?.firstname?.[0] ?? ""}${p?.lastname?.[0] ?? ""}`.toUpperCase()}
          </div>

          <div className="flex flex-col items-start ml-3">
            <p className="text-[16px] font-medium text-docuhealth-dark">
              {p?.firstname} {p?.lastname}
            </p>
            <p className="text-[14px] text-gray-500 capitalize">
              {p?.plan_type ? `${p.plan_type} patient` : "patient"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <LabTabComponent
          tabs={getTabs({ patientFullInfo: { patient_info: p || {} } })}
        />
      </div>
    </div>
  );
};

export default PharmacistPatientInfo;
