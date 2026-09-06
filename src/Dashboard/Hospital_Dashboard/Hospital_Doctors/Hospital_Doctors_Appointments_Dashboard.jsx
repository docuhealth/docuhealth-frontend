import React, { useState, useContext, useEffect } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import AppointmentsList from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments_Dashboard/AppointmentsList";
import PatientInfo from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments_Dashboard/components/PatientInfo";
import SoapNoteEntry from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments_Dashboard/components/SoapNoteEntry";
import RequestAdmission from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments_Dashboard/components/RequestAdmission";
import OtherMedicalServicesFab from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments_Dashboard/components/OtherMedicalServicesFab";
import PrescribeMedication from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments_Dashboard/components/PrescribeMedication";
import { DoctorAppointmentsListContext } from "../../../context/HospitalContext/Doctors/DoctorAppointmentsListContext";

const Hospital_Doctors_Appointments_Dashboard = () => {
  const [seePatientDetails, setSeePatientDetails] = useState(false);
  const [afterVisitSummary, setAfterVisitSummary] = useState(false);
  const [soapNoteEntry, setSoapNoteEntry] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);

  // Tab title the patient-details view should open on. Set to "SOAP Notes"
  // right after a SOAP note is created; cleared when a different patient is
  // selected so it doesn't carry over.
  const [detailsTab, setDetailsTab] = useState(null);
  useEffect(() => {
    setDetailsTab(null);
  }, [selectedPatientDetails]);

  const [prescribeMedication, setPrescribeMedication] = useState(false);

  const [requestAdmission, setRequestAdmission] = useState(false);

  const { appointmentType } = useContext(DoctorAppointmentsListContext);

  return (
    <>
      {seePatientDetails ? (
        <>
          <div className="py-2 text-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
            <DynamicDate />
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <button
                className="py-2.5 px-10 rounded-full text-docuhealth-primary border border-docuhealth-primary cursor-pointer w-full lg:w-auto"
                onClick={() => {
                  setRequestAdmission(true);
                }}
              >
                Request for admission
              </button>
              <button
                className="py-2.5 px-10 rounded-full bg-docuhealth-primary border border-docuhealth-primary text-white cursor-pointer w-full lg:w-auto"
                onClick={() => {
                  setSoapNoteEntry(true);
                  setSeePatientDetails(false);
                }}
              >
                Add new SOAP Note
              </button>
            </div>
          </div>
          <div className="my-5">
            <PatientInfo
              setSeePatientDetails={setSeePatientDetails}
              selectedPatientDetails={selectedPatientDetails}
              initialTabTitle={detailsTab}
            />
          </div>
          <OtherMedicalServicesFab
            selectedPatientDetails={selectedPatientDetails}
            // This list is appointments, never admissions, so there's no
            // admission sqid to scope a care task to — admission-only
            // quick-services stay disabled here.
            admissionSqid={null}
            onOrderPharmacy={() => {
              setPrescribeMedication(true);
              setSeePatientDetails(false);
            }}
          />
          {requestAdmission && (
            <RequestAdmission
              setRequestAdmission={setRequestAdmission}
              selectedPatientDetails={selectedPatientDetails}
            />
          )}
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
                + close SOAP Note
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
                setDetailsTab("SOAP Notes");
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
