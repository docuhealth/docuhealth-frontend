import React, { useState } from 'react'
import DynamicDate from '../../../Components/Dynamic Date/DynamicDate'
import TabComponent from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient Mgt Dashboard/TabComponent'
import getTabs from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient Mgt Dashboard/TabDetails'
import AdvanceCheckUp from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Patient Mgt Dashboard/AdvanceCheckUp'

const Hospital_Nurses_Patients_Dashboard = () => {

  const [advanceCheckUp, setAdvanceCheckUp] = useState(false)
  const [selected, setSelected] = useState(null)

  return (
    <>
      {
        advanceCheckUp ? (
          <>
            <div className='py-2 text-sm flex justify-between items-center'>
              <DynamicDate />
            </div>
            <div className="bg-white my-5 border rounded-2xl p-5 text-sm">
                <AdvanceCheckUp selected={selected} setAdvanceCheckUp={setAdvanceCheckUp}/>
              </div>
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