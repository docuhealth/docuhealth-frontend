import LabProfileProvider from "../../context/HospitalContext/Lab/LabAppContext";
import LabAppointmentsListProvider from "../../context/HospitalContext/Lab/LabAppointmentsListContext";
import LabRequestsProvider from "../../context/HospitalContext/Lab/LabRequestsContext";
import HosStaffsProvider from "../../context/HospitalContext/HosStaffsContext";

const HospitalLabProviders = ({ children }) => {
  return (
    <LabProfileProvider>
      <LabRequestsProvider>
        <LabAppointmentsListProvider>
          <HosStaffsProvider>
            {children}
          </HosStaffsProvider>
        </LabAppointmentsListProvider>
      </LabRequestsProvider>
    </LabProfileProvider>
  );
};

export default HospitalLabProviders;
