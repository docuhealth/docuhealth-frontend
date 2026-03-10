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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
                    className="py-2.5 px-10 w-full lg:w-60 rounded-full bg-[#3E4095] text-white cursor-pointer"
                    onClick={() => {
                      setCaseNoteHistory(false);
                      setVitalSignsHistory(false);
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
                      className="flex items-center justify-center py-2 px-6 w-full rounded-full text-[#3E4095] border border-[#3E4095] cursor-pointer gap-1"
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
                            setIsDropdownOpen(false);
                          }}
                        >
                          Vital signs history
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    className="py-2.5 px-10 w-full lg:w-60 rounded-full bg-[#3E4095] text-white cursor-pointer"
                    onClick={() => {
                      setUpdateVitals(true);
                    }}
                  >
                    Update Vitals
                  </button>
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
          ) : caseNoteHistory ? (
            <CaseNote
              selected={selected}
              setCaseNoteHistory={setCaseNoteHistory}
              setCaseNoteDetail={setCaseNoteDetail}
            />
          ) : caseNoteDetail ? (
            <CaseNoteDetail caseNoteDetail={caseNoteDetail} setCaseNoteDetail={setCaseNoteDetail} />
          ) : newCaseNote ? (
            <>
              <AddNewCaseNote
                selected={selected}
                setNewCaseNote={setNewCaseNote}
              />
            </>
          ) : (
            <div className="bg-white my-5 border rounded-lg p-5 text-sm">
              <AdvanceCheckUp
                selected={selected}
                setAdvanceCheckUp={setAdvanceCheckUp}
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
