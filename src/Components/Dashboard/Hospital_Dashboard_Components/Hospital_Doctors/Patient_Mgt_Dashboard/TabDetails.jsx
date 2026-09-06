import React, { useState, useContext, useMemo } from "react";
import toast from "react-hot-toast";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import Pagination from "../../../Patient_Dashboard_Components/Pagination/Pagination";
import formatRecordDate from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { DoctorsAdmittedPatientMGTContext } from "../../../../../context/HospitalContext/Doctors/DoctorsAdmittedPatientMGTContext";
import SearchBar from "../../../../SearchBar/SearchBar";

const AdmittedPatientsTab = ({ setAdvanceCheckUp, setSelected, setAdvanceCheckUpSource, onDischargePatient }) => {
  const {
    admittedPatients,
    loading,
    count,
    currentPage,
    totalPages,
    refetch: fetchAdmittedPatients,
    tab,
    searchQuery,
    setSearchQuery,
    isRefreshing,
  } = useContext(DoctorsAdmittedPatientMGTContext);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const sortedAdmittedPatients = useMemo(() => {
    return [...admittedPatients].sort((a, b) => {
      const dateA = new Date(a.admission_date).getTime();
      const dateB = new Date(b.admission_date).getTime();
      return dateB - dateA;
    });
  }, [admittedPatients]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-sm">
        Loading...
      </div>
    );
  }

  if (admittedPatients.length === 0 && !searchQuery) {
    return (
      <div className="flex flex-col justify-center items-center text-center  h-full">
        <svg
          width="200"
          height="200"
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

        <h2 className="font-medium pb-1">No admitted patients!</h2>
        <div className="max-w-md text-center">
          <p className="text-[12px] text-gray-500">
            {" "}
            You currently don’t have any admitted patients.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search patient's name, HIN, or ward name..."
        />
        {isRefreshing && (
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5 w-full">
            <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#3E4095] rounded-full animate-spin"></span>
            Searching...
          </p>
        )}
      </div>

      {admittedPatients.length === 0 && searchQuery ? (
        <div className="py-12 text-center text-gray-500 text-sm">
          <p className="font-medium">No results found.</p>
          <p className="text-xs text-gray-400 mt-1">Try a different search term.</p>
        </div>
      ) : (
      <>
      <div className="my-4 text-[12px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sortedAdmittedPatients.map((admittedPatient, index) => (
          <div key={index} className="border p-3 rounded-xl">
            <div className="flex justify-between items-center">
              <p className="flex items-center gap-2">
                <span>
                  {admittedPatient?.patient_info?.firstname}{" "}
                  {admittedPatient?.patient_info?.lastname}{" "}
                </span>
                {admittedPatient?.patient_info?.payment_provider?.type && (
                  <span className="text-[10px] font-bold uppercase bg-docuhealth-light-green text-docuhealth-green px-2 py-0.5 rounded-full">
                    {admittedPatient.patient_info.payment_provider.type}
                  </span>
                )}
              </p>
              <div className="bg-docuhealth-light-green px-2 rounded-full">
                <p className="text-docuhealth-green ">
                  {formatRecordDate(admittedPatient.admission_date)}
                </p>
              </div>
            </div>
            {admittedPatient?.status === "awaiting_nurse_discharge" && (
              <div className="mt-2">
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  Discharge initiated · awaiting nurse
                </span>
              </div>
            )}
            <div className="border-b py-2">
              <p className="text-gray-600">
                HIN :{" "}
                {(admittedPatient?.patient_info?.hin || admittedPatient?.patient?.hin) ? admittedPatient.patient_info.hin.slice(0, 4) +
                  "••••••" +
                  admittedPatient.patient_info.hin.slice(-2) : 'N/A'}
              </p>
            </div>
            {admittedPatient?.staff_info && (
              <div className="flex items-center gap-1 text-gray-600 pt-3">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.50165 9.24984C9.88142 9.24984 11.8452 11.0312 12.1322 13.3332H2.87109C3.15814 11.0312 5.12187 9.24984 7.50165 9.24984ZM6.44401 10.5795C5.60773 10.8447 4.90335 11.4159 4.46914 12.1665H7.50165L6.44401 10.5795ZM8.55953 10.5797L7.50165 12.1665H10.5342C10.1 11.416 9.39574 10.8448 8.55953 10.5797ZM11.0017 1.6665V5.1665C11.0017 7.0995 9.43464 8.6665 7.50165 8.6665C5.56866 8.6665 4.00166 7.0995 4.00166 5.1665V1.6665H11.0017ZM5.16832 5.1665C5.16832 6.45515 6.21299 7.49984 7.50165 7.49984C8.79035 7.49984 9.83499 6.45515 9.83499 5.1665H5.16832ZM9.83499 2.83317H5.16832L5.16826 3.99984H9.83493L9.83499 2.83317Z"
                    fill="var(--color-docuhealth-dark)"
                  />
                </svg>
                <p className="">
                  {" "}
                  {`${admittedPatient.staff_info.firstname} ${admittedPatient.staff_info.lastname}`}
                </p>
              </div>
            )}
            {admittedPatient?.ward_info && (
              <div className="flex items-center gap-1 text-gray-600 pt-1 ">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.66634 11.666V8.16602H9.33301V11.666H11.083V2.33268H2.91634V11.666H4.66634ZM5.83301 11.666H8.16634V9.33268H5.83301V11.666ZM12.2497 11.666H13.4163V12.8327H0.583008V11.666H1.74967V1.74935C1.74967 1.42719 2.01084 1.16602 2.33301 1.16602H11.6663C11.9885 1.16602 12.2497 1.42719 12.2497 1.74935V11.666ZM6.41634 4.66602V3.49935H7.58301V4.66602H8.74967V5.83268H7.58301V6.99935H6.41634V5.83268H5.24967V4.66602H6.41634Z"
                    fill="var(--color-docuhealth-dark)"
                  />
                </svg>

                <p className="">
                  admitted to :{" "}
                  {`${admittedPatient.ward_info.name} ward`}
                </p>
              </div>
            )}

            {admittedPatient?.bed_info && (
              <div className="flex items-center gap-1 text-gray-600 pt-1 ">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.8337 6.41536V11.6654H11.667V9.91536H2.33366V11.6654H1.16699V2.33203H2.33366V8.16536H7.00033V4.08203H10.5003C11.789 4.08203 12.8337 5.1267 12.8337 6.41536ZM11.667 8.16536V6.41536C11.667 5.77103 11.1447 5.2487 10.5003 5.2487H8.16699V8.16536H11.667ZM4.66699 6.41536C4.98916 6.41536 5.25033 6.15421 5.25033 5.83203C5.25033 5.50987 4.98916 5.2487 4.66699 5.2487C4.34483 5.2487 4.08366 5.50987 4.08366 5.83203C4.08366 6.15421 4.34483 6.41536 4.66699 6.41536ZM4.66699 7.58203C3.7005 7.58203 2.91699 6.79856 2.91699 5.83203C2.91699 4.86554 3.7005 4.08203 4.66699 4.08203C5.63349 4.08203 6.41699 4.86554 6.41699 5.83203C6.41699 6.79856 5.63349 7.58203 4.66699 7.58203Z"
                    fill="var(--color-docuhealth-dark)"
                  />
                </svg>

                <p className="">
                  {`Bed ${admittedPatient.bed_info.bed_number}`}
                </p>
              </div>
            )}
            <div className="flex items-center gap-1 text-gray-600 pt-1 pb-3 border-b">
              <svg
                width="15"
                height="15"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.08366 1.7487V0.582031H5.25033V1.7487H8.75033V0.582031H9.91699V1.7487H12.2503C12.5725 1.7487 12.8337 2.00987 12.8337 2.33203V5.2487H11.667V2.91536H9.91699V4.08203H8.75033V2.91536H5.25033V4.08203H4.08366V2.91536H2.33366V11.082H5.83366V12.2487H1.75033C1.42816 12.2487 1.16699 11.9875 1.16699 11.6654V2.33203C1.16699 2.00987 1.42816 1.7487 1.75033 1.7487H4.08366ZM9.91699 6.9987C8.62835 6.9987 7.58366 8.04339 7.58366 9.33203C7.58366 10.6207 8.62835 11.6654 9.91699 11.6654C11.2056 11.6654 12.2503 10.6207 12.2503 9.33203C12.2503 8.04339 11.2056 6.9987 9.91699 6.9987ZM6.41699 9.33203C6.41699 7.39904 7.984 5.83203 9.91699 5.83203C11.85 5.83203 13.417 7.39904 13.417 9.33203C13.417 11.265 11.85 12.832 9.91699 12.832C7.984 12.832 6.41699 11.265 6.41699 9.33203ZM9.33366 7.58203V9.57365L10.6712 10.9112L11.4961 10.0862L10.5003 9.09041V7.58203H9.33366Z"
                  fill="var(--color-docuhealth-dark)"
                />
              </svg>

              <p className="">
                {formatFullDateTime(admittedPatient.admission_date)}
              </p>
            </div>
            <button
              className="text-center mt-3 py-2.5 border bg-docuhealth-dark text-white w-full rounded-full cursor-pointer"
              onClick={() => {
                setAdvanceCheckUp(true);
                setSelected(admittedPatient);
                setSelectedPatient(admittedPatient);
                setAdvanceCheckUpSource('active')
              }}
            >
              View patient's details
            </button>
            {admittedPatient?.status === "awaiting_nurse_discharge" ? (
              <button
                type="button"
                disabled
                title="A doctor discharge has already been recorded. A nurse will complete the discharge and free the bed."
                className="text-center mt-3 py-2 border border-gray-200 text-gray-400 w-full rounded-full cursor-not-allowed"
              >
                Awaiting nurse discharge
              </button>
            ) : (
              <button
                className="text-center mt-3 py-2 border border-docuhealth-dark text-docuhealth-dark w-full rounded-full cursor-pointer"
                onClick={() => onDischargePatient(admittedPatient)}
              >
                Discharge Patient
              </button>
            )}
          </div>
        ))}
      </div>
      </>)}

      <Pagination
        count={count}
        currentPage={currentPage}
        totalPages={totalPages}
        fetchData={fetchAdmittedPatients}
        tab={tab}
      />
    </>
  );
};

const OutPatientsTab = ({ setAdvanceCheckUp, setSelected, setAdvanceCheckUpSource }) => {
  const {
    admittedPatients: outPatients,
    loading,
    count,
    currentPage,
    totalPages,
    refetch: fetchOutPatients,
    tab,
    searchQuery,
    setSearchQuery,
    isRefreshing,
  } = useContext(DoctorsAdmittedPatientMGTContext);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const sortedOutPatients = useMemo(() => {
    return [...outPatients].sort((a, b) => {
      const dateA = new Date(a.created_at || a.admission_date).getTime();
      const dateB = new Date(b.created_at || b.admission_date).getTime();
      return dateB - dateA;
    });
  }, [outPatients]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-sm">
        Loading...
      </div>
    );
  }

  if (outPatients.length === 0 && !searchQuery) {
    return (
      <div className="flex flex-col justify-center items-center text-center  h-full">
        <h2 className="font-medium pb-1 mt-4">No out patients!</h2>
        <div className="max-w-md text-center">
          <p className="text-[12px] text-gray-500">
            You currently don’t have any out patients.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search patient's name or HIN..."
        />
        {isRefreshing && (
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5 w-full">
            <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#3E4095] rounded-full animate-spin"></span>
            Searching...
          </p>
        )}
      </div>

      {outPatients.length === 0 && searchQuery ? (
        <div className="py-12 text-center text-gray-500 text-sm">
          <p className="font-medium">No results found.</p>
          <p className="text-xs text-gray-400 mt-1">Try a different search term.</p>
        </div>
      ) : (
      <>
      <div className="my-4 text-[12px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sortedOutPatients.map((outPatient, index) => (
          <div key={index} className="border p-3 rounded-xl">
            <div className="flex justify-between items-center">
              <p className="flex items-center gap-2">
                <span>
                  {outPatient?.patient_info?.firstname}{" "}
                  {outPatient?.patient_info?.lastname}{" "}
                </span>
                {outPatient?.patient_info?.payment_provider?.type && (
                  <span className="text-[10px] font-bold uppercase bg-docuhealth-light-green text-docuhealth-green px-2 py-0.5 rounded-full">
                    {outPatient.patient_info.payment_provider.type}
                  </span>
                )}
              </p>
              <div className="bg-docuhealth-light-green px-2 rounded-full">
                <p className="text-docuhealth-green ">
                  {formatRecordDate(outPatient.admission_date)}
                </p>
              </div>
            </div>
            <div className="border-b py-2">
              <p className="text-gray-600">
                HIN :{" "}
                {(outPatient?.patient_info?.hin || outPatient?.patient?.hin) ? outPatient.patient_info.hin.slice(0, 4) +
                  "••••••" +
                  outPatient.patient_info.hin.slice(-2) : 'N/A'}
              </p>
            </div>
            {outPatient?.staff_info && (
              <div className="flex items-center gap-1 text-gray-600 pt-3">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.50165 9.24984C9.88142 9.24984 11.8452 11.0312 12.1322 13.3332H2.87109C3.15814 11.0312 5.12187 9.24984 7.50165 9.24984ZM6.44401 10.5795C5.60773 10.8447 4.90335 11.4159 4.46914 12.1665H7.50165L6.44401 10.5795ZM8.55953 10.5797L7.50165 12.1665H10.5342C10.1 11.416 9.39574 10.8448 8.55953 10.5797ZM11.0017 1.6665V5.1665C11.0017 7.0995 9.43464 8.6665 7.50165 8.6665C5.56866 8.6665 4.00166 7.0995 4.00166 5.1665V1.6665H11.0017ZM5.16832 5.1665C5.16832 6.45515 6.21299 7.49984 7.50165 7.49984C8.79035 7.49984 9.83499 6.45515 9.83499 5.1665H5.16832ZM9.83499 2.83317H5.16832L5.16826 3.99984H9.83493L9.83499 2.83317Z" fill="var(--color-docuhealth-dark)"/>
                </svg>
                <p className="">
                  {" "}
                  {`Dr. ${outPatient.staff_info.firstname} ${outPatient.staff_info.lastname}`}
                </p>
              </div>
            )}
            <div className="flex items-center gap-1 text-gray-600 pt-1 ">
              <i className="bx bx-phone text-[15px] text-docuhealth-dark"></i>
              <p className="">
                {outPatient?.patient_info?.phone_num || "No phone number"}
              </p>
            </div>
            <div className="flex items-center gap-1 text-gray-600 pt-1 pb-3 border-b">
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.08366 1.7487V0.582031H5.25033V1.7487H8.75033V0.582031H9.91699V1.7487H12.2503C12.5725 1.7487 12.8337 2.00987 12.8337 2.33203V5.2487H11.667V2.91536H9.91699V4.08203H8.75033V2.91536H5.25033V4.08203H4.08366V2.91536H2.33366V11.082H5.83366V12.2487H1.75033C1.42816 12.2487 1.16699 11.9875 1.16699 11.6654V2.33203C1.16699 2.00987 1.42816 1.7487 1.75033 1.7487H4.08366ZM9.91699 6.9987C8.62835 6.9987 7.58366 8.04339 7.58366 9.33203C7.58366 10.6207 8.62835 11.6654 9.91699 11.6654C11.2056 11.6654 12.2503 10.6207 12.2503 9.33203C12.2503 8.04339 11.2056 6.9987 9.91699 6.9987ZM6.41699 9.33203C6.41699 7.39904 7.984 5.83203 9.91699 5.83203C11.85 5.83203 13.417 7.39904 13.417 9.33203C13.417 11.265 11.85 12.832 9.91699 9.33203ZM9.33366 7.58203V9.57365L10.6712 10.9112L11.4961 10.0862L10.5003 9.09041V7.58203H9.33366Z" fill="var(--color-docuhealth-dark)"/>
              </svg>
              <p className="">{formatFullDateTime(outPatient.created_at || outPatient.admission_date)}</p>
            </div>
            <button
              className="text-center mt-4 py-2.5 border bg-docuhealth-dark text-white w-full rounded-full cursor-pointer"
              onClick={() => {
                setAdvanceCheckUp(true);
                setSelected(outPatient);
                setSelectedPatient(outPatient);
                setAdvanceCheckUpSource('outpatient')
              }}
            >
              View patient's details
            </button>
          </div>
        ))}
      </div>
      </>)}

      <Pagination
        count={count}
        currentPage={currentPage}
        totalPages={totalPages}
        fetchData={fetchOutPatients}
        tab={tab}
      />
    </>
  );
};

const DischargedPatientsTab = ({ setAdvanceCheckUp, setSelected, setAdvanceCheckUpSource }) => {
  const {
    admittedPatients,
    loading,
    count,
    currentPage,
    totalPages,
    refetch: fetchAdmittedPatients,
    tab,
    searchQuery,
    setSearchQuery,
    isRefreshing,
  } = useContext(DoctorsAdmittedPatientMGTContext);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Client-side sort only (search is handled server-side)
  const sortedAdmittedPatients = useMemo(() => {
    return [...admittedPatients].sort((a, b) => {
      const dateA = new Date(a.discharge_date || a.closed_at).getTime();
      const dateB = new Date(b.discharge_date || b.closed_at).getTime();
      return dateB - dateA;
    });
  }, [admittedPatients]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-sm">
        Loading...
      </div>
    );
  }

  if (admittedPatients.length === 0 && !searchQuery) {
    return (
      <div className="flex flex-col justify-center items-center text-center  h-full">
        <svg
          width="200"
          height="200"
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

        <h2 className="font-medium pb-1">No discharged patients!</h2>
        <div className="max-w-md text-center">
          <p className="text-[12px] text-gray-500">
            {" "}
            You currently don’t have any discharged patients.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search patient's name, HIN, or ward name..."
        />
        {isRefreshing && (
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5 w-full">
            <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#3E4095] rounded-full animate-spin"></span>
            Searching...
          </p>
        )}
      </div>

      {admittedPatients.length === 0 && searchQuery ? (
        <div className="py-12 text-center text-gray-500 text-sm">
          <p className="font-medium">No results found.</p>
          <p className="text-xs text-gray-400 mt-1">Try a different search term.</p>
        </div>
      ) : (
      <>
      <div className="my-4 text-[12px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sortedAdmittedPatients.map((admittedPatient, index) => (
          <div key={index} className="border p-3 rounded-xl">
            <div className="flex justify-between items-center">
              <p className="flex items-center gap-2">
                <span>
                  {admittedPatient?.patient_info?.firstname}{" "}
                  {admittedPatient?.patient_info?.lastname}{" "}
                </span>
                {admittedPatient?.patient_info?.payment_provider?.type && (
                  <span className="text-[10px] font-bold uppercase bg-docuhealth-light-green text-docuhealth-green px-2 py-0.5 rounded-full">
                    {admittedPatient.patient_info.payment_provider.type}
                  </span>
                )}
              </p>
              <div className="bg-docuhealth-light-green px-2 rounded-full">
                <p className="text-docuhealth-green ">
                  {formatRecordDate(admittedPatient.discharge_date || admittedPatient.closed_at)}
                </p>
              </div>
            </div>
            <div className="border-b py-2">
              <p className="text-gray-600">
                HIN :{" "}
                {(admittedPatient?.patient_info?.hin || admittedPatient?.patient?.hin) ? admittedPatient.patient_info.hin.slice(0, 4) +
                  "••••••" +
                  admittedPatient.patient_info.hin.slice(-2) : 'N/A'}
              </p>
            </div>
            {admittedPatient?.discharged_by && (
              <div className="flex items-center gap-1 text-gray-600 pt-3">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.50165 9.24984C9.88142 9.24984 11.8452 11.0312 12.1322 13.3332H2.87109C3.15814 11.0312 5.12187 9.24984 7.50165 9.24984ZM6.44401 10.5795C5.60773 10.8447 4.90335 11.4159 4.46914 12.1665H7.50165L6.44401 10.5795ZM8.55953 10.5797L7.50165 12.1665H10.5342C10.1 11.416 9.39574 10.8448 8.55953 10.5797ZM11.0017 1.6665V5.1665C11.0017 7.0995 9.43464 8.6665 7.50165 8.6665C5.56866 8.6665 4.00166 7.0995 4.00166 5.1665V1.6665H11.0017ZM5.16832 5.1665C5.16832 6.45515 6.21299 7.49984 7.50165 7.49984C8.79035 7.49984 9.83499 6.45515 9.83499 5.1665H5.16832ZM9.83499 2.83317H5.16832L5.16826 3.99984H9.83493L9.83499 2.83317Z"
                    fill="var(--color-docuhealth-dark)"
                  />
                </svg>
                <p className="">
                  Discharged by Dr. {admittedPatient.discharged_by.firstname}{" "}
                  {admittedPatient.discharged_by.lastname}
                </p>
              </div>
            )}
            {admittedPatient?.ward_info && (
              <div className="flex items-center gap-1 text-gray-600 pt-1 ">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.66634 11.666V8.16602H9.33301V11.666H11.083V2.33268H2.91634V11.666H4.66634ZM5.83301 11.666H8.16634V9.33268H5.83301V11.666ZM12.2497 11.666H13.4163V12.8327H0.583008V11.666H1.74967V1.74935C1.74967 1.42719 2.01084 1.16602 2.33301 1.16602H11.6663C11.9885 1.16602 12.2497 1.42719 12.2497 1.74935V11.666ZM6.41634 4.66602V3.49935H7.58301V4.66602H8.74967V5.83268H7.58301V6.99935H6.41634V5.83268H5.24967V4.66602H6.41634Z"
                    fill="var(--color-docuhealth-dark)"
                  />
                </svg>

                <p className="">
                  admitted to :{" "}
                  {`${admittedPatient.ward_info.name} ward`}
                </p>
              </div>
            )}

            {admittedPatient?.bed_info && (
              <div className="flex items-center gap-1 text-gray-600 pt-1 ">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.8337 6.41536V11.6654H11.667V9.91536H2.33366V11.6654H1.16699V2.33203H2.33366V8.16536H7.00033V4.08203H10.5003C11.789 4.08203 12.8337 5.1267 12.8337 6.41536ZM11.667 8.16536V6.41536C11.667 5.77103 11.1447 5.2487 10.5003 5.2487H8.16699V8.16536H11.667ZM4.66699 6.41536C4.98916 6.41536 5.25033 6.15421 5.25033 5.83203C5.25033 5.50987 4.98916 5.2487 4.66699 5.2487C4.34483 5.2487 4.08366 5.50987 4.08366 5.83203C4.08366 6.15421 4.34483 6.41536 4.66699 6.41536ZM4.66699 7.58203C3.7005 7.58203 2.91699 6.79856 2.91699 5.83203C2.91699 4.86554 3.7005 4.08203 4.66699 4.08203C5.63349 4.08203 6.41699 4.86554 6.41699 5.83203C6.41699 6.79856 5.63349 7.58203 4.66699 7.58203Z"
                    fill="var(--color-docuhealth-dark)"
                  />
                </svg>

                <p className="">
                  {`Bed ${admittedPatient.bed_info.bed_number}`}
                </p>
              </div>
            )}
            <div className="flex items-center gap-1 text-gray-600 pt-1 pb-3 border-b">
              <svg
                width="15"
                height="15"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.08366 1.7487V0.582031H5.25033V1.7487H8.75033V0.582031H9.91699V1.7487H12.2503C12.5725 1.7487 12.8337 2.00987 12.8337 2.33203V5.2487H11.667V2.91536H9.91699V4.08203H8.75033V2.91536H5.25033V4.08203H4.08366V2.91536H2.33366V11.082H5.83366V12.2487H1.75033C1.42816 12.2487 1.16699 11.9875 1.16699 11.6654V2.33203C1.16699 2.00987 1.42816 1.7487 1.75033 1.7487H4.08366ZM9.91699 6.9987C8.62835 6.9987 7.58366 8.04339 7.58366 9.33203C7.58366 10.6207 8.62835 11.6654 9.91699 11.6654C11.2056 11.6654 12.2503 10.6207 12.2503 9.33203C12.2503 8.04339 11.2056 6.9987 9.91699 6.9987ZM6.41699 9.33203C6.41699 7.39904 7.984 5.83203 9.91699 5.83203C11.85 5.83203 13.417 7.39904 13.417 9.33203C13.417 11.265 11.85 12.832 9.91699 12.832C7.984 12.832 6.41699 11.265 6.41699 9.33203ZM9.33366 7.58203V9.57365L10.6712 10.9112L11.4961 10.0862L10.5003 9.09041V7.58203H9.33366Z"
                  fill="var(--color-docuhealth-dark)"
                />
              </svg>

              <p className="">
                {formatFullDateTime(admittedPatient.discharge_date || admittedPatient.closed_at) || 'Pending'}
              </p>
            </div>
            <button
              className="text-center mt-3 py-2.5 border bg-docuhealth-dark text-white w-full rounded-full cursor-pointer"
              onClick={() => {
                setAdvanceCheckUp(true);
                setSelected(admittedPatient);
                setSelectedPatient(admittedPatient);
                setAdvanceCheckUpSource('discharged')
              }}
            >
              View patient's details
            </button>
          </div>
        ))}
      </div>
      </>)}

      <Pagination
        count={count}
        currentPage={currentPage}
        totalPages={totalPages}
        fetchData={fetchAdmittedPatients}
        tab={tab}
      />
    </>
  );
};

const DischargedPatientsWrapper = (props) => {
  const { tab: activeStatus, setTab } = useContext(DoctorsAdmittedPatientMGTContext);

  return (
    <div className="flex flex-col">
      <div className="flex gap-4 border-b border-gray-200 mb-4">
        <button
          className={`py-2 px-2 text-sm font-medium border-b-2 ${
            activeStatus === "inpatient_discharge"
              ? "border-docuhealth-primary text-docuhealth-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("inpatient_discharge")}
        >
          Inpatient Discharges
        </button>
        <button
          className={`py-2 px-2 text-sm font-medium border-b-2 ${
            activeStatus === "outpatient_discharge"
              ? "border-docuhealth-primary text-docuhealth-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("outpatient_discharge")}
        >
          Outpatient Discharges
        </button>
      </div>
      <DischargedPatientsTab {...props} />
    </div>
  );
};

const getTabs = (advanceCheckUp, setAdvanceCheckUp, setSelected, setAdvanceCheckUpSource, onDischargePatient) => [
  {
    title: "Admitted Patients",
    status: "inpatient",
    content: (
      <AdmittedPatientsTab
        advanceCheckUp={advanceCheckUp}
        setAdvanceCheckUp={setAdvanceCheckUp}
        setSelected={setSelected}
        setAdvanceCheckUpSource={setAdvanceCheckUpSource}
        onDischargePatient={onDischargePatient}
      />
    ),
  },

  {
    title: "Out Patients",
    status: "outpatient",
    content: (
      <OutPatientsTab
        setAdvanceCheckUp={setAdvanceCheckUp}
        setSelected={setSelected}
        setAdvanceCheckUpSource={setAdvanceCheckUpSource}
      />
    ),
  },

  {
    title: "Discharged Patients",
    status: ["inpatient_discharge", "outpatient_discharge"],
    defaultStatus: "inpatient_discharge",
    content: <DischargedPatientsWrapper
      advanceCheckUp={advanceCheckUp}
      setAdvanceCheckUp={setAdvanceCheckUp}
      setSelected={setSelected}
      setAdvanceCheckUpSource={setAdvanceCheckUpSource}
    />,
  },
];

export default getTabs;
