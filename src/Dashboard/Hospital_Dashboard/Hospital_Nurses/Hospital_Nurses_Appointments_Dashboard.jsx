import React from 'react'
import DynamicDate from '../../../Components/Dynamic Date/DynamicDate'
import AppointmentsList from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Appointments Dashboard/AppointmentsList'

const Hospital_Nurses_Appointments_Dashboard = () => {
  return (
    <>
      <div className='py-2 text-sm flex justify-between items-center'>
        <DynamicDate />
      </div>
      <div className="bg-white my-5 border rounded-2xl p-5">
        <div className=" border rounded-lg p-5">
          <h2 className=" mb-4 pb-2 border-b font-medium">
            Upcoming Appointments List
          </h2>
          <div>
            <AppointmentsList />
          </div>
        </div>
      </div>
    </>
  )
}

export default Hospital_Nurses_Appointments_Dashboard