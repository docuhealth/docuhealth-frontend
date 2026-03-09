import React, { useState } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import TabComponent from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/TabComponent";
import getTabs from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/TabDetails";
import AdvanceCheckUp from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/AdvanceCheckUp";
import UpdateVitals from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Home_Dashboard/components/UpdateVitals";
import CaseNote from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/CaseNote";
import AddNewCaseNote from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/AddNewCaseNote";
import CaseNoteDetail from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/CaseNoteDetail";

const Hospital_Nurses_Patients_Dashboard = () => {
  const [updateVitals, setUpdateVitals] = useState(false);
  const [caseNoteHistory, setCaseNoteHistory] = useState(false);

  const [newCaseNote, setNewCaseNote] = useState(false);
  const [advanceCheckUp, setAdvanceCheckUp] = useState(false);
  const [selected, setSelected] = useState(null);

  const [caseNoteDetail, setCaseNoteDetail] = useState(false);

  return (
    <>
      {advanceCheckUp ? (
        <>
          <div className="py-2 text-sm flex flex-col lg:flex-row justify-between items-start gap-3 lg:gap-0 lg:items-center">
            <DynamicDate />
            <div className="flex flex-col lg:flex-row items-center gap-2 w-full lg:w-auto">
              {updateVitals ? (
                <></>
              ) : caseNoteHistory && !caseNoteDetail ? (
                <>
                  <button
                    className="py-2.5 px-10 w-full lg:w-60 rounded-full bg-[#3E4095] text-white cursor-pointer"
                    onClick={() => {
                      setCaseNoteHistory(false);
                      setNewCaseNote(true);
                    }}
                  >
                    Add New Case Note
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="py-2 px-10 w-full lg:w-60 rounded-full text-[#3E4095] border border-[#3E4095] cursor-pointer"
                    onClick={() => {
                      setCaseNoteHistory(true);
                    }}
                  >
                    Case Note History
                  </button>

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
          ) : caseNoteHistory ? (
            <CaseNote
              selected={selected}
              setCaseNoteHistory={setCaseNoteHistory}
              setCaseNoteDetail={setCaseNoteDetail}
            />
          ) : caseNoteDetail ? (
            <CaseNoteDetail caseNoteDetail={caseNoteDetail} setCaseNoteDetail={setCaseNoteDetail}/>
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
