import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { IdCardContext } from "../../../../../context/Patient Context/IdCardContext";
import toast from "react-hot-toast";
import Id_Card from "../../Home Dashboard/Components/Id Card/Id_Card";


const UserSubAcctRecords = ({ subAccounts, loading, setDisplaySubAcctModal, setViewDetailMedicalRecord, setSelectedSubAcct }) => {
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
                <div className="w-9 h-9 rounded-full bg-[#3E4095]/10  overflow-hidden flex justify-center items-center text-sm font-semibold text-[#3E4095] ">
                  {subaccount
                    ? `${subaccount.firstname?.[0] || ""}${
                         subaccount.lastname?.[0] || ""
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
                {subaccount.hin.slice(0, 4) +
                  "*".repeat(subaccount.hin.length - 5)}
              </p>
              <p className=" w-full py-6 ">DOB: {subaccount.dob}</p>
              <p className=" w-full py-6 ">Sex: {subaccount.gender}</p>
              {/* {subaccount.date_created.split("T")[0]} */}
              <p className="relative  w-full py-6 ">12/10/2025</p>
              <div className="relative  w-full py-6 flex justify-end ">
                <i
                  className={`bx bx-dots-vertical-rounded cursor-pointer mr-5 ${
                    openPopover === index ? "bg-slate-300 rounded-full h-8 w-8 flex justify-center items-center" : "h-8 w-8 flex justify-center items-center"
                  }`}
                  onClick={() => togglePopover(index)}
                ></i>

                {openPopover === index && (
                  <div className="absolute top-14 right-0 mt-2 bg-white border shadow-sm rounded-xs p-2 w-52 z-30">
                    <Link to="">
                      <p
                        className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                        onClick={(index) => {
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

            {/* Action Button */}
          </div>
        ))}
      </div>

      <Id_Card onboardIDCard ={onboardIDCard} setOnboardIDCard ={setOnboardIDCard}
      idCardData={idCardData} 
      handleChange={handleChange} 
      handleIDCardCreation ={handleIDCardCreation}
      isIDCreatedSuccessfully = {isIDCreatedSuccessfully}
      setIsIDCreatedSuccessfully ={setIsIDCreatedSuccessfully}
      selectedProfile = {selectedProfile} />

    </>
  );
};

export default UserSubAcctRecords;
