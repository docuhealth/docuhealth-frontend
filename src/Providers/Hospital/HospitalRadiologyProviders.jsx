import RadiologyProfileProvider from "../../context/HospitalContext/Radiology/RadiologyAppContext";
import HosStaffsProvider from "../../context/HospitalContext/HosStaffsContext";

const HospitalRadiologyProviders = ({ children }) => {
  return (
    <RadiologyProfileProvider>
      <HosStaffsProvider>{children}</HosStaffsProvider>
    </RadiologyProfileProvider>
  );
};

export default HospitalRadiologyProviders;
