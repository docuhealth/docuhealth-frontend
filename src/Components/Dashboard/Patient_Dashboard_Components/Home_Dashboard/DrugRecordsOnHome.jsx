import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPatientDrugRecords } from "../../../../queries/Patient/patientDrugRecords";
import Pagination2 from "../Pagination/Pagination2";

const DrugRecordsOnHome = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["drugRecords", currentPage, pageSize],
    queryFn: fetchPatientDrugRecords,
  });

  const drugRecords = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="bg-white my-5 border rounded-lg py-8 px-6">
      <div className="mb-4">
        {isFetching && (
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#3E4095] rounded-full animate-spin"></span>
            Fetching records...
          </p>
        )}
      </div>

      {isPending ? (
        <div className="flex justify-center items-center ">
          <p className="text-gray-600 text-sm animate-pulse">
            Loading drug records...
          </p>
        </div>
      ) : drugRecords.length === 0 ? (
        <div className="flex flex-col justify-center items-center text-center h-full">
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

          <h2 className="font-medium pb-1">No drug records!</h2>
          <div className="max-w-md text-center">
            <p className="text-[12px] text-gray-500">
              No drug records yet, no hospital or pharmacy has dropped a <br /> drug record.
            </p>
          </div>
        </div>
      ) : (
        <>
          <h2 className="mb-4 pb-2 border-b font-medium">My Drug Records</h2>
          <div className="overflow-x-auto">
            {drugRecords?.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[12px] text-gray-400 border-b">
                    <th className="pb-2 font-normal">Drug Name</th>
                    <th className="pb-2 font-normal">Route</th>
                    <th className="pb-2 font-normal">Qty</th>
                    <th className="pb-2 font-normal">Frequency</th>
                    <th className="pb-2 font-normal">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-[12px]">
                  {drugRecords.map((drug, index) => (
                    <tr
                      key={index}
                      className="border-b last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 font-medium text-docuhealth-primary">
                        {drug.name}
                      </td>
                      <td className="py-3 text-gray-600">{drug.route || "Oral"}</td>
                      <td className="py-3 text-gray-600">{drug.quantity}</td>
                      <td className="py-3 text-gray-600">
                        {typeof drug.frequency === "object"
                          ? `${drug.frequency.value || ""} ( ${drug.frequency.rate || ""} )`
                          : drug.frequency || "N/A"}
                      </td>
                      <td className="py-3 text-gray-600">
                        {typeof drug.duration === "object"
                          ? `${drug.duration.value || ""} ( ${drug.duration.rate || ""} )`
                          : drug.duration || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-[12px] text-gray-500 italic">
                No medication records available.
              </p>
            )}
          </div>
          <div>
            {totalPages > 1 && (
              <Pagination2
                count={count}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DrugRecordsOnHome;
