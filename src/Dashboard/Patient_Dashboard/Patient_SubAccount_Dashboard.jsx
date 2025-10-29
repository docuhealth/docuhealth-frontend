import React, { useState, useEffect } from "react";
import DynamicDate from "../../Components/Dynamic Date/DynamicDate";
import UserSubAcctNoticeDisplay from "../../Components/Dashboard/Patient_Dashboard_Components/Sub_Acct_Dashboard/UserSubAcctNoticeDisplay";
import UserSubAcctOverlay from "../../Components/Dashboard/Patient_Dashboard_Components/Sub_Acct_Dashboard/UserCreateSubAcctOverlay";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import UserSubAcctList from "../../Components/Dashboard/Patient_Dashboard_Components/Sub_Acct_Dashboard/UserSubAcctList";
import UserSubAcctUpgradeModal from "../../Components/Dashboard/Patient_Dashboard_Components/Sub_Acct_Dashboard/UserSubAcctUpgradeModal";
import UserUpgradeSubAcctNotification from "../../Components/Dashboard/Patient_Dashboard_Components/Sub_Acct_Dashboard/UserUpgradeSubAcctNotification";
import UserSubAcctListMobile from "../../Components/Dashboard/Patient_Dashboard_Components/Sub_Acct_Dashboard/UserSubAcctListMobile";
import Id_Card from "../../Components/Dashboard/Patient_Dashboard_Components/Home Dashboard/Components/Id Card/Id_Card";

const Patient_SubAccount_Dashboard = () => {
  const [noticeDisplay, setNoticeDisplay] = useState(false);
  const [showCreateSubAcctOverlay, setShowCreateSubAcctOverlay] =
    useState(false);
  const [loading, setLoading] = useState(false);
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
    child_city: "",
    child_street: "",
    child_house_number: "",
    child_country: "",
  });
  const [subAcctUpgradeStep, setSubAcctUpgradeStep] = useState(1);
  const [subAcctUpgradeLoading, setSubAcctUpgradeLoading] = useState(false);
  const [subAcctUpgradeSuccessNot, setSubAcctUpgradeSuccessNot] =
    useState(false);

  const handleSubAcctUpgradeDataChange = (e) => {
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
        "Please fill all fields correctly and ensure password is strong."
      );
    }
  };

  const isValid =
    subAcctUpgradeData.child_state.trim() !== "" &&
    subAcctUpgradeData.child_house_number.trim() !== "" &&
    subAcctUpgradeData.child_street.trim() !== "" &&
    subAcctUpgradeData.child_city.trim() !== "" 



  const handleSubAcctUpgrade = async () => {
    setSubAcctUpgradeLoading(true);
    // console.log(subAcctUpgradeData);
    

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
    };

    if(!isValid) {
      setSubAcctUpgradeLoading(false);
      toast.error("Please fill all fields.");
      return;
    }

    try {
      const res = await axiosInstance.post(
        `/api/patients/subaccounts/upgrade`,
        payload
      );
      // console.log(res.data);
      setDisplaySubAcctModal(false);
      setSubAcctUpgradeSuccessNot(true);
      setSubAcctUpgradeStep(1);
    } catch (error) {
      console.error("Error upgrading sub account:", error);
      toast.error(error.response?.data?.message || "Upgrade failed.");
    } finally {
      setSubAcctUpgradeLoading(false);
      setSubAcctUpgradeStep(1)
      setSubAcctUpgradeData({
        child_email: "",
        child_hin: "",
        child_phone_number: "",
        child_password: "",
        confirm_password: "",
        child_state: "",
        child_city: "",
        child_street: "",
        child_house_number: "",
        child_country: "",
      });
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSymbol: false,
    hasMinLength: false,
  });
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const validatePassword = (password) => {
    const requirements = {
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      hasMinLength: password.length >= 8,
    };

    setPasswordRequirements(requirements);

    // Check if all requirements are met
    const allRequirementsMet = Object.values(requirements).every(Boolean);
    setIsPasswordValid(allRequirementsMet);
  };

  // Password strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

    if (score <= 1)
      return { strength: score, label: "Very Weak", color: "bg-red-500" };
    if (score <= 2)
      return { strength: score, label: "Weak", color: "bg-orange-500" };
    if (score <= 3)
      return { strength: score, label: "Fair", color: "bg-yellow-500" };
    if (score <= 4)
      return { strength: score, label: "Good", color: "bg-blue-500" };
    return { strength: score, label: "Strong", color: "bg-green-500" };
  };

  const handleChange = (e) => {
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

  const handleSubAcctCreation = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isFormValid) {
      setLoading(false);
      toast.error("Please fill all required fields correctly.");
      return;
    }

    try {
      const res = await axiosInstance.post(
        "/api/patients/subaccounts",
        formData
      );
      console.log(res);
      setShowCreateSubAcctOverlay(false);
    } catch (error) {
      console.error("Error creating sub account:", error);
    } finally {
      setLoading(false);
      setFormData({
        firstname: "",
        lastname: "",
        middlename: "",
        dob: "",
        gender: "",
      });
    }
  };

  //   useEffect(() => {
  //   console.log("Loading state:", loading);
  // }, [loading]);
  

  return (
    <>
      <div className="text-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0">
        <div>
          <DynamicDate />
        </div>

        <div>
          <button
            className="flex justify-center items-center gap-2 px-6 py-2 bg-[#3E4095] text-white font-medium rounded-full transition w-full "
            onClick={toggleAcctCreationOverlay}
            disabled={loading}
          >
            Create a sub account
          </button>
        </div>
      </div>
      <div className="">
        <UserSubAcctList setDisplaySubAcctModal={setDisplaySubAcctModal} />

        <UserSubAcctListMobile setDisplaySubAcctModal={setDisplaySubAcctModal} />
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
        loading={loading}
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
        subAcctUpgradeLoading={subAcctUpgradeLoading}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        isPasswordValid={isPasswordValid}
        validatePassword={validatePassword}
        passwordRequirements={passwordRequirements}
        getPasswordStrength={getPasswordStrength}
        handleFinalStepSubAcctUpgrade={handleFinalStepSubAcctUpgrade}
        subAcctUpgradeSuccessNot={subAcctUpgradeSuccessNot}
        setSubAcctUpgradeSuccessNot={setSubAcctUpgradeSuccessNot}
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

{
  /* <UserSubAcctNoticeDisplay
noticeDisplay={noticeDisplay}
noticeMessage={noticeMessage}
paymentStatus={paymentStatus}
closeNoticeMessage={closeNoticeMessage}
closeNoticeMessageToCreateAcct={closeNoticeMessageToCreateAcct}
/> */
}
