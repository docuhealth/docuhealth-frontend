import React, { useContext } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import template from "../../../assets/img/template.png";
import { PharmacistAppContext } from "../../../context/HospitalContext/Pharmacist/PharmacistAppContext";
import RecentPatients from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Pharmacist/Home_Dashboard/components/RecentPatients";

const Hospital_Pharmacist_Home_Dashboard = () => {
  const { hospitalName, backgroundImage } = useContext(PharmacistAppContext);
  const backgroundImageUrl = backgroundImage || template;

  return (
    <>
      <div className="py-2">
        <DynamicDate />

        {/* Cover Image */}
        <div
          className="relative mt-4 w-full h-[300px] rounded-xl bg-cover bg-center flex flex-col items-center justify-center border border-gray-300"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${backgroundImageUrl})`
          }}
        >
          <div className="text-white text-center mb-4">
            <p className="text-xl font-semibold opacity-90 uppercase tracking-widest">
              {hospitalName ? (hospitalName.toUpperCase().endsWith('HOSPITAL') ? hospitalName : `${hospitalName} Hospital`) : "NIL Hospital"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg my-5 ">
        <div className=" border rounded-lg p-4 lg:p-6">
          <h2 className=" mb-4 pb-2 border-b font-medium">
            Recent Patients
          </h2>
          <div>
            <RecentPatients />
          </div>
        </div>
      </div>
    </>
  );
};

export default Hospital_Pharmacist_Home_Dashboard;
