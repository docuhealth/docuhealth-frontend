import React, { useState, useContext, useEffect } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import AppointmentsList from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments_Dashboard/AppointmentsList";
import PatientInfo from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments_Dashboard/components/PatientInfo";
import SoapNoteEntry from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments_Dashboard/components/SoapNoteEntry";
import PrescribeMedication from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments_Dashboard/components/PrescribeMedication";
import { DoctorAppointmentsListContext } from "../../../context/HospitalContext/Doctors/DoctorAppointmentsListContext";

const Hospital_Doctors_Appointments_Dashboard = () => {
  const [seePatientDetails, setSeePatientDetails] = useState(false);
  const [afterVisitSummary, setAfterVisitSummary] = useState(false);
  const [soapNoteEntry, setSoapNoteEntry] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);

  // Tab title the patient-details view should open on. Set to "Encounter Notes"
  // right after a SOAP note is created; cleared when a different patient is
  // selected so it doesn't carry over.
  const [detailsTab, setDetailsTab] = useState(null);
  useEffect(() => {
    setDetailsTab(null);
  }, [selectedPatientDetails]);

  const [prescribeMedication, setPrescribeMedication] = useState(false);


  const { appointmentType } = useContext(DoctorAppointmentsListContext);

  return (
    <>
      {seePatientDetails ? (
        <>
          <div className="py-2 text-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
            <DynamicDate />
            {/* An appointment is not a visit: SOAP notes, bed requests and orders need a check-in. */}
            <p className="text-[13px] text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 w-full lg:w-auto">
              To write an encounter note, request a bed or place orders, check this patient in first.
            </p>
          </div>
          <div className="my-5">
            <PatientInfo
              setSeePatientDetails={setSeePatientDetails}
              selectedPatientDetails={selectedPatientDetails}
              initialTabTitle={detailsTab}
            />
          </div>

        </>
      ) : soapNoteEntry ? (
        <>
          <div className="py-2 text-sm flex justify-between items-center">
            <DynamicDate />
            <div className="">
              <button
                className="py-2.5 px-10 rounded-full bg-docuhealth-primary text-white cursor-pointer"
                onClick={() => {
                  setSoapNoteEntry(false);
                  setSeePatientDetails(true);
                }}
              >
                + close Encounter Note
              </button>
            </div>
          </div>
          <div>
            <SoapNoteEntry
              setSoapNoteEntry={setSoapNoteEntry}
              selectedPatientDetails={selectedPatientDetails}
              source="appointments"
              onBack={() => {
                // Return to the patient-details view this form was opened
                // from, not the appointments list.
                setSoapNoteEntry(false);
                setSeePatientDetails(true);
              }}
              onSubmitted={() => {
                // After creating the note, reopen patient details on the
                // SOAP Notes tab so the doctor sees their new note.
                setSoapNoteEntry(false);
                setSeePatientDetails(true);
                setDetailsTab("Encounter Notes");
              }}
            />
          </div>
        </>
      ) : prescribeMedication ? (
        <>
          <div className="py-2 text-sm flex justify-between items-center">
            <DynamicDate />
          </div>
          <div>
            <PrescribeMedication
              setPrescribeMedication={setPrescribeMedication}
              selectedPatientDetails={selectedPatientDetails}
              setSeePatientDetails={setSeePatientDetails}
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
