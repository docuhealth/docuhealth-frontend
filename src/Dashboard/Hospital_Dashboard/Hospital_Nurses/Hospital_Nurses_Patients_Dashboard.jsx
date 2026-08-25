import React, { useState, useRef, useEffect } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import TabComponent from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/TabComponent";
import getTabs from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/TabDetails";
import AdvanceCheckUp from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/AdvanceCheckUp";
import UpdateVitals from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Home_Dashboard/components/UpdateVitals";
import CaseNote from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/CaseNote";
import AddNewCaseNote from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/AddNewCaseNote";
import CaseNoteDetail from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/CaseNoteDetail";
import VitalSignsHistory from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/VitalSignsHistory";
import SharedSoapNotes from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/SharedSoapNotes";
import SharedSoapNoteDetail from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/SharedSoapNoteDetail";
import AddNursingAdmissionNote from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/AddNursingAdmissionNote";
import SelectHandoverNurseModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/SelectHandoverNurseModal";
import AddHandoverNoteForm from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/AddHandoverNoteForm";
import Modal from "../../../Components/ui/Modal";
import { ChevronDown } from "lucide-react";

const Hospital_Nurses_Patients_Dashboard = () => {
  const [updateVitals, setUpdateVitals] = useState(false);
  const [caseNoteHistory, setCaseNoteHistory] = useState(false);
  const [vitalSignsHistory, setVitalSignsHistory] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isQuickLogDropdownOpen, setIsQuickLogDropdownOpen] = useState(false);
  const quickLogDropdownRef = useRef(null);

  const [newCaseNote, setNewCaseNote] = useState(false);
  const [advanceCheckUp, setAdvanceCheckUp] = useState(false);
  const [selected, setSelected] = useState(null);

  const [caseNoteDetail, setCaseNoteDetail] = useState(false);
  const [sharedSoapNoteHistory, setSharedSoapNoteHistory] = useState(false);
  const [sharedSoapNoteDetail, setSharedSoapNoteDetail] = useState(false);
  const [showAdmissionNote, setShowAdmissionNote] = useState(false);
  
  const [showHandoverNurseModal, setShowHandoverNurseModal] = useState(false);
  const [showHandoverNoteForm, setShowHandoverNoteForm] = useState(false);
  const [selectedHandoverNurse, setSelectedHandoverNurse] = useState(null);
  const [showHandoverSuccessModal, setShowHandoverSuccessModal] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (quickLogDropdownRef.current && !quickLogDropdownRef.current.contains(event.target)) {
        setIsQuickLogDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!advanceCheckUp) {
      setCaseNoteHistory(false);
      setVitalSignsHistory(false);
      setSharedSoapNoteHistory(false);
      setSharedSoapNoteDetail(false);
      setCaseNoteDetail(false);
      setNewCaseNote(false);
      setUpdateVitals(false);
      setShowAdmissionNote(false);
      setShowHandoverNoteForm(false);
    }
  }, [advanceCheckUp]);

  return (
    <>
      {advanceCheckUp ? (
        <>
          <div className="py-2 text-sm flex flex-col lg:flex-row justify-between items-start gap-3 lg:gap-0 lg:items-center">
            <DynamicDate />
            <div className="flex flex-col lg:flex-row items-center gap-2 w-full lg:w-auto">
              {updateVitals ? (
                <></>
              ) : (caseNoteHistory || vitalSignsHistory) && !caseNoteDetail ? (
                <>
                  <button
                    className="py-2.5 px-10 w-full lg:w-60 rounded-full bg-docuhealth-primary text-white cursor-pointer"
                    onClick={() => {
                      setCaseNoteHistory(false);
                      setVitalSignsHistory(false);
                      setSharedSoapNoteHistory(false);
                      setShowAdmissionNote(false);
                      setNewCaseNote(true);
                    }}
                  >
                    Add New Case Note
                  </button>
                </>
              ) : (
                <>
                  <div className="relative w-full lg:w-60" ref={dropdownRef}>
                    <button
                      className="flex items-center justify-center py-2 px-6 w-full rounded-full text-docuhealth-primary border border-docuhealth-primary cursor-pointer gap-1"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span className="">Vital signs</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full mt-2 left-0 w-full bg-white border border-gray-200 rounded  z-10 overflow-hidden p-2 text-sm">
                        <button
                          className="w-full text-left px-3  py-2.5 hover:bg-gray-100  text-gray-700 transition-colors"
                          onClick={() => {
                            setCaseNoteHistory(true);
                            setVitalSignsHistory(false);
                            setSharedSoapNoteHistory(false);
                            setIsDropdownOpen(false);
                          }}
                        >
                          Case note history
                        </button>
                        <button
                          className="w-full text-left px-3  py-2.5 hover:bg-gray-100 text-gray-700 transition-colors"
                          onClick={() => {
                            setVitalSignsHistory(true);
                            setCaseNoteHistory(false);
                            setSharedSoapNoteHistory(false);
                            setIsDropdownOpen(false);
                          }}
                        >
                          Vital signs history
                        </button>
                        <button
                          className="w-full text-left px-3  py-2.5 hover:bg-gray-100 text-gray-700 transition-colors"
                          onClick={() => {
                            setUpdateVitals(true);
                            setVitalSignsHistory(false);
                            setCaseNoteHistory(false);
                            setSharedSoapNoteHistory(false);
                            setIsDropdownOpen(false);
                          }}
                        >
                          Update Vitals
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="relative w-full lg:w-60" ref={quickLogDropdownRef}>
                    <button
                      className="py-2.5 px-10 w-full rounded-full bg-docuhealth-primary text-white cursor-pointer flex justify-center items-center gap-1"
                      onClick={() => setIsQuickLogDropdownOpen(!isQuickLogDropdownOpen)}
                    >
                      <span>Quick log</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isQuickLogDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isQuickLogDropdownOpen && (
                      <div className="absolute top-full mt-2 left-0 w-full bg-white border border-gray-200 rounded z-10 overflow-hidden p-2 text-sm shadow-lg">
                        <button
                          className="w-full text-left px-3 py-2.5 hover:bg-gray-100 text-gray-700 transition-colors"
                          onClick={() => {
                            setIsQuickLogDropdownOpen(false);
                            console.log("Quick log clicked");
                          }}
                        >
                          Quick log
                        </button>
                        <button
                          className="w-full text-left px-3 py-2.5 hover:bg-gray-100 text-gray-700 transition-colors"
                          onClick={() => {
                            setIsQuickLogDropdownOpen(false);
                            setShowHandoverNurseModal(true);
                          }}
                        >
                          Add handover note
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {!showAdmissionNote && (
                    <button
                      className="py-2.5 px-6 w-full lg:w-auto rounded-full bg-docuhealth-primary text-white cursor-pointer flex items-center justify-center gap-2 font-medium transition-colors"
                      onClick={() => {
                        setCaseNoteHistory(false);
                        setVitalSignsHistory(false);
                        setSharedSoapNoteHistory(false);
                        setNewCaseNote(false);
                        setUpdateVitals(false);
                        setShowAdmissionNote(true);
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Add nursing admission note
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          {updateVitals ? (
            <UpdateVitals
              selectedPatient={selected}
              setUpdateVitals={setUpdateVitals}
            />
          ) : vitalSignsHistory ? (
            <VitalSignsHistory
              selected={selected}
              setVitalSignsHistory={setVitalSignsHistory}
            />
          ) : sharedSoapNoteDetail ? (
            <SharedSoapNoteDetail
              sharedSoapNoteDetail={sharedSoapNoteDetail}
              setSharedSoapNoteDetail={setSharedSoapNoteDetail}
            />
          ) : sharedSoapNoteHistory ? (
            <SharedSoapNotes
              selected={selected}
              setSharedSoapNoteHistory={setSharedSoapNoteHistory}
              setSharedSoapNoteDetail={setSharedSoapNoteDetail}
            />
          ) : caseNoteDetail ? (
            <CaseNoteDetail caseNoteDetail={caseNoteDetail} setCaseNoteDetail={setCaseNoteDetail} />
          ) : caseNoteHistory ? (
            <CaseNote
              selected={selected}
              setCaseNoteHistory={setCaseNoteHistory}
              setCaseNoteDetail={setCaseNoteDetail}
            />
          ) : newCaseNote ? (
            <>
              <AddNewCaseNote
                selected={selected}
                setNewCaseNote={setNewCaseNote}
              />
            </>
          ) : showAdmissionNote ? (
            <AddNursingAdmissionNote
              selected={selected}
              setShowAdmissionNote={setShowAdmissionNote}
            />
          ) : showHandoverNoteForm ? (
            <AddHandoverNoteForm
              handoverNurseName={selectedHandoverNurse ? `${selectedHandoverNurse.firstname} ${selectedHandoverNurse.lastname}` : ""}
              onBack={() => setShowHandoverNoteForm(false)}
              onUpload={(noteData) => {
                console.log("Uploaded note:", noteData);
                setShowHandoverNoteForm(false);
                setShowHandoverSuccessModal(true);
              }}
            />
          ) : (
            <div className="bg-white my-5 border rounded-lg p-5 text-sm">
              <AdvanceCheckUp
                selected={selected}
                setAdvanceCheckUp={setAdvanceCheckUp}
                setSharedSoapNoteDetail={setSharedSoapNoteDetail}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="py-2 text-sm flex justify-between items-center">
            <DynamicDate />
          </div>
          <div className="bg-white my-5 border rounded-lg p-5">
            <TabComponent
              tabs={getTabs(advanceCheckUp, setAdvanceCheckUp, setSelected)}
            />
          </div>
        </>
      )}

      {showHandoverNurseModal && (
        <SelectHandoverNurseModal
          onClose={() => setShowHandoverNurseModal(false)}
          onProceed={(nurse) => {
            setSelectedHandoverNurse(nurse);
            setShowHandoverNurseModal(false);
            
            // Hide other forms
            setCaseNoteHistory(false);
            setVitalSignsHistory(false);
            setSharedSoapNoteHistory(false);
            setNewCaseNote(false);
            setUpdateVitals(false);
            setShowAdmissionNote(false);
            
            // Show our new form
            setShowHandoverNoteForm(true);
          }}
        />
      )}

      {showHandoverSuccessModal && (
        <Modal isOpen={showHandoverSuccessModal} onClose={() => setShowHandoverSuccessModal(false)}>
          <div className="py-3 text-center max-w-sm mx-auto flex flex-col items-center">
           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
            <h3 className="text-[17px] font-semibold text-gray-900 mb-8 leading-snug">
              You have successfully uploaded your handover note for this patient!
            </h3>
            <button
              onClick={() => setShowHandoverSuccessModal(false)}
              className="mt-2 w-full py-3 px-4 bg-docuhealth-primary  text-white font-medium rounded-full transition-colors"
            >
              Go back to patient info
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Hospital_Nurses_Patients_Dashboard;
