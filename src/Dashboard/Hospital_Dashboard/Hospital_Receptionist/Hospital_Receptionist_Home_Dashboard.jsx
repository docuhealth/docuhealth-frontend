import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import DynamicDate from '../../../Components/Dynamic Date/DynamicDate'
import template from '../../../assets/img/template.png'
import OnboardNewPatient from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Receptionist/Home Dashboard/components/OnboardNewPatient'
import toast from 'react-hot-toast'
import axiosInstance from '../../../utils/axiosInstance'
import BookAppointment from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Receptionist/Home Dashboard/components/BookAppointment'

const Hospital_Receptionist_Home_Dashboard = () => {
  const [newPatient, setNewPatient] = useState(false)
  const [checkHIN, setCheckHIN] = useState(false)
  const [patientHIN, setPatientHIN] = useState('')
  const [loading, setLoading] = useState(false)
  const [patientDetails, setPatientDetails] = useState([])
  // const [patientEmail, setPatientEmail] = useState('')
  const [bookAppointment, setBookAppointment] = useState(false)


  const handleHINCheck = async () => {
    setLoading(true)

    if (!patientHIN) {
      toast.error("Patient's HIN is not provided !")
      setLoading(false)
      return
    }

    try {
      const res = await axiosInstance.get(`api/receptionists/patient/${patientHIN}`)
      toast.success(" Patient's Details Retrieved Successfully ")
      console.log(res)
      setPatientDetails(res.data)
      setLoading(false)
      setCheckHIN(true)
      setPatientHIN('')
    } catch (err) {
      toast.error('Patient Details Retrieve Failed !')
      setPatientHIN('')
      setLoading(false)
    }
  }


  console.log(patientDetails)

  return (
    <>
      {
        checkHIN ? (
          <>
            <div className='py-2 text-sm flex justify-between items-center'>
              <DynamicDate />
              <div>
                <button className='bg-[#3E4095] py-2.5 px-8 rounded-full text-white cursor-pointer' onClick={() => {
                  setBookAppointment(!bookAppointment)
                }}>
                  Book an appointment
                </button>
              </div>
            </div>
            <div className='bg-white rounded-xl border mt-3 p-5 text-sm'>
              <div className='flex items-center gap-1 cursor-pointer border-b pb-3' onClick={() => {
                setCheckHIN(false)
              }}>
                <ArrowLeft className='w-4 h-4 text-gray-800' />
                <p>Patient details</p>
              </div>
              <div className='py-5 border-b'>
                <div className="flex items-center">
                  <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center text-xl font-semibold">
                    {`${patientDetails.firstname[0]}${patientDetails.lastname[0]}`.toUpperCase()}
                  </div>

                  <div className="flex flex-col items-start">
                    <p className="ml-2 text-sm font-medium">
                      {patientDetails.firstname} {patientDetails.lastname}
                    </p>
                    <p className="ml-2 text-[12px] text-gray-500">
                      patient
                    </p>
                  </div>
                </div>
              </div>
              <div className="my-5 bg-[#FAFAFA] rounded-xl border p-4">
                <h2 className="font-medium">General Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 ">First Name</p>
                    <input
                      type="text"
                      readOnly
                      className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                      value={patientDetails.firstname}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 ">Last Name</p>
                    <input
                      type="text"
                      readOnly
                      className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                      value={patientDetails.lastname}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 ">Date of birth</p>
                    <input
                      type="text"
                      readOnly
                      className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                      value={patientDetails.dob}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 ">Email address</p>
                    <input
                      type="text"
                      readOnly
                      className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                      value={patientDetails.email || 'NIL'}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 ">Phone number</p>
                    <input
                      type="text"
                      readOnly
                      className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                      value={patientDetails.phone_num}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 ">Home address</p>
                    <input
                      type="text"
                      readOnly
                      className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                      value={patientDetails.street + patientDetails.city + patientDetails.state + patientDetails.country || 'NIL'}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 ">Assigned doctor</p>
                    <input
                      type="text"
                      readOnly
                      className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                      value="NIL"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 ">Date of last visit</p>
                    <input
                      type="text"
                      readOnly
                      className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                      value="NIL"
                    />
                  </div>

                </div>
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
                <button className=' border border-[#3E4095] rounded-full py-2.5 px-8 text-[#3E4095] cursor-pointer' onClick={() => {
                  setNewPatient(!newPatient)
                }}>
                  Register a new patient to DocuHealth
                </button>
                <div>
                  <div className='flex relative items-center' >
                    <span className=' absolute left-4'>

                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.33398 12.834C2.33398 10.2566 4.42332 8.16732 7.00065 8.16732C9.57799 8.16732 11.6673 10.2566 11.6673 12.834H10.5007C10.5007 10.901 8.93364 9.33398 7.00065 9.33398C5.06765 9.33398 3.50065 10.901 3.50065 12.834H2.33398ZM7.00065 7.58398C5.0669 7.58398 3.50065 6.01773 3.50065 4.08398C3.50065 2.15023 5.0669 0.583984 7.00065 0.583984C8.9344 0.583984 10.5007 2.15023 10.5007 4.08398C10.5007 6.01773 8.9344 7.58398 7.00065 7.58398ZM7.00065 6.41732C8.28982 6.41732 9.33398 5.37315 9.33398 4.08398C9.33398 2.79482 8.28982 1.75065 7.00065 1.75065C5.71148 1.75065 4.66732 2.79482 4.66732 4.08398C4.66732 5.37315 5.71148 6.41732 7.00065 6.41732Z" fill="#647284" />
                      </svg>
                    </span>
                    <input type="text"
                      placeholder=" Enter patient's HIN "
                      value={patientHIN}
                      onChange={(e) => setPatientHIN(e.target.value)}
                      className='outline-none bg-white pl-10 pr-5 rounded-l-full border py-3'
                      required
                    />

                    <button
                      onClick={handleHINCheck}
                      disabled={loading}
                      className={`w-full   py-3  ${loading ? 'cursor-not-allowed bg-gray-300 text-gray-500' : 'bg-[#3E4095] cursor-pointer'}
                        
                 rounded-full sm:rounded-l-none   px-8    text-white sm:col-span-2 `}
                    >
                      {
                        loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              ></path>
                            </svg>
                            Checking HIN...
                          </span>
                        ) : (
                          "Check HIN"
                        )
                      }

                    </button>
                  </div>
                </div>
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
                      <p className='text-[#3E4095] font-semibold text-lg'>50 / 57 Beds</p>
                    </div>
                  </div>
                  <div className=' flex items-center gap-2 bg-purple-100 p-3 rounded-md'>
                    <div className='bg-[#9000FF] p-2 rounded-full'>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 11V20H20V17H4V20H2V4H4V14H12V7H18C20.2091 7 22 8.79086 22 11ZM20 14V11C20 9.89543 19.1046 9 18 9H14V14H20ZM8 11C8.55228 11 9 10.5523 9 10C9 9.44772 8.55228 9 8 9C7.44772 9 7 9.44772 7 10C7 10.5523 7.44772 11 8 11ZM8 13C6.34315 13 5 11.6569 5 10C5 8.34315 6.34315 7 8 7C9.65685 7 11 8.34315 11 10C11 11.6569 9.65685 13 8 13Z" fill="white" />
                      </svg>

                    </div>
                    <div>
                      <p className='text-xs'>Wards occupied / Available</p>
                      <p className='text-[#9000FF] font-semibold text-lg'>50 / 57 Wards</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>

              </div>
              <div>
                
              </div>
            </div>
          </>
        )
      }

      {newPatient && (
        <OnboardNewPatient setNewPatient={setNewPatient} />
      )}

      {
        bookAppointment && (
          <BookAppointment setBookAppointment={setBookAppointment} patientDetails={patientDetails} />
        )
      }
    </>
  )
}

export default Hospital_Receptionist_Home_Dashboard