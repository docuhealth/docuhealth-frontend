import React, { useContext } from 'react'
import DynamicDate from '../../../Components/DynamicDate/DynamicDate'
import AppointmentsList from '../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Receptionist/Appointments_Dashboard/AppointmentsList'
import { ReceptionistAppointmentsListContext } from "../../../context/HospitalContext/Receptionist/ReceptionistAppointmentsListContext";

const Hospital_Receptionist_Appointments_Dashboard = () => {
  const { appointmentType } = useContext(ReceptionistAppointmentsListContext);

  return (
    <>
        <div className='py-2 text-sm flex justify-between items-center'>
        <DynamicDate />
      </div>
     <div className="bg-white my-5  rounded-lg ">
        <div className=" border rounded-lg p-4 lg:p-6">
          <div>
            <AppointmentsList />
          </div>
        </div>
      </div>
    </>
  )
}

export default Hospital_Receptionist_Appointments_Dashboard