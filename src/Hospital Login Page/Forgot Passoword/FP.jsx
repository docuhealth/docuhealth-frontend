import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash} from "react-icons/fa";
import dashb from "../../assets/dashb.png";


const FP = () => {
  const [email, setEmail] = useState("");
  const handleSubmit = () => {};
  return (
    <div>
      <div className="min-h-screen">
        <div className="flex">
          {/* Left Side */}
          <div className="flex-1 h-screen flex items-center justify-center">
            <div className="w-3/4" id="temp">
              <div className="pb-10">
                <img src={logo} alt="Logo" className="" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Forgot Password
              </h2>
              <p className="text-gray-600 mb-6">
              We’ll send an OTP to the email below which is your registered email to help you  reset your password
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <p className="font-semibold">Hospital Email Address :</p>
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
                >
                  Send OTP
                </button>
              </form>

            </div>
          </div>

          {/* Right Side */}
          <div
            className="flex-1 h-screen flex flex-col justify-center items-center"
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
    </div>
  );
};

export default FP;
