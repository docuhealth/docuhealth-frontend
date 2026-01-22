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
          <div className="bg-white my-5  rounded-lg ">
        <div className=" border rounded-lg p-4 lg:p-6">
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