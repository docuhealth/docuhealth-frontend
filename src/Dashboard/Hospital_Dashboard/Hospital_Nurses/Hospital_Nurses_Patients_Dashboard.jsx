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
import { ChevronDown } from "lucide-react";

const Hospital_Nurses_Patients_Dashboard = () => {
  const [updateVitals, setUpdateVitals] = useState(false);
  const [caseNoteHistory, setCaseNoteHistory] = useState(false);
  const [vitalSignsHistory, setVitalSignsHistory] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [newCaseNote, setNewCaseNote] = useState(false);
  const [advanceCheckUp, setAdvanceCheckUp] = useState(false);
  const [selected, setSelected] = useState(null);

  const [caseNoteDetail, setCaseNoteDetail] = useState(false);
  const [sharedSoapNoteHistory, setSharedSoapNoteHistory] = useState(false);
  const [sharedSoapNoteDetail, setSharedSoapNoteDetail] = useState(false);
  const [showAdmissionNote, setShowAdmissionNote] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
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

                  <button
                    className="py-2.5 px-10 w-full lg:w-60 rounded-full bg-docuhealth-primary text-white cursor-pointer flex justify-center items-center"
                    onClick={() => {
                      console.log("Quick log clicked");
                    }}
                  >
                    Quick log
                  </button>
                  
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
    </>
  );
};

export default Hospital_Nurses_Patients_Dashboard;
