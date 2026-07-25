import PharmacistProfileProvider from "../../context/HospitalContext/Pharmacist/PharmacistAppContext";
import PharmacistAppointmentsListProvider from "../../context/HospitalContext/Pharmacist/PharmacistAppointmentsListContext";
import PharmacistPrescriptionsProvider from "../../context/HospitalContext/Pharmacist/PharmacistPrescriptionsContext";
import HosStaffsProvider from "../../context/HospitalContext/HosStaffsContext";
import HosWardProvider from "../../context/HospitalContext/HosWardContext";

const HospitalPharmacistProviders = ({ children }) => {
  return (
    <HosWardProvider>
      <HosStaffsProvider>
        <PharmacistAppointmentsListProvider>
          <PharmacistProfileProvider>
            <PharmacistPrescriptionsProvider>
              {children}
            </PharmacistPrescriptionsProvider>
          </PharmacistProfileProvider>
        </PharmacistAppointmentsListProvider>
      </HosStaffsProvider>
    </HosWardProvider>
  );
};

export default HospitalPharmacistProviders;
