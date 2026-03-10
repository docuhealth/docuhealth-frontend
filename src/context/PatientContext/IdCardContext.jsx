import React, { useEffect, useState } from "react";
import { createContext } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { getToken } from "../../services/authService";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";


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

  const queryClient = useQueryClient();


  const idCardMutation = useMutation({
    mutationFn: async (selectedPatient) => {
      let res;
      if ("emergency" in (selectedPatient || {})) {

        const payload = {
          first_emergencey_number : idCardData.firstEmergency,
          second_emergencey_number : idCardData.secondEmergency,
          emergence_address : idCardData.emergencyAddress
        }

        console.log(payload)
        res = await axiosInstance.post("api/patients/id-card", payload);
      } else {
        res = await axiosInstance.patch(
          `api/patients/subaccounts/id-card/${selectedPatient?.hin}`
        );
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success("ID Card Created Successfully");
      setOnboardIDCard(false);
      setIsIDCreatedSuccessfully(true);
      // Optional: Refresh any profile data
      queryClient.invalidateQueries({ queryKey: ["patient-profile"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "An error occurred");
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIdCardData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelection = (selected) => {
    // console.log(selected)
    setOnboardIDCard(true);
    setSelectedProfile(selected);
  };



  const handleIDCardCreation = (selectedPatient) => {
    const phoneRegex = /^\d{11,}$/;

    // Validation
    if (!idCardData.firstEmergency || !idCardData.secondEmergency || !idCardData.emergencyAddress) {
      toast.error("Kindly fill all fields");
      return;
    }
    if (!phoneRegex.test(idCardData.firstEmergency) || !phoneRegex.test(idCardData.secondEmergency)) {
      toast.error("Emergency numbers must be at least 11 digits");
      return;
    }

    // Trigger Mutation
    idCardMutation.mutate(selectedPatient);
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
        isCreatingID: idCardMutation.isPending
      }}
    >
      {props.children}
    </IdCardContext.Provider>
  );
};

export default IdCardProvider;
