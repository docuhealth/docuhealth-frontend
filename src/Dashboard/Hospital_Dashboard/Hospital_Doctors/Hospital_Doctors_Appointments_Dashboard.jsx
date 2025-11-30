import React, { useState } from 'react'
import DynamicDate from '../../../Components/Dynamic Date/DynamicDate'
import AppointmentsList from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments Dashboard/AppointmentsList";
import PatientInfo from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments Dashboard/components/PatientInfo';
import AfterVisitSummary from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments Dashboard/components/AfterVisitSummary';

const Hospital_Doctors_Appointments_Dashboard = () => {

    const [seePatientDetails, setSeePatientDetails] = useState(false)
    const [afterVisitSummary, setAfterVisitSummary] = useState(false)
    const [selectedPatientDetails, setSelectedPatientDetails] = useState(null)



    return (
        <>
            {
                seePatientDetails ? (
                    <>
                        <div className='py-2 text-sm flex justify-between items-center'>
                            <DynamicDate />
                            <div className='flex items-center gap-3'>
                                <button className='py-2.5 px-10 rounded-full text-[#3E4095] border border-[#3E4095] cursor-pointer '>
                                    Other medical services
                                </button>
                                <button className='py-2.5 px-10 rounded-full text-[#3E4095] border border-[#3E4095] cursor-pointer'>
                                    Request for admission
                                </button>
                                <button className='py-2.5 px-10 rounded-full bg-[#3E4095] text-white cursor-pointer' onClick={()=> {
                                    console.log('hi')
                                    setAfterVisitSummary(true)
                                    setSeePatientDetails(false)
                                }}>
                                    + Add after-visit summary
                                </button>
                            </div>
                        </div>
                        <div>
                            <PatientInfo  setSeePatientDetails ={setSeePatientDetails} selectedPatientDetails={selectedPatientDetails}/>
                        </div>
                    </>

                ) : afterVisitSummary ? (
                    <>
                    <div className='py-2 text-sm flex justify-between items-center'>
                            <DynamicDate />
                            <div className='flex items-center gap-3'>
                                <button className='py-2.5 px-10 rounded-full text-[#3E4095] border border-[#3E4095] cursor-pointer '>
                                    Other medical services
                                </button>
                                <button className='py-2.5 px-10 rounded-full text-[#3E4095] border border-[#3E4095] cursor-pointer'>
                                    Request for admission
                                </button>
                                <button className='py-2.5 px-10 rounded-full bg-[#3E4095] text-white cursor-pointer' onClick={()=> {
                                    setAfterVisitSummary(false)
                                }}>
                                    + close after-visit summary
                                </button>
                            </div>
                        </div>
                        <div>
                                <AfterVisitSummary  setAfterVisitSummary={setAfterVisitSummary}/>
                        </div>
                    </>
                ) :(
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
                                    <AppointmentsList setSeePatientDetails={setSeePatientDetails} setSelectedPatientDetails={setSelectedPatientDetails} />
                                </div>
                            </div>
                        </div>
                    </>
                )
            }

        </>
    )
}

export default Hospital_Doctors_Appointments_Dashboard;                                                             