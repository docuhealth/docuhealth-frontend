import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DynamicDate from "../../Components/DynamicDate/DynamicDate";
import UserSubAcctNoticeDisplay from "../../Components/Dashboard/Patient_Dashboard_Components/Sub_Acct_Dashboard/UserSubAcctNoticeDisplay";
import UserSubAcctOverlay from "../../Components/Dashboard/Patient_Dashboard_Components/Sub_Acct_Dashboard/UserCreateSubAcctOverlay";
import toast from "react-hot-toast";
import UserSubAcctList from "../../Components/Dashboard/Patient_Dashboard_Components/Sub_Acct_Dashboard/UserSubAcctList";
import UserSubAcctUpgradeModal from "../../Components/Dashboard/Patient_Dashboard_Components/Sub_Acct_Dashboard/UserSubAcctUpgradeModal";
import UserUpgradeSubAcctNotification from "../../Components/Dashboard/Patient_Dashboard_Components/Sub_Acct_Dashboard/UserUpgradeSubAcctNotification";
import UserSubAcctListMobile from "../../Components/Dashboard/Patient_Dashboard_Components/Sub_Acct_Dashboard/UserSubAcctListMobile";
import { useHasActiveSubscription } from "../../hooks/patients/useHasActiveSubscription";

import { keepPreviousData } from "@tanstack/react-query";
import { useSubaccounts } from "../../hooks/patients/useSubaccounts";
import { useCreateSubaccount } from "../../hooks/patients/useCreateSubaccount";
import { useUpgradeSubaccount } from "../../hooks/patients/useUpgradeSubaccount";
import useDebounce from "../../hooks/useDebounce";
import { getToken } from "../../services/authService";
import { getPasswordRequirements, isPasswordValid as checkPasswordValid } from "../../utils/passwordStrength";

const Patient_SubAccount_Dashboard = () => {
    const navigate = useNavigate();

  const [noticeDisplay, setNoticeDisplay] = useState(false);
  const [showCreateSubAcctOverlay, setShowCreateSubAcctOverlay] =
    useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 6;
  const debouncedSearch = useDebounce(searchQuery, 300);
  const isUserLoggedIn = !!getToken();
  const hasSubscription = useHasActiveSubscription();

  const { data: subAccountsData, isPending, isFetching, isError, error } = useSubaccounts(
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

  const subAccounts = subAccountsData?.results || [];
  const count = subAccountsData?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    middlename: "",
    dob: "",
    gender: "",
  });

  const [displaySubAcctModal, setDisplaySubAcctModal] = useState(false);
  const [subAcctUpgradeData, setSubAcctUpgradeData] = useState({
    child_email: "",
    child_hin: "",
    child_phone_number: "",
    child_password: "",
    confirm_password: "",
    child_state: "",
    child_stateCode: "",
    child_city: "",
    child_street: "",
    child_house_number: "",
    child_country: "",
    child_countryCode: "",
  });
  const [subAcctUpgradeStep, setSubAcctUpgradeStep] = useState(1);
  const [subAcctUpgradeLoading, setSubAcctUpgradeLoading] = useState(false);
  const [subAcctUpgradeSuccessNot, setSubAcctUpgradeSuccessNot] =
    useState(false);

  const handleSubAcctUpgradeDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSubAcctUpgradeData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNextStepSubAcctUpgrade = () => {
    if (
      subAcctUpgradeData.child_email &&
      subAcctUpgradeData.child_phone_number &&
      subAcctUpgradeData.child_hin &&
      subAcctUpgradeData.child_country
    ) {
      setSubAcctUpgradeStep(2);
    } else {
      toast.error("Please fill all fields.");
    }
  };

  const handleFinalStepSubAcctUpgrade = () => {
    if (
      subAcctUpgradeData.child_password &&
      subAcctUpgradeData.confirm_password &&
      subAcctUpgradeData.child_password ===
      subAcctUpgradeData.confirm_password &&
      isPasswordValid
    ) {
      setSubAcctUpgradeStep(3);
    } else {
      toast.error(
        "Please fill all fields correctly and ensure password is strong.",
      );
    }
  };

  const isValid =
    subAcctUpgradeData.child_state.trim() !== "" &&
    subAcctUpgradeData.child_house_number.trim() !== "" &&
    subAcctUpgradeData.child_street.trim() !== "" &&
    subAcctUpgradeData.child_city.trim() !== "";

  const upgradeSubAcctMutation = useUpgradeSubaccount({
    onSuccess: () => {
      setDisplaySubAcctModal(false);
      setSubAcctUpgradeSuccessNot(true);

      setSubAcctUpgradeStep(1);
      setSubAcctUpgradeData({
        child_email: "",
        child_hin: "",
        child_phone_number: "",
        child_password: "",
        confirm_password: "",
        child_state: "",
        child_stateCode: "",
        child_city: "",
        child_street: "",
        child_house_number: "",
        child_country: "",
        child_countryCode: "",
      });
    },
    onError: (error: any) => {
      console.error("Error upgrading sub account:", error);
      toast.error(error.response?.data?.message || "Upgrade failed.");
    },
  });

  const handleSubAcctUpgrade = async () => {

    setSubAcctUpgradeLoading(true);



    const payload = {
      email: subAcctUpgradeData.child_email,
      subaccount: subAcctUpgradeData.child_hin,
      phone_num: subAcctUpgradeData.child_phone_number,
      password: subAcctUpgradeData.child_password,
      state: subAcctUpgradeData.child_state,
      city: subAcctUpgradeData.child_city,
      street: subAcctUpgradeData.child_street,
      house_no: subAcctUpgradeData.child_house_number,
      country: subAcctUpgradeData.child_country,
      verify_url:
        "https://docuhealthservices.net/user-create-account-verify-otp",
    };

    if (!isValid) {
      setSubAcctUpgradeLoading(false);
      toast.error("Please fill all fields.");
      return;
    }

    if (!hasSubscription) {
      toast.error("Please subscribe to access feature");
      navigate("/user-subscriptions-dashboard");
      return;
    }
    upgradeSubAcctMutation.mutate(payload);
  };

  const [showPassword, setShowPassword] = useState(false);
  const isPasswordValid = checkPasswordValid(getPasswordRequirements(subAcctUpgradeData.child_password));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const isFormValid =
    formData.firstname.trim() !== "" &&
    formData.lastname.trim() !== "" &&
    formData.middlename.trim() !== "" &&
    formData.dob.trim() !== "" &&
    formData.gender.trim() !== "";

  useEffect(() => {
    // Show notice immediately when the dashboard loads
    setNoticeDisplay(true);

    // Then show the notice every 24 hours (1 day)
    const interval = setInterval(() => {
      setNoticeDisplay(true);
    }, 86400000); // 86,400,000 ms = 24 hours

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const closeNoticeMessage = () => {
    setNoticeDisplay(false);
  };

  const noticeMessage = [
    {
      title: "Sub Account",
      instruction: "Read about the sub account feature below",
      benefitTitle: "Benefits of Sub Account :",
      benefit1:
        "Store and track your child's medical history, including vaccinations, allergies, and illnesses.",
      benefit2:
        " Easily access and share medical information with healthcare providers.",
      benefit3:
        " Transfer ownership to your child when they start using their own mobile device.",
      workTitle: "How it Works:",
      work1:
        " Create a SUB account for your child, providing their basic information.",
      work2:
        " View and easily get access to all of  their medical information when needed.",
      work3:
        "  When your child start using his/her own device, they can take ownership of their own account and start keeping their own health record summary without your permission.",
      lastMessage:
        "By using our SUB account feature, you can ensure your child's medical history is accurate, up-to-date, and easily accessible – giving you peace of mind and empowering your child to take control of their health as they grow older.",
    },
  ];

  const toggleAcctCreationOverlay = () => {
    setShowCreateSubAcctOverlay(!showCreateSubAcctOverlay);
  };

  const closeNoticeMessageToCreateAcct = () => {
    setNoticeDisplay(false);
    setShowCreateSubAcctOverlay(true);
  };

  const subAcctCreationMutation = useCreateSubaccount({
    onSuccess: () => {
      toast.success("Sub account created successfully");
      setShowCreateSubAcctOverlay(false);

      // Reset form here
      setFormData({
        firstname: "",
        lastname: "",
        middlename: "",
        dob: "",
        gender: "",
      });
    },
    onError: (err: any) => {
      console.error("Error creating sub account:", err);
      toast.error("Sub account creation failed");
    },
  });

  const handleSubAcctCreation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

    if (!hasSubscription) {
      toast.error("Please subscribe to access feature");
      navigate("/user-subscriptions-dashboard");
      return;
    }

    subAcctCreationMutation.mutate(formData);
  };

  return (
    <>
      <div className="text-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0">
        <div>
          <DynamicDate />
        </div>

        <div>
          <button
            className="flex justify-center items-center gap-2 px-6 py-2 bg-docuhealth-primary text-white font-medium rounded-full transition w-full cursor-pointer "
            onClick={toggleAcctCreationOverlay}
            disabled={subAcctCreationMutation.isPending}
          >
            Create a sub account
          </button>
        </div>
      </div>
      <div className="">
        <UserSubAcctList 
          setDisplaySubAcctModal={setDisplaySubAcctModal} 
          subAccounts={subAccounts}
          isPending={isPending}
          isFetching={isFetching}
          count={count}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <UserSubAcctListMobile
          setDisplaySubAcctModal={setDisplaySubAcctModal}
          subAccounts={subAccounts}
          isPending={isPending}
          isFetching={isFetching}
          count={count}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>
      <UserSubAcctNoticeDisplay
        noticeDisplay={noticeDisplay}
        noticeMessage={noticeMessage}
        // paymentStatus={paymentStatus}
        closeNoticeMessage={closeNoticeMessage}
        closeNoticeMessageToCreateAcct={closeNoticeMessageToCreateAcct}
      />
      <UserSubAcctOverlay
        showCreateSubAcctOverlay={showCreateSubAcctOverlay}
        handleSubAcctCreation={handleSubAcctCreation}
        toggleAcctCreationOverlay={toggleAcctCreationOverlay}
        formData={formData}
        handleChange={handleChange}
        isFormValid={isFormValid}
        loading={subAcctCreationMutation.isPending}
      />

      <UserSubAcctUpgradeModal
        displaySubAcctModal={displaySubAcctModal}
        setDisplaySubAcctModal={setDisplaySubAcctModal}
        subAcctUpgradeData={subAcctUpgradeData}
        setSubAcctUpgradeData={setSubAcctUpgradeData}
        handleSubAcctUpgradeDataChange={handleSubAcctUpgradeDataChange}
        handleNextStepSubAcctUpgrade={handleNextStepSubAcctUpgrade}
        subAcctUpgradeStep={subAcctUpgradeStep}
        handleSubAcctUpgrade={handleSubAcctUpgrade}
        subAcctUpgradeLoading={upgradeSubAcctMutation.isPending}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        isPasswordValid={isPasswordValid}
        handleFinalStepSubAcctUpgrade={handleFinalStepSubAcctUpgrade}
        isValid={isValid}
      />

      <UserUpgradeSubAcctNotification
        subAcctUpgradeSuccessNot={subAcctUpgradeSuccessNot}
        setSubAcctUpgradeSuccessNot={setSubAcctUpgradeSuccessNot}
      />
    </>
  );
};

export default Patient_SubAccount_Dashboard;
