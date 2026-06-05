import LabProfileProvider from "../../context/HospitalContext/Lab/LabAppContext";
import LabAppointmentsListProvider from "../../context/HospitalContext/Lab/LabAppointmentsListContext";
import LabRequestsProvider from "../../context/HospitalContext/Lab/LabRequestsContext";
import LabHealthPersonnelProvider from "../../context/HospitalContext/Lab/LabHealthPersonnelContext";
import LabResultsProvider from "../../context/HospitalContext/Lab/LabResultsContext";

const HospitalLabProviders = ({ children }) => {
  return (
    <LabProfileProvider>
      <LabRequestsProvider>
        <LabAppointmentsListProvider>
          <LabHealthPersonnelProvider>
            <LabResultsProvider>
              {children}
            </LabResultsProvider>
          </LabHealthPersonnelProvider>
        </LabAppointmentsListProvider>
      </LabRequestsProvider>
    </LabProfileProvider>
  );
};

export default HospitalLabProviders;
