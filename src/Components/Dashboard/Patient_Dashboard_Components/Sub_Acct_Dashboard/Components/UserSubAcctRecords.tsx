import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useIdCardStore } from "../../../../../store/useIdCardStore";
import { useCreateIdCard } from "../../../../../hooks/patients/useCreateIdCard";
import { fetchSubscriptionStatus } from "../../../../../services/authService";
import toast from "react-hot-toast";
import Id_Card from "../../Home_Dashboard/Components/IdCard/Id_Card";
import { SubAccount } from "../../../../../types/patients/sub-accounts";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../../../Components/ui/Table";

interface UserSubAcctRecordsProps {
  subAccounts: SubAccount[];
  isPending: boolean;
  setDisplaySubAcctModal: (value: boolean) => void;
  setViewDetailMedicalRecord: (value: boolean) => void;
  setSelectedSubAcct: (subaccount: SubAccount) => void;
}

const UserSubAcctRecords = ({ subAccounts, isPending, setDisplaySubAcctModal, setViewDetailMedicalRecord, setSelectedSubAcct }: UserSubAcctRecordsProps) => {
  const navigate = useNavigate();
  const [openPopover, setOpenPopover] = useState<number | null>(null);
  const paymentStatus = true; // example placeholder

  const {
    onboardIDCard,
    setOnboardIDCard,
    idCardData,
    handleChange,
    isIDCreatedSuccessfully,
    setIsIDCreatedSuccessfully,
    handleSelection,
    selectedProfile
  } = useIdCardStore();
  const { mutate: handleIDCardCreation, isPending: isCreatingID } = useCreateIdCard();

  const togglePopover = (index?: number | null) => {
    setOpenPopover(openPopover === index ? null : (index ?? null));
  };



  const handleOpenForm = (name: string, hin: string, dob: string) => {
    console.log("Generating ID Card for:", { name, hin, dob });
  };

  if (isPending) {
    return <p className="text-center pb-10 text-sm">Loading sub-accounts...</p>;
  }

  if (!subAccounts || subAccounts.length === 0) {
    return (
      <p className="text-center py-6 text-gray-500 text-sm">
        No Sub-Accounts found
      </p>
    );
  }

  return (
    <>


      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>HIN</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Sex</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead>{"  "}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subAccounts.map((subaccount, index) => (
            <TableRow key={index} className="relative">
              <TableCell> 
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-docuhealth-primary/10 overflow-hidden flex justify-center items-center text-sm font-semibold text-docuhealth-primary">
                    {subaccount
                      ? `${subaccount.firstname?.[0] || ""}${subaccount.lastname?.[0] || ""}`.toUpperCase()
                      : "NA"}
                  </div>
                  <p>
                    {subaccount.firstname} {subaccount.middlename} {subaccount.lastname}
                  </p>
                </div>
              </TableCell>
              <TableCell>HIN: {subaccount.hin}</TableCell>
              <TableCell>DOB: {subaccount.dob}</TableCell>
              <TableCell>Sex: {subaccount.gender}</TableCell>
              <TableCell>12/10/2025</TableCell>
              <TableCell>
                <div className="relative flex justify-center items-center">
                  <div
                    onClick={() => togglePopover(index)}
                    className={`cursor-pointer flex justify-center items-center h-8 w-8 rounded-full ${
                      openPopover === index ? "bg-slate-300" : "hover:bg-gray-200"
                    }`}
                  >
                    <i className="bx bx-dots-vertical-rounded text-sm"></i>
                  </div>
                  {openPopover === index && (
                    <div className="absolute top-10 right-0 mt-2 bg-white border shadow-sm rounded-xs p-2 w-52 z-30">
                      <Link to="">
                        <p
                          className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                          onClick={() => {
                            togglePopover(index);
                            setViewDetailMedicalRecord(true);
                            setSelectedSubAcct(subaccount);
                          }}
                        >
                          Check Medical History
                        </p>
                      </Link>
                      <Link
                        to=""
                        onClick={() => {
                          togglePopover();
                          setDisplaySubAcctModal(true);
                        }}
                      >
                        <p className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer">
                          Upgrade Sub Account
                        </p>
                      </Link>
                      <p
                        className={`text-[12px] p-2 rounded-sm cursor-pointer ${
                          isCreatingID ? "text-gray-400" : "text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => {
                          if (isCreatingID) return;
                          const hasSubscription = fetchSubscriptionStatus();
                          if (!hasSubscription) {
                            toast.error("Please subscribe to access feature");
                            navigate("/user-subscriptions-dashboard");
                            return;
                          }
                          togglePopover();
                          handleSelection(subaccount);
                        }}
                      >
                        {isCreatingID ? "Processing..." : "Generate ID Card"}
                      </p>
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Id_Card onboardIDCard={onboardIDCard} setOnboardIDCard={setOnboardIDCard}
        idCardData={idCardData}
        handleChange={handleChange}
        handleIDCardCreation={handleIDCardCreation}
        isCreatingID={isCreatingID}
        isIDCreatedSuccessfully={isIDCreatedSuccessfully}
        setIsIDCreatedSuccessfully={setIsIDCreatedSuccessfully}
        selectedProfile={selectedProfile} />

    </>
  );
};

export default UserSubAcctRecords;
