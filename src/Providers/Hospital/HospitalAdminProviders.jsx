import HosProfileProvider from "../../context/Hospital Context/Admin/HosAppContext"
import HosAdmittedPatientMGTProvider from "../../context/Hospital Context/Admin/HosAdmittedPatientMGTContext"
import HosStaffsProvider from "../../context/Hospital Context/Admin/HosStaffsContext"
import HosAppointmentsProvider from "../../context/Hospital Context/Admin/HosAppointmentsContext"
import HosSubscriptionsProvider from "../../context/Hospital Context/Admin/HosSubscriptionsContext"

const HospitalAdminProviders = ({ children }) => (
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
)

export default HospitalAdminProviders