import React, { useState, useEffect, useContext } from "react";
import { ArrowLeft } from "lucide-react";
import formatRecordDate from "../../../../Patient_Dashboard_Components/Home Dashboard/Components/formatRecordDate";
import { formatFullDateTime } from "../../../../Patient_Dashboard_Components/Home Dashboard/Components/formatRecordDate";
import Pagination2 from "../../../../Patient_Dashboard_Components/Pagination/Pagination2";
import toast from "react-hot-toast";
import axiosInstanceHos from "../../../../../../utils/axiosInstanceHos";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

const Vitals = ({ setVitals, setSelectedPatient }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // Example page size

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["assigned-for-vitals", currentPage],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(
        `api/nurses/vital-signs/requests?page=${currentPage}&size=${pageSize}`
      );
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

    useEffect(() => {
    if (isError) {
      toast.error(
        error?.response?.data?.message ||
          "Error fetching assigned patients !",
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

  if (assignedVitals.length === 0) {
    return (
      <>
        <div className="flex items-center gap-1 cursor-pointer pt-5 pb-3 text-gray-500 text-sm">
          <div
            onClick={() => {
              setVitals(false);
            }}
          >
            <ArrowLeft className="w-4 h-4 text-gray-800" />
          </div>

          <p>Assigned Patients for Vitals</p>
        </div>
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

          <h2 className="font-medium pb-1">No patients assigned for vitals!</h2>
          <div className="max-w-md text-center">
            <p className="text-[12px] text-gray-500">
              {" "}
              You currently don’t have any patients assigned for vitals.
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
          <div
            onClick={() => {
              setVitals(false);
            }}
          >
            <ArrowLeft className="w-4 h-4 text-gray-800" />
          </div>

          <p>Assigned Patients for Vitals</p>
        </div>
        <div className="my-4 text-[12px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignedVitals.map((vital, index) => (
            <div key={index} className="border p-3 rounded-xl">
              <div className="flex justify-between items-center">
                <p className="font-medium">
                  {vital.patient.firstname} {vital.patient.lastname}{" "}
                </p>
                <div className="bg-[#D2F5DB] px-2 rounded-full">
                  <p className="text-[#08A913] ">
                    {formatRecordDate(vital.created_at)}
                  </p>
                </div>
              </div>

              <div className="border-b py-2">
                <p className="text-gray-600">
                  HIN :{" "}
                  {vital.patient.hin.slice(0, 4) +
                    "••••••" +
                    vital.patient.hin.slice(-2)}
                </p>
              </div>

              <div className="flex items-center gap-1 text-gray-600 pt-3 ">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.33301 12.832C2.33301 10.2547 4.42234 8.16536 6.99967 8.16536C9.57702 8.16536 11.6663 10.2547 11.6663 12.832H10.4997C10.4997 10.899 8.93267 9.33203 6.99967 9.33203C5.06668 9.33203 3.49967 10.899 3.49967 12.832H2.33301ZM6.99967 7.58203C5.06592 7.58203 3.49967 6.01578 3.49967 4.08203C3.49967 2.14828 5.06592 0.582031 6.99967 0.582031C8.93342 0.582031 10.4997 2.14828 10.4997 4.08203C10.4997 6.01578 8.93342 7.58203 6.99967 7.58203ZM6.99967 6.41536C8.28884 6.41536 9.33301 5.3712 9.33301 4.08203C9.33301 2.79286 8.28884 1.7487 6.99967 1.7487C5.71051 1.7487 4.66634 2.79286 4.66634 4.08203C4.66634 5.3712 5.71051 6.41536 6.99967 6.41536Z"
                    fill="#1B2B40"
                  />
                </svg>

                <p className="">{vital.patient.gender}</p>
              </div>
              <div className="flex items-center gap-1 text-gray-600 pt-1">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.66634 1.75V2.91667H3.49967V5.25C3.49967 6.53864 4.54434 7.58333 5.83301 7.58333C7.12165 7.58333 8.16634 6.53864 8.16634 5.25V2.91667H6.99967V1.75H8.74967C9.07185 1.75 9.33301 2.01117 9.33301 2.33333V5.25C9.33301 6.98408 8.0719 8.42362 6.41681 8.70152L6.41634 9.625C6.41634 10.7526 7.33042 11.6667 8.45801 11.6667C9.33143 11.6667 10.0768 11.1182 10.3684 10.3469C9.75785 10.0742 9.33301 9.46172 9.33301 8.75C9.33301 7.78347 10.1165 7 11.083 7C12.0495 7 12.833 7.78347 12.833 8.75C12.833 9.54981 12.2965 10.2243 11.5637 10.4332C11.2056 11.8137 9.95087 12.8333 8.45801 12.8333C6.68607 12.8333 5.24967 11.3969 5.24967 9.625L5.24979 8.70164C3.5944 8.42397 2.33301 6.98431 2.33301 5.25V2.33333C2.33301 2.01117 2.59418 1.75 2.91634 1.75H4.66634ZM11.083 8.16667C10.7608 8.16667 10.4997 8.42782 10.4997 8.75C10.4997 9.07217 10.7608 9.33333 11.083 9.33333C11.4052 9.33333 11.6663 9.07217 11.6663 8.75C11.6663 8.42782 11.4052 8.16667 11.083 8.16667Z"
                    fill="#1B2B40"
                  />
                </svg>

                <p className="">
                  {" "}
                  {vital?.staff
                    ? `${vital?.staff?.role ==='doctor' ? 'Dr. ' + vital.staff.firstname : vital.staff.firstname} ${vital.staff.lastname}`
                    : "NIL"}
                </p>
              </div>
              <div className="flex items-center gap-1 text-gray-600 pt-1 ">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.08366 1.7487V0.582031H5.25033V1.7487H8.75033V0.582031H9.91699V1.7487H12.2503C12.5725 1.7487 12.8337 2.00987 12.8337 2.33203V5.2487H11.667V2.91536H9.91699V4.08203H8.75033V2.91536H5.25033V4.08203H4.08366V2.91536H2.33366V11.082H5.83366V12.2487H1.75033C1.42816 12.2487 1.16699 11.9875 1.16699 11.6654V2.33203C1.16699 2.00987 1.42816 1.7487 1.75033 1.7487H4.08366ZM9.91699 6.9987C8.62835 6.9987 7.58366 8.04339 7.58366 9.33203C7.58366 10.6207 8.62835 11.6654 9.91699 11.6654C11.2056 11.6654 12.2503 10.6207 12.2503 9.33203C12.2503 8.04339 11.2056 6.9987 9.91699 6.9987ZM6.41699 9.33203C6.41699 7.39904 7.984 5.83203 9.91699 5.83203C11.85 5.83203 13.417 7.39904 13.417 9.33203C13.417 11.265 11.85 12.832 9.91699 12.832C7.984 12.832 6.41699 11.265 6.41699 9.33203ZM9.33366 7.58203V9.57365L10.6712 10.9112L11.4961 10.0862L10.5003 9.09041V7.58203H9.33366Z"
                    fill="#1B2B40"
                  />
                </svg>

                <p className="">{formatFullDateTime(vital.created_at)}</p>
              </div>
              <div className="pt-1 pb-3 border-b">
                <p className="text-gray-600">
                  Status :{" "}
                  <span className="text-amber-600">{vital.status}</span>
                </p>
              </div>

              <button
                className="text-center mt-3 py-2 border border-[#1B2B40] text-[#1B2B40] w-full rounded-full cursor-pointer"
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
      </div>
    </>
  );
};

export default Vitals;
