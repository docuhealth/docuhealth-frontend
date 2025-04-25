import React from "react";
import { Eye } from "lucide-react";

const PharmacyTableHead = () => {
  return (
    <div className="bg-white  px-5 border-t rounded-t-2xl ">
      <div className="py-5 flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-md font-medium text-gray-800">
          Pharm-code request
        </h1>
        <button
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#0000FF] border border-[#0000FF] rounded-full"
          onClick={() => console.log("View approved pharmacies clicked")}
        >
          <Eye size={16} />
          <span>View approved pharmacies</span>
        </button>
      </div>
    </div>
  );
};

export default PharmacyTableHead;
