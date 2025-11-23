import HosProfileProvider from "../../context/Hospital Context/Admin/HosAppContext"
import HosStaffsProvider from "../../context/Hospital Context/Admin/HosStaffsContext"
import HosAppointmentsProvider from "../../context/Hospital Context/Admin/HosAppointmentsContext"

const HospitalAdminProviders = ({ children }) => (
    <HosProfileProvider>
        <HosStaffsProvider>
            <HosAppointmentsProvider>
                {children}
            </HosAppointmentsProvider>
        </HosStaffsProvider>
    </HosProfileProvider>
)

export default HospitalAdminProviders