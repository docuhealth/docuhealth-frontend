import React, { useState, useEffect } from "react";
import { usePatientDrugRecords } from "../../../../hooks/patients/usePatientDrugRecords";
import { getToken } from "../../../../services/authService";
import useDebounce from "../../../../hooks/useDebounce";
import { keepPreviousData } from "@tanstack/react-query";
import Pagination2 from "../Pagination/Pagination2";
import SearchBar from "../../../../Components/SearchBar/SearchBar";
import EmptyState from "../../../../Components/ui/EmptyState";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../../Components/ui/Table";

const Drug_Records = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 6;
  const debouncedSearch = useDebounce(searchQuery, 300);
  const isUserLoggedIn = !!getToken();

  const { data, isPending, isFetching, isError, error } = usePatientDrugRecords(
    currentPage,
    pageSize,
    debouncedSearch,
    {
      enabled: isUserLoggedIn,
      placeholderData: keepPreviousData,
    }
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const drugRecords = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize);


  return (
    <>
      <div className="bg-white my-5 border rounded-lg py-8 px-6">
        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by drug name..."
          />
          {isFetching && (
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#3E4095] rounded-full animate-spin"></span>
              Searching...
            </p>
          )}
        </div>
        {/* ===== Loading State ===== */}
        {isPending ? (
          <div className="flex justify-center items-center ">
            <p className="text-gray-600 text-sm animate-pulse">
              Loading drug records...
            </p>
          </div>
        ) : drugRecords.length === 0 && searchQuery ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            <p className="font-medium">No results found.</p>
            <p className="text-xs text-gray-400 mt-1">Try a different search term.</p>
          </div>
        ) : drugRecords.length === 0 ? (
          // ===== Empty State =====
          <EmptyState
            title="No drug records!"
            description={<>No drug records yet, no hospital or pharmacy has dropped a <br /> drug record.</>}
          />
        ) : (
          <>
            <h2 className=" mb-4 pb-2 border-b font-medium">
              My Drug Records
            </h2>
              <div className="overflow-x-auto">
                   {drugRecords?.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="text-[12px] text-gray-400">
                            <TableHead className="pb-2 font-normal">Drug Name</TableHead>
                            <TableHead className="pb-2 font-normal">Route</TableHead>
                            <TableHead className="pb-2 font-normal">Qty</TableHead>
                            <TableHead className="pb-2 font-normal">Frequency</TableHead>
                            <TableHead className="pb-2 font-normal">Duration</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="text-[12px]">
                          {drugRecords.map((drug, index) => (
                            <TableRow key={index}>
                              <TableCell className="py-3 font-medium text-docuhealth-primary">
                                {drug.name}
                              </TableCell>
                              <TableCell className="py-3 text-gray-600">{drug.route || "Oral"}</TableCell>
                              <TableCell className="py-3 text-gray-600">{drug.quantity}</TableCell>
                              <TableCell className="py-3 text-gray-600">
                                {/* Handling nested frequency object */}
                                {typeof drug.frequency === 'object'
                                  ? `${drug.frequency.value || ''} ( ${drug.frequency.rate || ''} )`
                                  : drug.frequency || "N/A"}
                              </TableCell>
                              <TableCell className="py-3 text-gray-600">
                                {/* Handling nested duration object */}
                                {typeof drug.duration === 'object'
                                  ? `${drug.duration.value || ''} ( ${drug.duration.rate || ''} )`
                                  : drug.duration || "N/A"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                   ) : (
                     <p className="text-[12px] text-gray-500 italic">No medication records available.</p>
                   )}
                 </div>
            <div>
              <Pagination2
                count={count}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />

            </div>
          </>
        )
        }
      </div>
    </>
  );
};

export default Drug_Records;
