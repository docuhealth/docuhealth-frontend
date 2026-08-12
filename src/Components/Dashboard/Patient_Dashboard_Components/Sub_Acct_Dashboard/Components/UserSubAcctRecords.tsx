import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useIdCardStore } from "../../../../../store/useIdCardStore";
import { useCreateIdCard } from "../../../../../hooks/patients/useCreateIdCard";
import { fetchSubscriptionStatus } from "../../../../../services/authService";
import toast from "react-hot-toast";
import Id_Card from "../../Home_Dashboard/Components/IdCard/Id_Card";
import { SubAccount } from "../../../../../types/patients/sub-accounts";

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


      <div className="flex flex-col ">
        <div className="grid grid-cols-7 text-left text-sm bg-gray-100 py-5 rounded-md">
          <p className=" col-span-2 w-full pl-5 ">Name</p>
          <p className=" w-full  ">HIN</p>
          <p className=" w-full  ">Date of Birth</p>
          <p className=" w-full  ">Sex</p>
          <p className=" w-full  ">Date Created</p>
          <p className=" w-full  "></p>
        </div>
        {subAccounts.map((subaccount, index) => (
          <div key={index} className=" relative">
            {/* Left Section */}
            <div className="grid grid-cols-7 items-center text-[12px] text-gray-700 text-left w-full  border-b border-b-gray-200">
              <div className="font-semibold col-span-2 w-full py-6 pl-5 flex items-center gap-3 ">
                <div className="w-9 h-9 rounded-full bg-docuhealth-primary/10  overflow-hidden flex justify-center items-center text-sm font-semibold text-docuhealth-primary ">
                  {subaccount
                    ? `${subaccount.firstname?.[0] || ""}${subaccount.lastname?.[0] || ""
                      }`.toUpperCase()
                    : "NA"}
                </div>
                <p>
                  {subaccount.firstname} {subaccount.middlename}{" "}
                  {subaccount.lastname}
                </p>
              </div>
              <p className=" w-full py-6 ">
                HIN:{" "}
                {subaccount.hin}
                {/* {subaccount.hin.slice(0, 4) +
                  "*".repeat(subaccount.hin.length - 5)} */}
              </p>
              <p className=" w-full py-6 ">DOB: {subaccount.dob}</p>
              <p className=" w-full py-6 ">Sex: {subaccount.gender}</p>
              {/* {subaccount.date_created.split("T")[0]} */}
              <p className="relative  w-full py-6 ">12/10/2025</p>
              <div className="relative w-full py-6 flex justify-center items-center ">
                <div
                  onClick={() => togglePopover(index)}
                  className={`cursor-pointer mr-5 flex justify-center items-center
      h-8 w-8 rounded-full 
      ${openPopover === index ? "bg-slate-300" : "hover:bg-gray-200"}
    `}
                >
                  <i className="bx bx-dots-vertical-rounded text-sm"></i>
                </div>


                {openPopover === index && (
                  <div className="absolute top-14 right-0 mt-2 bg-white border shadow-sm rounded-xs p-2 w-52 z-30">
                    <Link to="">
                      <p
                        className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                        onClick={() => {
                          togglePopover(index)
                          setViewDetailMedicalRecord(true)
                          setSelectedSubAcct(subaccount)
                        }}
                      >
                        Check Medical History
                      </p>
                    </Link>

                    <Link
                      to=""
                      onClick={() => {
                        // example: show upgrade modal
                        togglePopover();
                        setDisplaySubAcctModal(true)
                      }}
                    >
                      <p className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer">
                        Upgrade Sub Account
                      </p>
                    </Link>

                    <p
                      className={`text-[12px] p-2 rounded-sm cursor-pointer ${isCreatingID ? "text-gray-400" : "text-gray-700 hover:bg-gray-200"
                        }`}
                      onClick={() => {
                        if (isCreatingID) return; // Prevent double clicks
                        
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
            </div>

            {/* Action Button */}
          </div>
        ))}
      </div>

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
