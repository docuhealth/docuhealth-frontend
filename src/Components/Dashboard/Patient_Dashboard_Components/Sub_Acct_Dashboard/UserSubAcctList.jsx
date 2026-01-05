import React, { useState, useEffect, useContext } from "react";
import Pagination2 from "../Pagination/Pagination2";
import toast from "react-hot-toast";
import { SubAccountContext } from "../../../../context/Patient Context/SubAccountContext";
import UserSubAcctRecords from "./Components/UserSubAcctRecords";
import axiosInstance from "../../../../utils/axiosInstance";
import UserSubAcctMedicalRecords from "./Components/UserSubAcctMedicalRecords";
import MedicalRecordsDetail from "../Home Dashboard/MedicalRecordsDetail";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

const UserSubAcctList = ({ setDisplaySubAcctModal }) => {
  const {
    subAccounts, isPending, count,
    currentPage, setCurrentPage, totalPages
  } = useContext(SubAccountContext);



  const [viewDetailMedicalRecord, setViewDetailMedicalRecord] = useState(false);
  const [selectedSubAcct, setSelectedSubAcct] = useState(null);
  const [viewSubAcctDetailMedicalRecord, setViewSubAcctDetailMedicalRecord] = useState(false);
  const [subAcctMedicalRecordsDetail, setSubAcctMedicalRecordsDetail] = useState([]);

  // Local state for sub-account pagination
  const [subAcctCurrentPage, setSubAcctCurrentPage] = useState(1);
  const pageSize = 6;

  const {
    data: medicalRecordsData,
    isPending: subAcctMedicalRecordsLoading
  } = useQuery({
    queryKey: ["subAcctMedicalRecords", selectedSubAcct?.hin, subAcctCurrentPage],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `api/patients/subaccounts/medical-records/${selectedSubAcct.hin}?page=${subAcctCurrentPage}&size=${pageSize}`
      );
      return res.data;
    },
    enabled: !!selectedSubAcct?.hin, // Only fetch if a sub-account is selected
    placeholderData: keepPreviousData, // Prevents "flicker" when changing pages
  });



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
        <div className="hidden sm:block pt-8 px-6 border rounded-2xl bg-white my-5 ">
          <h1 className=" mb-4 font-medium">Sub-Accounts</h1>
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
