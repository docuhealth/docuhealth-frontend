import React, { useState, useContext } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import template from "../../../assets/img/template.png";
import { Camera, Trash2, Users, UserCheck, Briefcase, Bed } from "lucide-react"; 
import { HosAppContext } from "../../../context/HospitalContext/Admin/HosAppContext";
import ImageCustomization from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Home_Dashboard/ImageCustomization";
import RemoveBrandingModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Home_Dashboard/RemoveBrandingModal";


const Hospital_Admin_Home_Dashboard = () => {

  const { profile, dashboardMetrics, dashboardMetricsLoading } = useContext(HosAppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);


  const backgroundImage = profile?.theme?.bg_image || template;


  // console.log(dashboardMetrics)

  return (
    <>
      <div className="py-2">
        <DynamicDate />

        {/* Background Container */}
        <div
          className="relative mt-4 w-full h-[300px] rounded-xl bg-cover bg-center flex flex-col items-center justify-center border border-gray-300"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${backgroundImage})`
          }}
        >
          {/* Watermark / Helper Text */}
          <div className="text-white text-center mb-4">
            <p className="text-xl font-semibold opacity-90 uppercase tracking-widest">
              {profile?.name}  Hospital
            </p>
          </div>


          <div className="absolute bottom-4 right-4 flex flex-col md:flex-row items-center gap-3 ">

            <button className=" flex items-center gap-2 bg-white px-4 py-2 rounded-md shadow-lg hover:bg-gray-100 transition-colors text-[#3E4095] font-medium text-sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Camera size={18} />
              Change cover theme
            </button>
            <button className=" flex items-center gap-2 bg-white px-4 py-2 rounded-md shadow-lg hover:bg-gray-100 transition-colors text-red-500 font-medium text-sm"
              onClick={() => setIsRemoveModalOpen(true)}
            >

              <Trash2 size={18} />
              Remove cover theme
            </button>
          </div>


        </div>

      </div>

      {isModalOpen && (
        <ImageCustomization onClose={() => setIsModalOpen(false)} />
      )}

      {isRemoveModalOpen && (
        <RemoveBrandingModal type='bg_image' onClose={() => setIsRemoveModalOpen(false)} />
      )}

    </>
  );
};

export default Hospital_Admin_Home_Dashboard;