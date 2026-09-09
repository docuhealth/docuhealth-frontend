import React, { useState } from 'react';
import Modal from "../../../../../ui/Modal";
import Button from "../../../../../ui/Button";

const LogOutModal = ({ isOpen, onClose, onLogout, staffList, setStaffList, selected, handleFinalRequest,processingId, isFetching }) => {
 

    
    const [handoverOptions, setHandoverOptions] = useState({
        patientManagement: true,
        myAppointments: true,
    });


    if (!isOpen) return null;

    const isAnyOptionSelected = Object.values(handoverOptions).some(value => value === true);

 

    return (

        <>
            {staffList ? (
                <Modal isOpen={isOpen} onClose={() => setStaffList('')} title={`Choose a preferred ${selected}`} maxWidth="4xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 my-2 text-sm gap-4 max-h-[60vh] overflow-y-auto w-full">
                        {staffList.map((staff, index) => {
                            const isThisStaffLoading = processingId === staff.staff_id;
                            const isAnyLoading = processingId !== null;
                            return (
                                <div key={index} className="border rounded-md p-3">
                                    <div>
                                        <div className="flex justify-between items-center border-b pb-5">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-blue-50 p-2 rounded-full">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z" fill="var(--color-docuhealth-primary)" />
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

                                        <div className="w-full pt-6">
                                            <Button
                                                onClick={() => handleFinalRequest(staff.staff_id)}
                                                disabled={isAnyLoading}
                                                loading={isThisStaffLoading}
                                                loadingText="Assigning..."
                                                variant="outline"
                                                fullWidth
                                            >
                                                Assign patient
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Modal>
            ) : (
                <Modal isOpen={isOpen} onClose={onClose} title="">
                    <div className="relative flex flex-col items-center mb-6 pt-4">
                        <button
                            onClick={onClose}
                            className="absolute -top-2 -right-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <svg width="50" height="50" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.0007 36.6654C10.7959 36.6654 3.33398 29.2034 3.33398 19.9987C3.33398 10.7939 10.7959 3.33203 20.0007 3.33203C29.2053 3.33203 36.6673 10.7939 36.6673 19.9987C36.6673 29.2034 29.2053 36.6654 20.0007 36.6654ZM20.0007 33.332C27.3645 33.332 33.334 27.3625 33.334 19.9987C33.334 12.6349 27.3645 6.66536 20.0007 6.66536C12.6369 6.66536 6.66732 12.6349 6.66732 19.9987C6.66732 27.3625 12.6369 33.332 20.0007 33.332ZM21.6673 17.4987V24.9987H23.334V28.332H16.6673V24.9987H18.334V20.832H16.6673V17.4987H21.6673ZM22.5007 13.332C22.5007 14.7127 21.3813 15.832 20.0007 15.832C18.62 15.832 17.5007 14.7127 17.5007 13.332C17.5007 11.9513 18.62 10.832 20.0007 10.832C21.3813 10.832 22.5007 11.9513 22.5007 13.332Z" fill="var(--color-docuhealth-dark)" />
                        </svg>

                        <h2 className="font-medium text-gray-800 mt-2">Handover/Log-out</h2>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-md p-6 mb-6">
                        <p className="text-gray-500 text-center text-xs leading-relaxed">
                            You're about to end your current shift, kindly use the options below to handover to the incoming nurse
                        </p>
                    </div>

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
                                    className="w-4 h-4 accent-docuhealth-primary cursor-pointer"
                                />
                                <span className="text-gray-700 font-medium text-sm group-hover:text-docuhealth-primary">Patient management</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={handoverOptions.myAppointments}
                                    onChange={() => setHandoverOptions(prev => ({ ...prev, myAppointments: !prev.myAppointments }))}
                                    className="w-4 h-4 accent-docuhealth-primary cursor-pointer"
                                />
                                <span className="text-gray-700 font-medium text-sm group-hover:text-docuhealth-primary">My appointments</span>
                            </label>
                        </div>
                    </div>

                    <Button
                        onClick={() => onLogout(handoverOptions)}
                        disabled={!isAnyOptionSelected || isFetching}
                        loading={isFetching}
                        loadingText="Processing..."
                        fullWidth
                    >
                        Proceed to assign
                    </Button>

                    <button
                        onClick={() => onLogout(null)}
                        className="w-full mt-4 text-gray-500 text-[12px] hover:text-red-500 transition-colors cursor-pointer"
                    >
                        Just Logout (Skip Handover)
                    </button>
                </Modal>
            )}
        </>
    );
};

export default LogOutModal;