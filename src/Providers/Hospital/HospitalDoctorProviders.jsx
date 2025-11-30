import DoctorProfileProvider from "../../context/Hospital Context/Doctors/DoctorAppContext";
import DoctorAppointmentsListProvider from "../../context/Hospital Context/Doctors/DoctorAppointmentsListContext";


const HospitalDoctorProviders = ({ children }) => {
  return (
    <DoctorProfileProvider>
      <DoctorAppointmentsListProvider>
        {children}
      </DoctorAppointmentsListProvider>
    </DoctorProfileProvider>

  )
}

export default HospitalDoctorProviders