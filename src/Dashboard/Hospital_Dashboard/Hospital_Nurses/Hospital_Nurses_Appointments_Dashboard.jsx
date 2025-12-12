import React, { useState } from 'react'
import DynamicDate from '../../../Components/Dynamic Date/DynamicDate'
import AppointmentsList from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Appointments Dashboard/AppointmentsList'
import UpdateVitals from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Home Dashboard/components/UpdateVitals'

const Hospital_Nurses_Appointments_Dashboard = () => {

  const [updateVitals, setUpdateVitals] = useState(false)
  const [selectedPatientForVitals, setSelectedPatientForVitals] = useState(null)

  return (
    <>
      <div className='py-2 text-sm flex justify-between items-center'>
        <DynamicDate />
      </div>
      {
        updateVitals ? (
          <>
          <UpdateVitals selectedPatient={selectedPatientForVitals}  setUpdateVitals={setUpdateVitals}/>
          </>
        ) : (
          <>
            <div className="bg-white my-5 border rounded-2xl p-5">
              <div className=" border rounded-lg p-5">
                <h2 className=" mb-4 pb-2 border-b font-medium">
                  Upcoming Appointments List
                </h2>
                <div>
                  <AppointmentsList setUpdateVitals={setUpdateVitals} setSelectedPatientForVitals={setSelectedPatientForVitals}/>
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