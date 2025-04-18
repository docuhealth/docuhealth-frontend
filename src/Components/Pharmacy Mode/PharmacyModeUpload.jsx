import React, {useState} from 'react'
import { X } from "lucide-react";

const PharmacyModeUpload = ({setPharmacyModeProceed}) => {

      const [formData, setFormData] = useState({
        pharmacyCode: ""
      });
  
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
      };

  return (
     <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 ">
         <div className="bg-white  max-w-96 relative w-full p-5 mx-3">
           <div className="flex flex-row-reverse pb-5 ">
             <button
               onClick={() => setPharmacyModeProceed("")}
               className=" text-gray-800 "
             >
               <X size={20} />
             </button>
   
             <h2 className=" font-semibold text-center flex-1">
               Login with your pharmacy code
             </h2>
           </div>
   
           <div>
             <div className="bg-white ">
               <div className="mb-2">
                 <label className="block text-gray-700 text-sm font-medium mb-1">
                  Input Pharmacy Code
                 </label>
                 <input
                   type="text"
                   name="pharmacyCode"
                   value={formData.pharmacyCode}
                   onChange={handleChange}
                   placeholder="Enter your pharmacy code"
                   className="w-full px-3 py-2 border rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0000FF]  text-sm"
                 />
               </div>

               <div className='text-sm text-gray-500 text-center py-1'>
               <p>  You can generate one from the previos tab</p>
               </div>
   
             </div>
           </div>
   
           <button
             // onClick={handleProceed}
             className="mt-4 w-full bg-[#0000FF] text-white py-2 rounded-full transition text-sm"
           >
             Proceed
           </button>
         </div>
       </div>
  )
}

export default PharmacyModeUpload
