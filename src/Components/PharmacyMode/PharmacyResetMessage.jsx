import React, {useState} from 'react';
import { X } from "lucide-react";


const PharmacyResetMessage = ({setIsPharmacyReset}) => {
    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 text-[#1B2B40]">
               <div className="bg-white  max-w-96 relative w-full p-5 mx-3">
                 <div className="flex flex-row-reverse pb-5 ">
                   <button
                     onClick={() => setIsPharmacyReset(false)}
                     className=" text-gray-800 "
                   >
                     <X size={20} />
                   </button>
         
                   <h2 className=" font-semibold text-center flex-1">
                     New Pharmacy Code Request
                   </h2>
                 </div>
         
                 <div className="text-sm">
                   <p>Kindly check the pharmacy’s registered email for the new Pharma Code</p>
                   <p className="text-right font-semibold pt-2">Docu Health (admin)</p>
                 </div>
               </div>
             </div>
    );
};

export default PharmacyResetMessage;