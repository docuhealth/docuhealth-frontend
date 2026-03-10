import React, { useState, useContext } from 'react'
import DynamicDate from '../../../Components/DynamicDate/DynamicDate'
import AppointmentsList from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Appointments_Dashboard/AppointmentsList'
import UpdateVitals from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Home_Dashboard/components/UpdateVitals'
import AddNewCaseNote from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/AddNewCaseNote'

import CaseNote from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/CaseNote'
import CaseNoteDetail from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient_Mgt_Dashboard/CaseNoteDetail'
import { NursesAppointmentsListContext } from '../../../context/HospitalContext/Nurses/NursesAppointmentsListContext'

const Hospital_Nurses_Appointments_Dashboard = () => {

  const [updateVitals, setUpdateVitals] = useState(false)
  const [newCaseNote, setNewCaseNote] = useState(false);
  const [caseNoteHistory, setCaseNoteHistory] = useState(false);
  const [caseNoteDetail, setCaseNoteDetail] = useState(false);
  const [selectedPatientForVitals, setSelectedPatientForVitals] = useState(null)
  const [selectedPatientForCASE, setSelectedPatientForCASE] = useState(null)

  const { appointmentType } = useContext(NursesAppointmentsListContext);

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
          <CaseNoteDetail caseNoteDetail={caseNoteDetail} setCaseNoteDetail={setCaseNoteDetail} />
        ) : (
          <>
            <div className="bg-white my-5  rounded-lg ">
              <div className=" border rounded-lg p-4 lg:p-6">
                <h2 className=" mb-4 pb-2 border-b font-medium capitalize">
                  {appointmentType === 'upcoming' ? 'Upcoming' : 'Past'} Appointments List
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
