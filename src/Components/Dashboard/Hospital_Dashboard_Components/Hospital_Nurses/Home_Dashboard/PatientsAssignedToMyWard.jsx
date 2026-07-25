import React, { useContext } from 'react'
import { NursesPatientsAssignedToWardContext } from '../../../../../context/HospitalContext/Nurses/NursesPatientsAssignedToWardContext'
import { formatFullDate, formatTime } from '../../../Patient_Dashboard_Components/Patient_Appointments_Dashboard/Components/Date_Time_Formatter'
import Pagination2 from '../../../Patient_Dashboard_Components/Pagination/Pagination2'
import SearchBar from '../../../../SearchBar/SearchBar'
import toast from 'react-hot-toast'

const PatientsAssignedToMyWard = () => {

  const {
    assignedPatientsToWard,
    loading,
    count,
    currentPage,
    totalPages,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    isRefreshing,
  } = useContext(NursesPatientsAssignedToWardContext);

  console.log(assignedPatientsToWard)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-sm">
        Loading...
      </div>
    );
  }

  if (assignedPatientsToWard.length === 0 && !searchQuery) {
    return (
      <div className="flex flex-col justify-center items-center text-center  h-full ">
        <svg
          width="180"
          height="180"
          viewBox="0 0 366 366"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_d_1517_47151)">
            <circle cx="183" cy="171" r="159" fill="#DBDBDB" />
          </g>
          <circle cx="183" cy="171" r="132" fill="#F6F6F6" />
          <path
            d="M164.25 114.75V102.25H151.75V114.75H126.75C123.298 114.75 120.5 117.548 120.5 121V221C120.5 224.452 123.298 227.25 126.75 227.25H239.25C242.702 227.25 245.5 224.452 245.5 221V121C245.5 117.548 242.702 114.75 239.25 114.75H214.25V102.25H201.75V114.75H164.25ZM133 158.5H233V214.75H133V158.5ZM133 127.25H151.75V133.5H164.25V127.25H201.75V133.5H214.25V127.25H233V146H133V127.25ZM169.741 164.528L183 177.786L196.257 164.528L205.097 173.366L191.839 186.626L205.096 199.883L196.258 208.721L183 195.464L169.741 208.721L160.903 199.882L174.161 186.626L160.902 173.366L169.741 164.528Z"
            fill="#929AA3"
          />
          <defs>
            <filter
              id="filter0_d_1517_47151"
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
                result="effect1_dropShadow_1517_47151"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_1517_47151"
                result="shape"
              />
            </filter>
          </defs>
        </svg>

        <h2 className="font-medium pb-1">No admitted patients !</h2>
        <div className="max-w-md text-center">
          <p className="text-[12px] text-gray-500">
            {" "}
            You currently don’t have any patients assigned to your ward in this hospital.
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
          placeholder="Search by patient name, doctor, or email..."
        />
        {isRefreshing && (
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5 w-full">
            <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#3E4095] rounded-full animate-spin"></span>
            Searching...
          </p>
        )}
      </div>

      {assignedPatientsToWard.length === 0 && searchQuery ? (
        <div className="py-12 text-center text-gray-500 text-sm">
          <p className="font-medium">No results found.</p>
          <p className="text-xs text-gray-400 mt-1">Try a different search term.</p>
        </div>
      ) : (
      <>
      <div className='hidden lg:flex flex-col'>
        <div className="grid grid-cols-7 text-left text-sm bg-gray-100 py-5 rounded-md">

          <div className="col-span-2 w-full pl-5 flex items-center gap-2">
            <p>Patient's Name</p>
          </div>

          <p>Date of Adm.</p>
          <p>Time of Adm.</p>
          <p>Assigned Doc</p>
          <p>Patient's Email</p>
          <p>Sex</p>
        </div>
        {
          assignedPatientsToWard.map((patient, index) => (
            <div key={index} className='relative'>
                <div className="grid grid-cols-7 items-center text-[12px] text-gray-700 text-left w-full  border-b border-b-gray-200">
                    <div className='font-semibold col-span-2 w-full py-6 pl-5 flex items-center gap-1 '>

                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.6654 12.834H10.4987V11.6673C10.4987 10.7008 9.71522 9.91732 8.7487 9.91732H5.2487C4.2822 9.91732 3.4987 10.7008 3.4987 11.6673V12.834H2.33203V11.6673C2.33203 10.0565 3.63787 8.75065 5.2487 8.75065H8.7487C10.3595 8.75065 11.6654 10.0565 11.6654 11.6673V12.834ZM6.9987 7.58398C5.0657 7.58398 3.4987 6.01698 3.4987 4.08398C3.4987 2.15099 5.0657 0.583984 6.9987 0.583984C8.93169 0.583984 10.4987 2.15099 10.4987 4.08398C10.4987 6.01698 8.93169 7.58398 6.9987 7.58398ZM6.9987 6.41732C8.28734 6.41732 9.33203 5.37265 9.33203 4.08398C9.33203 2.79532 8.28734 1.75065 6.9987 1.75065C5.71003 1.75065 4.66536 2.79532 4.66536 4.08398C4.66536 5.37265 5.71003 6.41732 6.9987 6.41732Z" fill="var(--color-docuhealth-secondary)" />
                        </svg>

                        <p> {patient.patient.firstname} {patient.patient.lastname}</p>
                    </div>
                    <p>
                        {formatFullDate(patient.admission_date)}
                    </p>
                    <p>
                    {formatTime(patient.admission_date)}
                    </p>
                    <p>
                    {patient.staff.firstname} {patient.staff.lastname}
                    </p>
                    <p className='truncate max-w-[120px]'>
                        {patient.patient.email ||"NIL"} 
                    </p>
                    <p>
                        {patient.patient.gender}
                    </p>

                </div>
            </div>
        ))
        }
      </div>
      <div className="lg:hidden flex flex-col gap-4">
        {assignedPatientsToWard.map((patient, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-md p-4 ">
            <div className="flex justify-between items-start border-b border-gray-50 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-docuhealth-primary h-10 w-10 rounded-full flex items-center justify-center font-bold">
                  {patient.patient.firstname[0]}{patient.patient.lastname[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{patient.patient.firstname} {patient.patient.lastname}</h3>
                  <p className="text-[11px] text-gray-500 uppercase tracking-tight">{patient.patient.gender} patient</p>
                </div>
              </div>
              <span className="text-[10px] bg-blue-50 text-docuhealth-primary px-2 py-1 rounded-md font-medium">
                Admitted
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Admission Date</p>
                <p className="text-[12px] font-medium text-gray-700">{formatFullDate(patient.admission_date)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Admission Time</p>
                <p className="text-[12px] font-medium text-gray-700">{formatTime(patient.admission_date)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Assigned Doctor</p>
                <p className="text-[12px] font-medium text-gray-700">Dr. {patient.staff.firstname} {patient.staff.lastname}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Email/Info</p>
                <p className="text-[12px] font-medium text-gray-700 truncate">{patient.patient.email || "NIL"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Pagination2
        count={count}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={ setCurrentPage}
      />
      </>)}
    </>

  )
}

export default PatientsAssignedToMyWard