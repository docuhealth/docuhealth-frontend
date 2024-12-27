import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa"; // React Icons
import dashb from "../assets/dashb.png";
import { Link } from "react-router-dom";

const ULP = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [number, setNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // To manage steps

  const [name, setName] = useState("");
  const [nin, setNin] = useState("");
  const [dob, setDob] = useState("");

  const [notification, setnotification] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(email, password, number, confirmPassword, name, nin, dob);
    setEmail("");
    setPassword("");
    setNumber("");
    setConfirmPassword("");
    setDob("");
    setName("");
    setNin("");
    setnotification(true);
    setNotificationVisible(false);
  };

  const handleNextStep = () => {
    // Check if the form is completed before allowing to move to next step
    if (
      email &&
      number && number.length > 10 &&
      password &&
      confirmPassword &&
      password === confirmPassword
    ) {
      setStep(2); // Move to Step 2
    } else {
      setError("Please fill all fields correctly.");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Left Side */}
        <div className="hidden sm:flex flex-1 min-h-screen  items-center justify-center ">
          <div
            className="w-3/4"
            id="temp"
            style={{ display: step === 1 ? "block" : "none" }}
          >
            <div className="pb-10">
              <img src={logo} alt="Logo" className="" />
            </div>
            <h2 className="text-2xl font-bold mb-2 ">Create Your Account</h2>
            <p className="text-gray-600  mb-6">
              Create your account with your correct credentials to get started
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <p className="font-semibold">Email :</p>
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
                <p className="font-semibold">Phone Number (Mandantory) :</p>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative">
                <p className="font-semibold">Password:</p>
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

              {/* Confirm Password Input */}
              <div className="relative">
                <p className="font-semibold">Confirm Password:</p>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder=""
                    className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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

              {/* Move to next step button */}
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-[#0000FF] text-white py-3 rounded-full hover:bg-blue-700"
              >
                Move to Step 2 / 3
              </button>
            </form>

            {/* Sign-In Prompt */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link to="/user-login" className="text-[#0000FF] hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div
            className="w-3/4"
            id="temp"
            style={{ display: step === 2 ? "block" : "none" }}
          >
            <div className="pb-10">
              <img src={logo} alt="Logo" className="" />
            </div>
            <h2 className="text-2xl font-bold mb-2 ">Create Your Account</h2>
            <p className="text-gray-600  mb-6">
              Create your account with your correct credentials to get started
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <p className="font-semibold">
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
                <p className="font-semibold">NIN:</p>
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

              <div className="relative">
                <p className="font-semibold">Date Of Birth:</p>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                  />
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
                Sign Up Now
              </button>
            </form>

            {/* Sign-In Prompt */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link
                to="//user-login"
                className="text-[#0000FF] hover:underline"
              >
                Sign in
              </Link>
            </p>
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
            <p className="text-[#15C621] mb-4 text-sm sm:text-xl">
              You have successfully signed up
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
          <div className="fixed bottom-0 left-0 right-0 bg-white text-black  py-4 rounded-t-3xl shadow-md animate-slide-up ">
            <div className="flex justify-center items-center gap-1 pb-4">
              <div>
                <img src={logo} alt="DocuHealth Logo" />
              </div>
              <h1 className="text-[#0000FF] text-3xl font-bold">DocuHealth</h1>
            </div>
            <div
              className="px-5"
              id="temp"
              style={{ display: step === 1 ? "block" : "none" }}
            >
              <h2 className="text-xl sm:text-2xl  mb-1 ">
                Create Your Account
              </h2>
              <p className="text-gray-600  mb-6">
                Create your account with your correct credentials to get started
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <p className="font-semibold">Email :</p>
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
                  <p className="font-semibold">Phone Number (Mandantory) :</p>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                      value={number}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 11) {
                          setNumber(value);
                        }
                      }}
                      required
                      minLength={11}
                      maxLength={11}
                      min="11111111111" // Minimum number with 11 digits
                      max="99999999999" // Maximum number with 11 digits
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="relative">
                  <p className="font-semibold">Password:</p>
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

                {/* Confirm Password Input */}
                <div className="relative">
                  <p className="font-semibold">Confirm Password:</p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder=""
                      className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-blue-500"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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

                {/* Move to next step button */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-[#0000FF] text-white py-3 rounded-full hover:bg-blue-700"
                >
                  Move to Step 2 / 3
                </button>
              </form>

              {/* Sign-In Prompt */}
              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{" "}
                <Link
                  to="/hospital-login"
                  className="text-[#0000FF] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
            <div
              className=" px-5"
              id="temp"
              style={{ display: step === 2 ? "block" : "none" }}
            >
              <h2 className="text-xl sm:text-2xl mb-2 ">Create Your Account</h2>
              <p className="text-gray-600  mb-6">
                Create your account with your correct credentials to get started
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <p className="font-semibold">
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
                  <p className="font-semibold">NIN:</p>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                      value={nin}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 20) {
                          setNin(value);
                        }
                      }}
                      required
                      minLength={20}
                      maxLength={20}
                      min="10000000000000000000" // Minimum number with 20 digits
                      max="99999999999999999999" // Maximum number with 20 digits
                    />
                  </div>
                </div>

                <div className="relative">
                  <p className="font-semibold">Date Of Birth:</p>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full px-4 py-3 border rounded-lg pl-3 outline-none focus:border-blue-500"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                    />
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
                  Sign Up Now
                </button>
              </form>

              {/* Sign-In Prompt */}
              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{" "}
                <Link
                  to="/hospital-login"
                  className="text-[#0000FF] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ULP;
