import React from 'react'
import DynamicDate from '../../../Components/DynamicDate/DynamicDate'
import TabComponent from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Patient_Mgt_Dashboard/TabComponent'
import tabs from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Patient_Mgt_Dashboard/TabDetails'


const Hospital_Admin_Patients_Dashboard = () => {
    return (
        <>
            <div className='py-2 text-sm flex justify-between items-center'>
                <DynamicDate />
            </div>
            <div className="bg-white my-5 border rounded-lg p-5">
                <TabComponent tabs={tabs} />
            </div>
        </>
    )
}
export default Hospital_Admin_Patients_Dashboard;