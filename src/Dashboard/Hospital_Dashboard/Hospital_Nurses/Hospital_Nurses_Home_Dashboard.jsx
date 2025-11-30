import React, { useState, useContext } from 'react'
import { ArrowLeft } from 'lucide-react'
import DynamicDate from '../../../Components/Dynamic Date/DynamicDate'
import template from '../../../assets/img/template.png'
import toast from 'react-hot-toast'
import axiosInstance from '../../../utils/axiosInstance'
import { NursesAppContext } from '../../../context/Hospital Context/Nurses/NursesAppContext'
import AdmissionRequests from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Home Dashboard/components/AdmissionRequests'
import Vitals from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Nurses/Home Dashboard/components/Vitals'

const Hospital_Nurses_Home_Dashboard = () => {

  const { profile, wardInfo } = useContext(NursesAppContext);
  const [admissionRequest, setAdmissionRequest] = useState(false)
  const [vitals, setVitals] = useState(false)



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
        ): vitals ? (
          <>
          <div className='py-2 text-sm '>
            <DynamicDate />
            <div>
              <Vitals setVitals={setVitals} />
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
            <div className='text-sm flex justify-end items-center gap-5 mt-5'>
              <button className='border border-[#3E4095] rounded-full py-2.5 px-12 text-[#3E4095] cursor-pointer'
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
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className=' flex items-center gap-2 bg-blue-50 p-3 rounded-md'>
                  <div className='bg-[#3E4095] p-2 rounded-full'>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 11V20H20V17H4V20H2V4H4V14H12V7H18C20.2091 7 22 8.79086 22 11ZM20 14V11C20 9.89543 19.1046 9 18 9H14V14H20ZM8 11C8.55228 11 9 10.5523 9 10C9 9.44772 8.55228 9 8 9C7.44772 9 7 9.44772 7 10C7 10.5523 7.44772 11 8 11ZM8 13C6.34315 13 5 11.6569 5 10C5 8.34315 6.34315 7 8 7C9.65685 7 11 8.34315 11 10C11 11.6569 9.65685 13 8 13Z" fill="white" />
                    </svg>
  
                  </div>
                  <div>
                    <p className='text-xs'>Bed occupied / Available</p>
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
          </div>
        </>
        )
      }

    </>
  )
}

export default Hospital_Nurses_Home_Dashboard