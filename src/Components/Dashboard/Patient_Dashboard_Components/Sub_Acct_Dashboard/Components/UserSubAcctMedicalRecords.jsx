import React from "react";
import formatRecordDate from "../../Home Dashboard/Components/formatRecordDate";
import { formatFullDateTime } from "../../Home Dashboard/Components/formatRecordDate";
import { truncateWords } from "../../Home Dashboard/Components/formatRecordDate";
import Pagination from "../../Pagination/Pagination";

const UserSubAcctMedicalRecords = ({
  subAcctMedicalRecords,
  subAcctMedicalRecordsLoading,
  setViewDetailMedicalRecord,

  fetchSubAcctMedicalRecords,
  subAcctCount,
  subAcctCurrentPage,
  subAcctTotalPages,

  setViewSubAcctDetailMedicalRecord,
  setSubAcctMedicalRecordsDetail



}) => {
  if (subAcctMedicalRecordsLoading) {
    return (
      <div className="flex justify-center items-center h-full text-sm py-14">
        Loading...
      </div>
    );
  }
  if (subAcctMedicalRecords.length === 0) {
    return (
      <>
        <div className="py-14">
          <div
            className="text-sm underline flex items-center gap-1 cursor-pointer"
            onClick={() => setViewDetailMedicalRecord(false)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.56528 6.41685H11.6654V7.58352H4.56528L7.69426 10.7125L6.86932 11.5374L2.33203 7.00019L6.86932 2.46289L7.69426 3.28785L4.56528 6.41685Z"
                fill="#1B2B40"
              />
            </svg>

            <p>Go Back</p>
          </div>
          <div className="flex flex-col justify-center items-center text-center  h-full ">
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
            <h2 className="font-medium pb-1">No medical records yet!</h2>
            <div className="max-w-md text-center">
              <p className="text-[12px] text-gray-500">
                {" "}
                No records yet, no hospital has dropped an after-visit summary.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="bg-white my-5 border rounded-2xl pt-8 px-6 ">
        <div
          className="text-sm underline flex items-center gap-1 cursor-pointer pb-3"
          onClick={() => setViewDetailMedicalRecord(false)}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.56528 6.41685H11.6654V7.58352H4.56528L7.69426 10.7125L6.86932 11.5374L2.33203 7.00019L6.86932 2.46289L7.69426 3.28785L4.56528 6.41685Z"
              fill="#1B2B40"
            />
          </svg>

          <p className="text-[#1B2B40]">Go Back</p>
        </div>
        <h1 className="mb-4 font-medium">Sub Account Medical Records</h1>
        <div className="my-4 text-[12px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subAcctMedicalRecords.map((record) => (
            <div key={record.id} className="bg-[#FAFEFF] border rounded-xl p-5">
              <div className="flex justify-between items-center ">
                <div className="flex items-center gap-1">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.50165 9.24984C9.88142 9.24984 11.8452 11.0312 12.1322 13.3332H2.87109C3.15814 11.0312 5.12187 9.24984 7.50165 9.24984ZM6.44401 10.5795C5.60773 10.8447 4.90335 11.4159 4.46914 12.1665H7.50165L6.44401 10.5795ZM8.55953 10.5797L7.50165 12.1665H10.5342C10.1 11.416 9.39574 10.8448 8.55953 10.5797ZM11.0017 1.6665V5.1665C11.0017 7.0995 9.43464 8.6665 7.50165 8.6665C5.56866 8.6665 4.00166 7.0995 4.00166 5.1665V1.6665H11.0017ZM5.16832 5.1665C5.16832 6.45515 6.21299 7.49984 7.50165 7.49984C8.79035 7.49984 9.83499 6.45515 9.83499 5.1665H5.16832ZM9.83499 2.83317H5.16832L5.16826 3.99984H9.83493L9.83499 2.83317Z"
                      fill="#1B2B40"
                    />
                  </svg>
                  <p className="font-medium">Dr Amiefa Obed</p>
                </div>
                <div className="bg-[#D2F5DB] px-2 rounded-full">
                  <p className="text-[#08A913] ">
                    {formatRecordDate(record.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 py-1">
                <div>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.16536 2.25V3.41667H3.9987V5.75C3.9987 7.03864 5.04337 8.08333 6.33203 8.08333C7.62067 8.08333 8.66536 7.03864 8.66536 5.75V3.41667H7.4987V2.25H9.2487C9.57087 2.25 9.83203 2.51117 9.83203 2.83333V5.75C9.83203 7.48408 8.57092 8.92362 6.91583 9.20152L6.91536 10.125C6.91536 11.2526 7.82945 12.1667 8.95703 12.1667C9.83046 12.1667 10.5758 11.6182 10.8674 10.8469C10.2569 10.5742 9.83203 9.96172 9.83203 9.25C9.83203 8.28347 10.6155 7.5 11.582 7.5C12.5486 7.5 13.332 8.28347 13.332 9.25C13.332 10.0498 12.7955 10.7243 12.0627 10.9332C11.7046 12.3137 10.4499 13.3333 8.95703 13.3333C7.1851 13.3333 5.7487 11.8969 5.7487 10.125L5.74881 9.20164C4.09342 8.92397 2.83203 7.48431 2.83203 5.75V2.83333C2.83203 2.51117 3.0932 2.25 3.41536 2.25H5.16536ZM11.582 8.66667C11.2599 8.66667 10.9987 8.92782 10.9987 9.25C10.9987 9.57217 11.2599 9.83333 11.582 9.83333C11.9042 9.83333 12.1654 9.57217 12.1654 9.25C12.1654 8.92782 11.9042 8.66667 11.582 8.66667Z"
                      fill="#1B2B40"
                    />
                  </svg>
                </div>
                <p className="">Medical Doctor</p>
              </div>
              <div className="flex items-center gap-1 pb-1">
                <div>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.16536 12.1665V8.6665H9.83203V12.1665H11.582V2.83317H3.41536V12.1665H5.16536ZM6.33203 12.1665H8.66536V9.83317H6.33203V12.1665ZM12.7487 12.1665H13.9154V13.3332H1.08203V12.1665H2.2487V2.24984C2.2487 1.92767 2.50987 1.6665 2.83203 1.6665H12.1654C12.4875 1.6665 12.7487 1.92767 12.7487 2.24984V12.1665ZM6.91536 5.1665V3.99984H8.08203V5.1665H9.2487V6.33317H8.08203V7.49984H6.91536V6.33317H5.7487V5.1665H6.91536Z"
                      fill="#1B2B40"
                    />
                  </svg>
                </div>
                <p className="">Jarus Hospital</p>
              </div>
              <div className="flex items-center gap-1 pb-3 border-b ">
                <div>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.58464 2.25016V1.0835H5.7513V2.25016H9.2513V1.0835H10.418V2.25016H12.7513C13.0735 2.25016 13.3346 2.51133 13.3346 2.8335V5.75016H12.168V3.41683H10.418V4.5835H9.2513V3.41683H5.7513V4.5835H4.58464V3.41683H2.83464V11.5835H6.33464V12.7502H2.2513C1.92914 12.7502 1.66797 12.489 1.66797 12.1668V2.8335C1.66797 2.51133 1.92914 2.25016 2.2513 2.25016H4.58464ZM10.418 7.50016C9.12933 7.50016 8.08464 8.54485 8.08464 9.8335C8.08464 11.1221 9.12933 12.1668 10.418 12.1668C11.7066 12.1668 12.7513 11.1221 12.7513 9.8335C12.7513 8.54485 11.7066 7.50016 10.418 7.50016ZM6.91797 9.8335C6.91797 7.9005 8.48498 6.3335 10.418 6.3335C12.351 6.3335 13.918 7.9005 13.918 9.8335C13.918 11.7665 12.351 13.3335 10.418 13.3335C8.48498 13.3335 6.91797 11.7665 6.91797 9.8335ZM9.83463 8.0835V10.0751L11.1722 11.4126L11.9971 10.5877L11.0013 9.59188V8.0835H9.83463Z"
                      fill="#1B2B40"
                    />
                  </svg>
                </div>
                <p className="">{formatFullDateTime(record.created_at)}</p>
              </div>
              <div className="py-5">
                <p>{truncateWords(record.chief_complaint, 20)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 ">
                <button
                  className="bg-[#1B2B40] py-2 text-white rounded-full "
                  onClick={() => {
                    setViewSubAcctDetailMedicalRecord(true)
                    setSubAcctMedicalRecordsDetail(record)
                    }
                    
                  }
                >
                  <p>View details</p>
                </button>
                <button className="flex justify-center items-center gap-1 py-2 border border-[#1B2B40] rounded-full">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.5 7H5.5C3.77101 7 2.26977 7.9751 1.5162 9.40535C1.50547 9.27165 1.5 9.13645 1.5 9C1.5 6.2386 3.73857 4 6.5 4V1.25L11.75 5.5L6.5 9.75V7ZM5.5 6H7.5V7.6539L10.1607 5.5L7.5 3.34612V5H6.5C5.28975 5 4.20505 5.53745 3.47156 6.38675C4.10436 6.1357 4.79021 6 5.5 6Z"
                      fill="#1B2B40"
                    />
                  </svg>

                  <p>Share</p>
                </button>
              </div>
            </div>
          ))}
        </div>
        <Pagination count={subAcctCount} currentPage={subAcctCurrentPage} totalPages={subAcctTotalPages} fetchData={fetchSubAcctMedicalRecords} />
      </div>
    </>
  );
};

export default UserSubAcctMedicalRecords;
