import React, { useState } from 'react'
import DynamicDate from '../../../Components/Dynamic Date/DynamicDate'
import TabComponent from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient Mgt Dashboard/TabComponent'
import getTabs from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient Mgt Dashboard/TabDetails'
import AdvanceCheckUp from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient Mgt Dashboard/AdvanceCheckUp'
import UpdateVitals from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Home Dashboard/components/UpdateVitals'
import CaseNote from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient Mgt Dashboard/CaseNote'
import AddNewCaseNote from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient Mgt Dashboard/AddNewCaseNote'

const Hospital_Nurses_Patients_Dashboard = () => {

  const [updateVitals, setUpdateVitals] = useState(false)
  const [caseNoteHistory, setCaseNoteHistory] = useState(false)

  const [newCaseNote, setNewCaseNote] = useState(false)
  const [advanceCheckUp, setAdvanceCheckUp] = useState(false)
  const [selected, setSelected] = useState(null)

  return (

    <>
      {
        advanceCheckUp ? (
          <>
            <div className='py-2 text-sm flex flex-col lg:flex-row justify-between items-start gap-3 lg:gap-0 lg:items-center'>
              <DynamicDate />
              <div className='flex flex-col lg:flex-row items-center gap-2 w-full lg:w-auto'>
                {updateVitals ? (
                  <>
                  </>
                ) : caseNoteHistory ? (
                  <>
                    <button
                      className="py-2.5 px-10 w-full lg:w-60 rounded-full bg-[#3E4095] text-white cursor-pointer"
                      onClick={() => {
                        setCaseNoteHistory(false)
                        setNewCaseNote(true)
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
                        setCaseNoteHistory(true)
                      }}
                    >
                      Case Note History
                    </button>

                    <button
                      className="py-2.5 px-10 w-full lg:w-60 rounded-full bg-[#3E4095] text-white cursor-pointer"
                      onClick={() => {
                        setUpdateVitals(true)
                      }}
                    >
                      Update Vitals
                    </button>

                  </>
                )}

              </div>
            </div>
            {
              updateVitals ? (
                <UpdateVitals
                  selectedPatient={selected}
                  setUpdateVitals={setUpdateVitals}
                />

              ) : caseNoteHistory ? (
                <CaseNote setCaseNoteHistory={setCaseNoteHistory} />
              ) : newCaseNote ? (
                <>
                <AddNewCaseNote setNewCaseNote={setNewCaseNote}/>
                </>
              ) :(
                <div className="bg-white my-5 border rounded-2xl p-5 text-sm">
                  <AdvanceCheckUp selected={selected} setAdvanceCheckUp={setAdvanceCheckUp} />
                </div>
              )
            }

          </>
        ) : (
          <>
            <div className='py-2 text-sm flex justify-between items-center'>
              <DynamicDate />
            </div>
            <div className="bg-white my-5 border rounded-2xl p-5">
              <TabComponent tabs={getTabs(advanceCheckUp, setAdvanceCheckUp, setSelected)} />
            </div>
          </>
        )
      }

    </>
  )
}

export default Hospital_Nurses_Patients_Dashboard