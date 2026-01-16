import React, { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import axiosInstanceHos from '../../../../../utils/axiosInstanceHos'
import toast from 'react-hot-toast'

const AdvanceCheckUp = ({ selected, setAdvanceCheckUp }) => {

    const [patientFullInfo, setPatientFullInfo] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchPatientInfo = async () => {
            // Ensure we have a HIN before calling
            const hin = selected?.patient?.hin;
            if (!hin) return;

            setLoading(true)
            try {
                const res = await axiosInstanceHos.get(`api/doctors/patient/info/${hin}`)
                console.log(res.data)
                setPatientFullInfo(res.data)
            } catch (err) {
                console.error("Error fetching patient info:", err)
                toast.error("Failed to load patient information")
            } finally {
                setLoading(false)
            }
        }

        fetchPatientInfo()
    }, [selected])

    const patient = patientFullInfo?.patient_info;

    return (
        <>
            <div className='flex items-center gap-1 cursor-pointer border-b pb-3' >
                <div
                    onClick={() => {
                        setAdvanceCheckUp(false)
                    }}>
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4.56528 6.41685H11.6654V7.58352H4.56528L7.69426 10.7125L6.86932 11.5374L2.33203 7.00019L6.86932 2.46289L7.69426 3.28785L4.56528 6.41685Z"
                            fill="#1B2B40"
                        />
                    </svg>
                </div>

                <p>Advance CheckUp</p>
            </div>
            {loading ? (
                /* Basic Loading State */
                <div className="flex justify-center items-center gap-3 px-2 py-3">
                    <p className="text-sm text-gray-500 pt-2">Loading patient data...</p>
                </div>
            ) : (
                <>
                    <div className='py-5 border-b'>
                        <div className="flex items-center">
                            <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center text-xl font-semibold">
                                {/* {`${patientFullInfo?.patient_info?.firstname?.[0] ?? ''}${patientFullInfo?.patient_info?.lastname?.[0] ?? ''}`.toUpperCase()} */}

                            </div>

                            <div className="flex flex-col items-start">
                                <p className="ml-2 text-sm font-medium">
                                    {/* {patientFullInfo?.patient_info?.firstname} {patientFullInfo?.patient_info?.lastname} */}
                                </p>
                                <p className="ml-2 text-[12px] text-gray-500">
                                    patient
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default AdvanceCheckUp