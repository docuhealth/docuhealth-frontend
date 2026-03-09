import React, { useState, useEffect, useContext } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import AppointmentsListHospital from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Appointments_Dashboard/AppointmentsListHospital";


const Hospital_Admin_Appointments_Dashboard = () => {
    return (
        <>
            <div className="py-2">
                <DynamicDate />
            </div>
            <div className="bg-white my-5 rounded-lg">
                <div className=" border rounded-lg p-4 lg:p-6">
                    <h2 className=" mb-4 pb-2 border-b font-medium">
                        Upcoming Appointments
                    </h2>
                    <div>
                        <AppointmentsListHospital />
                    </div>
                </div>
            </div>

        </>
    )
}
export default Hospital_Admin_Appointments_Dashboard;