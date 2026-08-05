import React, { useState } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { useQuery } from "@tanstack/react-query";
import axiosInstanceHos from "../../../utils/axiosInstanceHos";
import Pagination2 from "../../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination2";
import Hospital_Lab_Test_Detail_Dashboard from "../Hospital_Lab/Hospital_Lab_Test_Detail_Dashboard";
import useDebounce from "../../../hooks/useDebounce";

const Hospital_Doctors_Lab_Dashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: labRecordsData, isLoading: labLoading } = useQuery({
    queryKey: ["doctor-lab-records", currentPage, debouncedSearch],
    queryFn: async () => {
      let url = `api/lab/test-orders/appointments?page=${currentPage}&size=${pageSize}`;
      if (debouncedSearch) {
        url += `&search=${encodeURIComponent(debouncedSearch)}`;
      }
      const res = await axiosInstanceHos.get(url);
      return res.data;
    },
    keepPreviousData: true,
  });

  const patientLabRecords = labRecordsData?.results || [];
  const count = labRecordsData?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  const [selectedRecord, setSelectedRecord] = useState(null);

  if (selectedRecord) {
    return (
      <div className="">
        <Hospital_Lab_Test_Detail_Dashboard 
          orderIdProp={selectedRecord} 
          onBackProp={() => setSelectedRecord(null)} 
          isDoctorView={true} 
        />
      </div>
    );
  }

  return (
    <>
      <div className="py-2 text-sm flex justify-between items-center">
        <DynamicDate />
      </div>
      <div className="bg-white my-5 rounded-lg">
        <div className="border rounded-lg p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-2 border-b gap-4">
            <h2 className="font-medium capitalize">
              Lab Results Approvals
            </h2>
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search name or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-docuhealth-primary"
              />
            </div>
          </div>

          {labLoading ? (
            <div className="flex justify-center items-center h-40 text-sm">
              Loading...
            </div>
          ) : !patientLabRecords || patientLabRecords.length === 0 ? (
            <div className="flex flex-col justify-center items-center text-center py-10 h-full">
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
              </svg>
              <h2 className="font-medium pb-1 mt-4">No lab results!</h2>
              <div className="max-w-md text-center">
                <p className="text-[12px] text-gray-500">
                  There are no lab results to approve at the moment.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-[12px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {patientLabRecords.map((record) => (
                  <div key={record.sqid || record.id} className="bg-white border rounded-xl p-4">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-docuhealth-dark text-[15px]">
                        {record?.test_info?.name || "Lab Test"}
                      </p>
                      <div className="bg-docuhealth-primary-muted px-3 py-1 rounded-full">
                        <p className="text-docuhealth-primary text-[11px] font-medium">
                          Lab result
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mb-3">
                      <div className="flex items-center gap-1">
                        <p className="text-gray-400 text-xs">Test Order Status: </p>
                        <p className="text-docuhealth-green text-xs font-semibold capitalize">{record?.status ? record.status.replace("_", " ") : "Ready"}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="text-gray-400 text-xs">Approval Status: </p>
                        <p className={`text-xs font-semibold capitalize ${
                          record?.result_info?.status === 'approved' || record?.result_info?.status === 'accepted' ? 'text-docuhealth-green' : 
                          record?.result_info?.status === 'rejected' ? 'text-red-500' : 
                          record?.result_info?.status === 'pending' ? 'text-amber-500' : 'text-gray-500'
                        }`}>
                          {record?.result_info?.status || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 my-3"></div>

                    <div className="flex items-center gap-2 mb-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      <p className="text-gray-500 text-[12px]">
                        {record?.result_info?.submitted_by ? `${record.result_info.submitted_by.firstname} ${record.result_info.submitted_by.lastname}` : "N/A"}
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mt-0.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      <p className="text-gray-500 text-[12px] leading-snug">
                        {record?.result_info?.created_at ? new Date(record.result_info.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "N/A"}
                      </p>
                    </div>

                    <div className="border-t border-gray-100 my-3"></div>

                    <button 
                      onClick={() => setSelectedRecord(record)}
                      className="w-full bg-docuhealth-primary hover:bg-docuhealth-dark-primary text-white text-[12px] font-medium py-2 rounded-full transition-colors cursor-pointer"
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Pagination2
                  count={count}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Hospital_Doctors_Lab_Dashboard;