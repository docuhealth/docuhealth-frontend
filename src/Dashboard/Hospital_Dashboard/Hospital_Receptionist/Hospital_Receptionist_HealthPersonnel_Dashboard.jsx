import React from 'react'
import DynamicDate from '../../../Components/DynamicDate/DynamicDate'
import Health_Personnel_List from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Receptionist/Health_Personnel_Dashboard/Health_Personnel_List'

const Hospital_Receptionist_HealthPersonnel_Dashboard = () => {
  return (
    <>
      <div className='py-2 text-sm flex justify-between items-center'>
        <DynamicDate />
      </div>
      <div className="bg-white my-5 rounded-lg">
        <div className=" border rounded-lg p-4 lg:p-6">
          <h2 className=" mb-4 pb-2 border-b font-medium">
            Health Personnel List
          </h2>
          <div>
            <Health_Personnel_List />
          </div>
        </div>
      </div>
    </>
  )
}

export default Hospital_Receptionist_HealthPersonnel_Dashboard