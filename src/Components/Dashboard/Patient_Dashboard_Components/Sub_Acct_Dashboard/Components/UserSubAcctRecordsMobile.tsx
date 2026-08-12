import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useIdCardStore } from "../../../../../store/useIdCardStore";
import { useCreateIdCard } from "../../../../../hooks/patients/useCreateIdCard";
import { fetchSubscriptionStatus } from "../../../../../services/authService";
import { MoreVertical, User, Calendar, History, TrendingUp, CreditCard } from "lucide-react";
import Id_Card from "../../Home_Dashboard/Components/IdCard/Id_Card";
import toast from "react-hot-toast";
import { SubAccount } from "../../../../../types/patients/sub-accounts";

interface UserSubAcctRecordsMobileProps {
  subAccounts: SubAccount[];
  isPending: boolean;
  setDisplaySubAcctModal: (value: boolean) => void;
  setViewDetailMedicalRecord: (value: boolean) => void;
  setSelectedSubAcct: (subaccount: SubAccount) => void;
}

const UserSubAcctRecordsMobile = ({
  subAccounts,
  isPending,
  setDisplaySubAcctModal,
  setViewDetailMedicalRecord,
  setSelectedSubAcct
}: UserSubAcctRecordsMobileProps) => {
  const navigate = useNavigate();
  const [openPopover, setOpenPopover] = useState<number | null>(null);

  console.log(subAccounts)

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

  const togglePopover = (index: number) => {
    setOpenPopover(openPopover === index ? null : index);
  };

  // console.log(subAccounts)

  if (isPending) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-docuhealth-primary"></div>
      </div>
    );
  }

  if (!subAccounts || subAccounts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500 text-sm">No Sub-Accounts found</p>
      </div>
    );
  }

  

  return (
    <>
      <div className="space-y-4">
        {subAccounts.map((subaccount, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg  overflow-visible">
            {/* Header: Name and Action */}
            <div className="flex justify-between items-start p-4 pb-0">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-docuhealth-primary font-bold shadow-sm">
                  {subaccount.firstname?.[0]}{subaccount.lastname?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-[15px]">
                    {subaccount.firstname} {subaccount.lastname}
                  </h3>
                  <p className="text-[11px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                    {/* HIN: {subaccount.hin.slice(0, 4)}•••• */}
                    HIN: {subaccount.hin}
                  </p>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => togglePopover(index)}
                  className={`p-2 rounded-full transition-colors ${
                    openPopover === index ? "bg-gray-100 text-docuhealth-primary" : "text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {openPopover === index && (
                  <>
                    {/* Backdrop to close popover */}
                    <div className="fixed inset-0 z-20" onClick={() => setOpenPopover(null)}></div>
                    <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg p-1.5 w-56 z-30 animate-in fade-in zoom-in duration-150">
                      <button
                        className="w-full flex items-center gap-3 text-[12px] text-gray-700 hover:bg-indigo-50 hover:text-docuhealth-primary p-2.5 rounded-lg transition-colors"
                        onClick={() => {
                          setOpenPopover(null);
                          setViewDetailMedicalRecord(true);
                          setSelectedSubAcct(subaccount);
                        }}
                      >
                        {/* <History className="w-4 h-4" />  */}
                        Check Medical History
                      </button>

                      <button
                        className="w-full flex items-center gap-3 text-[12px] text-gray-700 hover:bg-indigo-50 hover:text-docuhealth-primary p-2.5 rounded-lg transition-colors"
                        onClick={() => {
                          setOpenPopover(null);
                          setDisplaySubAcctModal(true);
                        }}
                      >
                        {/* <TrendingUp className="w-4 h-4" />  */}
                        Upgrade Account
                      </button>

                      <button
                        disabled={isCreatingID}
                        className={`w-full flex items-center gap-3 text-[12px] p-2.5 rounded-lg transition-colors ${
                          isCreatingID ? "text-gray-300" : "text-gray-700 hover:bg-indigo-50 hover:text-docuhealth-primary"
                        }`}
                        onClick={() => {
                          if (isCreatingID) return;
                          
                          const hasSubscription = fetchSubscriptionStatus();
                          if (!hasSubscription) {
                            toast.error("Please subscribe to access feature");
                            navigate("/user-subscriptions-dashboard");
                            return;
                          }

                          setOpenPopover(null);
                          handleSelection(subaccount);
                        }}
                      >
                        {/* <CreditCard className="w-4 h-4" /> */}
                        {isCreatingID ? "Processing..." : "Generate ID Card"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="p-4 pt-6 grid grid-cols-2 gap-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                  <Calendar className="w-3 h-3" /> Date of Birth
                </div>
                <p className="text-[13px] font-semibold text-gray-700">{subaccount.dob || "—"}</p>
              </div>

              <div className="space-y-1 pl-4 border-l border-gray-100">
                <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                  <User className="w-3 h-3" /> Sex
                </div>
                <p className="text-[13px] font-semibold text-gray-700 capitalize">{subaccount.gender || "—"}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                   Created
                </div>
                <p className="text-[13px] font-semibold text-gray-700">12 Oct, 2025</p>
              </div>

              <div className="space-y-1 pl-4 border-l border-gray-100 flex flex-col justify-center">
                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold w-fit">
                   Active
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Id_Card 
        onboardIDCard={onboardIDCard} 
        setOnboardIDCard={setOnboardIDCard}
        idCardData={idCardData}
        isCreatingID ={isCreatingID}
        handleChange={handleChange}
        handleIDCardCreation={handleIDCardCreation}
        isIDCreatedSuccessfully={isIDCreatedSuccessfully}
        setIsIDCreatedSuccessfully={setIsIDCreatedSuccessfully}
        selectedProfile={selectedProfile} 
      />
    </>
  );
};

export default UserSubAcctRecordsMobile;