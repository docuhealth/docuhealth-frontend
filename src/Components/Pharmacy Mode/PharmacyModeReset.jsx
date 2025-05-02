import React, {useState} from 'react'
import { X } from "lucide-react";
import { toast } from 'react-toastify';

const PharmacyModeReset = ({setPharmacyModeProceed, setIsPharmacyReset}) => {

    const [formData, setFormData] = useState({
          emailAddress: ""
        });
        const[loading, setLoading] = useState(false)
    
        const handleChange = (e) => {
          const { name, value } = e.target;
          setFormData({ ...formData, [name]: value });
        };

          const payload ={
            email : formData.emailAddress
          }
        const handleSubmit = async (e) => {
          setLoading(true)
          e.preventDefault(); 
          
      
          try {
            const response = await fetch("https://docuhealth-backend-h03u.onrender.com/api/pharmarcy/reset_code", {
              method: "PATCH", 
              headers: {
                "Content-Type": "application/json", // Indicate the payload format
              },
              body: JSON.stringify(payload), 
            });
      
            if (response.ok) {
              setLoading(false)
              setIsPharmacyReset(true)
              setPharmacyModeProceed("")
              // toast.success("Email sent successfully!");
              // setLoading('Send Otp')
              // setTimeout(() => {
              //   navigate("/hospital-verify-otp",  { state: { email } });
              // }, 1000);
            } else {
              console.log()
              const errorData = await response.json();
              console.error("Failed to create pharmacy", errorData);
              toast.error(errorData.message)
            }
          } catch (error) {
           console.error(`Error: ${error.message}`);
           toast.error(error.response.message)
          //  setLoading('Send Otp')
          }finally{
            setLoading(false)
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
                  Reset your pharmacy code
                </h2>
              </div>
      
              <div>
                <div className="bg-white ">
                  <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                     Input your registered email address
                    </label>
                    <input
                      type="eamil"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className="w-full px-3 py-2 border rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0000FF]  text-sm"
                    />
                  </div>
   
                
      
                </div>
              </div>
      
              <button
                onClick={handleSubmit}
                className="mt-4 w-full bg-[#0000FF] text-white py-2 rounded-full transition text-sm"
              >
                {loading ? 'Requesting a new phramacy code' : 'Request a new pharmacy code'}
              </button>
            </div>
          </div>
  )
}

export default PharmacyModeReset
