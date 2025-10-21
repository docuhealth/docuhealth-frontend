import React, { useState, useEffect } from "react";
import logo from "../../../assets/img/logo.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import dashb from "../../../assets/img/dashb.png";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../../utils/authAPI";
import toast from "react-hot-toast";

const FP = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("patient");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();

    // Check if input is an email or phone number
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneNumber = /^\d+$/.test(email); // Checks if input contains only digits

    if (!isEmail && !isPhoneNumber) {
      toast.error("Please enter a valid email or phone number.");
      setIsLoading(false);
      return;
    }

    try {
      // Prepare the payload
      const payload = {
        role, // Add the appropriate role
        ...(isEmail ? { email } : { phone_num: email }), // Dynamically add email or phone
      };

      // Make the POST request
      const response = await authAPI(
        "POST",
        "api/auth/forgot-password",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response;
      // console.log(response)
      setIsLoading(false);
      toast.success(data.message || "OTP sent successfully!");

      // Navigate with appropriate data
      const navigateData = isEmail ? { email } : { phone_num: email };
      setTimeout(() => {
        navigate("/user-verify-otp", { state: navigateData });
      }, 1000);
    } catch (error) {
      // Handle unexpected errors
      console.error("An error occurred:", error);
      toast.error(
        error.message || "An error occurred. Please try again later."
      );
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="hidden h-screen sm:flex">
        {/* Left Side */}
        <div className="w-full flex-1">
          <div className=" hidden sm:flex justify-center items-center py-10 h-screen ">
            <Link to="/">
              <div className=" fixed top-10 left-10  flex gap-1 items-center font-semibold">
                <img src={logo} alt="Logo" className="h-6" />
                <h1 className="text-xl">DOCUHEALTH</h1>
              </div>
            </Link>
            <div className="px-10 w-full">
              <div>
                <h2 className="text-xl font-semibold pb-1">Forgot Password</h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Input your registered email below to receieve an OTP to help
                  you reset your password.
                </p>

                <form onSubmit={handleSubmit} className="text-sm">
                  <div className="relative pb-5">
                    <p className="font-semibold pb-1">Enter Email :</p>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3 rounded-full bg-[#0000FF] text-white hover:bg-blue-700"
            ${isLoading ? "cursor-not-allowed bg-gray-300 text-gray-500 " : ""}
          `}
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending Otp" : "Send Otp"}
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
            background: "linear-gradient(to bottom, #0000FF, #718FCC)",
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
        <div className=" fixed top-10 left-5  flex gap-2 items-center font-semibold">
          <img src={logo} alt="Logo" className="h-6" />
          <h1 className="text-xl">DOCUHEALTH</h1>
        </div>
        <div className="">
          <div className="px-5 w-full">
            <div>
              <h2 className="text-xl font-semibold pb-1">Forgot Password</h2>
              <p className="text-gray-600 mb-6 text-sm">
                Input your registered email below to receieve an OTP to help you
                reset your password.
              </p>

              <form onSubmit={handleSubmit} className="text-sm">
                <div className="relative pb-5">
                  <p className="font-semibold pb-1">Enter Email :</p>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 rounded-full bg-[#0000FF] text-white hover:bg-blue-700"
            ${isLoading ? "cursor-not-allowed bg-gray-300 text-gray-500 " : ""}
          `}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending Otp" : "Send Otp"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FP;

{
  /* <div className="w-3/4" id="temp">

<h2 className="text-xl font-bold mb-2">Forgot Password</h2>
<p className="text-gray-600 mb-6 text-sm">
  Input your registered email below to receieve an OTP to help you
  reset your password.
</p>

<form onSubmit={handleSubmit} className="space-y-4 text-sm">

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


  <button
    type="submit"
    className={`w-full py-3 rounded-full bg-[#0000FF] text-white hover:bg-blue-700"
            ${isLoading ? 'cursor-not-allowed bg-gray-300 text-gray-500 ' : ''}
          `}
    disabled={isLoading}
  >
    {isLoading ? 'Sending Otp' : "Send Otp"}
  </button>
</form>
</div> */
}
