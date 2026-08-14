import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPatientDrugRecords } from "../../../../services/patientDashboardService";
import Pagination2 from "../Pagination/Pagination2";
import EmptyState from "../../../../Components/ui/EmptyState";

const DrugRecordsOnHome = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["drugRecords", currentPage, pageSize],
    queryFn: () => fetchPatientDrugRecords(currentPage, pageSize),
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
        <EmptyState
          title="No drug records!"
          description={<>No drug records yet, no hospital or pharmacy has dropped a <br /> drug record.</>}
        />
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
