import React, { useState, useMemo, useContext, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Pagination2 from '../../../../Patient_Dashboard_Components/Pagination/Pagination2';
import { formatFullDate, formatTime } from '../../../../Patient_Dashboard_Components/Patient_Appointments_Dashboard/Components/Date_Time_Formatter';

import { fetchPharmacistRecentPatients } from '../../../../../../queries/Hospital/pharmacist/recent_patients';
import { getHospitalToken } from '../../../../../../services/authService';

const RecentPatients = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [days, setDays] = useState(7);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const isUserLoggedIn = !!getHospitalToken();

    const { data, isLoading: loading, isFetching: isRefreshing } = useQuery({
        queryKey: ["pharmacist-recent-patients", currentPage, days],
        queryFn: fetchPharmacistRecentPatients,
        enabled: isUserLoggedIn,
        staleTime: 1000 * 5,
    });

    const recentPatients = data?.results || [];
    const count = data?.count || 0;
    const totalPages = Math.ceil(count / 10);

    // Keep client-side sort: closest to current time first
    const sortedPatients = useMemo(() => {
        const now = new Date().getTime();
        return [...recentPatients].sort((a, b) => {
            const timeA = new Date(a.last_dispensed_at).getTime();
            const timeB = new Date(b.last_dispensed_at).getTime();
            return Math.abs(timeA - now) - Math.abs(timeB - now);
        });
    }, [recentPatients]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full text-sm">
                Loading...
            </div>
        );
    }

    if (recentPatients.length === 0 && days === 7) {
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


    const filterOptions = [
        { label: 'Last 24 Hours', value: 1 },
        { label: 'Last 7 Days', value: 7 },
        { label: 'Last 30 Days', value: 30 },
        { label: 'Last 3 Months', value: 90 },
    ];
    
    const selectedOption = filterOptions.find(opt => opt.value === days) || filterOptions[1];

    return (
        <>
        <div className="mb-4 w-full flex justify-between items-center relative z-10">
            <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">Filter by:</label>
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center justify-between gap-3 w-40 bg-white border border-gray-200 hover:border-docuhealth-primary rounded-lg px-3 py-2 text-sm text-gray-700  transition-all focus:outline-none "
                    >
                        <span className="font-medium">{selectedOption.label}</span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute left-0 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg py-1 animate-fade-in-down">
                            {filterOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setDays(option.value);
                                        setCurrentPage(1);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                        days === option.value
                                            ? 'bg-docuhealth-primary/10 text-docuhealth-primary font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
                {isRefreshing && (
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#3E4095] rounded-full animate-spin"></span>
                        Loading...
                    </p>
                )}
      </div>

      {recentPatients.length === 0 ? (
        <div className="py-12 text-center text-gray-500 text-sm">
          <p className="font-medium">No results found.</p>
          <p className="text-xs text-gray-400 mt-1">Try changing the filter.</p>
        </div>
      ) : (
      <>
            <div className='hidden lg:flex lg:flex-col '>
                <div className="grid grid-cols-6 text-left text-sm bg-gray-100 py-5 rounded-md">

                    <div className="col-span-2 w-full pl-5 flex items-center gap-2">
                        <p>Patient's Name</p>
                    </div>

                    <p className='col-span-2'>Date / Time</p>
                    <p>HIN</p>
                    <p>Sex</p>
                </div>
                {
                    sortedPatients.map((patient, index) => (
                        <div key={index} className='relative'>
                            <div className="grid grid-cols-6 items-center text-[12px] text-gray-700 text-left w-full  border-b border-b-gray-200">
                                <div className='font-semibold col-span-2 w-full py-6 pl-5 flex items-center gap-1 '>

                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.6654 12.834H10.4987V11.6673C10.4987 10.7008 9.71522 9.91732 8.7487 9.91732H5.2487C4.2822 9.91732 3.4987 10.7008 3.4987 11.6673V12.834H2.33203V11.6673C2.33203 10.0565 3.63787 8.75065 5.2487 8.75065H8.7487C10.3595 8.75065 11.6654 10.0565 11.6654 11.6673V12.834ZM6.9987 7.58398C5.0657 7.58398 3.4987 6.01698 3.4987 4.08398C3.4987 2.15099 5.0657 0.583984 6.9987 0.583984C8.93169 0.583984 10.4987 2.15099 10.4987 4.08398C10.4987 6.01698 8.93169 7.58398 6.9987 7.58398ZM6.9987 6.41732C8.28734 6.41732 9.33203 5.37265 9.33203 4.08398C9.33203 2.79532 8.28734 1.75065 6.9987 1.75065C5.71003 1.75065 4.66536 2.79532 4.66536 4.08398C4.66536 5.37265 5.71003 6.41732 6.9987 6.41732Z" fill="var(--color-docuhealth-secondary)" />
                                    </svg>

                                    <p> {patient.firstname} {patient.lastname}</p>
                                </div>
                                <p className='col-span-2'>{formatFullDate(patient.last_dispensed_at)} / {formatTime(patient.last_dispensed_at)}</p>
                                <p>
                                    {patient.hin
                                        ? patient.hin.slice(0, 4) + "••••••" + patient.hin.slice(-2)
                                        : ""}
                                </p>

                                <p>{patient.gender}</p>

                            </div>
                        </div>
                    ))
                }
            </div>
            <div className="lg:hidden flex flex-col gap-4">
                {sortedPatients.map((patient, index) => (
                    <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-md p-5  duration-200"
                    >
                        {/* Header: Avatar, Name and Gender Tag */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-50 text-docuhealth-primary flex items-center justify-center font-bold text-sm border border-blue-100 uppercase">
                                    {patient.firstname?.[0]}{patient.lastname?.[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-[14px] leading-tight">
                                        {patient.firstname} {patient.lastname}
                                    </h3>
                                    <p className="text-[11px] text-gray-500 font-medium">
                                        {patient.gender}
                                    </p>
                                </div>
                            </div>
                            <span className="bg-gray-50 text-gray-600 text-[10px] px-2 py-1 rounded-md border border-gray-100 font-medium uppercase tracking-wider">
                                {patient.hin?.slice(-4) || "N/A"}
                            </span>
                        </div>

                        {/* Main Info Grid */}
                        <div className="grid grid-cols-1 gap-y-4 pt-3 border-t border-gray-50">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-tighter mb-0.5">Registration Info</p>
                                <div className="flex items-center gap-1.5 text-gray-700">
                                    <i className='bx bx-calendar text-docuhealth-primary text-[14px]'></i>
                                    <p className="text-[11.5px] font-medium leading-none">
                                        {formatFullDate(patient.last_dispensed_at)}
                                    </p>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1 pl-5">
                                    at {formatTime(patient.last_dispensed_at)}
                                </p>
                            </div>
                        </div>

                        {/* HIN Masked Section */}
                        <div className="mt-4 bg-docuhealth-primary-faded rounded-lg p-2.5 flex justify-between items-center">
                            <span className="text-[10px] font-semibold text-docuhealth-primary uppercase">HIN Number</span>
                            <span className="text-[12px] font-mono font-bold text-gray-600 tracking-widest">
                                {patient.hin
                                    ? patient.hin.slice(0, 4) + "••••" + patient.hin.slice(-2)
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
        )}
        </>
    )
}

export default RecentPatients
