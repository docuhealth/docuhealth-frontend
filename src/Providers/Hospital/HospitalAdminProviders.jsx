import HosProfileProvider from "../../context/HospitalContext/Admin/HosAppContext";
import HosAdmittedPatientMGTProvider from "../../context/HospitalContext/Admin/HosAdmittedPatientMGTContext";
import HosStaffsProvider from "../../context/HospitalContext/HosStaffsContext";
import HosAppointmentsProvider from "../../context/HospitalContext/Admin/HosAppointmentsContext";
import HosSubscriptionsProvider from "../../context/HospitalContext/Admin/HosSubscriptionsContext";
import HosWardProvider from "../../context/HospitalContext/HosWardContext";

const HospitalAdminProviders = ({ children }) => (
  <HosWardProvider>
  <HosProfileProvider>
    <HosAdmittedPatientMGTProvider>
      <HosStaffsProvider>
        <HosAppointmentsProvider>
          <HosSubscriptionsProvider>        
              {children}
          </HosSubscriptionsProvider>
        </HosAppointmentsProvider>
      </HosStaffsProvider>
    </HosAdmittedPatientMGTProvider>
  </HosProfileProvider>
  </HosWardProvider>
);

export default HospitalAdminProviders;
