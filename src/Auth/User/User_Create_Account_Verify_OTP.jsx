import React, { useState, useEffect } from "react";
import docuhealth_logo from "../../assets/img/docuhealth_logo.png";
import dashb from "../../assets/img/dashb.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../../utils/authAPI";
import { FaEnvelope, FaKey } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

const User_Create_Account_Verify_OTP = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("patient");
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isMobile = window.innerWidth <= 768; // Adjust breakpoint as needed
    if (isMobile) {
      const timer = setTimeout(() => {
        setNotificationVisible(true);
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer); // Cleanup on component unmount
    }
  }, []);

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();

    try {
      // Dynamically determine which field to send (email or phone_num)
      const payload = {
        otp: otp,
        email: email,
      };

      // Send the request to the API
      const response = await authAPI(
        "POST",
        "api/auth/signup/verify-otp",
        payload
      );

      // Handle the response
      setIsLoading(false);

      // Display success message
      toast.success(response.message || "OTP Verified!");
      // console.log(response)
      setTimeout(() => {
        navigate("/user-login");
      }, 1000);
    } catch (error) {
      console.error("Error during OTP verification:", error.message);
      setIsLoading(false);
      toast.error(error.message || "OTP Verification Failed, Try Again");
    }
  };
  return (
    <div>
      <div className="hidden h-screen sm:flex">
        {/* Left Side */}
        <div className="w-full flex-1">
          <div className=" hidden sm:flex justify-center items-center py-10 h-screen ">
            <Link to="/">
               <div className=" fixed top-10 left-10  flex gap-1 items-center font-semibold text-[#3E4095]">
                         <img src={docuhealth_logo} alt="Logo" className="w-6" />
                         <h1 className="text-xl">DocuHealth</h1>
                       </div>
            </Link>
            <div className="w-full">
              <div className="px-10 w-full">
                <h2 className="text-xl font-semibold pb-1">Verify OTP</h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Please enter the 6 digit Pin we sent to your email address to
                  proceed!
                </p>

                <form onSubmit={handleSubmit} className="text-sm">
                  {/* Email Input */}
                  <div className="relative pb-3">
                    <p className="font-semibold pb-1">Email address :</p>
                    <div className="relative">
                      <input
                        type="email"
                        className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-[#3E4095]"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  {/* OTP Input */}
                  <div className="relative pb-5">
                    <p className="font-semibold pb-1">OTP :</p>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-[#3E4095]"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                      <FaKey className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-full ${
                      isLoading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#3E4095] text-white"
                    }`}
                  >
                      {isLoading ? (     <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying Otp
                    </div> ): ("Proceed")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div
          className="flex-1 h-screen flex flex-col justify-center items-center p-4"
          style={{
            background: "linear-gradient(to bottom, #3E4095, #718FCC)",
          }}
        >
          <div className="">
            <p className="text-white font-semibold text-2xl pb-1">
              The simplest way to manage <br /> medical records
            </p>
            <p className="text-white font-light text-sm">
              No better way to attend to, and keep records of medical records
            </p>
          </div>

          <div className="max-h-[420px] flex justify-center items-center pt-2">
            <img
              src={dashb}
              alt="Dashboard"
              className="object-contain w-full h-full"
            />
          </div>
        </div>
      </div>
      <div className="h-screen flex flex-col justify-center items-center sm:hidden py-10">
      <div className=" fixed top-10 left-5  flex gap-1 items-center font-semibold text-[#3E4095]">
               <img src={docuhealth_logo} alt="Logo" className="w-6" />
               <h1 className="text-xl">DocuHealth</h1>
             </div>
        <div className="w-full">
          <div className="px-5 w-full">
            <h2 className="text-xl font-semibold pb-1">Verify OTP</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Please enter the 6 digit Pin we sent to your email address to
              proceed!
            </p>

            <form onSubmit={handleSubmit} className="text-sm">
              {/* Email Input */}
              <div className="relative pb-3">
                <p className="font-semibold pb-1">Email address :</p>
                <div className="relative">
                  <input
                    type="email"
                    className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-[#3E4095]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              {/* OTP Input */}
              <div className="relative pb-5">
                <p className="font-semibold pb-1">OTP :</p>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-[#3E4095]"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  <FaKey className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-full ${
                  isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#3E4095] text-white "
                }`}
              >
             
                {isLoading ? (     <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying Otp
                    </div> ): ("Proceed")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User_Create_Account_Verify_OTP;
