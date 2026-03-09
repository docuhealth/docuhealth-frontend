import React, {useContext} from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { DoctorAppContext } from "../../../context/HospitalContext/Doctors/DoctorAppContext";
import template from "../../../assets/img/template.png";

const Hospital_Doctors_Home_Dashboard = () => {

    const { hospitalName, backgroundImage } = useContext(DoctorAppContext);

    const backgroundImageUrl = backgroundImage || template

    return (
        <>
            <div className="py-2">
                <DynamicDate />
                <div
                    className="relative mt-4 w-full h-[300px] rounded-xl bg-cover bg-center flex flex-col items-center justify-center border border-gray-300"
                    style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${backgroundImageUrl})`
                    }}
                >
                    {/* Watermark / Helper Text */}
                    <div className="text-white text-center mb-4">
                        <p className="text-xl font-semibold opacity-90 uppercase tracking-widest">
                            {hospitalName || 'NIL'}  Hospital
                        </p>
                    </div>
                </div>
            </div>
        </>
    )

}

export default Hospital_Doctors_Home_Dashboard;