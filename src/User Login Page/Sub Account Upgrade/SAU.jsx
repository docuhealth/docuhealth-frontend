import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.png";
import dashb from '../../assets/dashb.png'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const SAU = () => {
  const [name, setName] = useState("");
  const [nin, setNin] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

  const [notification, setnotification] = useState(false);

  const [notificationVisible, setNotificationVisible] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(email, password, number, name, nin);
    setEmail("");
    setPassword("");
    setNumber("");
    setName("");
    setNin("");
    setnotification(true);
    setNotificationVisible(false);
  };

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Left Side */}
        <div className="hidden sm:flex flex-1 min-h-screen  items-center justify-center ">
          <div className="w-3/4 py-10" id="temp">
            <div className="pb-10">
              <img src={logo} alt="Logo" className="" />
            </div>
            <h2 className="text-2xl font-bold mb-2 ">Create Your Account</h2>
            <p className="text-gray-600  mb-6">
              Create your account with your correct credentials to get started
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <p className="font-semibold pb-1">
                  Full Name (should correspond with NIN) :
                </p>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="relative">
                <p className="font-semibold pb-1">NIN:</p>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                    value={nin}
                    onChange={(e) => setNin(e.target.value)}
                    required
                  />
                </div>
              </div>
              {/* Email Input */}
              <div className="relative">
                <p className="font-semibold pb-1">Email :</p>
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

              <div className="relative">
                <p className="font-semibold pb-1">
                  Phone Number (Mandantory) :
                </p>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <p className="font-semibold pb-1">Password:</p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder=""
                      className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-4 w-4 text-gray-400" />
                      ) : (
                        <FaEye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              {/* Error Message */}
              {error && <p className="text-red-500 text-sm">{error}</p>}

              {/* Move to next step button */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-[#0000FF] text-white py-3 rounded-full hover:bg-blue-700"
              >
                Upgrade Now
              </button>
            </form>
          </div>
        </div>
         {/* Right Side */}
                <div
                  className="flex-1 min-h-screen flex flex-col justify-center items-center p-4"
                  style={{
                    background: "linear-gradient(to bottom, #0000FF, #718FCC)",
                  }}
                >
                  <div className="">
                    <p className="text-white font-semibold text-xl sm:text-2xl pb-1">
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
  );
};

export default SAU;
