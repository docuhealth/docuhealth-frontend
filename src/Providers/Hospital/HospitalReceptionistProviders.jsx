import ReceptionistProfileProvider from "../../context/HospitalContext/Receptionist/ReceptionistAppContext";
import ReceptionistAdmissionRequestProvider from "../../context/HospitalContext/Receptionist/ReceptionistAdmissionRequestContext";
import ReceptionistAppointmentsListProvider from "../../context/HospitalContext/Receptionist/ReceptionistAppointmentsListContext";
import ReceptionistRecentPatientsProvider from "../../context/HospitalContext/Receptionist/ReceptionistRecentPatientsContext";
import ReceptionistAdmittedPatientMGTProvider from "../../context/HospitalContext/Receptionist/ReceptionistAdmittedPatientMGTContext";

import HosWardProvider from "../../context/HospitalContext/HosWardContext";
import HosStaffsProvider from "../../context/HospitalContext/HosStaffsContext";

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
