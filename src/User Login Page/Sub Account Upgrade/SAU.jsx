import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.png";
import dashb from "../../assets/dashb.png";
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

  const isFormValid = name && nin && email && number && password;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !nin || !email || !number || !password) {
      setError("All fields must be filled before submission.");
      return;
    }

    setError("");

    console.log(email, password, number, name, nin);
    setEmail("");
    setPassword("");
    setNumber("");
    setName("");
    setNin("");
    setnotification(true);
    setNotificationVisible(false);
  };
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
    <div className="min-h-screen">
      <div className="flex">
        {/* Left Side */}
        <div className="hidden sm:flex flex-1 min-h-screen  items-center justify-center ">
          <div className="w-3/4 py-10" id="temp">
            <div className="pb-10">
              <img src={logo} alt="Logo" className="" />
            </div>
            <h2 className="text-2xl font-bold mb-2 "> Account Upgrade</h2>
            <p className="text-gray-600  mb-6">
              Simply upgrade this account to a standard with the necessary
              information below
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* <div className="relative">
                <p className="font-semibold pb-1">
                  Full Name (should correspond with existing name) :
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
              </div> */}
              {/* <div className="relative">
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
              </div> */}
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
              </div>

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
              {/* Error Message */}
              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                  type="submit"
                  className={`w-full py-3 rounded-full ${
                    isFormValid
                      ? "bg-[#0000FF] text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!isFormValid}
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
      {notification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white py-6 px-14 rounded-lg shadow-lg flex flex-col justify-center items-center">
            <div className="pb-2">
              <svg
                width="70"
                height="70"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50.4014" r="50" fill="#15C621" />
                <path
                  d="M44.6659 58.857L69.1789 34.344L72.9501 38.1152L44.6659 66.3994L27.6953 49.429L31.4666 45.6578L44.6659 58.857Z"
                  fill="white"
                />
              </svg>
            </div>
            <p className="text-[#15C621] mb-4 text-sm sm:text-base">
              Account Upgraded Successfully
            </p>
            <div className="flex justify-center w-full">
              <button
                className="bg-[#0000FF] w-full rounded-full text-white px-4 py-2 "
                onClick={() => {
                  setnotification(false);
                }}
              >
                Go To Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      {notificationVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="fixed bottom-0 left-0 right-0 bg-white text-black py-4 rounded-t-3xl shadow-md animate-slide-up">
            <div className="flex justify-center items-center px-5 pb-4">
              <div className="flex items-center gap-1">
                <img src={logo} alt="DocuHealth Logo" className="h-8" />
                <h1 className="text-[#0000FF] text-3xl font-bold">
                  DocuHealth
                </h1>
              </div>
            </div>

            <div className="px-5">
              <h2 className="text-xl sm:text-2xl mb-2">Upgrade Your Account</h2>
              <p className="text-gray-600 mb-6">
                Fill in all details correctly before proceeding.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                {/* <div className="relative">
                  <p className="font-semibold pb-1">Full Name:</p>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg outline-none focus:border-blue-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div> */}

                {/* NIN */}
                {/* <div className="relative">
                  <p className="font-semibold pb-1">NIN:</p>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border rounded-lg outline-none focus:border-blue-500"
                    value={nin}
                    onChange={(e) => setNin(e.target.value)}
                    required
                  />
                </div> */}

                {/* Email */}
                <div className="relative">
                  <p className="font-semibold pb-1">Email:</p>
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

                {/* Phone Number */}
                <div className="relative">
                  <p className="font-semibold pb-1">Phone Number:</p>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border rounded-lg outline-none focus:border-blue-500"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <p className="font-semibold pb-1">Password:</p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
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

                {/* Error Message */}
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="submit"
                  className={`w-full py-3 rounded-full ${
                    isFormValid
                      ? "bg-[#0000FF] text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!isFormValid}
                >
                  Upgrade Now
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SAU;
