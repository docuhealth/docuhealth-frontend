import React from "react";
import VitalSignsCard from "../../../../ui/VitalSignsCard";
import SharedSoapNotes from "./SharedSoapNotes";

export const getAdvanceCheckUpTabs = (patient, admission, patientFullInfo, formatDate, formatDateTime, setSharedSoapNoteDetail) => {
    return [
        {
            title: "Patient's information",
            status: "info",
            content: (
                <div className="space-y-6">
                    {/* General Information */}
                    <div className="bg-gray-50 rounded-xl border p-6">
                        <h3 className="font-semibold text-gray-800 mb-5">General information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-600 font-medium">First Name</label>
                                <input type="text" readOnly value={patient?.firstname || ''} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-600 font-medium">Last name</label>
                                <input type="text" readOnly value={patient?.lastname || ''} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-600 font-medium">Date of birth</label>
                                <input type="text" readOnly value={formatDate(patient?.dob)} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-600 font-medium">Email address</label>
                                <input type="text" readOnly value={patient?.email || 'N/A'} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-600 font-medium">Phone number</label>
                                <input type="text" readOnly value={patient?.phone_num || ''} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-600 font-medium">Home address</label>
                                <input type="text" readOnly value={patient?.street ? `${patient.street}, ${patient.state || ''}` : 'N/A'} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Admission Information */}
                    <div className="bg-gray-50 rounded-xl border p-6">
                        <h3 className="font-semibold text-gray-800 mb-5">Admission information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-600 font-medium">Admitting doctor</label>
                                <input type="text" readOnly value={admission?.staff_info ? `Dr. ${admission.staff_info.firstname} ${admission.staff_info.lastname}` : 'N/A'} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-600 font-medium">Date/Time of Admission</label>
                                <input type="text" readOnly value={formatDateTime(admission?.admission_date)} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-600 font-medium">Ward</label>
                                <input type="text" readOnly value={admission?.ward_info?.name ? `${admission.ward_info.name} ward` : 'N/A'} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-600 font-medium">Bed</label>
                                <input type="text" readOnly value={admission?.bed_info?.bed_number ? `Bed ${admission.bed_info.bed_number}` : 'N/A'} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-sm text-gray-600 font-medium">Admission diagnosis</label>
                                <textarea readOnly value={admission?.diagnosis || 'N/A'} rows={2} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none resize-none" />
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "My nursing tasks queue",
            status: "tasks",
            content: (
                <div className="bg-gray-50 rounded-xl border p-12 text-center text-gray-500">
                    <p>My nursing tasks queue coming soon...</p>
                </div>
            )
        },
        {
            title: "Shared soap notes",
            status: "soap",
            content: (
                <SharedSoapNotes 
                    selected={admission}
                    setSharedSoapNoteHistory={() => {}}
                    setSharedSoapNoteDetail={setSharedSoapNoteDetail}
                />
            )
        },
        {
            title: "Task history",
            status: "task_history",
            content: (
                <div className="bg-gray-50 rounded-xl border p-12 text-center text-gray-500">
                    <p>Task history coming soon...</p>
                </div>
            )
        }
    ];
};
