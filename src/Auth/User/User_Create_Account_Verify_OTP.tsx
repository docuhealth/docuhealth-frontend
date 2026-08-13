import React, { useState, useEffect } from "react";
import docuhealth_logo from "../../assets/img/docuhealth_logo.png";
import dashb from "../../assets/img/dashb.png";
import AuthRightSide from "../AuthRightSide";
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
  const [isResending, setIsResending] = useState(false);


  const navigate = useNavigate();


  // requests 
  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();

    try {
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
      toast.success(response.message || "OTP Verified Successfully!");
      console.log(response)
      
      const patientHin = response.hin;
      navigate("/verify-nin", { state: { patient_hin: patientHin } });
    } catch (error: any) {
      console.error("Error during OTP verification:", error);
      toast.error(error.detail || "OTP Verification Failed, Try Again");
     
    }finally{
      setIsLoading(false);

      setEmail('')
      setOtp('')
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }

    setIsResending(true);
    try {
      const payload = {
        email: email,
        verify_url: "https://docuhealthservices.net/user-create-account-verify-otp",
      };

      const response = await authAPI("POST", "api/auth/resend-otp", payload);

      toast.success(response.message || "OTP sent successfully!");
    } catch (error: any) {
      console.error("Error resending OTP:", error);
      toast.error(
        error?.error || error?.email?.[0] || error?.detail || error?.message || "Failed to resend OTP, Try Again"
      );
    } finally {
      setIsResending(false);
    }
  };
  return (
    <div>
      <div className="hidden h-screen sm:flex">
        {/* Left Side */}
        <div className="w-full flex-1">
          <div className=" hidden sm:flex justify-center items-center py-10 h-screen ">
            <Link to="/">
              <div className=" fixed top-10 left-10  flex gap-1 items-center font-semibold text-docuhealth-primary">
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
                        className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-docuhealth-primary"
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
                        className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-docuhealth-primary"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                      <FaKey className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Resend OTP Link */}
                  <div>
                    <p className="text-center text-sm text-gray-600 pb-5">
                      OTP expired or you did not receive it?{" "}
                      <span
                        onClick={!isResending ? handleResend : undefined}
                        className={`text-docuhealth-primary hover:underline ${isResending ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                      >
                        {isResending ? "Resending..." : "Click to resend"}
                      </span>
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-full ${isLoading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-docuhealth-primary text-white"
                      }`}
                  >
                    {isLoading ? (<div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying Otp
                    </div>) : ("Proceed")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <AuthRightSide />
      </div>
      <div className="h-screen flex flex-col justify-center items-center sm:hidden py-10">
      <Link to="/">
        <div className=" fixed top-10 left-5  flex gap-1 items-center font-semibold text-docuhealth-primary">
          <img src={docuhealth_logo} alt="Logo" className="w-6" />
          <h1 className="text-xl">DocuHealth</h1>
        </div>
      </Link>
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
                    className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-docuhealth-primary"
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
                    className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-docuhealth-primary"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  <FaKey className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Resend OTP Link */}
              <div>
                <p className="text-center text-sm text-gray-600 pb-5">
                  OTP expired or you did not receive it?{" "}
                  <span
                    onClick={!isResending ? handleResend : undefined}
                    className={`text-docuhealth-primary hover:underline ${isResending ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  >
                    {isResending ? "Resending..." : "Click to resend"}
                  </span>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-full ${isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-docuhealth-primary text-white "
                  }`}
              >

                {isLoading ? (<div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying Otp
                </div>) : ("Proceed")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User_Create_Account_Verify_OTP;
