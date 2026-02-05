import React, { useState } from "react";
import DynamicDate from "../../../Components/Dynamic Date/DynamicDate";
import TabComponent from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Patient Mgt Dashboard/TabComponent";
import getTabs from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Patient Mgt Dashboard/TabDetails";
import AdvanceCheckUp from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Patient Mgt Dashboard/AdvanceCheckUp";
import OtherMedicalServices from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments Dashboard/components/OtherMedicalServices";
import TransferToAnotherWard from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Patient Mgt Dashboard/TransferToAnotherWard";
import AfterDischargeSummary from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Patient Mgt Dashboard/AfterDischargeSummary";
import SoapNoteEntry from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments Dashboard/components/SoapNoteEntry";

const Hospital_Doctors_Patients_Dashboard = () => {
  const [advanceCheckUp, setAdvanceCheckUp] = useState(false);
  const [advanceCheckUpSource, setAdvanceCheckUpSource] = useState("active");

  const [selected, setSelected] = useState(null);

  const [otherMedicalServices, setOtherMedicalServices] = useState(false);
  const [transferRequest, setTransferRequest] = useState(false);

  const [soapNoteEntry, setSoapNoteEntry] = useState(false);

  const [dischargePatient, setDischargePatient] = useState(false);
  const [selectedDischargePatient, setSelectedDischargePatient] =
    useState(null);

  return (
    <>
      {advanceCheckUp ? (
        <>
          <div className="py-2 text-sm flex flex-col lg:flex-row justify-between items-start gap-3 lg:gap-0 lg:items-center">
            <DynamicDate />
            {!selected.discharge_date && (
            <div className="flex flex-col lg:flex-row items-center gap-2 w-full lg:w-auto">
              <button
                className="py-2.5 px-10 rounded-full text-[#3E4095] border border-[#3E4095] cursor-pointer w-full lg:w-auto "
                onClick={() => {
                  setOtherMedicalServices(true);
                }}
              >
                Other medical services
              </button>

              <button
                className="py-2.5 px-10 rounded-full text-[#3E4095] border border-[#3E4095] cursor-pointer w-full lg:w-auto"
                onClick={() => {
                  setTransferRequest(true);
                }}
              >
                Transfer to another ward
              </button>
              <button
                className="py-2.5 px-10 rounded-full bg-[#3E4095] border border-[#3E4095] text-white cursor-pointer w-full lg:w-auto"
                onClick={() => {
                  setDischargePatient(true);
                  setSelectedDischargePatient(selected);
                  //   setSeePatientDetails(false);
                }}
              >
                Discharge Patient
              </button>
            </div>
            )}
          </div>
          <div className="bg-white my-5 border rounded-lg p-5 text-sm">
            <AdvanceCheckUp
              selected={selected}
              setAdvanceCheckUp={setAdvanceCheckUp}
              setSoapNoteEntry={setSoapNoteEntry}
              advanceCheckUpSource = {advanceCheckUpSource}
            />
          </div>
          {otherMedicalServices && (
            <OtherMedicalServices
              setOtherMedicalServices={setOtherMedicalServices}
              selectedPatientDetails={selected}
            />
          )}

          {dischargePatient && (
            <AfterDischargeSummary
              selectedDischargePatient={selectedDischargePatient}
              setDischargePatient={setDischargePatient}
            />
          )}

          {transferRequest && (
            <TransferToAnotherWard
              setRequestAdmission={setTransferRequest}
              selectedPatientDetails={selected}
            />
          )}
        </>
      ) : soapNoteEntry ? (
        <>
          <SoapNoteEntry
            setSoapNoteEntry={setSoapNoteEntry}
            selectedPatientDetails={selected}
          />
        </>
      ) : (
        <>
          <div className="py-2 text-sm flex justify-between items-center">
            <DynamicDate />
          </div>
          <div className="bg-white my-5 border rounded-lg p-5">
            <TabComponent
              tabs={getTabs(advanceCheckUp, setAdvanceCheckUp, setSelected, setAdvanceCheckUpSource)}
            />
          </div>
        </>
      )}
    </>
  );
};

export default Hospital_Doctors_Patients_Dashboard;
