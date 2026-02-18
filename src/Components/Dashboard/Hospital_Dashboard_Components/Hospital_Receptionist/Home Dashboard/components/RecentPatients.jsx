import React, { useState, useContext, useMemo } from 'react';
import { ReceptionistRecentPatientsContext } from '../../../../../../context/Hospital Context/Receptionist/ReceptionistRecentPatientsContext'
import Pagination2 from '../../../../Patient_Dashboard_Components/Pagination/Pagination2';
import { formatFullDate, formatTime } from '../../../../Patient_Dashboard_Components/Patient_Appointments_Dashboard/Components/Date_Time_Formatter';
import SearchBar from '../../../../../SearchBar/SearchBar';

const RecentPatients = () => {

    const {
        recentPatients,
        loading,
        count,
        currentPage,
        totalPages,
        setCurrentPage,
    } = useContext(ReceptionistRecentPatientsContext);

    const [searchQuery, setSearchQuery] = useState("");

    // 1. Filter by search and Rank by proximity to "Today/Now"
    const processedPatients = useMemo(() => {
        // A. Filter logic
        let filtered = recentPatients.filter((item) => {
            const searchStr = searchQuery.toLowerCase();
            return (
                item.patient.firstname?.toLowerCase().includes(searchStr) ||
                item.patient.lastname?.toLowerCase().includes(searchStr) ||
                item.patient.hin?.toLowerCase().includes(searchStr) ||
                item.staff.firstname?.toLowerCase().includes(searchStr)
            );
        });

        // B. Sort logic: Closest to current time ranks first
        const now = new Date().getTime();
        return [...filtered].sort((a, b) => {
            const timeA = new Date(a.created_at).getTime();
            const timeB = new Date(b.created_at).getTime();
            return Math.abs(timeA - now) - Math.abs(timeB - now);
        });
    }, [recentPatients, searchQuery]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full text-sm">
                Loading...
            </div>
        );
    }

    if (recentPatients.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center text-center  h-full">
                <svg
                    width="200"
                    height="200"
                    viewBox="0 0 366 366"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g filter="url(#filter0_d_1501_46523)">
                        <circle cx="183" cy="171" r="159" fill="#DBDBDB" />
                    </g>
                    <circle cx="183" cy="171" r="132" fill="#F6F6F6" />
                    <path
                        d="M183 233.5C148.482 233.5 120.5 205.518 120.5 171C120.5 136.482 148.482 108.5 183 108.5C217.518 108.5 245.5 136.482 245.5 171C245.5 205.518 217.518 233.5 183 233.5ZM183 221C210.614 221 233 198.614 233 171C233 143.386 210.614 121 183 121C155.386 121 133 143.386 133 171C133 198.614 155.386 221 183 221ZM176.75 139.75H189.25V152.25H176.75V139.75ZM176.75 164.75H189.25V202.25H176.75V164.75Z"
                        fill="#929AA3"
                    />
                    <defs>
                        <filter
                            id="filter0_d_1501_46523"
                            x="0"
                            y="0"
                            width="366"
                            height="366"
                            filterUnits="userSpaceOnUse"
                            color-interpolation-filters="sRGB"
                        >
                            <feFlood flood-opacity="0" result="BackgroundImageFix" />
                            <feColorMatrix
                                in="SourceAlpha"
                                type="matrix"
                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                result="hardAlpha"
                            />
                            <feOffset dy="12" />
                            <feGaussianBlur stdDeviation="12" />
                            <feComposite in2="hardAlpha" operator="out" />
                            <feColorMatrix
                                type="matrix"
                                values="0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0.15 0"
                            />
                            <feBlend
                                mode="normal"
                                in2="BackgroundImageFix"
                                result="effect1_dropShadow_1501_46523"
                            />
                            <feBlend
                                mode="normal"
                                in="SourceGraphic"
                                in2="effect1_dropShadow_1501_46523"
                                result="shape"
                            />
                        </filter>
                    </defs>
                </svg>

                <h2 className="font-medium pb-1">No recent patients!</h2>
                <div className="max-w-md text-center">
                    <p className="text-[12px] text-gray-500">
                        {" "}
                        You currently don’t have any recent patients.
                    </p>
                </div>
            </div>
        );
    }


    return (
        <>
        <div className="mb-4 w-full">
      <SearchBar 
                    value={searchQuery} 
                    onChange={setSearchQuery} 
                    placeholder="Search by name, HIN, or assigned staff..."
                />
      </div>
            <div className='hidden lg:flex lg:flex-col '>
                <div className="grid grid-cols-7 text-left text-sm bg-gray-100 py-5 rounded-md">

                    <div className="col-span-2 w-full pl-5 flex items-center gap-2">
                        <p>Patient's Name</p>
                    </div>

                    <p className='col-span-2'>Date / Time</p>
                    <p>HIN</p>
                    <p>Staff</p>
                    <p>Sex</p>
                </div>
                {
                    processedPatients.map((patient, index) => (
                        <div key={index} className='relative'>
                            <div className="grid grid-cols-7 items-center text-[12px] text-gray-700 text-left w-full  border-b border-b-gray-200">
                                <div className='font-semibold col-span-2 w-full py-6 pl-5 flex items-center gap-1 '>

                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.6654 12.834H10.4987V11.6673C10.4987 10.7008 9.71522 9.91732 8.7487 9.91732H5.2487C4.2822 9.91732 3.4987 10.7008 3.4987 11.6673V12.834H2.33203V11.6673C2.33203 10.0565 3.63787 8.75065 5.2487 8.75065H8.7487C10.3595 8.75065 11.6654 10.0565 11.6654 11.6673V12.834ZM6.9987 7.58398C5.0657 7.58398 3.4987 6.01698 3.4987 4.08398C3.4987 2.15099 5.0657 0.583984 6.9987 0.583984C8.93169 0.583984 10.4987 2.15099 10.4987 4.08398C10.4987 6.01698 8.93169 7.58398 6.9987 7.58398ZM6.9987 6.41732C8.28734 6.41732 9.33203 5.37265 9.33203 4.08398C9.33203 2.79532 8.28734 1.75065 6.9987 1.75065C5.71003 1.75065 4.66536 2.79532 4.66536 4.08398C4.66536 5.37265 5.71003 6.41732 6.9987 6.41732Z" fill="#647284" />
                                    </svg>

                                    <p> {patient.patient.firstname} {patient.patient.lastname}</p>
                                </div>
                                <p className='col-span-2'>{formatFullDate(patient.created_at)} / {formatTime(patient.created_at)}</p>
                                <p>
                                    {patient.patient.hin
                                        ? patient.patient.hin.slice(0, 4) + "••••••" + patient.patient.hin.slice(-2)
                                        : ""}
                                </p>


                                <div className='font-semibold w-full py-6  flex items-center gap-1 '>

                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.6654 12.834H10.4987V11.6673C10.4987 10.7008 9.71522 9.91732 8.7487 9.91732H5.2487C4.2822 9.91732 3.4987 10.7008 3.4987 11.6673V12.834H2.33203V11.6673C2.33203 10.0565 3.63787 8.75065 5.2487 8.75065H8.7487C10.3595 8.75065 11.6654 10.0565 11.6654 11.6673V12.834ZM6.9987 7.58398C5.0657 7.58398 3.4987 6.01698 3.4987 4.08398C3.4987 2.15099 5.0657 0.583984 6.9987 0.583984C8.93169 0.583984 10.4987 2.15099 10.4987 4.08398C10.4987 6.01698 8.93169 7.58398 6.9987 7.58398ZM6.9987 6.41732C8.28734 6.41732 9.33203 5.37265 9.33203 4.08398C9.33203 2.79532 8.28734 1.75065 6.9987 1.75065C5.71003 1.75065 4.66536 2.79532 4.66536 4.08398C4.66536 5.37265 5.71003 6.41732 6.9987 6.41732Z" fill="#647284" />
                                    </svg>

                                    <p> {patient.staff.role === 'doctor'
  ? `Dr. ${patient.staff.firstname} ${patient.staff.lastname}`
  : `${patient.staff.firstname} ${patient.staff.lastname}`}
</p>

                                </div>
                                <p>{patient.patient.gender}</p>

                            </div>
                        </div>
                    ))
                }
            </div>
            <div className="lg:hidden flex flex-col gap-4">
                {processedPatients.map((patient, index) => (
                    <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-md p-5  duration-200"
                    >
                        {/* Header: Avatar, Name and Gender Tag */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-50 text-[#3E4095] flex items-center justify-center font-bold text-sm border border-blue-100 uppercase">
                                    {patient.patient.firstname[0]}{patient.patient.lastname[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-[14px] leading-tight">
                                        {patient.patient.firstname} {patient.patient.lastname}
                                    </h3>
                                    <p className="text-[11px] text-gray-500 font-medium">
                                        {patient.patient.gender}
                                    </p>
                                </div>
                            </div>
                            <span className="bg-gray-50 text-gray-600 text-[10px] px-2 py-1 rounded-md border border-gray-100 font-medium uppercase tracking-wider">
                                {patient.patient.hin?.slice(-4) || "N/A"}
                            </span>
                        </div>

                        {/* Main Info Grid */}
                        <div className="grid grid-cols-2 gap-y-4 pt-3 border-t border-gray-50">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-tighter mb-0.5">Registration Info</p>
                                <div className="flex items-center gap-1.5 text-gray-700">
                                    <i className='bx bx-calendar text-[#3E4095] text-[14px]'></i>
                                    <p className="text-[11.5px] font-medium leading-none">
                                        {formatFullDate(patient.created_at)}
                                    </p>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1 pl-5">
                                    at {formatTime(patient.created_at)}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-tighter mb-0.5">Assigned Staff</p>
                                <div className="flex items-center gap-1.5 text-gray-700">
                                    <i className='bx bx-shield-quarter text-[#3E4095] text-[14px]'></i>
                                    <p className="text-[11.5px] font-medium leading-none">
                                    {patient.staff.role === 'doctor'
  ? `Dr. ${patient.staff.firstname} ${patient.staff.lastname}`
  : `${patient.staff.firstname} ${patient.staff.lastname}`}

                                    </p>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1 pl-5">Healthcare Provider</p>
                            </div>
                        </div>

                        {/* HIN Masked Section */}
                        <div className="mt-4 bg-[#F8F9FF] rounded-lg p-2.5 flex justify-between items-center">
                            <span className="text-[10px] font-semibold text-[#3E4095] uppercase">HIN Number</span>
                            <span className="text-[12px] font-mono font-bold text-gray-600 tracking-widest">
                                {patient.patient.hin
                                    ? patient.patient.hin.slice(0, 4) + "••••" + patient.patient.hin.slice(-2)
                                    : "—"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>


            <Pagination2

                count={count}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage = {setCurrentPage}
            />
        </>
    )
}

export default RecentPatients