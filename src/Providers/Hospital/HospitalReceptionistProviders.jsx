import ReceptionistProfileProvider from "../../context/Hospital Context/Receptionist/ReceptionistAppContext";
import ReceptionistAdmissionRequestProvider from "../../context/Hospital Context/Receptionist/ReceptionistAdmissionRequestContext";
import ReceptionistHealthPersonnelProvider from "../../context/Hospital Context/Receptionist/ReceptionistHealthPersonnelContext";
import ReceptionistAppointmentsListProvider from "../../context/Hospital Context/Receptionist/ReceptionistAppointmentsListContext";
import ReceptionistRecentPatientsProvider from "../../context/Hospital Context/Receptionist/ReceptionistRecentPatientsContext";
import ReceptionistAdmittedPatientMGTProvider from "../../context/Hospital Context/Receptionist/ReceptionistAdmittedPatientMGTContext";

const HospitalReceptionistProviders = ({ children }) => (
  <ReceptionistProfileProvider>
    <ReceptionistAdmissionRequestProvider>
      <ReceptionistHealthPersonnelProvider>
        <ReceptionistAppointmentsListProvider>
          <ReceptionistRecentPatientsProvider>
            <ReceptionistAdmittedPatientMGTProvider>
              {children}
            </ReceptionistAdmittedPatientMGTProvider>
          </ReceptionistRecentPatientsProvider>
        </ReceptionistAppointmentsListProvider>
      </ReceptionistHealthPersonnelProvider>
    </ReceptionistAdmissionRequestProvider>
  </ReceptionistProfileProvider>
);

export default HospitalReceptionistProviders;
