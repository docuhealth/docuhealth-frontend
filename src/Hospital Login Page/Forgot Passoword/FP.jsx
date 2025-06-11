import React, { useState, useEffect } from "react";
import logo from "../../assets/img/logo.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import dashb from "../../assets/img/dashb.png";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';


const FP = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("hospital");
  const [loading, setLoading] = useState('');

   const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setLoading('Sending Otp')
    e.preventDefault(); 
    

    try {
      const response = await fetch("https://docuhealth-backend-h03u.onrender.com/api/auth/forgot_password", {
        method: "POST", // Use POST method for sending data
        headers: {
          "Content-Type": "application/json", // Indicate the payload format
        },
        body: JSON.stringify({ email, role }), // Send the email as JSON
      });

      if (response.ok) {
        toast.success("Email sent successfully!");
        setLoading('Send Otp')
        setTimeout(() => {
          navigate("/hospital-verify-otp",  { state: { email } });
        }, 1000);
      } else {
        toast.error(`Failed to send email, try again`);
        setLoading('Send Otp')
      }
    } catch (error) {
     console.error(`Error: ${error.message}`);
     setLoading('Send Otp')
    }
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
          <div className=" hidden sm:flex flex-1 h-screen  items-center justify-center text-sm">
            <div className="w-3/4" id="temp">
              <div className="pb-10">
                <img src={logo} alt="Logo" className="" />
              </div>
              <h2 className="text-xl font-bold mb-2">Forgot Password</h2>
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
                  className={`w-full py-3 rounded-full text-white ${
                    email
                      ? "bg-[#0000FF] hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!email}
                  onClick={handleSubmit}
                >
                     {loading ? loading: "Send Otp"}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 text-sm">
          <div className="fixed bottom-0 left-0 right-0 bg-white text-black  py-4 rounded-t-3xl shadow-md animate-slide-up ">
            <div className="flex justify-center items-center gap-1 pb-4">
              <div>
                <img src={logo} alt="DocuHealth Logo" />
              </div>
              <h1 className="text-[#0000FF] text-2xl font-bold">DocuHealth</h1>
            </div>
            <div className="px-5" id="temp">
              <h2 className=" text-base sm:text-2xl  mb-2">Forgot Password ?</h2>
              <p className="text-gray-600 mb-6 text-sm">
                We’ll send an OTP to the email below which is your registered
                email to help you reset your password
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
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
                        className={`w-full py-3 rounded-full text-white ${
                          email
                            ? "bg-[#0000FF] hover:bg-blue-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!email}
                        onClick={handleSubmit}
                      >
                           {loading ? loading: "Send Otp"}
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
