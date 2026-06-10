import LabProfileProvider from "../../context/HospitalContext/Lab/LabAppContext";
import LabAppointmentsListProvider from "../../context/HospitalContext/Lab/LabAppointmentsListContext";
import LabRequestsProvider from "../../context/HospitalContext/Lab/LabRequestsContext";
import HosStaffsProvider from "../../context/HospitalContext/HosStaffsContext";
import LabResultsProvider from "../../context/HospitalContext/Lab/LabResultsContext";

const HospitalLabProviders = ({ children }) => {
  return (
    <LabProfileProvider>
      <LabRequestsProvider>
        <LabAppointmentsListProvider>
          <HosStaffsProvider>
            <LabResultsProvider>
              {children}
            </LabResultsProvider>
          </HosStaffsProvider>
        </LabAppointmentsListProvider>
      </LabRequestsProvider>
    </LabProfileProvider>
  );
};

export default HospitalLabProviders;
