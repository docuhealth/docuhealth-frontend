import React from "react";
import docuhealth_logo from "../../../assets/img/docuhealth_logo.png"
export const Logo = () => {
  return (
    <div className="flex items-center gap-1 text-xl 2xl:text-2xl font-bold text-[#3E4095]">
        <img src={docuhealth_logo} alt="DocuHealth Logo" className="w-10" />
        
      DocuHealth
    </div>
  );
};
