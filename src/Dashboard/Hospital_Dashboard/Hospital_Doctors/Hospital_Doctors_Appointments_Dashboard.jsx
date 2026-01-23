import React, { useState } from "react";
import DynamicDate from "../../../Components/Dynamic Date/DynamicDate";
import AppointmentsList from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments Dashboard/AppointmentsList";
import PatientInfo from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments Dashboard/components/PatientInfo";
import SoapNoteEntry from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments Dashboard/components/SoapNoteEntry";
import RequestAdmission from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments Dashboard/components/RequestAdmission";
import OtherMedicalServices from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments Dashboard/components/OtherMedicalServices";

const Hospital_Doctors_Appointments_Dashboard = () => {
  const [seePatientDetails, setSeePatientDetails] = useState(false);
  const [afterVisitSummary, setAfterVisitSummary] = useState(false);
  const [soapNoteEntry, setSoapNoteEntry] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);

  const [otherMedicalServices, setOtherMedicalServices] = useState(false);

  const [requestAdmission, setRequestAdmission] = useState(false);

  return (
    <>
      {seePatientDetails ? (
        <>
          <div className="py-2 text-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
            <DynamicDate />
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <button className="py-2.5 px-10 rounded-full text-[#3E4095] border border-[#3E4095] cursor-pointer w-full lg:w-auto "  onClick={()=> {
                  setOtherMedicalServices(true)
                }}>
                Other medical services
               
              </button>
              <button className="py-2.5 px-10 rounded-full text-[#3E4095] border border-[#3E4095] cursor-pointer w-full lg:w-auto"
              onClick={()=> {
                setRequestAdmission(true)
              }}
              >
                Request for admission
              </button>
              <button
                className="py-2.5 px-10 rounded-full bg-[#3E4095] border border-[#3E4095] text-white cursor-pointer w-full lg:w-auto"
                onClick={() => {
                  console.log("hi");
                  setSoapNoteEntry(true);
                  setSeePatientDetails(false);
                }}
              >
                + Add new SOAP Note
              </button>
            </div>
          </div>
          <div className="my-5">
            <PatientInfo
              setSeePatientDetails={setSeePatientDetails}
              selectedPatientDetails={selectedPatientDetails}
            />
          </div>
          {
            otherMedicalServices && (
              <OtherMedicalServices setOtherMedicalServices={setOtherMedicalServices} 
              selectedPatientDetails={selectedPatientDetails}
              />
            )
          }
          {
            requestAdmission && (
                <RequestAdmission  setRequestAdmission ={setRequestAdmission} selectedPatientDetails={selectedPatientDetails}/>
            )
          }
        </>
      ) : soapNoteEntry ? (
        <>
          <div className="py-2 text-sm flex justify-between items-center">
            <DynamicDate />
            <div className="">
              <button
                className="py-2.5 px-10 rounded-full bg-[#3E4095] text-white cursor-pointer"
                onClick={() => {
                  setSoapNoteEntry(false);
                }}
              >
                + close SOAP Note
              </button>
            </div>
          </div>
          <div>
            <SoapNoteEntry
              setSoapNoteEntry={setSoapNoteEntry}
              selectedPatientDetails={selectedPatientDetails}
            />
          </div>
        </>
      ) : (
        <>
          <div className="py-2 text-sm flex justify-between items-center">
            <DynamicDate />
          </div>
          <div className="bg-white my-5  rounded-lg ">
        <div className=" border rounded-lg p-4 lg:p-6">
              <h2 className=" mb-4 pb-2 border-b font-medium">
                Upcoming Appointments List
              </h2>
              <div>
                <AppointmentsList
                  setSeePatientDetails={setSeePatientDetails}
                  setSelectedPatientDetails={setSelectedPatientDetails}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Hospital_Doctors_Appointments_Dashboard;
