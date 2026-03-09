import DoctorProfileProvider from "../../context/HospitalContext/Doctors/DoctorAppContext";
import DoctorAppointmentsListProvider from "../../context/HospitalContext/Doctors/DoctorAppointmentsListContext";
import DoctorsHealthPersonnelProvider from "../../context/HospitalContext/Doctors/DoctorsHealthPersonnelContext";
import DoctorsAdmittedPatientMGTProvider from "../../context/HospitalContext/Doctors/DoctorsAdmittedPatientMGTContext";

import HosStaffsProvider from "../../context/HospitalContext/HosStaffsContext";
import HosWardProvider from "../../context/HospitalContext/HosWardContext";

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
