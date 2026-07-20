import { useContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReceptionistAdmissionRequestContext } from "../../../../../context/HospitalContext/Receptionist/ReceptionistAdmissionRequestContext";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";
import formatRecordDate from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import axiosInstanceHos from "../../../../../utils/axiosInstanceHos";
import SearchBar from "../../../../SearchBar/SearchBar";
import toast from "react-hot-toast";

const AdmissionRequestList = () => {
  const {
    admissionRequests,
    loading,
    isRefreshing,
    count,
    currentPage,
    totalPages,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
  } = useContext(ReceptionistAdmissionRequestContext);

  console.log(admissionRequests)


  const queryClient = useQueryClient();

  const admissionMutation = useMutation({
    mutationFn: (admissionRequestID) => {
      return axiosInstanceHos.patch(
        `api/hospitals/admissions/${admissionRequestID}/confirm`,
      );
    },
    onSuccess: () => {
      // Invalidate both requested queries
      queryClient.invalidateQueries({
        queryKey: ["hospital-admission-requests"],
      });
      queryClient.invalidateQueries({
        queryKey: ["hospital-patients-receptionist"],
      });

      toast.success("Patient admitted successfully");
    },
    onError: (err) => {
      console.error("Error admitting patient:", err);
      toast.error(err.response?.data?.message || err.response?.data?.detail || "Error admitting patient");
    },
  });

  const onAdmitClick = (id) => {
    // You can add additional logic here, like a confirmation dialog
    admissionMutation.mutate(id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-sm">
        Loading...
      </div>
    );
  }
  if (admissionRequests.length === 0 && !searchQuery) {
    return (
      <div className="flex flex-col justify-center items-center text-center  h-full">
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

        <h2 className="font-medium pb-1">No admission request!</h2>
        <div className="max-w-md text-center">
          <p className="text-[12px] text-gray-500">
            {" "}
            You currently don’t have any admission request.
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
          placeholder="Search patient name, HIN..."
        />
        {isRefreshing && (
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#3E4095] rounded-full animate-spin"></span>
            Searching...
          </p>
        )}
      </div>

      {admissionRequests.length === 0 && searchQuery ? (
        <div className="py-12 text-center text-gray-500 text-sm">
          <p className="font-medium">No results found.</p>
          <p className="text-xs text-gray-400 mt-1">Try a different search term.</p>
        </div>
      ) : (
      <>
      <div className="my-4 text-[12px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {admissionRequests.map((admissionRequest, index) => {
          const isMutatingThis =
            admissionMutation.isPending &&
            admissionMutation.variables === admissionRequest.id;

          return (
            <div key={index} className="border p-3 rounded-xl">
              <div className="flex justify-between items-center">
                <p>
                  {admissionRequest.patient.firstname}{" "}
                  {admissionRequest.patient.lastname}{" "}
                </p>
                <div className="bg-docuhealth-light-green px-2 rounded-full">
                  <p className="text-docuhealth-green ">
                    {formatRecordDate(admissionRequest.request_date) || 'Pending'}
                  </p>
                </div>
              </div>
              <div className="border-b py-2">
                <p className="text-gray-600">
                  HIN :{" "}
                  {admissionRequest.patient.hin.slice(0, 4) +
                    "••••••" +
                    admissionRequest.patient.hin.slice(-2)}
                </p>
              </div>
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
                  {admissionRequest?.staff
                    ? `${admissionRequest?.staff?.role === "doctor" ? `Dr. ` + admissionRequest.staff.firstname : admissionRequest.staff.firstname} ${admissionRequest.staff.lastname}`
                    : "NIL"}
                </p>
              </div>
              <div className="flex items-center gap-1 text-gray-600 pt-1 pb-3 border-b">
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
                  {admissionRequest?.ward_info
                    ? `${admissionRequest.ward_info.name} ward`
                    : "NIL"}
                </p>
              </div>

              <button
                className="text-center mt-3 py-2 border border-docuhealth-dark w-full rounded-full cursor-pointer disabled:opacity-50"
                disabled={admissionMutation.isPending}
                onClick={() => onAdmitClick(admissionRequest.id)}
              >
                {isMutatingThis ? "Admitting..." : "Admit patient"}
              </button>
            </div>
          )


        })}
      </div>
      <Pagination2
        count={count}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
      </>
      )}
    </>
  );
};

export default AdmissionRequestList;
