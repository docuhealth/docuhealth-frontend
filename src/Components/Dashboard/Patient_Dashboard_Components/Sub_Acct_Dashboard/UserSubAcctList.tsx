import React, { useState, useEffect, useContext } from "react";
import Pagination2 from "../Pagination/Pagination2";
import toast from "react-hot-toast";
import UserSubAcctRecords from "./Components/UserSubAcctRecords";
import UserSubAcctMedicalRecords from "./Components/UserSubAcctMedicalRecords";
import MedicalRecordsDetail from "../Home_Dashboard/MedicalRecordsDetail";
import SearchBar from "../../../../Components/SearchBar/SearchBar";
import { SubAccount } from "../../../../types/patients/sub-accounts";
import { useSubaccountMedicalRecords } from "../../../../hooks/patients/useSubaccountMedicalRecords";

interface UserSubAcctListProps {
  setDisplaySubAcctModal: (value: boolean) => void;
  subAccounts: SubAccount[];
  isPending: boolean;
  isFetching: boolean;
  count: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const UserSubAcctList = ({
  setDisplaySubAcctModal,
  subAccounts,
  isPending,
  isFetching,
  count,
  currentPage,
  setCurrentPage,
  totalPages,
  searchQuery,
  setSearchQuery,
}: UserSubAcctListProps) => {



  const [viewDetailMedicalRecord, setViewDetailMedicalRecord] = useState(false);
  const [selectedSubAcct, setSelectedSubAcct] = useState<SubAccount | null>(null);
  const [viewSubAcctDetailMedicalRecord, setViewSubAcctDetailMedicalRecord] = useState(false);
  const [subAcctMedicalRecordsDetail, setSubAcctMedicalRecordsDetail] = useState<any>([]);

  // Local state for sub-account pagination
  const [subAcctCurrentPage, setSubAcctCurrentPage] = useState(1);
  const pageSize = 6;

  const {
    data: medicalRecordsData,
    isPending: subAcctMedicalRecordsLoading
  } = useSubaccountMedicalRecords(selectedSubAcct?.hin, subAcctCurrentPage, pageSize);



  const subAcctMedicalRecords = medicalRecordsData?.results || [];
  const subAcctCount = medicalRecordsData?.count || 0;
  const subAcctTotalPages = Math.ceil(subAcctCount / pageSize);

  // Logic to handle going back to the list
  const handleBackToList = () => {
    setViewDetailMedicalRecord(false);
    setSelectedSubAcct(null);
    setSubAcctCurrentPage(1); // Reset page for next time
  };


  return (
    <>
      {viewDetailMedicalRecord ? (
        viewSubAcctDetailMedicalRecord ? (
          <>
            <MedicalRecordsDetail selectedMedicalRecord={subAcctMedicalRecordsDetail} setViewDetailMedicalRecord={setViewSubAcctDetailMedicalRecord} />
          </>
        ) : (
          <>
            <UserSubAcctMedicalRecords
            subAcctMedicalRecords={subAcctMedicalRecords}
            subAcctMedicalRecordsLoading={subAcctMedicalRecordsLoading}
            setViewDetailMedicalRecord={handleBackToList} // Passing back logic
            subAcctCount={subAcctCount}
            subAcctCurrentPage={subAcctCurrentPage}
            setSubAcctCurrentPage={setSubAcctCurrentPage} // Pass the setter directly
            subAcctTotalPages={subAcctTotalPages}
            setViewSubAcctDetailMedicalRecord={setViewSubAcctDetailMedicalRecord}
            setSubAcctMedicalRecordsDetail={setSubAcctMedicalRecordsDetail}
            />
          </>
        )
      ) : (
        <div className="hidden lg:block pt-8 px-6 border rounded-lg bg-white my-5">
          <h1 className="mb-4 font-medium">Sub-Accounts</h1>
          <div className="mb-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name or HIN..."
            />
            {isFetching && (
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#3E4095] rounded-full animate-spin"></span>
                Searching...
              </p>
            )}
          </div>
          <div>
            <UserSubAcctRecords
              subAccounts={subAccounts}
              isPending={isPending}
              setDisplaySubAcctModal={setDisplaySubAcctModal}
              setViewDetailMedicalRecord={setViewDetailMedicalRecord}
              setSelectedSubAcct={setSelectedSubAcct}
            />
          </div>
          <div className="">
            <Pagination2
              count={count}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default UserSubAcctList;
