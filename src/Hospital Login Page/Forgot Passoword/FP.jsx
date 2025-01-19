import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import dashb from "../../assets/dashb.png";
import axios from "axios";
import { toast } from "react-toastify";


const FP = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from reloading

    // if (!email) {
    //   alert("Please enter your email!");
    //   return;
    // }

    // setLoading(true); // Show loading state

    // try {
    //   const response = await axios.post(
    //     "https://docuhealth-backend.onrender.com/api/auth/forgot_password",
    //     { email } // Send email as JSON payload
    //   );

    //   if (response.status === 200) {
    //     alert("OTP sent successfully! ✅");
    //   } else {
    //     alert("Failed to send OTP ❌: " + response.data.message);
    //   }
    // } catch (error) {
    //   console.error("Error sending OTP:", error);
    //   alert("An error occurred. Please try again.");
    // } finally {
    //   setLoading(false); // Hide loading state
    // }
  };

  const [notificationVisible, setNotificationVisible] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768; // Adjust breakpoint as needed
    if (isMobile) {
      const timer = setTimeout(() => {
        setNotificationVisible(true);
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer); // Cleanup on component unmount
    }
  }, []);
  return (
    <div>
      <div className="min-h-screen">
        <div className="flex">
          {/* Left Side */}
          <div className=" hidden sm:flex flex-1 h-screen  items-center justify-center">
            <div className="w-3/4" id="temp">
              <div className="pb-10">
                <img src={logo} alt="Logo" className="" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>
              <p className="text-gray-600 mb-6">
                We’ll send an OTP to the email below which is your registered
                email to help you reset your password
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <p className="font-semibold pb-1">Hospital Email Address :</p>
                  <div className="relative">
                    <input
                      type="email"
                      className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`w-full py-3 rounded-full bg-[#0000FF] text-white hover:bg-blue-700"
                    
                  `}
                  disabled={loading}
                >
                     {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Side */}
          <div
            className="flex-1 h-screen flex flex-col justify-center items-center p-4"
            style={{
              background: "linear-gradient(to bottom, #0000FF, #718FCC)",
            }}
          >
            <div className="">
              <p className="text-white font-semibold text-2xl pb-1">
                The simplest way to manage <br /> medical records
              </p>
              <p className="text-white font-light">
                No better way to attend to, and keep records of medical records
              </p>
            </div>

            <div className="max-h-[470px] flex justify-center items-center pt-2">
              <img
                src={dashb}
                alt="Dashboard"
                className="object-contain w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
      {notificationVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="fixed bottom-0 left-0 right-0 bg-white text-black  py-4 rounded-t-3xl shadow-md animate-slide-up ">
            <div className="flex justify-center items-center gap-1 pb-4">
              <div>
                <img src={logo} alt="DocuHealth Logo" />
              </div>
              <h1 className="text-[#0000FF] text-3xl font-bold">DocuHealth</h1>
            </div>
            <div className="px-5" id="temp">
              <h2 className=" text-xl sm:text-2xl  mb-2">Forgot Password ?</h2>
              <p className="text-gray-600 mb-6">
                We’ll send an OTP to the email below which is your registered
                email to help you reset your password
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <p className="pb-1">Hospital Email Address :</p>
                  <div className="relative">
                    <input
                      type="email"
                      className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500"
                      value={email}
                      placeholder="Jarus@gmail.com"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`w-full py-3 rounded-full bg-[#0000FF] text-white hover:bg-blue-700"
                    
                  `}
                >
                  Send OTP
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FP;
