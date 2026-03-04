import React, { useState } from 'react'
import DynamicDate from '../../../Components/Dynamic Date/DynamicDate'
import AppointmentsList from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Appointments Dashboard/AppointmentsList'
import UpdateVitals from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Home Dashboard/components/UpdateVitals'
import AddNewCaseNote from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient Mgt Dashboard/AddNewCaseNote'

import CaseNote from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient Mgt Dashboard/CaseNote'
import CaseNoteDetail from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient Mgt Dashboard/CaseNoteDetail'

const Hospital_Nurses_Appointments_Dashboard = () => {

  const [updateVitals, setUpdateVitals] = useState(false)
  const [newCaseNote, setNewCaseNote] = useState(false);
  const [caseNoteHistory, setCaseNoteHistory] = useState(false);
  const [caseNoteDetail, setCaseNoteDetail] = useState(false);
  const [selectedPatientForVitals, setSelectedPatientForVitals] = useState(null)
  const [selectedPatientForCASE, setSelectedPatientForCASE] = useState(null)



  return (
    <>
      <div className='py-2 text-sm flex justify-between items-center'>
        <DynamicDate />
      </div>
      {
        updateVitals ? (
          <>
            <UpdateVitals selectedPatient={selectedPatientForVitals} setUpdateVitals={setUpdateVitals} />
          </>
        ) : newCaseNote ? (
          <>
            <AddNewCaseNote
              selected={selectedPatientForCASE}
              setNewCaseNote={setNewCaseNote}
            />
          </>
        ) : caseNoteHistory ? (
            <CaseNote
              selected={selectedPatientForCASE}
              setCaseNoteHistory={setCaseNoteHistory}
              setCaseNoteDetail={setCaseNoteDetail}
            />
          ) : caseNoteDetail ? (
            <CaseNoteDetail caseNoteDetail={caseNoteDetail} setCaseNoteDetail={setCaseNoteDetail}/>
          ) : (
          <>
            <div className="bg-white my-5  rounded-lg ">
              <div className=" border rounded-lg p-4 lg:p-6">
                <h2 className=" mb-4 pb-2 border-b font-medium">
                  Upcoming Appointments List
                </h2>
                <div>
                  <AppointmentsList setNewCaseNote={setNewCaseNote} setCaseNoteHistory={setCaseNoteHistory} setUpdateVitals={setUpdateVitals} setSelectedPatientForVitals={setSelectedPatientForVitals} setSelectedPatientForCASE={setSelectedPatientForCASE} />
                </div>
              </div>
            </div>
          </>
        )
      }

    </>
  )
}

export default Hospital_Nurses_Appointments_Dashboard