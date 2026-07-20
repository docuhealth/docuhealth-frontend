import React, { useContext } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import AppointmentsList from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Pharmacist/Appointments_Dashboard/AppointmentsList";
import { PharmacistAppointmentsListContext } from "../../../context/HospitalContext/Pharmacist/PharmacistAppointmentsListContext";

const Hospital_Pharmacist_Appointments_Dashboard = () => {
  const { appointmentType } = useContext(PharmacistAppointmentsListContext);

  return (
    <>
      <div className="py-2 text-sm flex justify-between items-center">
        <DynamicDate />
      </div>
      <div className="bg-white my-5 rounded-lg border p-4 lg:p-6">
        <h2 className="mb-4 pb-2 border-b font-medium capitalize text-gray-800">
          {appointmentType === 'upcoming' 
            ? 'Upcoming' 
            : appointmentType === 'today' 
            ? "Today's" 
            : 'Past'} Appointments List
        </h2>
        <div>
          <AppointmentsList />
        </div>
      </div>
    </>
  );
};

export default Hospital_Pharmacist_Appointments_Dashboard;
