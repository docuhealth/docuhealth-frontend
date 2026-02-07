import DoctorProfileProvider from "../../context/Hospital Context/Doctors/DoctorAppContext";
import DoctorAppointmentsListProvider from "../../context/Hospital Context/Doctors/DoctorAppointmentsListContext";
import DoctorsHealthPersonnelProvider from "../../context/Hospital Context/Doctors/DoctorsHealthPersonnelContext";
import DoctorsAdmittedPatientMGTProvider from "../../context/Hospital Context/Doctors/DoctorsAdmittedPatientMGTContext";

import HosStaffsProvider from "../../context/Hospital Context/HosStaffsContext";
import HosWardProvider from "../../context/Hospital Context/HosWardContext";

const HospitalDoctorProviders = ({ children }) => {
  return (
    <HosWardProvider>
    <HosStaffsProvider>
    <DoctorProfileProvider>
      <DoctorAppointmentsListProvider>
        <DoctorsHealthPersonnelProvider>
          <DoctorsAdmittedPatientMGTProvider>
            {children}
          </DoctorsAdmittedPatientMGTProvider>
        </DoctorsHealthPersonnelProvider>
      </DoctorAppointmentsListProvider>
    </DoctorProfileProvider>
    </HosStaffsProvider>
    </HosWardProvider>
  );
};

export default HospitalDoctorProviders;
