import LabProfileProvider from "../../context/HospitalContext/Lab/LabAppContext";

const HospitalLabProviders = ({ children }) => {
  return (
    <LabProfileProvider>
      {children}
    </LabProfileProvider>
  );
};

export default HospitalLabProviders;
