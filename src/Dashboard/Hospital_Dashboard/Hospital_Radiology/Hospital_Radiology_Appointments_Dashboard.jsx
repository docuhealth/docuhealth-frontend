import React, { useState } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import RadiologyAppointmentsList from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Radiology/Appointments/RadiologyAppointmentsList";
import RadiologyAppointmentPatientInfo from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Radiology/Appointments/RadiologyAppointmentPatientInfo";

// Mirrors the doctor's Appointments dashboard shell (Hospital_Doctors_Appointments_Dashboard's
// default/list branch), plus a patient-details view swap matching the
// Pharmacist appointments dashboard (Hospital_Pharmacist_Appointments_Dashboard.jsx)
// for the kebab menu's "See patient's details" / "Create an order" actions.
const Hospital_Radiology_Appointments_Dashboard = () => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [autoOpenCreateOrder, setAutoOpenCreateOrder] = useState(false);

  const handleSeeDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setAutoOpenCreateOrder(false);
  };

  const handleCreateOrder = (appointment) => {
    setSelectedAppointment(appointment);
    setAutoOpenCreateOrder(true);
  };

  return (
    <>
      <div className="py-2 text-sm flex justify-between items-center">
        <DynamicDate />
      </div>

      {selectedAppointment ? (
        <RadiologyAppointmentPatientInfo
          appointment={selectedAppointment}
          autoOpenCreateOrder={autoOpenCreateOrder}
          onBack={() => setSelectedAppointment(null)}
        />
      ) : (
        <div className="bg-white my-5 rounded-lg">
          <div className="border rounded-lg p-4 lg:p-6">
            <RadiologyAppointmentsList onSeeDetails={handleSeeDetails} onCreateOrder={handleCreateOrder} />
          </div>
        </div>
      )}
    </>
  );
};

export default Hospital_Radiology_Appointments_Dashboard;
