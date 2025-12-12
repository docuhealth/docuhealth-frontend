import React, { useState } from 'react'
import axiosInstance from '../../../../../../utils/axiosInstance'
import toast from 'react-hot-toast'

const UpdateVitals = ({ selectedPatient, setUpdateVitals }) => {

    const [loading, setLoading] = useState(false)
    const [bloodPressure, setBloodPressure] = useState("");
    const [temperature, setTemperature] = useState("");
    const [respRate, setRespRate] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [heartRate, setHeartRate] = useState("");


    console.log(selectedPatient)
    const handleSubmit = async () => {
        setLoading(true)

        const payload = {
            request: selectedPatient.id,
            blood_pressure: bloodPressure,
            temp: temperature,
            resp_rate: respRate,
            height: height,
            weight: weight,
            heart_rate: heartRate
        };

        if (!bloodPressure || !temperature || !respRate || !height || !weight || !heartRate) {
            toast.error("All fields are required.");
            setLoading(false);
            return;
        }



        try {
            const res = await axiosInstance.post(
                "api/nurses/vital-signs/process",
                payload
            );

            toast.success("Vitals updated successfully!");

            setUpdateVitals(false);   // close modal
        } catch (err) {
            console.error("Error updating vitals:", err);

            toast.error(err.response?.data?.message || "Failed to update vitals.");
        } finally {
            setLoading(false);
            setBloodPressure('')
            setHeartRate('')
            setHeight('')
            setRespRate('')
            setTemperature('')
            setWeight('')
        }


    }
    return (
        <div className="bg-white my-5 border rounded-2xl pt-8 px-6 text-sm ">
            <div
                className="flex justify-start items-center gap-1 cursor-pointer border-b pb-3"
                onClick={() => setUpdateVitals(false)}
            >
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

                <h2 className=" text-sm">Update Vitals</h2>
            </div>
            <div className="border rounded-md p-5 my-5">
                <p className="font-medium">Vital signs</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 my-5 gap-5">
                    <div className="relative">
                        <p className="pb-1">Blood pressure</p>
                        <div className="relative">
                            <input
                                type="text"
                                id="bloodPressure"
                                className="w-full text-sm border px-3 py-2 rounded-sm pr-16 focus:outline-none" // add padding-right for the unit
                                placeholder="Enter blood pressure"
                                value={bloodPressure}
                                onChange={(e) => setBloodPressure(e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                                mmHg
                            </span>
                        </div>
                    </div>
                    <div className="relative">
                        <p className="pb-1">Temperature</p>
                        <div className="relative">
                            <input
                                type="text"
                                id="temperature"
                                className="w-full text-sm border px-3 py-2 rounded-sm pr-8 focus:outline-none" // add padding-right for the unit
                                placeholder="Enter temperature"
                                value={temperature}
                                onChange={(e) => setTemperature(e.target.value)}

                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                                °C
                            </span>
                        </div>
                    </div>
                    <div className="relative">
                        <p className="pb-1">Respiratory Rate</p>
                        <div className="relative">
                            <input
                                type="text"
                                id="respRate"
                                className="w-full text-sm border px-3 py-2 rounded-sm pr-14 focus:outline-none" // add padding-right for the unit
                                placeholder="Enter respiratory rate"
                                value={respRate}
                                onChange={(e) => setRespRate(e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                                /Min
                            </span>
                        </div>
                    </div>
                    <div className="relative">
                        <p className="pb-1">Height</p>
                        <div className="relative">
                            <input
                                type="text"
                                id="height"
                                className="w-full text-sm border px-3 py-2 rounded-sm pr-10 focus:outline-none" // add padding-right for the unit
                                placeholder="Enter height"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                                m
                            </span>
                        </div>
                    </div>
                    <div className="relative">
                        <p className="pb-1">Heart Rate</p>
                        <div className="relative">
                            <input
                                type="text"
                                id="heartRate"
                                className="w-full text-sm border px-3 py-2 rounded-sm pr-14 focus:outline-none" // add padding-right for the unit
                                placeholder="Enter heart rate"
                                value={heartRate}
                                onChange={(e) => setHeartRate(e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                                Bpm
                            </span>
                        </div>
                    </div>
                    <div className="relative">
                        <p className="pb-1">Weight</p>
                        <div className="relative">
                            <input
                                type="text"
                                id="weight"
                                className="w-full text-sm border px-3 py-2 rounded-sm pr-10 focus:outline-none" // add padding-right for the unit
                                placeholder="Enter weight"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[12px]">
                                Kg
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex justify-end items-end'>
                <button
                    className={`py-2.5 px-10  rounded-full bg-[#3E4095] text-white cursor-pointer mb-5 disabled:bg-[#3E4095]/60 disabled:cursor-not-allowed ${loading ? 'bg-[#3E4095]/60 cursor-not-allowed' : ''}  text-sm`}
                    disabled={loading || !bloodPressure || !temperature || !respRate || !height || !weight || !heartRate}
                    onClick={() => {
                        handleSubmit()
                    }}
                >
                    {loading ? (
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
                            Updating Vitals
                        </span>
                    ) : (
                        "Update Vitals"
                    )}{" "}
                </button>
            </div>

        </div>
    )
}

export default UpdateVitals