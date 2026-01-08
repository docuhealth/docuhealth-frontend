import DoctorProfileProvider from "../../context/Hospital Context/Doctors/DoctorAppContext";
import DoctorAppointmentsListProvider from "../../context/Hospital Context/Doctors/DoctorAppointmentsListContext";
import DoctorsHealthPersonnelProvider from "../../context/Hospital Context/Doctors/DoctorsHealthPersonnelContext";


const HospitalDoctorProviders = ({ children }) => {
  return (
    <DoctorProfileProvider>
      <DoctorAppointmentsListProvider>
        <DoctorsHealthPersonnelProvider>
        {children}
        </DoctorsHealthPersonnelProvider>
      </DoctorAppointmentsListProvider>
    </DoctorProfileProvider>

  )
}

export default HospitalDoctorProviders