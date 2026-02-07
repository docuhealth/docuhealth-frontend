import ReceptionistProfileProvider from "../../context/Hospital Context/Receptionist/ReceptionistAppContext";
import ReceptionistAdmissionRequestProvider from "../../context/Hospital Context/Receptionist/ReceptionistAdmissionRequestContext";
import ReceptionistAppointmentsListProvider from "../../context/Hospital Context/Receptionist/ReceptionistAppointmentsListContext";
import ReceptionistRecentPatientsProvider from "../../context/Hospital Context/Receptionist/ReceptionistRecentPatientsContext";
import ReceptionistAdmittedPatientMGTProvider from "../../context/Hospital Context/Receptionist/ReceptionistAdmittedPatientMGTContext";

import HosWardProvider from "../../context/Hospital Context/HosWardContext";
import HosStaffsProvider from "../../context/Hospital Context/HosStaffsContext";

const HospitalReceptionistProviders = ({ children }) => (
  <HosWardProvider>
    <HosStaffsProvider>
      <ReceptionistProfileProvider>
        <ReceptionistAdmissionRequestProvider>
          <ReceptionistAppointmentsListProvider>
            <ReceptionistRecentPatientsProvider>
              <ReceptionistAdmittedPatientMGTProvider>
                {children}
              </ReceptionistAdmittedPatientMGTProvider>
            </ReceptionistRecentPatientsProvider>
          </ReceptionistAppointmentsListProvider>
        </ReceptionistAdmissionRequestProvider>
      </ReceptionistProfileProvider>
    </HosStaffsProvider>
  </HosWardProvider>
);

export default HospitalReceptionistProviders;
