import React, { createContext } from "react";

export const LabAppContext = createContext();

const LabProfileProvider = ({ children }) => {
  return (
    <LabAppContext.Provider
      value={{
        profile: null,
        isLoading: false,
        backgroundImage: null,
        hospitalName: null,
      }}
    >
      {children}
    </LabAppContext.Provider>
  );
};

export default LabProfileProvider;
