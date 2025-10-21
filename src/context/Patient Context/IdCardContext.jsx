import React, { useEffect, useState } from "react";
import { createContext } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { getToken } from "../../services/authService";
import toast from "react-hot-toast";

export const IdCardContext = createContext();

const IdCardProvider = (props) => {
  const [onboardIDCard, setOnboardIDCard] = useState(false);
  const [isIDCreatedSuccessfully, setIsIDCreatedSuccessfully] = useState(false);
  const [idCardData, setIdCardData] = useState({
    fullName: "",
    firstEmergency: "",
    secondEmergency: "",
    emergencyAddress: "",
  });
  const [selectedProfile, setSelectedProfile] = useState(null);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setIdCardData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelection = (selected) => {
    setOnboardIDCard(true);
    setSelectedProfile(selected);
  };

  const handleIDCardCreation = async (selectedPatient) => {
    console.log(selectedPatient);
    const phoneRegex = /^\d{11,}$/; // only digits, minimum 11 digits

    if (
      !idCardData.firstEmergency ||
      !idCardData.secondEmergency ||
      !idCardData.emergencyAddress
    ) {
      toast.error("Kindly fill all fields");
      return;
    }

    if (!phoneRegex.test(idCardData.firstEmergency)) {
      toast.error(
        "First emergency number must be at least 11 digits and contain only numbers"
      );
      return;
    }

    if (!phoneRegex.test(idCardData.secondEmergency)) {
      toast.error(
        "Second emergency number must be at least 11 digits and contain only numbers"
      );
      return;
    }

    try {
      console.log(selectedPatient);
      let res;

      if ("emergency" in (selectedPatient || {})) {
        // If it exists, call this endpoint
        res = await axiosInstance.patch("api/patients/id-card");
      } else {
        // If it doesn't exist, call this one with hin
        res = await axiosInstance.patch(
          `api/patients/subaccounts/id-card/${selectedProfile?.hin}`
        );
      }

      // Log or handle API response
      console.log("ID Card API Response:", res.data);

      toast.success("ID Card Created Successfully");
      setOnboardIDCard(false);
      setIsIDCreatedSuccessfully(true);
    } catch (err) {
      console.error("Error creating ID Card:", err);
      toast.error(
        err.response?.data?.message ||
          "An error occurred while creating the ID card"
      );
    } finally {
      setOnboardIDCard(false);
    }
  };

  return (
    <IdCardContext.Provider
      value={{
        onboardIDCard,
        setOnboardIDCard,
        idCardData,
        handleChange,
        handleIDCardCreation,
        isIDCreatedSuccessfully,
        setIsIDCreatedSuccessfully,
        handleSelection,
        selectedProfile,
      }}
    >
      {props.children}
    </IdCardContext.Provider>
  );
};

export default IdCardProvider;
