import React, { useState } from "react";
import { X } from "lucide-react";
import axios from 'axios'
import { toast } from "react-toastify";

const PharmacyModeGenerate = ({setPharmacyModeProceed, setIsPharmacyCreated}) => {

    const [formData, setFormData] = useState({
      pharmacyName: "",
      phoneNumber: "",
      emailAddress: "",
      pharmacyAddress: "",  
      referred_by: ""
    });
    const[loading, setLoading] = useState(false)

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    const payload = {
      name: formData.pharmacyName,
      email:  formData.emailAddress,
      phone_num: formData.phoneNumber,
      address: formData.emailAddress,
      referred_by: formData.referred_by
    }

    const handleSubmit = async (e) => {
      e.preventDefault(); 
      setLoading(true)

      // Validate form data here if needed
      if (!formData.pharmacyName || !formData.phoneNumber || !formData.emailAddress || !formData.pharmacyAddress || !formData.referred_by) {
        toast.error("Please fill in all fields.");
        setLoading(false)
        return;
      }
    
      try {
        const response = await axios.post(
          "https://docuhealth-backend-h03u.onrender.com/api/pharmarcy/register",
          payload, // no need to stringify with axios
          {
            headers: {
              'Content-Type': 'application/json', // important to set header
            },
          }
        );
    
        if (response.status === 200) {
          setLoading(false)
          console.log(response.data);
          setPharmacyModeProceed("")
          setIsPharmacyCreated(true)
          
          // toast.success("Email sent successfully!");
          // setLoading('Send Otp')
          // setTimeout(() => {
          //   navigate("/hospital-verify-otp", { state: { email } });
          // }, 1000);
        } else {
          console.error("Failed to create pharmacy", response.data);
        }
      }catch (error) {
        if (error.response) {
          console.error("Server responded with an error:", error.response.data);
          toast.error(error.response.data.message); // move it here
        } else {
          console.error(`Error: ${error.message}`);
          toast.error("An unexpected error occurred. Please try again."); // fallback error
        }
      }
      finally{
        setLoading(false)
        setFormData({
          pharmacyName: '',
          emailAddress: '',
          phoneNumber: '',
          pharmacyAddress : ''
        })
      }
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
               Referred By
              </label>
              <input
                type="text"
                name="referred_by"
                value={formData.referred_by}
                onChange={handleChange}
                placeholder="Referral"
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
          onClick={handleSubmit}
          className="mt-4 w-full bg-[#0000FF] text-white py-2 rounded-full transition text-sm"
        >
          {loading ? 'Generating Pharm - Code' : 'Generate Pharm - Code ' }
        </button>
      </div>
    </div>
  );
};

export default PharmacyModeGenerate;
