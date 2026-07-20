import React from 'react'

const PatientVitalsDetails = ({ selectedPatient, setSelectedPatient }) => {

    return (
        <div className="bg-white my-5 border rounded-2xl pt-8 px-6 text-sm ">
          
                <div
                    className="flex justify-start items-center gap-1 cursor-pointer border-b pb-3"
                    onClick={() => setSelectedPatient(false)}
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
                            fill="var(--color-docuhealth-dark)"
                        />
                    </svg>

                    <h2 className=" text-sm">Patient's details</h2>
                </div>
                <div className='py-5 border-b'>
                    <div className="flex items-center">
                        <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center text-xl font-semibold">
                            {`${selectedPatient?.patient?.firstname?.[0] ?? ''}${selectedPatient?.patient?.lastname?.[0] ?? ''}`.toUpperCase()}

                        </div>

                        <div className="flex flex-col items-start">
                            <p className="ml-2 text-sm font-medium">
                                {selectedPatient?.patient?.firstname} {selectedPatient?.patient?.lastname}
                            </p>
                            <p className="ml-2 text-[12px] text-gray-500">
                                patient
                            </p>
                        </div>
                    </div>
                </div>
                <div className="my-5 bg-docuhealth-light-gray rounded-xl border p-4">
                <h2 className="font-medium">General Information</h2>

                <div className="grid  gap-4 mt-4">

                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1 ">First Name</p>
                        <input
                            type="text"
                            readOnly
                            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                            value={selectedPatient?.patient?.firstname}
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1 ">Last Name</p>
                        <input
                            type="text"
                            readOnly
                            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                            value={selectedPatient?.patient?.lastname}
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1 ">Date of birth</p>
                        <input
                            type="text"
                            readOnly
                            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                            value={selectedPatient?.patient?.dob}
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1 ">Email address</p>
                        <input
                            type="text"
                            readOnly
                            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                            value={selectedPatient?.patient?.email || 'NIL'}
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1 ">Phone number</p>
                        <input
                            type="text"
                            readOnly
                            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                            value={selectedPatient?.patient?.phone_num}
                        />
                    </div>

                

                    <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Home address
                    </p>

                    <textarea
                      readOnly
                      rows={3}
                      className="w-full text-gray-500 rounded-lg text-sm bg-white border px-3 py-2 resize-none"
                      value={
                        selectedPatient?.patient?.street
                          ? `${selectedPatient.patient?.street}, ${selectedPatient.patient?.city}, ${selectedPatient.patient?.state}, ${selectedPatient.patient?.country}`
                          : "NIL"
                      }
                    />
                  </div>

                    <div className='lg:col-span-2'>
                        <p className="text-sm font-medium text-gray-500 mb-1  ">Assigned staff</p>
                        <input
                            type="text"
                            readOnly
                            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                            value=   {selectedPatient?.staff
                                ? `${selectedPatient.staff.firstname} ${selectedPatient.staff.lastname}`
                                : "NIL"}
                        />
                    </div>

                

                </div>
            </div>
    
        </div>
    )
}

export default PatientVitalsDetails