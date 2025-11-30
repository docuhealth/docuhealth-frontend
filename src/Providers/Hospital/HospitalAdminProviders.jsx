import HosProfileProvider from "../../context/Hospital Context/Admin/HosAppContext"
import HosAdmittedPatientMGTProvider from "../../context/Hospital Context/Admin/HosAdmittedPatientMGTContext"
import HosStaffsProvider from "../../context/Hospital Context/Admin/HosStaffsContext"
import HosAppointmentsProvider from "../../context/Hospital Context/Admin/HosAppointmentsContext"

const HospitalAdminProviders = ({ children }) => (
    <HosProfileProvider>
        <HosAdmittedPatientMGTProvider>
            <HosStaffsProvider>
                <HosAppointmentsProvider>
                    {children}
                </HosAppointmentsProvider>
            </HosStaffsProvider>
        </HosAdmittedPatientMGTProvider>
    </HosProfileProvider>
)

export default HospitalAdminProviders