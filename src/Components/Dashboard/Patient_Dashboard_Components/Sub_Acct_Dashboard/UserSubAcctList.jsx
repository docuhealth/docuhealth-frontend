import React, { useState, useEffect, useContext } from "react";
import Pagination from "../Pagination/Pagination";
import toast from "react-hot-toast";
import { SubAccountContext } from "../../../../context/Patient Context/SubAccountContext";
import UserSubAcctRecords from "./Components/UserSubAcctRecords";
import axiosInstance from "../../../../utils/axiosInstance";
import UserSubAcctMedicalRecords from "./Components/UserSubAcctMedicalRecords";
import MedicalRecordsDetail from "../Home Dashboard/MedicalRecordsDetail";

const UserSubAcctList = ({ setDisplaySubAcctModal }) => {
  const { subAccounts } = useContext(SubAccountContext);
  const { setSubAccounts } = useContext(SubAccountContext);
  const { count } = useContext(SubAccountContext);
  const { setCount } = useContext(SubAccountContext);
  const { currentPage } = useContext(SubAccountContext);
  const { setCurrentPage } = useContext(SubAccountContext);
  const { totalPages } = useContext(SubAccountContext);
  const { setTotalPages } = useContext(SubAccountContext);
  const { fetchSubaccounts } = useContext(SubAccountContext);
  const { loading } = useContext(SubAccountContext);
  const [viewDetailMedicalRecord, setViewDetailMedicalRecord] = useState(false);
  const [selectedSubAcct, setSelectedSubAcct] = useState(null);
  const [subAcctMedicalRecordsLoading, setSubAcctMedicalRecordsLoading] =
    useState(false);
  const [subAcctMedicalRecords, setSubAcctMedicalRecords] = useState([]);

  const [viewSubAcctDetailMedicalRecord, setViewSubAcctDetailMedicalRecord] =
    useState(false);
  const [subAcctMedicalRecordsDetail, setSubAcctMedicalRecordsDetail] =
    useState([]);

  const [subAcctCount, setSubAcctCount] = useState(0);
  const [subAcctCurrentPage, setSubAcctCurrentPage] = useState(1);
  const [subAcctTotalPages, setSubAcctTotalPages] = useState(1);

  // ✅ don’t run on mount when it's null/undefined

  const pageSize = 6;

  const fetchSubAcctMedicalRecords = async (page = 1) => {
    setSubAcctMedicalRecordsLoading(true);
    console.log(selectedSubAcct.hin)
    try {
      const res = await axiosInstance.get(
        `api/patients/subaccounts/medical-records/${selectedSubAcct.hin}?page=${page}&size=${pageSize}`
      );
      console.log(res.data);
      setSubAcctMedicalRecords(res.data.results);
      setSubAcctCount(res.data.count || 0);
      setSubAcctCurrentPage(page);
      setSubAcctTotalPages(Math.ceil(res.data.count / pageSize));
    } catch (error) {
      console.error("Error fetching medical records:", error);
      toast.error("Error fetching medical records");
    } finally {
      setSubAcctMedicalRecordsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedSubAcct) return;
    fetchSubAcctMedicalRecords();
  }, [selectedSubAcct]);

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
              setViewDetailMedicalRecord={setViewDetailMedicalRecord}
              fetchSubAcctMedicalRecords={fetchSubAcctMedicalRecords}
              subAcctCount={subAcctCount}
              subAcctCurrentPage={subAcctCurrentPage}
              subAcctTotalPages={subAcctTotalPages}

              setViewSubAcctDetailMedicalRecord ={setViewSubAcctDetailMedicalRecord}
              setSubAcctMedicalRecordsDetail = {setSubAcctMedicalRecordsDetail}
            />
          </>
        )
      ) : (
        <div className="hidden sm:block pt-8 px-6 border rounded-2xl bg-white my-5 ">
          <h1 className=" mb-4 font-medium">Sub-Accounts</h1>
          <div>
            <UserSubAcctRecords
              subAccounts={subAccounts}
              loading={loading}
              setDisplaySubAcctModal={setDisplaySubAcctModal}
              setViewDetailMedicalRecord={setViewDetailMedicalRecord}
              setSelectedSubAcct={setSelectedSubAcct}
            />
          </div>
          <div className="">
            <Pagination
              count={count}
              setCount={setCount}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              setTotalPages={setTotalPages}
              fetchData={fetchSubaccounts}
              loading={loading}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default UserSubAcctList;
