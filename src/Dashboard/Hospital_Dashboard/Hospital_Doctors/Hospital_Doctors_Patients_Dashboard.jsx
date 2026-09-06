import React, { useState } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import TabComponent from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Patient_Mgt_Dashboard/TabComponent";
import getTabs from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Patient_Mgt_Dashboard/TabDetails";
import AdvanceCheckUp from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Patient_Mgt_Dashboard/AdvanceCheckUp";
import OtherMedicalServicesFab from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments_Dashboard/components/OtherMedicalServicesFab";
import TransferToAnotherWard from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Patient_Mgt_Dashboard/TransferToAnotherWard";
import InpatientDischargeSummary from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Patient_Mgt_Dashboard/InpatientDischargeSummary";
import SoapNoteEntry from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments_Dashboard/components/SoapNoteEntry";
import PrescribeMedication from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments_Dashboard/components/PrescribeMedication";
import PatientInfo from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments_Dashboard/components/PatientInfo";
import RequestAdmission from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments_Dashboard/components/RequestAdmission";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useContext } from "react";
import { DoctorsAdmittedPatientMGTContext } from "../../../context/HospitalContext/Doctors/DoctorsAdmittedPatientMGTContext";

const Hospital_Doctors_Patients_Dashboard = () => {
  const [advanceCheckUp, setAdvanceCheckUp] = useState(false);
  const [advanceCheckUpSource, setAdvanceCheckUpSource] = useState("inpatient");

  const [selected, setSelected] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { setTab } = useContext(DoctorsAdmittedPatientMGTContext);

  useEffect(() => {
    if (location.state?.openOutpatient) {
      setAdvanceCheckUp(true);
      setSelected(location.state.openOutpatient);
      setAdvanceCheckUpSource("outpatient");
      setTab("outpatient");

      // Clear the state so it doesn't re-trigger on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, setTab]);

  const [prescribeMedication, setPrescribeMedication] = useState(false);
  const [transferRequest, setTransferRequest] = useState(false);
  const [requestAdmission, setRequestAdmission] = useState(false);

  const [soapNoteEntry, setSoapNoteEntry] = useState(false);

  const [dischargePatient, setDischargePatient] = useState(false);
  const [selectedDischargePatient, setSelectedDischargePatient] =
    useState(null);

  // "tabs" | "discharge-summary" | "soap-history" — which view a discharged
  // patient's details page is showing. Reset whenever a different patient
  // is opened so it doesn't carry over between patients.
  const [dischargedView, setDischargedView] = useState("tabs");

  // Tab title the outpatient details view should open on. Set to "SOAP Notes"
  // right after a SOAP note is created so the doctor lands on their new note;
  // cleared whenever a different patient is opened.
  const [outpatientDetailsTab, setOutpatientDetailsTab] = useState(null);

  useEffect(() => {
    setDischargedView("tabs");
    setOutpatientDetailsTab(null);
  }, [selected]);

  return (
    <>
      {dischargePatient ? (
        <>
          <div className="py-2 text-sm flex justify-between items-center">
            <DynamicDate />
          </div>
          <InpatientDischargeSummary
            selectedDischargePatient={selectedDischargePatient}
            setDischargePatient={setDischargePatient}
          />
        </>
      ) : advanceCheckUp ? (
        <>
          <div className="py-2 text-sm flex flex-col lg:flex-row justify-between items-start gap-3 lg:gap-0 lg:items-center">
            <DynamicDate />
            {advanceCheckUpSource === "discharged" ? (
              <div className="flex flex-col lg:flex-row items-center gap-2 w-full lg:w-auto">
                <button
                  className="py-2.5 px-10 rounded-full text-docuhealth-primary border border-docuhealth-primary cursor-pointer w-full lg:w-auto"
                  onClick={() => setDischargedView("discharge-summary")}
                >
                  View discharge summary
                </button>
                <button
                  className="py-2.5 px-10 rounded-full text-docuhealth-primary border border-docuhealth-primary cursor-pointer w-full lg:w-auto"
                  onClick={() => setDischargedView("soap-history")}
                >
                  View soap note history
                </button>
              </div>
            ) : (
              !selected.discharge_date && (
                <div className="flex flex-col lg:flex-row items-center gap-2 w-full lg:w-auto">
                  {advanceCheckUpSource === "outpatient" ? (
                    <>
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
                          setAdvanceCheckUp(false);
                        }}
                      >
                        Add new SOAP Note
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="py-2.5 px-10 rounded-full text-docuhealth-primary border border-docuhealth-primary cursor-pointer w-full lg:w-auto"
                        onClick={() => {
                          setTransferRequest(true);
                        }}
                      >
                        Transfer to another ward
                      </button>
                      {selected?.status === "awaiting_nurse_discharge" ? (
                        <button
                          type="button"
                          disabled
                          title="A doctor discharge has already been recorded. A nurse will complete the discharge and free the bed."
                          className="py-2.5 px-10 rounded-full bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed w-full lg:w-auto"
                        >
                          Awaiting nurse discharge
                        </button>
                      ) : (
                        <button
                          className="py-2.5 px-10 rounded-full bg-docuhealth-primary border border-docuhealth-primary text-white cursor-pointer w-full lg:w-auto"
                          onClick={() => {
                            setDischargePatient(true);
                            setSelectedDischargePatient(selected);
                            //   setSeePatientDetails(false);
                          }}
                        >
                          Discharge Patient
                        </button>
                      )}
                    </>
                  )}
                </div>
              )
            )}
          </div>
          {!selected.discharge_date && (
            <OtherMedicalServicesFab
              selectedPatientDetails={selected}
              // Care-task quick-services need a real admission sqid, which
              // only exists when this is the inpatient list — the
              // outpatient list's `selected` is a check-in/appointment,
              // not an admission.
              admissionSqid={
                advanceCheckUpSource === "outpatient" ? null : selected?.sqid
              }
              onOrderPharmacy={() => {
                setPrescribeMedication(true);
                setAdvanceCheckUp(false);
              }}
            />
          )}
          <div className="text-sm">
            {advanceCheckUpSource === "outpatient" ? (
              <PatientInfo
                setSeePatientDetails={setAdvanceCheckUp}
                selectedPatientDetails={selected}
                isOutpatient={true}
                initialTabTitle={outpatientDetailsTab}
              />
            ) : (
              <AdvanceCheckUp
                selected={selected}
                setAdvanceCheckUp={setAdvanceCheckUp}
                advanceCheckUpSource={advanceCheckUpSource}
                dischargedView={dischargedView}
                setDischargedView={setDischargedView}
              />
            )}
          </div>
          {transferRequest && (
            <TransferToAnotherWard
              setRequestAdmission={setTransferRequest}
              selectedPatientDetails={selected}
            />
          )}

          {requestAdmission && advanceCheckUpSource === "outpatient" && (
            <RequestAdmission
              setRequestAdmission={setRequestAdmission}
              selectedPatientDetails={selected}
            />
          )}
        </>
      ) : soapNoteEntry ? (
        <>
          <SoapNoteEntry
            setSoapNoteEntry={setSoapNoteEntry}
            selectedPatientDetails={selected}
            onBack={() => {
              // Return to the patient-details view this form was opened
              // from, not the patient list.
              setSoapNoteEntry(false);
              setAdvanceCheckUp(true);
            }}
            onSubmitted={() => {
              // After creating the note, reopen the patient-details view
              // on the SOAP Notes tab so the doctor sees their new note.
              setSoapNoteEntry(false);
              setAdvanceCheckUp(true);
              setOutpatientDetailsTab("SOAP Notes");
            }}
          />
        </>
      ) : prescribeMedication ? (
        <>
          <div className="py-2 text-sm flex justify-between items-center">
            <DynamicDate />
          </div>
          <div>
            <PrescribeMedication
              setPrescribeMedication={setPrescribeMedication}
              selectedPatientDetails={selected}
              setSeePatientDetails={setAdvanceCheckUp}
              isFromPatientMgt={true}
            />
          </div>
        </>
      ) : (
        <>
          <div className="py-2 text-sm flex justify-between items-center">
            <DynamicDate />
          </div>
          <div className="bg-white my-5 border rounded-lg p-5">
            <TabComponent
              tabs={getTabs(
                advanceCheckUp,
                setAdvanceCheckUp,
                setSelected,
                setAdvanceCheckUpSource,
                (patient) => {
                  setDischargePatient(true);
                  setSelectedDischargePatient(patient);
                },
              )}
            />
          </div>
        </>
      )}
    </>
  );
};

export default Hospital_Doctors_Patients_Dashboard;
