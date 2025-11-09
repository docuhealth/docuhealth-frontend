import React, {useState, useEffect, useContext} from "react";
import { Link } from "react-router-dom";
import { IdCardContext } from "../../../../../context/Patient Context/IdCardContext";
import toast from "react-hot-toast";
import Id_Card from "../../Home Dashboard/Components/Id Card/Id_Card";

const UserSubAcctRecordsMobile = ({
  subAccounts,
  loading,
  setDisplaySubAcctModal,
  setViewDetailMedicalRecord,
  setSelectedSubAcct
}) => {
  const [openPopover, setOpenPopover] = useState(null);
  const paymentStatus = true; // example placeholder

     const {
      onboardIDCard,
      setOnboardIDCard,
      idCardData,
      handleChange,
      handleIDCardCreation,
      isIDCreatedSuccessfully,
      setIsIDCreatedSuccessfully,
      handleSelection,
      selectedProfile
    } = useContext(IdCardContext);

  const togglePopover = (index) => {
    setOpenPopover(openPopover === index ? null : index);
  };

  const fetchMedicalHistory = (hin) => {
    console.log("Fetching history for", hin);
  };

  const handleOpenForm = (name, hin, dob) => {
    console.log("Generating ID Card for:", { name, hin, dob });
  };

  if (loading) {
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
      <div className="space-y-4">
        {subAccounts.map((subaccount, index) => (
          <div key={index} className=" relative border border-gray-300 p-5 rounded-md">
            <div className="flex justify-between items-center py-2 border-b border-b-gray-200">
              <p>
                HIN:{" "}
                {subaccount.hin.slice(0, 4) +
                  "*".repeat(subaccount.hin.length - 5)}
              </p>
              <div className=" ">
                <i
                  className={`bx bx-dots-vertical-rounded cursor-pointer ${
                    openPopover === index
                      ? "bg-slate-300 rounded-full h-8 w-8 flex justify-center items-center"
                      : "h-8 w-8 flex justify-center items-center"
                  }`}
                  onClick={() => togglePopover(index)}
                ></i>

                {openPopover === index && (
                  <div className="absolute  right-4 mt-2 bg-white border shadow-sm rounded-xs p-2 w-52 z-30">
                    <Link to="">
                      <p
                        className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                        onClick={(index) => {
                          togglePopover(index);
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
                        setDisplaySubAcctModal(true);
                      }}
                    >
                      <p className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer">
                        Upgrade Sub Account
                      </p>
                    </Link>

                    <p
                      className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                       onClick={() => {
                        // if (paymentStatus) {
                        //   handleOpenForm(
                        //     subaccount.firstname + " " + subaccount.lastname,
                        //     subaccount.HIN,
                        //     subaccount.DOB
                        //   );
                        // } else {
                        //   toast.success(
                        //     "Kindly subscribe to a plan to access this feature"
                        //   );
                        // }
                        togglePopover()
                        handleSelection(subaccount)
                 
                      }}
                    >
                      Generate ID Card
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 py-4 gap-4">
                <div className="flex flex-col gap-2">
                    <p className="text-gray-400 text-[13px]">Name</p>
                    <p> {subaccount.firstname} {subaccount.lastname}</p>
                </div>
                <div className="flex justify-center items-center flex-col gap-2 border-l border-l-gray-300 px-4">
                    <p className="text-gray-400 text-[13px]">Date of birth</p>
                    <p> {subaccount.dob}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-gray-400 text-[13px]">Sex</p>
                    <p>{subaccount.gender}</p>
                </div>
                <div className="flex flex-col gap-2 border-l border-l-gray-300 justify-center items-center">
                    <p className="text-gray-400 text-[13px]">Date created</p>
                    <p>12/10/2025</p>
                </div>
            </div>
          </div>
        ))}{" "}
      </div>
      <Id_Card  onboardIDCard ={onboardIDCard} setOnboardIDCard ={setOnboardIDCard}
      idCardData={idCardData} 
      handleChange={handleChange} 
      handleIDCardCreation ={handleIDCardCreation}
      isIDCreatedSuccessfully = {isIDCreatedSuccessfully}
      setIsIDCreatedSuccessfully ={setIsIDCreatedSuccessfully}
      selectedProfile = {selectedProfile} />
    </>
  );
};

export default UserSubAcctRecordsMobile;
