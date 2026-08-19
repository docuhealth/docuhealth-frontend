import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import formatRecordDate from "../../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { formatFullDateTime } from "../../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import Pagination2 from "../../../../Patient_Dashboard_Components/Pagination/Pagination2";
import SearchBar from "../../../../../../Components/SearchBar/SearchBar";
import toast from "react-hot-toast";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useDebounce from "../../../../../../hooks/useDebounce";

const Vitals = ({ setVitals, setSelectedPatient }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 6;

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["assigned-for-vitals", currentPage, debouncedSearch],
    queryFn: async () => {
      let url = `api/nurses/vital-signs/requests?page=${currentPage}&size=${pageSize}`;
      if (debouncedSearch) url += `&search=${debouncedSearch}`;
      const res = await axiosInstanceHos.get(url);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError) {
      toast.error(
        error?.response?.data?.message || "Error fetching assigned patients !",
      );
      console.error(error);
    }
  }, [isError, error]);

  const assignedVitals = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-full text-sm">
        Loading...
      </div>
    );
  }

  if (assignedVitals.length === 0 && !searchQuery) {
    return (
      <>
        <div className="flex items-center gap-1 cursor-pointer pt-5 pb-3 text-gray-500 text-sm">
          <div onClick={() => setVitals(false)}>
            <ArrowLeft className="w-4 h-4 text-gray-800" />
          </div>
          <p>Assigned Patients for Vitals</p>
        </div>
        <div className="flex flex-col justify-center items-center text-center h-full">
          <svg width="200" height="200" viewBox="0 0 366 366" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_1517_47151)">
              <circle cx="183" cy="171" r="159" fill="#DBDBDB" />
            </g>
            <circle cx="183" cy="171" r="132" fill="#F6F6F6" />
            <path d="M164.25 114.75V102.25H151.75V114.75H126.75C123.298 114.75 120.5 117.548 120.5 121V221C120.5 224.452 123.298 227.25 126.75 227.25H239.25C242.702 227.25 245.5 224.452 245.5 221V121C245.5 117.548 242.702 114.75 239.25 114.75H214.25V102.25H201.75V114.75H164.25ZM133 158.5H233V214.75H133V158.5ZM133 127.25H151.75V133.5H164.25V127.25H201.75V133.5H214.25V127.25H233V146H133V127.25ZM169.741 164.528L183 177.786L196.257 164.528L205.097 173.366L191.839 186.626L205.096 199.883L196.258 208.721L183 195.464L169.741 208.721L160.903 199.882L174.161 186.626L160.902 173.366L169.741 164.528Z" fill="#929AA3" />
            <defs>
              <filter id="filter0_d_1517_47151" x="0" y="0" width="366" height="366" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dy="12" />
                <feGaussianBlur stdDeviation="12" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0.15 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1517_47151" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1517_47151" result="shape" />
              </filter>
            </defs>
          </svg>
          <h2 className="font-medium pb-1">No patients assigned for vitals!</h2>
          <div className="max-w-md text-center">
            <p className="text-[12px] text-gray-500">
              You currently don't have any patients assigned for vitals.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border mt-3 p-5 text-sm">
        <div className="flex items-center gap-1 cursor-pointer border-b pb-3">
          <div onClick={() => setVitals(false)}>
            <ArrowLeft className="w-4 h-4 text-gray-800" />
          </div>
          <p>Assigned Patients for Vitals</p>
        </div>

        <div className="my-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search patient name, HIN..."
          />
          {isFetching && (
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5 w-full">
              <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#3E4095] rounded-full animate-spin"></span>
              Searching...
            </p>
          )}
        </div>

        {assignedVitals.length === 0 && searchQuery ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            <p className="font-medium">No results found.</p>
            <p className="text-xs text-gray-400 mt-1">Try a different search term.</p>
          </div>
        ) : (
          <>
            <div className="my-4 text-[12px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {assignedVitals.map((vital, index) => (
                <div key={index} className="border p-3 rounded-xl">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">
                      {vital.patient.firstname} {vital.patient.lastname}{" "}
                    </p>
                    <div className="bg-docuhealth-light-green px-2 rounded-full">
                      <p className="text-docuhealth-green">{formatRecordDate(vital.created_at)}</p>
                    </div>
                  </div>

                  <div className="border-b py-2">
                    <p className="text-gray-600">
                      HIN:{" "}
                      {vital.patient_info.hin.slice(0, 4) + "••••••" + vital.patient_info.hin.slice(-2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-gray-600 pt-3">
                    <p className="">{vital.patient.gender}</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 pt-1">
                    <p className="">
                      {vital?.staff
                        ? `${vital?.staff?.role === 'doctor' ? 'Dr. ' + vital.staff.firstname : vital.staff.firstname} ${vital.staff.lastname}`
                        : "NIL"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 pt-1">
                    <p className="">{formatFullDateTime(vital.created_at)}</p>
                  </div>
                  <div className="pt-1 pb-3 border-b">
                    <p className="text-gray-600">
                      Status:{" "}
                      <span className="text-amber-600">{vital.status}</span>
                    </p>
                  </div>

                  <button
                    className="text-center mt-3 py-2 border border-docuhealth-dark text-docuhealth-dark w-full rounded-full cursor-pointer"
                    onClick={() => setSelectedPatient(vital)}
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>
            <Pagination2
              count={count}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </>
        )}
      </div>
    </>
  );
};

export default Vitals;
