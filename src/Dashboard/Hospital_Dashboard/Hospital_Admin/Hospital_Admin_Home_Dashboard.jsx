import React, { useState, useContext } from "react";
import DynamicDate from "../../../Components/Dynamic Date/DynamicDate";
import template from "../../../assets/img/template.png";
import { Camera } from "lucide-react"; // Optional: using lucide for the icon
import { HosAppContext } from "../../../context/Hospital Context/Admin/HosAppContext";
import ImageCustomization from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Home Dashboard/ImageCustomization";

const Hospital_Admin_Home_Dashboard = () => {

  const { profile } = useContext(HosAppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const backgroundImage = profile?.theme?.bg_image || template;

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

          {/* Change Button */}
          <button className=" absolute bottom-4 right-4 flex items-center gap-2 bg-white px-4 py-2 rounded-md shadow-lg hover:bg-gray-100 transition-colors text-[#3E4095] font-medium text-sm"
          onClick={() => setIsModalOpen(true)}
          >
            <Camera size={18} />
            Change cover image
          </button>
        </div>

      </div>

      {isModalOpen && (
        <ImageCustomization onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default Hospital_Admin_Home_Dashboard;