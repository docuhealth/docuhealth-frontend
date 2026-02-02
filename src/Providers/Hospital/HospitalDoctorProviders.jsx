import DoctorProfileProvider from "../../context/Hospital Context/Doctors/DoctorAppContext";
import DoctorAppointmentsListProvider from "../../context/Hospital Context/Doctors/DoctorAppointmentsListContext";
import DoctorsHealthPersonnelProvider from "../../context/Hospital Context/Doctors/DoctorsHealthPersonnelContext";
import DoctorsAdmittedPatientMGTProvider from "../../context/Hospital Context/Doctors/DoctorsAdmittedPatientMGTContext";

const HospitalDoctorProviders = ({ children }) => {
  return (
    <DoctorProfileProvider>
      <DoctorAppointmentsListProvider>
        <DoctorsHealthPersonnelProvider>
          <DoctorsAdmittedPatientMGTProvider>
            {children}
          </DoctorsAdmittedPatientMGTProvider>
        </DoctorsHealthPersonnelProvider>
      </DoctorAppointmentsListProvider>
    </DoctorProfileProvider>
  );
};

export default HospitalDoctorProviders;
