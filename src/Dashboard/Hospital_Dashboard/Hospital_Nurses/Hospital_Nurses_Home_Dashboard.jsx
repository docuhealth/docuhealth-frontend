import React, { useState, useContext } from 'react'
import {Link} from 'react-router-dom'
import DynamicDate from '../../../Components/Dynamic Date/DynamicDate'
import template from '../../../assets/img/template.png'
import { NursesAppContext } from '../../../context/Hospital Context/Nurses/NursesAppContext'
import AdmissionRequests from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Home Dashboard/components/AdmissionRequests'
import Vitals from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Home Dashboard/components/Vitals'
import PatientVitalsDetails from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Home Dashboard/components/PatientVitalsDetails'
import UpdateVitals from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Home Dashboard/components/UpdateVitals'
import PatientsAssignedToMyWard from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Home Dashboard/PatientsAssignedToMyWard'
import ProcessVitals from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Home Dashboard/components/ProcessVitals'

const Hospital_Nurses_Home_Dashboard = () => {

  const { profile, wardInfo } = useContext(NursesAppContext);
  const [admissionRequest, setAdmissionRequest] = useState(false)
  const [vitals, setVitals] = useState(false)
  const [updateVitals, setUpdateVitals] = useState(false)

  const [processVitals, setProcessVitals] = useState(false)

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [checkAdditionalNote, setCheckAdditionalNote] = useState(false)
  



  return (
    <>
      {
        admissionRequest ? (
          <>
            <div className='py-2 text-sm '>
              <DynamicDate />
              <div>
                <AdmissionRequests setAdmissionRequest={setAdmissionRequest} />
              </div>

            </div>
          </>
        ) : vitals ? (
          <>
            <div
              className={`py-2 text-sm ${selectedPatient ? "flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2" : ""
                }`}
            >
              {/* LEFT SIDE: DATE */}
              <DynamicDate />

              {/* RIGHT SIDE: ONLY SHOW WHEN A PATIENT IS SELECTED */}
              {selectedPatient && (
                <div className="grid grid-cols-1 w-full lg:w-auto lg:flex lg:items-center gap-3">
                  <button
                    className="py-2 px-10 lg:w-60 rounded-full text-[#3E4095] border border-[#3E4095] cursor-pointer"
                    onClick={() => setCheckAdditionalNote(true)}
                  >
                    Check additional note
                  </button>

                  <button
                    className="py-2.5 px-10 lg:w-60 rounded-full bg-[#3E4095] text-white cursor-pointer"
                    onClick={() => {
                      setVitals(false)
                      setProcessVitals(true)
                    }}
                  >
                    Process Vitals
                  </button>
                </div>

              )}
            </div>

            {/* CONTENT BELOW */}
            <div>
              {selectedPatient ? (
                <>
                  <PatientVitalsDetails selectedPatient={selectedPatient} setSelectedPatient={setSelectedPatient} />

                  {checkAdditionalNote && (
                    <>
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-sm">
                        <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full relative text-sm mx-3">
                          <div className='border rounded-md p-4 text-sm'>
                            <div className='flex justify-end'>
                              <button
                                onClick={() => setCheckAdditionalNote(false)}
                                className="text-gray-500 hover:text-black  "
                              >
                                <i className="bx bx-x text-2xl cursor-pointer"></i>
                              </button>
                            </div>
                            <div className="flex flex-col justify-center items-center">
                              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20.0007 36.6654C10.7959 36.6654 3.33398 29.2034 3.33398 19.9987C3.33398 10.7939 10.7959 3.33203 20.0007 3.33203C29.2053 3.33203 36.6673 10.7939 36.6673 19.9987C36.6673 29.2034 29.2053 36.6654 20.0007 36.6654ZM20.0007 33.332C27.3645 33.332 33.334 27.3625 33.334 19.9987C33.334 12.6349 27.3645 6.66536 20.0007 6.66536C12.6369 6.66536 6.66732 12.6349 6.66732 19.9987C6.66732 27.3625 12.6369 33.332 20.0007 33.332ZM21.6673 17.4987V24.9987H23.334V28.332H16.6673V24.9987H18.334V20.832H16.6673V17.4987H21.6673ZM22.5007 13.332C22.5007 14.7127 21.3813 15.832 20.0007 15.832C18.62 15.832 17.5007 14.7127 17.5007 13.332C17.5007 11.9513 18.62 10.832 20.0007 10.832C21.3813 10.832 22.5007 11.9513 22.5007 13.332Z" fill="#1B2B40" />
                              </svg>
                              <p className="pt-0.5 font-medium">Additional Info</p>



                            </div>
                            <div className='border rounded-lg w-full  min-h-[100px] p-3 text-[12px] outline-none mt-3
                            '>
                              {selectedPatient.note}
                            </div>
                            <button className='w-full rounded-full text-center mt-3 py-2 bg-[#3E4095] cursor-pointer text-white ' onClick={() => setCheckAdditionalNote(false)}>
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Vitals setVitals={setVitals} setSelectedPatient={setSelectedPatient} />
              )}
            </div>
          </>


        ) : processVitals ? (
          <>
             <div className='py-2 text-sm '>
              <DynamicDate />
              <div>
                <ProcessVitals selectedPatient={selectedPatient}  setProcessVitals={setProcessVitals}/>
              </div>

            </div>
          </>
        ) : (
          <>
            <div className='py-2'>
              <DynamicDate />
              <div className='pt-4'>
                <img src={template} alt='img' />
              </div>
              <div className='text-sm grid grid-cols-1 lg:flex lg:justify-end lg:items-center gap-2 lg:gap-5 mt-5'>
                <button className='border border-[#3E4095] rounded-full py-2 px-12 text-[#3E4095] cursor-pointer'
                  onClick={() => {
                    setAdmissionRequest(true)
                  }}
                >
                  Admission Request
                </button>
                <button className='bg-[#3E4095] text-white cursor-pointer py-2.5 px-12 rounded-full' onClick={() => {
                  setVitals(true)
                }}>
                  Assigned for vitals
                </button>
              </div>
              <div className='bg-white rounded-xl border mt-5 p-5 text-sm text-gray-700'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                  <div className=' flex items-center gap-2 bg-blue-50 p-3 rounded-md'>
                    <div className='bg-[#3E4095] p-2 rounded-full'>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 11V20H20V17H4V20H2V4H4V14H12V7H18C20.2091 7 22 8.79086 22 11ZM20 14V11C20 9.89543 19.1046 9 18 9H14V14H20ZM8 11C8.55228 11 9 10.5523 9 10C9 9.44772 8.55228 9 8 9C7.44772 9 7 9.44772 7 10C7 10.5523 7.44772 11 8 11ZM8 13C6.34315 13 5 11.6569 5 10C5 8.34315 6.34315 7 8 7C9.65685 7 11 8.34315 11 10C11 11.6569 9.65685 13 8 13Z" fill="white" />
                      </svg>

                    </div>
                    <div>
                      <p className='text-xs'>Beds Available / Total Beds</p>
                      <p className="text-[#3E4095] font-semibold text-lg">
                        {(wardInfo?.available_beds ?? "NIL")} / {(wardInfo?.total_beds ?? "NIL")} Beds
                      </p>

                    </div>
                  </div>
                  <div className=' flex items-center gap-2 bg-purple-100 p-3 rounded-md'>
                    <div className='bg-[#9000FF] p-2 rounded-full'>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 11V20H20V17H4V20H2V4H4V14H12V7H18C20.2091 7 22 8.79086 22 11ZM20 14V11C20 9.89543 19.1046 9 18 9H14V14H20ZM8 11C8.55228 11 9 10.5523 9 10C9 9.44772 8.55228 9 8 9C7.44772 9 7 9.44772 7 10C7 10.5523 7.44772 11 8 11ZM8 13C6.34315 13 5 11.6569 5 10C5 8.34315 6.34315 7 8 7C9.65685 7 11 8.34315 11 10C11 11.6569 9.65685 13 8 13Z" fill="white" />
                      </svg>

                    </div>
                    <div>
                      <p className='text-xs'>My ward</p>
                      <p className='text-[#9000FF] font-semibold text-lg'>  {profile?.ward_info?.name
                        ? profile.ward_info.name.charAt(0).toUpperCase() + profile.ward_info.name.slice(1)
                        : "NIL"}{" "}
                        Ward</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white my-5 border rounded-2xl p-5">
                <div className=" border rounded-lg p-5 ">
                  <div className='flex justify-between items-center border-b pb-2 mb-4'>
                  <h2 className="font-medium">
                    Patients in my ward
                  </h2>
                  <Link to ='/hospital-nurses-patients-dashboard'>
                  <p className='text-sm underline text-[#3E4095]'>view all </p>
                  
                  </Link>
                  </div>
                  <div className=''>
                  <PatientsAssignedToMyWard />
                </div>
                </div>
                
              </div>
            </div>
          </>
        )
      }

    </>
  )
}

export default Hospital_Nurses_Home_Dashboard