import HosProfileProvider from "../../context/Hospital Context/Admin/HosAppContext";
import HosAdmittedPatientMGTProvider from "../../context/Hospital Context/Admin/HosAdmittedPatientMGTContext";
import HosStaffsProvider from "../../context/Hospital Context/HosStaffsContext";
import HosAppointmentsProvider from "../../context/Hospital Context/Admin/HosAppointmentsContext";
import HosSubscriptionsProvider from "../../context/Hospital Context/Admin/HosSubscriptionsContext";
import HosWardProvider from "../../context/Hospital Context/HosWardContext";

const HospitalAdminProviders = ({ children }) => (
  <HosProfileProvider>
    <HosAdmittedPatientMGTProvider>
      <HosStaffsProvider>
        <HosAppointmentsProvider>
          <HosSubscriptionsProvider>
            <HosWardProvider>{children}</HosWardProvider>
          </HosSubscriptionsProvider>
        </HosAppointmentsProvider>
      </HosStaffsProvider>
    </HosAdmittedPatientMGTProvider>
  </HosProfileProvider>
);

export default HospitalAdminProviders;
