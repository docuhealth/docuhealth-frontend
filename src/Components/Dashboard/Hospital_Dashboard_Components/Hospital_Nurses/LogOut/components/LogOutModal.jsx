import React, { useState } from 'react';

const LogOutModal = ({ isOpen, onClose, isFetching, onLogout, staffList, setStaffList, selected }) => {
    // Internal state for the checkboxes
    const [handoverOptions, setHandoverOptions] = useState({
        patientManagement: true,
        myAppointments: true,
    });

    // If the parent hasn't triggered the modal, return null
    if (!isOpen) return null;

    const isAnyOptionSelected = Object.values(handoverOptions).some(value => value === true);

    return (
        <>
           {staffList ? (
            <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl w-full relative text-sm">
                                <div className="flex justify-between items-center border-b pb-4">
                                    <h2 className="font-medium">Choose a preferred {selected}</h2>
                                    {/* Close Button */}
                                    <div className="">
                                        <button
                                            onClick={() => setStaffList('')}
                                            className="text-gray-500 hover:text-black"
                                        >
                                            <i className="bx bx-x text-2xl cursor-pointer"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-col-3 my-5 text-sm">
                                    {staffList.map((staff, index) => (
                                        <div key={index} className="border rounded-md p-3">
                                            <div>
                                                <div className="flex justify-between items-center border-b pb-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-blue-50 p-2 rounded-full">
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z" fill="#3E4095" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{staff.firstname + ' ' + staff.lastname}</p>
                                                            <p className="text-xs">{selected}</p>
                                                        </div>

                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{staff.staff_id}</p>
                                                    </div>
                                                </div>

                                                <div className="w-full pt-8">
                                                    <button className="w-full rounded-full border py-2 border-[#3E4095] text-[#3E4095] cursor-pointer"
                                                        // onClick={() => handleAssign(staff.staff_id)}
                                                        >
                                                        Assign patient
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            </div>
            </>
           ) : (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 ">
            <div className="bg-white w-full max-w-[500px] rounded-md p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200 ">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {/* Icon & Title */}
                <div className="flex flex-col items-center mb-6">
                    <svg width="50" height="50" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.0007 36.6654C10.7959 36.6654 3.33398 29.2034 3.33398 19.9987C3.33398 10.7939 10.7959 3.33203 20.0007 3.33203C29.2053 3.33203 36.6673 10.7939 36.6673 19.9987C36.6673 29.2034 29.2053 36.6654 20.0007 36.6654ZM20.0007 33.332C27.3645 33.332 33.334 27.3625 33.334 19.9987C33.334 12.6349 27.3645 6.66536 20.0007 6.66536C12.6369 6.66536 6.66732 12.6349 6.66732 19.9987C6.66732 27.3625 12.6369 33.332 20.0007 33.332ZM21.6673 17.4987V24.9987H23.334V28.332H16.6673V24.9987H18.334V20.832H16.6673V17.4987H21.6673ZM22.5007 13.332C22.5007 14.7127 21.3813 15.832 20.0007 15.832C18.62 15.832 17.5007 14.7127 17.5007 13.332C17.5007 11.9513 18.62 10.832 20.0007 10.832C21.3813 10.832 22.5007 11.9513 22.5007 13.332Z" fill="#1B2B40" />
                    </svg>

                    <h2 className=" font-medium text-gray-800 mt-2">Handover/Log-out</h2>
                </div>

                {/* Info Box */}
                <div className="bg-gray-50 border border-gray-100 rounded-md p-6 mb-6">
                    <p className="text-gray-500 text-center text-xs leading-relaxed">
                        You're about to end your current shift, kindly use the options below to handover to the incoming nurse
                    </p>
                </div>

                {/* Selection Area */}
                <div className="border border-gray-100 rounded-md p-6 mb-8">
                    <h3 className="text-center font-bold text-gray-800 mb-4 text-sm">
                        Select what you'll like to handover
                    </h3>

                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={handoverOptions.patientManagement}
                                onChange={() => setHandoverOptions(prev => ({ ...prev, patientManagement: !prev.patientManagement }))}
                                className="w-4 h-4 accent-[#3E4095] cursor-pointer"
                            />
                            <span className="text-gray-700 font-medium text-sm group-hover:text-[#3E4095]">Patient management</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={handoverOptions.myAppointments}
                                onChange={() => setHandoverOptions(prev => ({ ...prev, myAppointments: !prev.myAppointments }))}
                                className="w-4 h-4 accent-[#3E4095] cursor-pointer"
                            />
                            <span className="text-gray-700 font-medium text-sm group-hover:text-[#3E4095]">My appointments</span>
                        </label>
                    </div>
                </div>

                {/* Main Action */}
                <button
                    disabled={!isAnyOptionSelected || isFetching} // Disable if fetching
                    onClick={() => onLogout(handoverOptions)}
                    className={`w-full py-3 rounded-full transition-all shadow active:scale-95 flex items-center justify-center gap-2 ${isAnyOptionSelected && !isFetching
                        ? "bg-[#3E4095] text-white cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                        }`}
                >
                    {isFetching ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : (
                        "Proceed to assign"
                    )}
                </button>

                {/* Secondary Action */}
                <button
                    onClick={() => onLogout(null)}
                    className="w-full mt-4 text-gray-500 text-[12px] hover:text-red-500 transition-colors cursor-pointer"
                >
                    Just Logout (Skip Handover)
                </button>
            </div>
        </div>
           )}
        </>
    );
};

export default LogOutModal;