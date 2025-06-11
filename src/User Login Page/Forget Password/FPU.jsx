import React, { useState, useEffect } from "react";
import logo from "../../assets/img/logo.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import dashb from "../../assets/img/dashb.png";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';

const FP = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setLoading("Sending Otp");
    e.preventDefault();

    // Check if input is an email or phone number
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneNumber = /^\d+$/.test(email); // Checks if input contains only digits

    if (!isEmail && !isPhoneNumber) {
      toast.error("Please enter a valid email or phone number.");
      setLoading("Send Otp");
      return;
    }

    try {
      // Prepare the payload
      const payload = {
        role, // Add the appropriate role
        ...(isEmail ? { email } : { phone_num: email }), // Dynamically add email or phone
      };

      // Make the POST request
      const response = await fetch(
        "https://docuhealth-backend-h03u.onrender.com/api/auth/forgot_password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      // Handle the response
      if (response.ok) {
        const data = await response.json();
        setLoading("Send Otp");
        toast.success(data.message || "OTP sent successfully!");

        // Navigate with appropriate data
        const navigateData = isEmail ? { email } : { phone_num: email };
        setTimeout(() => {
          navigate("/user-verify-otp", { state: navigateData });
        }, 1000);
      } else {
        const errorData = await response.json().catch(() => null); // Safely parse response
        const errorMessage =
          errorData?.message || "Failed to send OTP. Please try again.";
        toast.error(errorMessage);
        setLoading("Send Otp");
      }
    } catch (error) {
      // Handle unexpected errors
      console.error("An error occurred:", error);
      toast.error("An error occurred. Please try again later.");
      setLoading("Send Otp");
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
          <div className=" hidden sm:flex flex-1 h-screen  items-center justify-center">
            <div className="w-3/4" id="temp">
              <div className="pb-10">
                <img src={logo} alt="Logo" className="" />
              </div>
              <h2 className="text-xl font-bold mb-2">Forgot Password</h2>
              <p className="text-gray-600 mb-6 text-sm">
                Input your registered email below to receieve an OTP to help you
                reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                {/* Email Input */}
                <div className="relative">
                  <p className="font-semibold pb-1">Enter Email :</p>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-3 border rounded-lg pl-5 outline-none focus:border-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`w-full py-3 rounded-full bg-[#0000FF] text-white hover:bg-blue-700"
                          
                        `}
                >
                  {loading ? loading : "Send Otp"}
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
              <h1 className="text-[#0000FF] text-2xl font-bold">DocuHealth</h1>
            </div>
            <div className="px-5" id="temp">
              <h2 className=" text-base sm:text-2xl  mb-2">Forgot Password ?</h2>
              <p className="text-gray-600 mb-6 text-sm">
                Input your registered email below to receieve an OTP to help you
                reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                {/* Email Input */}
                <div className="relative">
                  <p className="pb-1">Enter Email :</p>
                  <div className="relative">
                    <input
                      type="email"
                      className="w-full px-4 py-3 border rounded-lg pl-5 outline-none focus:border-blue-500"
                      value={email}
                      placeholder="Jarus@gmail.com"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`w-full py-3 rounded-full bg-[#0000FF] text-white hover:bg-blue-700"
                          
                        `}
                >
                  {loading ? loading : "Send Otp"}
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
