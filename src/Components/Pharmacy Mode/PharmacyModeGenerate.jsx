import React, { useState } from "react";
import { X } from "lucide-react";

const PharmacyModeGenerate = ({setPharmacyModeProceed}) => {

    const [formData, setFormData] = useState({
      pharmacyName: "",
      phoneNumber: "",
      emailAddress: "",
      pharmacyAddress: "",  
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
            Welcome to pharmacy mode
          </h2>
        </div>

        <div>
          <div className="bg-white ">
            <div className="mb-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Name of Pharmacy
              </label>
              <input
                type="text"
                name="pharmacyName"
                value={formData.pharmacyName}
                onChange={handleChange}
                placeholder="Enter pharmacy name"
                className="w-full px-3 py-2 border rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0000FF]  text-sm"
              />
            </div>

            <div className="mb-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="e.g +234 123 4567"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0000FF]  text-sm"
              />
            </div>

            <div className="mb-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Email address
              </label>
              <input
                type="text"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0000FF]  text-sm"
              />
            </div>

            <div className="mb-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
               Pharmacy address
              </label>
              <textarea
                name="pharmacyAddress"
                value={formData.pharmacyAddress}
                onChange={handleChange}
                placeholder="Enter pharmacy address"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0000FF]  h-24 resize-none text-sm"
              ></textarea>
            </div>
          </div>
        </div>

        <button
          // onClick={handleProceed}
          className="mt-4 w-full bg-[#0000FF] text-white py-2 rounded-full transition text-sm"
        >
          Generate Pharm - Code
        </button>
      </div>
    </div>
  );
};

export default PharmacyModeGenerate;
