import ReceptionistProfileProvider from "../../context/Hospital Context/Receptionist/ReceptionistAppContext";
import ReceptionistAdmissionRequestProvider from "../../context/Hospital Context/Receptionist/ReceptionistAdmissionRequestContext";

const HospitalReceptionistProviders = ({ children }) => (
    <ReceptionistProfileProvider>
      <ReceptionistAdmissionRequestProvider>
      {children}
      </ReceptionistAdmissionRequestProvider>
    </ReceptionistProfileProvider>
  );
  
  export default HospitalReceptionistProviders;
  